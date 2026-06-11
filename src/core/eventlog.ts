import type { LiftLog } from "./types";
import type { WorkoutEvent, SetLoggedEvent } from "./events";
import { setLoggedFromLog, eventToLog } from "./events";

/**
 * Conflict-free merge of two event streams: union by event id, then stable
 * sort by ts (then id). Commutative, associative, idempotent — a CRDT-style
 * merge, so no event is ever lost regardless of device order.
 */
export function mergeEvents(a: WorkoutEvent[], b: WorkoutEvent[]): WorkoutEvent[] {
  const byId = new Map<string, WorkoutEvent>();
  for (const e of a || []) if (e && e.id) byId.set(e.id, e);
  for (const e of b || []) if (e && e.id && !byId.has(e.id)) byId.set(e.id, e);
  return [...byId.values()].sort((x, y) => x.ts - y.ts || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
}

/** Project the event stream → the LiftLog[] read model (tombstones applied). */
export function projectLogs(events: WorkoutEvent[]): LiftLog[] {
  const deleted = new Set<string>();
  for (const e of events || []) if (e.type === "SetDeleted") deleted.add(e.logId);
  // Last SetLogged per logId wins (supports edits); chronological by ts then date.
  const latest = new Map<string, SetLoggedEvent>();
  for (const e of events || []) {
    if (e.type !== "SetLogged" || deleted.has(e.logId)) continue;
    latest.set(e.logId, e);
  }
  return [...latest.values()]
    .sort((a, b) => a.ts - b.ts || (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map(eventToLog);
}

/** Turn a legacy log array into events (one SetLogged each, stable ids). */
export function fromLegacyLogs(logs: LiftLog[]): WorkoutEvent[] {
  return (logs || []).map(setLoggedFromLog);
}

/**
 * Conflict-free union of two log arrays by stable id — no log lost to
 * last-write-wins. This is the sync-merge primitive the app calls when a
 * remote snapshot arrives.
 */
export function mergeLogSets(localLogs: LiftLog[], remoteLogs: LiftLog[]): LiftLog[] {
  return projectLogs(mergeEvents(fromLegacyLogs(localLogs), fromLegacyLogs(remoteLogs)));
}
