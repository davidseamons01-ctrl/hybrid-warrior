// ─────────────────────────────────────────────────────────────
//  Event-sourced workout log (overhaul step 2).
//  Events are immutable facts. Derived state (the LiftLog[] read
//  model, e1RM, streaks…) is a pure projection of the stream — which
//  is what makes multi-device sync conflict-free (union by id, not
//  last-write-wins on a whole document).
// ─────────────────────────────────────────────────────────────
import type { LiftLog } from "./types";

export type WorkoutEventType = "SetLogged" | "SetDeleted";

/** A set was logged (or re-logged — last SetLogged per logId wins). */
export interface SetLoggedEvent {
  id: string; // unique, stable event id
  ts: number; // sortable timestamp (ms)
  type: "SetLogged";
  logId: string; // id of the resulting log row (delete/edit target)
  date: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  targetWeight?: number;
  targetReps?: number;
  targetSets?: number;
  feel?: string;
  outcome?: string;
  week?: number;
  score?: number;
  note?: string;
}

/** A tombstone: this logId should not appear in the projection. */
export interface SetDeletedEvent {
  id: string;
  ts: number;
  type: "SetDeleted";
  logId: string;
}

export type WorkoutEvent = SetLoggedEvent | SetDeletedEvent;

/** Deterministic, sortable ts from an iso date (noon), 0 if unparseable. */
function dateTs(date: string): number {
  const t = new Date(String(date) + "T12:00:00").getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Convert a legacy log row → a SetLogged event with a STABLE id derived from
 * the log's id, so backfilling the same logs always yields the same events
 * (idempotent) and two devices' logs union cleanly by id.
 */
export function setLoggedFromLog(log: LiftLog): SetLoggedEvent {
  const logId = String(
    log.id != null ? log.id : `${log.date}|${log.exercise}|${log.aW}|${log.aR}|${log.aS}`
  );
  const e: SetLoggedEvent = {
    id: "ev_" + logId,
    ts: dateTs(String(log.date)),
    type: "SetLogged",
    logId,
    date: String(log.date),
    exercise: String(log.exercise),
    weight: Number(log.aW) || 0,
    reps: Number(log.aR) || 0,
    sets: Number(log.aS) || 0,
  };
  if (log.tW != null) e.targetWeight = Number(log.tW);
  if (log.tR != null) e.targetReps = Number(log.tR);
  if (log.tS != null) e.targetSets = Number(log.tS);
  if (log.liftFeel != null) e.feel = String(log.liftFeel);
  if (log.outcome != null) e.outcome = String(log.outcome);
  if (log.week != null) e.week = Number(log.week);
  if (log.score != null) e.score = Number(log.score);
  if (log.note != null) e.note = String(log.note);
  return e;
}

/** Build a delete tombstone for a logId (ts injectable for determinism). */
export function setDeletedEvent(logId: string, ts?: number): SetDeletedEvent {
  const t = ts != null ? ts : Date.now();
  return { id: "del_" + String(logId), ts: t, type: "SetDeleted", logId: String(logId) };
}

/** Rebuild a LiftLog row from a SetLogged event. */
export function eventToLog(e: SetLoggedEvent): LiftLog {
  const log: LiftLog = {
    id: e.logId,
    date: e.date,
    exercise: e.exercise,
    aW: e.weight,
    aR: e.reps,
    aS: e.sets,
  };
  if (e.targetWeight !== undefined) log.tW = e.targetWeight;
  if (e.targetReps !== undefined) log.tR = e.targetReps;
  if (e.targetSets !== undefined) log.tS = e.targetSets;
  if (e.feel !== undefined) log.liftFeel = e.feel;
  if (e.outcome !== undefined) log.outcome = e.outcome;
  if (e.week !== undefined) log.week = e.week;
  if (e.score !== undefined) log.score = e.score;
  if (e.note !== undefined) log.note = e.note;
  return log;
}
