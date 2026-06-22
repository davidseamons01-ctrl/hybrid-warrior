// ─────────────────────────────────────────────────────────────────────────
//  Partner Sessions — M3 live runtime (backend-agnostic). The realtime
//  coordination logic talks to an injected `SessionBackend` interface, so it's
//  unit-testable with an in-memory fake and runs against Firestore in the app
//  (the concrete adapter wraps fbDb in ui.js, added when the UI mounts in M4).
//  The set feed is id-keyed → CRDT union (idempotent), like the workout events.
//  See docs/partner-sessions.md §6.3.
// ─────────────────────────────────────────────────────────────────────────
import type { Vibe } from "./partner";
import type { JointLift, JointRx } from "./partner-match";
import type { PartnerSession, JoinCodeRecord, UserRef, SharedLiftRef, SessionStatus } from "./partner-pairing";
import {
  newPartnerSession, participantFromUser, codeRecord, makeJoinCode,
  normalizeJoinCode, isCodeExpired, canTransition,
} from "./partner-pairing";

export type Unsub = () => void;

export interface FeedEvent {
  id: string; uid: string; handle: string;
  eid: string; name: string; weight: number; reps: number;
  ts: number; isPR?: boolean;
}

/** The only surface the realtime logic needs; Firestore and the fake both implement it. */
export interface SessionBackend {
  now(): number;
  newId(): string;
  createSession(s: PartnerSession): Promise<void>;
  getSession(id: string): Promise<PartnerSession | null>;
  patchSession(id: string, patch: Record<string, unknown>): Promise<void>; // Firestore set(merge) semantics
  watchSession(id: string, cb: (s: PartnerSession | null) => void): Unsub;
  putCode(rec: JoinCodeRecord): Promise<void>;
  getCode(code: string): Promise<JoinCodeRecord | null>;
  deleteCode(code: string): Promise<void>;
  appendFeed(id: string, ev: FeedEvent): Promise<void>;  // idempotent by ev.id
  watchFeed(id: string, cb: (events: FeedEvent[]) => void): Unsub;
}

