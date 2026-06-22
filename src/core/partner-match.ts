// Partner Sessions — program-based match engine (redesign). Pure: no DOM/IO.
//
// Two lifters each tap exercises from their OWN programmed day-plan into a shared
// "joint" block. For each lifter we then resolve a prescription per joint lift:
//   • already in their plan  → keep their programmed sets×reps×load ("programmed")
//   • borrowed from partner   → estimate from their strength + current program
//     phase ("estimated"), or flag "needs-calibration" if we have no strength for
//     it (and it isn't a bodyweight move).
// Everything they didn't share stays as their solo accessories.
import type { Scheme } from "./partner";
import { scaleLoad } from "./partner";

/** A single programmed exercise a lifter brings to the table. */
export interface DayPlanItem {
  eid: string;        // catalog exercise id (drives the workout card/video/plate later)
  name: string;
  sets: number;
  reps: number;       // target reps (0 = time/AMRAP/bodyweight)
  load: number;       // target working weight (0 = bodyweight/unloaded)
}

/** An agreed shared lift. Stored in the session as a map keyed by `eid`. */
export interface JointLift {
  eid: string;        // catalog exercise id — the identity used to match each plan
  key: string;        // canonical strength key (for estimating a borrowed load)
  name: string;
  addedBy: string;    // uid who put it in
  addedAt?: number;
}

export type RxSource = "programmed" | "estimated" | "needs-calibration";

export interface JointRx {
  key: string; eid: string; name: string;
  sets: number; reps: number; load: number; unit: string;
  source: RxSource;
}

/** Per-lifter inputs the engine needs to resolve a joint block. */
export interface LifterProfile {
  dayPlan: DayPlanItem[];
  scheme: Scheme;                          // resolved from their program phase
  strengthByKey: Record<string, number>;   // liftKey -> 1RM (lb), for borrowed lifts
  bodyweightKeys?: string[];               // keys that need no load (pull-up, dips…)
  incrementByKey?: Record<string, number>; // load step per key (default 5)
  unit: string;
}

/** Canonical lift key from an exercise name. Both devices MUST agree, so this
 *  mapping lives in shared pure code. Big lifts map to a strength slug; anything
 *  else falls back to a slug of the name. */
export function liftKeyForName(name: string): string {
  const s = String(name || "").toLowerCase();
  if (s.includes("bench")) return "bench";
  if (s.includes("deadlift") || s.includes("rdl") || s.includes("romanian")) return "deadlift";
  if (s.includes("hip thrust") || s.includes("hipthrust")) return "hipthrust";
  if (s.includes("overhead") || s.includes("ohp") || s.includes("military") || s.includes("shoulder press")) return "ohp";
  if (s.includes("pull-up") || s.includes("pullup") || s.includes("pull up") || s.includes("chin-up") || s.includes("chinup")) return "pullup";
  if (s.includes("row")) return "row";
  if (s.includes("squat")) return "squat";
  return s.trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "lift";
}

/** Resolve one joint lift's prescription for a given lifter. Plans match by eid
 *  (a shared catalog id); the fuzzy strength key is only for the borrowed load. */
export function resolveJointRx(lifter: LifterProfile, joint: JointLift): JointRx {
  const mine = lifter.dayPlan.find((it) => it.eid === joint.eid);
  const base = { key: joint.key, eid: joint.eid, name: joint.name, unit: lifter.unit };
  if (mine) {
    return { ...base, sets: mine.sets, reps: mine.reps, load: mine.load, source: "programmed" };
  }
  const sch = lifter.scheme;
  const skey = joint.key || liftKeyForName(joint.name);
  const max = lifter.strengthByKey[skey] || 0;
  if (max > 0) {
    const inc = (lifter.incrementByKey && lifter.incrementByKey[skey]) || 5;
    return { ...base, sets: sch.sets, reps: sch.reps, load: scaleLoad(max, sch.intensityPct, inc), source: "estimated" };
  }
  if ((lifter.bodyweightKeys || []).includes(skey) || (lifter.bodyweightKeys || []).includes(joint.eid)) {
    return { ...base, sets: sch.sets, reps: sch.reps, load: 0, source: "estimated" };
  }
  return { ...base, sets: sch.sets, reps: sch.reps, load: 0, source: "needs-calibration" };
}

/** Resolve the whole joint block for a lifter (in the given joint order). */
export function buildJointPlan(lifter: LifterProfile, joints: JointLift[]): JointRx[] {
  return joints.map((j) => resolveJointRx(lifter, j));
}

/** The lifter's solo accessories = their plan minus anything taken into the joint block. */
export function accessoriesFor(lifter: LifterProfile, joints: JointLift[]): DayPlanItem[] {
  const taken = new Set(joints.map((j) => j.eid));
  return lifter.dayPlan.filter((it) => !taken.has(it.eid));
}

/** Stable joint-lift list from the session's eid-keyed map (null = removed). */
export function jointLiftsFromMap(map: Record<string, JointLift | null> | undefined): JointLift[] {
  return Object.values(map || {})
    .filter((j): j is JointLift => !!j)
    .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0) || a.eid.localeCompare(b.eid));
}

/** True if the lifter still owes a calibration before the joint block can start. */
export function needsCalibration(lifter: LifterProfile, joints: JointLift[]): JointRx[] {
  return buildJointPlan(lifter, joints).filter((r) => r.source === "needs-calibration");
}
