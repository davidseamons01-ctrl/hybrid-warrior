// ─────────────────────────────────────────────────────────────────────────
//  Partner Sessions — M2 pairing & session data model (pure: no DOM/network).
//  See docs/partner-sessions.md §6.1, §7, §8. Builds and validates the docs the
//  realtime layer (M3) writes to Firestore: the session doc, join codes, gym
//  buddies, and invites. All consent/shape logic lives here so it's unit-tested;
//  the fbDb create/join/onSnapshot calls are thin wrappers added in M3.
// ─────────────────────────────────────────────────────────────────────────
import type { Vibe, Scheme } from "./partner";

/* ---------- session document ---------- */

export type SessionStatus = "lobby" | "proposing" | "active" | "split" | "complete" | "abandoned";

export interface ParticipantMaxes { [eid: string]: number }

export interface Participant {
  uid: string;
  handle: string;
  name: string;
  role: "host" | "guest";
  maxes: ParticipantMaxes; // {} unless the user opted into sharing
  maxesShared: boolean;
  focus: string[];         // goal/focus tags (not sensitive → always shared, for joint-fit)
  equipment: string[];     // available equipment
  ready: boolean;
  lastSeen: number;        // epoch ms — presence heartbeat
  progress: { sharedDone: number; splitDone: number };
}

export interface SharedLiftRef { eid: string; name: string; order: number; scheme: Scheme }

export interface PartnerSession {
  id: string;
  hostUid: string;
  status: SessionStatus;
  createdAt: number;
  updatedAt: number;
  vibe: Vibe;
  joinCode: string | null;
  participants: Record<string, Participant>;
  sharedLifts: SharedLiftRef[];
  liveState: { currentLiftIndex: number; turn: { uid: string; setNo: number } | null; restEndsAt: number | null };
}

export interface UserRef { uid: string; handle: string; name?: string; maxes?: ParticipantMaxes; focus?: string[]; equipment?: string[] }

/** Build a participant entry; maxes are included only with explicit consent. */
export function participantFromUser(u: UserRef, opts: { role: "host" | "guest"; shareMaxes: boolean; now?: number }): Participant {
  return {
    uid: u.uid,
    handle: u.handle,
    name: u.name || u.handle,
    role: opts.role,
    maxes: opts.shareMaxes ? (u.maxes || {}) : {},
    maxesShared: !!opts.shareMaxes,
    focus: u.focus || [],
    equipment: u.equipment || [],
    ready: false,
    lastSeen: opts.now ?? Date.now(),
    progress: { sharedDone: 0, splitDone: 0 },
  };
}

export function newPartnerSession(host: UserRef, opts: { id: string; code?: string | null; vibe?: Vibe; shareMaxes?: boolean; now?: number }): PartnerSession {
  const now = opts.now ?? Date.now();
  const host0 = participantFromUser(host, { role: "host", shareMaxes: opts.shareMaxes ?? false, now });
  return {
    id: opts.id,
    hostUid: host.uid,
    status: "lobby",
    createdAt: now,
    updatedAt: now,
    vibe: opts.vibe ?? "hypertrophy",
    joinCode: opts.code ?? null,
    participants: { [host.uid]: host0 },
    sharedLifts: [],
    liveState: { currentLiftIndex: 0, turn: null, restEndsAt: null },
  };
}

/* ---------- participant mutations (immutable) ---------- */

export function withParticipant(s: PartnerSession, p: Participant): PartnerSession {
  return { ...s, participants: { ...s.participants, [p.uid]: p }, updatedAt: p.lastSeen };
}
export function setReady(s: PartnerSession, uid: string, ready: boolean, now = Date.now()): PartnerSession {
  const p = s.participants[uid];
  if (!p) return s;
  return withParticipant({ ...s, updatedAt: now }, { ...p, ready, lastSeen: now });
}
export function touchPresence(s: PartnerSession, uid: string, now = Date.now()): PartnerSession {
  const p = s.participants[uid];
  if (!p) return s;
  return { ...s, participants: { ...s.participants, [uid]: { ...p, lastSeen: now } } };
}
export function isOnline(p: Participant, now = Date.now(), staleMs = 30000): boolean {
  return !!p && now - p.lastSeen <= staleMs;
}
export function participantCount(s: PartnerSession): number {
  return Object.keys(s.participants || {}).length;
}
export function allReady(s: PartnerSession): boolean {
  const ps = Object.values(s.participants || {});
  return ps.length > 0 && ps.every((p) => p.ready);
}

