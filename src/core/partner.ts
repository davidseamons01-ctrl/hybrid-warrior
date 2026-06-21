// ─────────────────────────────────────────────────────────────────────────
//  Partner Sessions — M1 merge engine (pure, no DOM/network/storage).
//  See docs/partner-sessions.md. Given N users (their maxes, focus, equipment
//  and today's plan), this:
//    • suggests shared compounds scored for JOINT goal-fit,
//    • scales each shared lift's load to each user's own max (load = max × %),
//    • resolves a usable max via the logged → estimate → calibrate ladder,
//    • splits each user's remaining accessories off from the shared block.
//  The realtime/UI layers (M2–M4) feed this real catalog/profile/plan data.
// ─────────────────────────────────────────────────────────────────────────
import { epley } from "./strength";

/* ---------- schemes / vibes ---------- */

export type Vibe = "strength" | "hypertrophy" | "pump";
export interface Scheme { sets: number; reps: number; intensityPct: number }

export const VIBE_SCHEMES: Record<Vibe, Scheme> = {
  strength: { sets: 5, reps: 3, intensityPct: 85 },
  hypertrophy: { sets: 4, reps: 8, intensityPct: 70 },
  pump: { sets: 3, reps: 12, intensityPct: 60 },
};

/* ---------- catalog + users ---------- */

export type PartnerEquipment = "barbell" | "dumbbell" | "machine" | "bodyweight";

export interface PartnerCompound {
  eid: string;
  name: string;
  tags: string[];      // goal/muscle tags it serves
  equipment: PartnerEquipment;
  increment: number;   // load step in lb (0 = bodyweight)
}

export interface PartnerUser {
  uid: string;
  name: string;
  maxes: Record<string, number>; // eid -> 1RM (lb)
  focus: string[];               // their goal/focus tags
  equipment: string[];           // available equipment types
  blockedEids?: string[];        // safety-mode exclusions
  unit?: "lb" | "kg";
  bodyweightLb?: number;
  experience?: "beginner" | "intermediate" | "advanced";
  todayEids?: string[];          // eids in their programmed session (continuity)
}

/** Curated partner-friendly compounds (default catalog; override in real app). */
export const PARTNER_COMPOUNDS: PartnerCompound[] = [
  { eid: "squat", name: "Back Squat", tags: ["legs", "quads", "glutes", "posterior", "strength"], equipment: "barbell", increment: 5 },
  { eid: "frontsquat", name: "Front Squat", tags: ["legs", "quads", "core", "strength"], equipment: "barbell", increment: 5 },
  { eid: "bench", name: "Bench Press", tags: ["push", "chest", "upper", "strength"], equipment: "barbell", increment: 5 },
  { eid: "incline", name: "Incline Bench", tags: ["push", "chest", "shoulders", "upper"], equipment: "barbell", increment: 5 },
  { eid: "deadlift", name: "Deadlift", tags: ["hinge", "posterior", "glutes", "back", "strength"], equipment: "barbell", increment: 5 },
  { eid: "rdl", name: "Romanian Deadlift", tags: ["hinge", "posterior", "glutes", "hamstrings"], equipment: "barbell", increment: 5 },
  { eid: "hipthrust", name: "Hip Thrust", tags: ["glutes", "posterior", "legs"], equipment: "barbell", increment: 5 },
  { eid: "ohp", name: "Overhead Press", tags: ["push", "shoulders", "upper", "strength"], equipment: "barbell", increment: 5 },
  { eid: "row", name: "Barbell Row", tags: ["pull", "back", "upper", "posterior"], equipment: "barbell", increment: 5 },
  { eid: "pullup", name: "Pull-up", tags: ["pull", "back", "upper"], equipment: "bodyweight", increment: 0 },
  { eid: "lunge", name: "Walking Lunge", tags: ["legs", "quads", "glutes"], equipment: "dumbbell", increment: 5 },
  { eid: "legpress", name: "Leg Press", tags: ["legs", "quads", "glutes"], equipment: "machine", increment: 10 },
];

/* ---------- load scaling ---------- */

/** Round a load to the nearest equipment increment (0 increment → nearest lb). */
export function roundToIncrement(load: number, increment: number): number {
  if (!(increment > 0)) return Math.max(0, Math.round(load));
  return Math.max(0, Math.round(load / increment) * increment);
}

/** Working load for a user: their 1RM × intensity%, rounded to the bar increment. */
export function scaleLoad(max: number, intensityPct: number, increment = 5): number {
  if (!(max > 0) || !(intensityPct > 0)) return 0;
  return roundToIncrement((max * intensityPct) / 100, increment);
}

/* ---------- max resolution (logged → estimate → calibrate) ---------- */

export type MaxSource = "logged" | "estimated" | "calibrated" | "none";
export interface ResolvedMax { value: number; source: MaxSource }

/** Provisional 1RM from a single calibration set (Epley, rounded). */
export function calibrationToMax(weight: number, reps: number): number {
  return Math.round(epley(weight, reps));
}

// Rough 1RM as a bodyweight multiple for an intermediate lifter, by lift.
const BW_MULT: Record<string, number> = {
  squat: 1.4, frontsquat: 1.1, bench: 1.0, incline: 0.85, deadlift: 1.75,
  rdl: 1.4, hipthrust: 1.6, ohp: 0.6, row: 0.9, lunge: 0.5, legpress: 2.2, pullup: 0,
};
const EXP_FACTOR: Record<string, number> = { beginner: 0.65, intermediate: 1, advanced: 1.3 };

