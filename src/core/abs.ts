// Optional 5-minute core finisher engine (pure: no DOM/IO).
// Several prefigured circuits; each exercise's exact sets/reps/seconds/load is
// derived from the lifter's own history (progressive overload) and, for the
// first weighted exposure, seeded from a relevant lift max or bodyweight.
// Template selection is adaptive — it favours the least-recently-trained circuit.

export type AbMode = "reps" | "time" | "weighted";

export interface AbSpec {
  eid: string;
  name: string;
  region: "upper" | "lower" | "oblique" | "rotation" | "stability";
  mode: AbMode;
  base: number;             // base reps (reps/weighted) or seconds (time)
  sets: number;
  restSec: number;
  perSide?: boolean;
  // first-time load seed for weighted moves: pct of a lift max or bodyweight
  seed?: { from: "bodyweight" | "bench" | "squat" | "deadlift" | "ohp"; pct: number };
  increment?: number;       // load step (lb) for weighted progression
}

export interface AbTemplate {
  id: string;
  name: string;
  focus: string;
  minutes: number;
  exercises: AbSpec[];
}

// ~5-minute circuits (2–3 moves, run as a couple of rounds). Real catalog eids.
export const AB_TEMPLATES: AbTemplate[] = [
  {
    id: "weighted-core", name: "Weighted Core", focus: "Loaded strength", minutes: 5,
    exercises: [
      { eid: "cable_crunch", name: "Cable Crunch", region: "upper", mode: "weighted", base: 12, sets: 3, restSec: 45, seed: { from: "bench", pct: 0.35 }, increment: 10 },
      { eid: "db_leg_raise", name: "DB Leg Raise", region: "lower", mode: "weighted", base: 12, sets: 3, restSec: 45, seed: { from: "bodyweight", pct: 0.08 }, increment: 5 },
      { eid: "suitcase", name: "Suitcase Carry", region: "rotation", mode: "time", base: 30, sets: 2, restSec: 30, perSide: true },
    ],
  },
  {
    id: "lower-ab", name: "Lower-Ab Ladder", focus: "Lower abs & hip flexors", minutes: 5,
    exercises: [
      { eid: "hanging_leg_raise", name: "Hanging Leg Raise", region: "lower", mode: "reps", base: 10, sets: 3, restSec: 45 },
      { eid: "toe_tap", name: "Dead Bug", region: "stability", mode: "reps", base: 10, sets: 3, restSec: 30, perSide: true },
      { eid: "db_leg_raise", name: "DB Leg Raise", region: "lower", mode: "weighted", base: 12, sets: 2, restSec: 30, seed: { from: "bodyweight", pct: 0.06 }, increment: 5 },
    ],
  },
  {
    id: "oblique", name: "Oblique & Anti-Rotation", focus: "Sides & rotary control", minutes: 5,
    exercises: [
      { eid: "side_plank", name: "Side Plank", region: "oblique", mode: "time", base: 30, sets: 2, restSec: 20, perSide: true },
      { eid: "russian_twist", name: "Russian Twist", region: "oblique", mode: "weighted", base: 16, sets: 3, restSec: 40, perSide: false, seed: { from: "bodyweight", pct: 0.05 }, increment: 5 },
      { eid: "suitcase", name: "Suitcase Carry", region: "rotation", mode: "time", base: 30, sets: 2, restSec: 30, perSide: true },
    ],
  },
  {
    id: "stability-brace", name: "Stability Brace", focus: "Bracing & endurance", minutes: 5,
    exercises: [
      { eid: "plank", name: "Plank Hold", region: "stability", mode: "time", base: 45, sets: 3, restSec: 30 },
      { eid: "toe_tap", name: "Dead Bug", region: "stability", mode: "reps", base: 12, sets: 3, restSec: 30, perSide: true },
      { eid: "side_plank", name: "Side Plank", region: "oblique", mode: "time", base: 30, sets: 2, restSec: 20, perSide: true },
    ],
  },
  {
    id: "core-pyramid", name: "Core Pyramid", focus: "Balanced mix", minutes: 5,
    exercises: [
      { eid: "cable_crunch", name: "Cable Crunch", region: "upper", mode: "weighted", base: 12, sets: 3, restSec: 40, seed: { from: "bench", pct: 0.3 }, increment: 10 },
      { eid: "hanging_leg_raise", name: "Hanging Leg Raise", region: "lower", mode: "reps", base: 10, sets: 3, restSec: 40 },
      { eid: "russian_twist", name: "Russian Twist", region: "oblique", mode: "reps", base: 20, sets: 2, restSec: 30 },
    ],
  },
  {
    id: "metabolic", name: "Metabolic Core", focus: "Conditioning + core", minutes: 5,
    exercises: [
      { eid: "mountain_climber", name: "Mountain Climbers", region: "stability", mode: "time", base: 40, sets: 3, restSec: 25 },
      { eid: "russian_twist", name: "Russian Twist", region: "oblique", mode: "reps", base: 20, sets: 3, restSec: 25 },
      { eid: "plank", name: "Plank Hold", region: "stability", mode: "time", base: 40, sets: 2, restSec: 25 },
    ],
  },
];