/** Valid forward status transitions (any state may go to "abandoned"). */
const FLOW: Record<SessionStatus, SessionStatus[]> = {
  lobby: ["proposing", "abandoned"],
  proposing: ["active", "lobby", "abandoned"],
  active: ["split", "abandoned"],
  split: ["complete", "abandoned"],
  complete: [],
  abandoned: [],
};
export function canTransition(from: SessionStatus, to: SessionStatus): boolean {
  return to === "abandoned" ? from !== "complete" : (FLOW[from] || []).includes(to);
}

/* ---------- join codes ---------- */

// Unambiguous alphabet: no I, O, 0, 1.
export const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const DEFAULT_CODE_TTL_MS = 10 * 60 * 1000;

export function makeJoinCode(len = 6, rand: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < len; i++) s += JOIN_CODE_ALPHABET[Math.floor(rand() * JOIN_CODE_ALPHABET.length)];
  return s;
}
export function normalizeJoinCode(input: string): string {
  return String(input || "").toUpperCase().replace(/[\s-]+/g, "");
}
export function isValidJoinCode(input: string, len = 6): boolean {
  const c = normalizeJoinCode(input);
  return c.length === len && [...c].every((ch) => JOIN_CODE_ALPHABET.includes(ch));
}

export interface JoinCodeRecord { code: string; sessionId: string; hostUid: string; expiresAt: number }
export function codeRecord(code: string, sessionId: string, hostUid: string, opts: { ttlMs?: number; now?: number } = {}): JoinCodeRecord {
  const now = opts.now ?? Date.now();
  return { code: normalizeJoinCode(code), sessionId, hostUid, expiresAt: now + (opts.ttlMs ?? DEFAULT_CODE_TTL_MS) };
}
export function isCodeExpired(rec: JoinCodeRecord | null | undefined, now = Date.now()): boolean {
  return !rec || now >= rec.expiresAt;
}

/** Deep-link hash for QR codes, e.g. "#join=ABC23X". */
export function joinHash(code: string): string {
  return "#join=" + normalizeJoinCode(code);
}
export function parseJoinHash(hash: string): string | null {
  const m = String(hash || "").match(/[#&]join=([A-Za-z0-9-]+)/);
  if (!m) return null;
  const c = normalizeJoinCode(m[1]);
  return isValidJoinCode(c) ? c : null;
}

/* ---------- gym buddies (stored in prefs.gymBuddies) ---------- */

export interface GymBuddy { uid: string; handle: string; name?: string; since: number }
export function addGymBuddy(list: GymBuddy[], buddy: GymBuddy): GymBuddy[] {
  return [...(list || []).filter((b) => b.uid !== buddy.uid), buddy];
}
export function removeGymBuddy(list: GymBuddy[], uid: string): GymBuddy[] {
  return (list || []).filter((b) => b.uid !== uid);
}
export function hasGymBuddy(list: GymBuddy[], uid: string): boolean {
  return (list || []).some((b) => b.uid === uid);
}

/* ---------- invites (partner_invites/{uid}/items) ---------- */

export interface PartnerInvite { id: string; fromUid: string; fromHandle: string; sessionId: string; createdAt: number }
export function makeInvite(from: { uid: string; handle: string }, sessionId: string, opts: { id?: string; now?: number } = {}): PartnerInvite {
  const now = opts.now ?? Date.now();
  return { id: opts.id ?? from.uid + "_" + now, fromUid: from.uid, fromHandle: from.handle, sessionId, createdAt: now };
}
