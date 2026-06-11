import type { Goal, WarmupSet, WarmupOpts, AccessoryRxInput, AccessoryPrescription } from "./types";

/* ---------- goal-aware periodization ---------- */

export function isDeloadWeek(w: number): boolean {
  return w === 4 || w === 8;
}

/** strength / hybrid / powerlifting peak toward a true max test at wk 13. */
export function peakIsMaxTest(goal: Goal): boolean {
  return goal === "strength" || goal === "hybrid" || goal === "powerlifting";
}

export function phaseLabel(goal: Goal, w: number): string {
  if (goal === "fat_loss") return w <= 4 ? "Base" : w <= 8 ? "Build" : w <= 12 ? "Burn" : "Benchmark";
  if (goal === "muscle") return w <= 4 ? "Volume" : w <= 8 ? "Overload" : w <= 12 ? "Intensify" : "Pump Peak";
  if (goal === "beginner") return w <= 4 ? "Learn" : w <= 8 ? "Build" : w <= 12 ? "Grow" : "Check-In";
  if (goal === "endurance") return w <= 4 ? "Base" : w <= 8 ? "Build" : w <= 12 ? "Peak" : "Taper";
  // strength / hybrid / powerlifting
  return w <= 4 ? "Hypertrophy" : w <= 8 ? "Strength" : w <= 12 ? "Peak" : "Test";
}

/** Top-set intensity as a fraction of e1RM, per goal per week. */
const WK_FACTOR: Record<string, number[]> = {
  strength: [0.62, 0.65, 0.68, 0.6, 0.72, 0.76, 0.79, 0.65, 0.8, 0.84, 0.88, 0.92, 0.85],
  hybrid: [0.62, 0.65, 0.68, 0.6, 0.72, 0.76, 0.79, 0.65, 0.8, 0.84, 0.88, 0.92, 0.85],
  muscle: [0.65, 0.68, 0.7, 0.6, 0.7, 0.72, 0.74, 0.64, 0.72, 0.75, 0.77, 0.78, 0.7],
  fat_loss: [0.55, 0.58, 0.6, 0.52, 0.6, 0.62, 0.64, 0.56, 0.62, 0.64, 0.66, 0.66, 0.6],
  beginner: [0.5, 0.52, 0.55, 0.5, 0.58, 0.6, 0.62, 0.56, 0.64, 0.66, 0.68, 0.68, 0.65],
  powerlifting: [0.65, 0.68, 0.72, 0.62, 0.76, 0.8, 0.84, 0.68, 0.86, 0.9, 0.93, 0.95, 0.9],
  endurance: [0.55, 0.58, 0.6, 0.52, 0.62, 0.64, 0.66, 0.58, 0.66, 0.66, 0.64, 0.58, 0.55],
};

export function wkFactorFor(goal: Goal, w: number): number {
  const arr = WK_FACTOR[goal] || WK_FACTOR.strength;
  const i = Math.max(1, Math.min(13, w)) - 1;
  return arr[i];
}

/** Rep targets [primaryHeavy, mainWork, ...] per goal/week. */
export function phaseRepsFor(goal: Goal, w: number): number[] {
  if (goal === "muscle") return w <= 4 ? [12, 12, 10, 12] : w <= 8 ? [10, 10, 8, 10] : w <= 12 ? [8, 8, 6, 8] : [12, 15, 12, 15];
  if (goal === "fat_loss") return w <= 4 ? [15, 12, 15, 12] : w <= 8 ? [12, 12, 12, 15] : w <= 12 ? [12, 10, 12, 15] : [15, 20, 15, 20];
  if (goal === "beginner") return w <= 4 ? [12, 12, 12, 12] : w <= 8 ? [10, 10, 10, 12] : w <= 12 ? [8, 10, 8, 10] : [10, 12, 10, 12];
  if (goal === "powerlifting") return w <= 4 ? [6, 5, 5, 5] : w <= 8 ? [5, 4, 3, 4] : w <= 12 ? [3, 2, 2, 2] : [2, 1, 1, 1];
  if (goal === "endurance") return w <= 4 ? [10, 10, 8, 10] : w <= 8 ? [8, 8, 8, 10] : w <= 12 ? [8, 6, 8, 8] : [10, 10, 10, 12];
  return w <= 4 ? [10, 8, 8, 6] : w <= 8 ? [6, 5, 4, 3] : w <= 12 ? [4, 3, 2, 2] : [3, 2, 1, 1];
}