export interface AbHistory { weight: number; reps: number; daysAgo: number }
export interface AbCtx {
  historyByEid: Record<string, AbHistory>;
  maxes: Record<string, number>;   // bench/squat/deadlift/ohp 1RMs
  bodyweightLb: number;
  unit: string;
}
export type AbRxSource = "progressed" | "seeded" | "base";
export interface AbRx {
  eid: string; name: string; region: string; mode: AbMode;
  sets: number; reps?: number; seconds?: number; load: number; unit: string;
  perSide?: boolean; source: AbRxSource; note: string;
}

const round = (n: number, step: number) => Math.max(0, Math.round(n / step) * step);

function seedLoad(spec: AbSpec, ctx: AbCtx): number {
  if (!spec.seed) return 0;
  const base = spec.seed.from === "bodyweight" ? ctx.bodyweightLb : (ctx.maxes[spec.seed.from] || 0);
  return round(base * spec.seed.pct, spec.increment || 5);
}

/** Resolve one exercise's exact dose from the lifter's history (+ seed/maxes). */
export function resolveAbRx(spec: AbSpec, ctx: AbCtx): AbRx {
  const base = { eid: spec.eid, name: spec.name, region: spec.region, mode: spec.mode, sets: spec.sets, unit: ctx.unit, perSide: spec.perSide, load: 0 };
  const h = ctx.historyByEid[spec.eid];
  if (spec.mode === "time") {
    const seconds = h && h.reps > 0 ? Math.min(spec.base * 2, Math.max(spec.base, h.reps + 5)) : spec.base;
    return { ...base, seconds, source: h ? "progressed" : "base", note: h ? "+5s on last hold" : "starting hold" };
  }
  if (spec.mode === "weighted") {
    const inc = spec.increment || 5;
    if (h && h.weight > 0) {
      // hit the target reps last time → add load and reset reps; else hold load, chase a rep
      if (h.reps >= spec.base) return { ...base, load: round(h.weight + inc, inc), reps: spec.base, source: "progressed", note: `+${inc} ${ctx.unit} on last` };
      return { ...base, load: round(h.weight, inc), reps: Math.max(spec.base, h.reps), source: "progressed", note: "match last load, add a rep" };
    }
    const seeded = seedLoad(spec, ctx);
    return { ...base, load: seeded, reps: spec.base, source: seeded > 0 ? "seeded" : "base", note: seeded > 0 ? "seeded from your strength" : "bodyweight to start" };
  }
  // bodyweight reps
  const reps = h && h.reps > 0 ? Math.min(spec.base * 2, Math.max(spec.base, h.reps + 1)) : spec.base;
  return { ...base, reps, source: h ? "progressed" : "base", note: h ? "+1 rep on last" : "starting reps" };
}

/** Build a full finisher prescription for a template. */
export function buildAbFinisher(template: AbTemplate, ctx: AbCtx): AbRx[] {
  return template.exercises.map((s) => resolveAbRx(s, ctx));
}

export function abTemplateById(id: string, templates = AB_TEMPLATES): AbTemplate | undefined {
  return templates.find((t) => t.id === id);
}

/** Adaptive pick: the circuit whose moves are the least-recently trained (freshest stimulus). */
export function selectAbTemplate(ctx: AbCtx, templates = AB_TEMPLATES): AbTemplate {
  const staleness = (t: AbTemplate) =>
    t.exercises.reduce((s, e) => s + (ctx.historyByEid[e.eid] ? ctx.historyByEid[e.eid].daysAgo : 999), 0) / t.exercises.length;
  let best = templates[0], bestScore = -1;
  for (const t of templates) {
    const score = staleness(t);
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return best;
}