/** Deep-merge matching Firestore `set(merge:true)`: objects merge, arrays/primitives replace. */
export function fsMerge<T>(base: T, patch: unknown): T {
  if (patch === null || typeof patch !== "object" || Array.isArray(patch)) return patch as T;
  const out: Record<string, unknown> = base && typeof base === "object" && !Array.isArray(base)
    ? { ...(base as Record<string, unknown>) } : {};
  for (const k of Object.keys(patch as Record<string, unknown>)) {
    const pv = (patch as Record<string, unknown>)[k];
    const bv = out[k];
    out[k] = pv && typeof pv === "object" && !Array.isArray(pv) && bv && typeof bv === "object" && !Array.isArray(bv)
      ? fsMerge(bv, pv) : pv;
  }
  return out as T;
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

/** In-memory backend — simulates the shared Firestore state for tests/reference. */
export function createInMemoryBackend(opts: { now?: () => number; idSeq?: () => string } = {}) {
  const sessions = new Map<string, PartnerSession>();
  const codes = new Map<string, JoinCodeRecord>();
  const feeds = new Map<string, Map<string, FeedEvent>>();
  const sessionSubs = new Map<string, Set<(s: PartnerSession | null) => void>>();
  const feedSubs = new Map<string, Set<(e: FeedEvent[]) => void>>();
  let counter = 0;
  const now = opts.now || (() => Date.now());
  const newId = opts.idSeq || (() => "id" + ++counter);
  const feedArr = (id: string) => [...(feeds.get(id) || new Map()).values()].sort((a, b) => a.ts - b.ts);
  const emitSession = (id: string) => (sessionSubs.get(id) || []).forEach((cb) => cb(sessions.has(id) ? clone(sessions.get(id)!) : null));
  const emitFeed = (id: string) => (feedSubs.get(id) || []).forEach((cb) => cb(feedArr(id)));

  const be: SessionBackend & { _sessions: typeof sessions; _codes: typeof codes; _feeds: typeof feeds } = {
    now, newId, _sessions: sessions, _codes: codes, _feeds: feeds,
    async createSession(s) { sessions.set(s.id, clone(s)); emitSession(s.id); },
    async getSession(id) { return sessions.has(id) ? clone(sessions.get(id)!) : null; },
    async patchSession(id, patch) { const cur = sessions.get(id); if (!cur) return; sessions.set(id, fsMerge(cur, patch)); emitSession(id); },
    watchSession(id, cb) {
      if (!sessionSubs.has(id)) sessionSubs.set(id, new Set());
      sessionSubs.get(id)!.add(cb);
      cb(sessions.has(id) ? clone(sessions.get(id)!) : null);
      return () => { sessionSubs.get(id)?.delete(cb); };
    },
    async putCode(rec) { codes.set(normalizeJoinCode(rec.code), { ...rec }); },
    async getCode(code) { const r = codes.get(normalizeJoinCode(code)); return r ? { ...r } : null; },
    async deleteCode(code) { codes.delete(normalizeJoinCode(code)); },
    async appendFeed(id, ev) { if (!feeds.has(id)) feeds.set(id, new Map()); feeds.get(id)!.set(ev.id, { ...ev }); emitFeed(id); },
    watchFeed(id, cb) {
      if (!feedSubs.has(id)) feedSubs.set(id, new Set());
      feedSubs.get(id)!.add(cb);
      cb(feedArr(id));
      return () => { feedSubs.get(id)?.delete(cb); };
    },
  };
  return be;
}

/* ---------- coordination operations (run on any backend) ---------- */

export async function hostCreateSession(
  be: SessionBackend, host: UserRef,
  opts: { vibe?: Vibe; shareMaxes?: boolean; codeLen?: number; ttlMs?: number; code?: string } = {}
): Promise<{ session: PartnerSession; code: string }> {
  const id = be.newId();
  const code = normalizeJoinCode(opts.code ?? makeJoinCode(opts.codeLen ?? 6));
  const session = newPartnerSession(host, { id, code, vibe: opts.vibe, shareMaxes: opts.shareMaxes, now: be.now() });
  await be.createSession(session);
  await be.putCode(codeRecord(code, id, host.uid, { ttlMs: opts.ttlMs, now: be.now() }));
  return { session, code };
}

export type JoinResult =
  | { ok: true; session: PartnerSession }
  | { ok: false; error: "not-found" | "expired" | "gone" | "closed" };

export async function joinByCode(
  be: SessionBackend, user: UserRef, codeInput: string, opts: { shareMaxes?: boolean } = {}
): Promise<JoinResult> {
  const code = normalizeJoinCode(codeInput);
  const rec = await be.getCode(code);
  if (!rec) return { ok: false, error: "not-found" };
  if (isCodeExpired(rec, be.now())) return { ok: false, error: "expired" };
  const session = await be.getSession(rec.sessionId);
  if (!session) return { ok: false, error: "gone" };
  if (session.status === "abandoned" || session.status === "complete") return { ok: false, error: "closed" };
  if (!session.participants[user.uid]) {
    const p = participantFromUser(user, { role: "guest", shareMaxes: !!opts.shareMaxes, now: be.now() });
    await be.patchSession(rec.sessionId, { participants: { [user.uid]: p }, updatedAt: be.now() });
  }
  return { ok: true, session: (await be.getSession(rec.sessionId))! };
}

export async function setReadyRemote(be: SessionBackend, id: string, uid: string, ready: boolean): Promise<void> {
  await be.patchSession(id, { participants: { [uid]: { ready, lastSeen: be.now() } }, updatedAt: be.now() });
}

/** Presence heartbeat — call on a timer (~10s) while in a session. */
export async function heartbeat(be: SessionBackend, id: string, uid: string): Promise<void> {
  await be.patchSession(id, { participants: { [uid]: { lastSeen: be.now() } } });
}

/** Add or remove a joint lift (program-based redesign). null patch = removed. */
export async function toggleJointLift(be: SessionBackend, id: string, joint: JointLift | null, eid: string): Promise<void> {
  await be.patchSession(id, { jointLifts: { [eid]: joint }, updatedAt: be.now() });
}

/** Each device publishes its own resolved joint prescriptions into its participant. */
export async function publishJointRx(be: SessionBackend, id: string, uid: string, rx: JointRx[]): Promise<void> {
  await be.patchSession(id, { participants: { [uid]: { jointRx: rx } }, updatedAt: be.now() });
}

export async function setSharedBlock(be: SessionBackend, id: string, lifts: SharedLiftRef[], vibe?: Vibe): Promise<void> {
  const patch: Record<string, unknown> = { sharedLifts: lifts, updatedAt: be.now() };
  if (vibe) patch.vibe = vibe;
  await be.patchSession(id, patch);
}

export async function transition(be: SessionBackend, id: string, to: SessionStatus): Promise<boolean> {
  const s = await be.getSession(id);
  if (!s || !canTransition(s.status, to)) return false;
  await be.patchSession(id, { status: to, updatedAt: be.now() });
  return true;
}

/** Append a completed set to the live feed (idempotent by id; also logged to the user's own history by the caller). */
export async function logSharedSet(be: SessionBackend, id: string, ev: Omit<FeedEvent, "ts"> & { ts?: number }): Promise<void> {
  await be.appendFeed(id, { ...ev, ts: ev.ts ?? be.now() } as FeedEvent);
}

/**
 * Rotate the shared-bar turn through `order` (the lifting rotation). When the
 * last lifter finishes, the turn wraps to the first and advances the set number.
 */
export async function advanceTurn(be: SessionBackend, id: string, order: string[]): Promise<void> {
  if (!order.length) return;
  const s = await be.getSession(id);
  if (!s) return;
  const turn = s.liveState.turn;
  let uid = order[0], setNo = 1;
  if (turn) {
    const i = order.indexOf(turn.uid);
    if (i < 0 || i === order.length - 1) { uid = order[0]; setNo = turn.setNo + 1; }
    else { uid = order[i + 1]; setNo = turn.setNo; }
  }
  await be.patchSession(id, { liveState: { turn: { uid, setNo } }, updatedAt: be.now() });
}