export function phaseSetsFor(goal: Goal, w: number): number {
  if (isDeloadWeek(w)) return goal === "fat_loss" ? 2 : 3;
  if (goal === "muscle") return w <= 4 ? 4 : w <= 8 ? 4 : w <= 12 ? 5 : 4;
  if (goal === "fat_loss") return 3;
  if (goal === "beginner") return 3;
  if (goal === "endurance") return 3;
  if (goal === "powerlifting") return w <= 4 ? 4 : w <= 12 ? 5 : 3;
  return w <= 4 ? 4 : w <= 12 ? 5 : 3;
}

/* ---------- computed warmup sets ---------- */

export function warmupSets(topSetLb: number, opts?: WarmupOpts): WarmupSet[] {
  const o = opts || {};
  const bar = o.bar != null ? o.bar : 45;
  const unit = o.unit || "lb";
  const top = Number(topSetLb) || 0;
  if (top <= bar * 1.2) return [];
  const round = (n: number) => Math.round(n / 5) * 5;
  const steps: Array<{ pct: number; reps: number; w?: number }> = [
    { pct: 0, reps: 10, w: bar },
    { pct: 0.5, reps: 8 },
    { pct: 0.7, reps: 5 },
    { pct: 0.85, reps: 3 },
  ];
  const out: WarmupSet[] = [];
  let lastW = -1;
  for (const s of steps) {
    let w = s.w != null ? s.w : round(top * s.pct);
    if (w >= top * 0.9) break;
    if (w < bar) w = bar;
    if (w === lastW) continue;
    lastW = w;
    out.push({ weight: w, reps: s.reps, unit });
  }
  return out;
}

export function warmupText(topSetLb: number, opts?: WarmupOpts): string {
  const sets = warmupSets(topSetLb, opts);
  if (!sets.length) return "";
  const unit = (opts && opts.unit) || "lb";
  return sets
    .map((s, i) =>
      i === 0 && s.weight === ((opts && opts.bar) || 45)
        ? `bar×${s.reps}`
        : `${s.weight}${unit}×${s.reps}`
    )
    .join(", ");
}

/* ---------- data-driven accessory prescription ---------- */

export function accessoryReps(goal: Goal, w: number, isolation: boolean): number {
  const strengthy = goal === "strength" || goal === "powerlifting" || goal === "hybrid";
  const lean = goal === "fat_loss" || goal === "endurance";
  if (isolation) {
    if (strengthy) return w <= 8 ? 12 : 10;
    if (lean) return 15;
    return w <= 4 ? 15 : w <= 12 ? 12 : 15;
  }
  if (strengthy) return w <= 4 ? 10 : w <= 8 ? 8 : w <= 12 ? 6 : 8;
  if (lean) return 12;
  return w <= 4 ? 12 : w <= 12 ? 10 : 12;
}

export function accessoryRx(opts?: AccessoryRxInput): AccessoryPrescription {
  const o = opts || {};
  const goal: Goal = o.goal || "strength";
  const w = Math.max(1, Number(o.week) || 1);
  const iso = !!o.isolation;
  const exp = Number(o.experienceMonths) || 0;
  const deload = isDeloadWeek(w);
  const reps = accessoryReps(goal, w, iso);
  let sets = exp >= 18 ? (iso ? 3 : 4) : exp >= 6 ? 3 : 2;
  if (deload) sets = Math.max(2, sets - 1);
  let target = Number(o.estTarget) || 0;
  let basis = "scaled to your strength";
  const last = Number(o.lastLogged) || 0;
  if (last > 0) {
    target = last;
    basis = "from your last session";
    if (o.lastFeel === "easy" || o.beatTarget) {
      target = last * 1.04;
      basis = "progressed from last time";
    } else if (o.lastFeel === "hard") {
      basis = "held (last time was hard)";
    }
  }
  return { sets, reps, target: Math.max(0, target), basis };
}