/** Coarse 1RM estimate from bodyweight + experience (labeled provisional in UI). */
export function estimateMaxFromBodyweight(eid: string, bodyweightLb: number, experience: string = "intermediate"): number {
  const m = BW_MULT[eid];
  if (m == null || !(bodyweightLb > 0)) return 0;
  const f = EXP_FACTOR[experience] ?? 1;
  return Math.round((bodyweightLb * m * f) / 5) * 5;
}

/** Best available max for a user+lift, flagging where it came from. */
export function resolveMax(user: PartnerUser, eid: string): ResolvedMax {
  const logged = Number(user.maxes?.[eid]) || 0;
  if (logged > 0) return { value: logged, source: "logged" };
  const est = user.bodyweightLb ? estimateMaxFromBodyweight(eid, user.bodyweightLb, user.experience) : 0;
  if (est > 0) return { value: est, source: "estimated" };
  return { value: 0, source: "none" };
}

/* ---------- shared-lift suggestion (joint goal-fit) ---------- */

export interface Suggestion { eid: string; name: string; jointScore: number; reason: string }

/** How many of a user's focus tags this compound serves. */
export function fitScore(user: PartnerUser, c: PartnerCompound): number {
  const focus = new Set(user.focus || []);
  let s = 0;
  for (const t of c.tags) if (focus.has(t)) s++;
  return s;
}

/** Can this user safely perform this lift (equipment available, not blocked)? */
export function canPerform(user: PartnerUser, c: PartnerCompound): boolean {
  if ((user.blockedEids || []).includes(c.eid)) return false;
  if (c.equipment !== "bodyweight" && !(user.equipment || []).includes(c.equipment)) return false;
  return true;
}

/**
 * Rank shared compounds by JOINT fit. minFit rewards lifts good for *everyone*
 * (the whole point of a shared lift); total fit and program-continuity break ties.
 */
export function suggestSharedLifts(
  users: PartnerUser[],
  catalog: PartnerCompound[] = PARTNER_COMPOUNDS,
  opts: { max?: number } = {}
): Suggestion[] {
  const max = opts.max ?? 3;
  const out: Suggestion[] = [];
  for (const c of catalog) {
    if (!users.length || !users.every((u) => canPerform(u, c))) continue;
    const fits = users.map((u) => fitScore(u, c));
    const minFit = Math.min(...fits);
    const sumFit = fits.reduce((a, b) => a + b, 0);
    const continuity = users.filter((u) => (u.todayEids || []).includes(c.eid)).length;
    const jointScore = minFit * 100 + sumFit * 10 + continuity;
    if (jointScore <= 0) continue; // serves nobody
    const reason = continuity ? "In a program today, fits everyone"
      : minFit > 0 ? "Fits everyone's goals" : "Shared compound";
    out.push({ eid: c.eid, name: c.name, jointScore, reason });
  }
  out.sort((a, b) => b.jointScore - a.jointScore || a.eid.localeCompare(b.eid));
  return out.slice(0, Math.max(0, max));
}

/* ---------- merge: shared block + per-user split ---------- */

export interface UserLoad { uid: string; name: string; load: number; maxSource: MaxSource; needsCalibration: boolean }
export interface SharedLiftPlan { eid: string; name: string; scheme: Scheme; loads: UserLoad[] }
export interface MergedSession { vibe: Vibe; shared: SharedLiftPlan[]; splits: Record<string, string[]> }

/** Per-user loads for one shared lift (scheme may be a vibe preset or a program override). */
export function buildSharedLiftPlan(sug: Suggestion, users: PartnerUser[], scheme: Scheme, increment = 5): SharedLiftPlan {
  const loads: UserLoad[] = users.map((u) => {
    const rm = resolveMax(u, sug.eid);
    return {
      uid: u.uid,
      name: u.name,
      load: scaleLoad(rm.value, scheme.intensityPct, increment),
      maxSource: rm.source,
      needsCalibration: rm.source === "none",
    };
  });
  return { eid: sug.eid, name: sug.name, scheme, loads };
}

/**
 * Assemble the full session: a shared block (per-user loads) + each user's
 * remaining accessories (their plan minus the shared lifts already done).
 * `schemeOverrides` lets a per-lift "match their program" choice replace the vibe.
 */
export function mergeSession(
  users: PartnerUser[],
  suggestions: Suggestion[],
  planByUid: Record<string, string[]>,
  opts: { vibe?: Vibe; catalog?: PartnerCompound[]; schemeOverrides?: Record<string, Scheme> } = {}
): MergedSession {
  const vibe = opts.vibe ?? "hypertrophy";
  const baseScheme = VIBE_SCHEMES[vibe];
  const catalog = opts.catalog ?? PARTNER_COMPOUNDS;
  const incrByEid: Record<string, number> = {};
  for (const c of catalog) incrByEid[c.eid] = c.increment;
  const overrides = opts.schemeOverrides || {};

  const shared = suggestions.map((s) =>
    buildSharedLiftPlan(s, users, overrides[s.eid] || baseScheme, incrByEid[s.eid] ?? 5)
  );
  const sharedEids = new Set(suggestions.map((s) => s.eid));
  const splits: Record<string, string[]> = {};
  for (const u of users) {
    splits[u.uid] = (planByUid[u.uid] || []).filter((eid) => !sharedEids.has(eid));
  }
  return { vibe, shared, splits };
}
