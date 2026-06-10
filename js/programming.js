// ═══════════════════════════════════════════════════════════
//  programming.js — PURE programming brain (no DOM / storage / network)
//  Everything here is side-effect-free and unit-testable in Node.
//  Imported by ui.js. Keep it dependency-free so it never crashes the app.
// ═══════════════════════════════════════════════════════════

/* ---------- 1. GOAL / ARCHETYPE MODEL ---------- */

// Base goals match the 4 goals the 64-plan generator already builds.
export const BASE_GOALS = ["strength", "hybrid", "fat_loss", "muscle"];

// Map each onboarding focus-area label to goal weights. Lets us pick the
// dominant goal AND detect secondary intent (e.g. running + lifting = hybrid).
const FOCUS_GOAL_WEIGHTS = {
  "Bench Press":          { strength: 3, muscle: 1 },
  "Squat":                { strength: 3, muscle: 1 },
  "Deadlift":             { strength: 3, muscle: 1 },
  "5K Running":           { hybrid: 3, fat_loss: 1 },
  "Improve Conditioning": { hybrid: 3, fat_loss: 2 },
  "Lose Weight":          { fat_loss: 4 },
  "Build Muscle":         { muscle: 4 },
  "General Fitness":      { hybrid: 2, muscle: 1, fat_loss: 1 },
  "Hourglass Shape":      { muscle: 3, fat_loss: 1 },
  "Glute Shelf":          { muscle: 3, strength: 1 },
  "Posture & Back Tone":  { muscle: 2, hybrid: 1 },
  "Pilates Plus Tone":    { fat_loss: 2, muscle: 1 },
  "Home-Friendly Workouts": { hybrid: 1, fat_loss: 1, muscle: 1 },
  "Pregnancy Safe":       { hybrid: 1 },
  "Postpartum Recovery":  { hybrid: 1 }
};

// Returns { goal, scores } — the dominant base goal plus the full weight map.
export function goalFromFocus(focusAreas, primaryGoal) {
  const scores = { strength: 0, hybrid: 0, fat_loss: 0, muscle: 0 };
  for (const fa of (focusAreas || [])) {
    const w = FOCUS_GOAL_WEIGHTS[fa];
    if (!w) continue;
    for (const g of Object.keys(w)) scores[g] += w[g];
  }
  // An explicitly chosen primary goal gets a decisive boost.
  if (primaryGoal && FOCUS_GOAL_WEIGHTS[primaryGoal]) {
    const w = FOCUS_GOAL_WEIGHTS[primaryGoal];
    for (const g of Object.keys(w)) scores[g] += w[g] * 2;
  }
  let goal = "hybrid", best = -1;
  for (const g of BASE_GOALS) if (scores[g] > best) { best = scores[g]; goal = g; }
  if (best <= 0) goal = "hybrid"; // sensible default when nothing selected
  return { goal, scores };
}

/* ---------- 2. EQUIPMENT MODEL ---------- */

export const ALL_EQUIPMENT = ["barbell", "dumbbell", "kettlebell", "machine", "bands", "pullup_bar", "bench", "bodyweight"];

// Normalize a stored equipment value (legacy "gym"/"home" string, or an
// array inventory) into a Set we can test against.
export function equipmentSet(equip) {
  if (Array.isArray(equip)) {
    const s = new Set(equip);
    s.add("bodyweight"); // always available
    return s;
  }
  if (equip === "home") return new Set(["dumbbell", "bands", "bodyweight"]);
  if (equip === "minimal" || equip === "none") return new Set(["bodyweight"]);
  // "gym" / unknown → full access
  return new Set(ALL_EQUIPMENT);
}

// Substitution table: eid → ordered fallbacks keyed by required equipment.
// We only reference exercise ids that exist in the catalog.
const SUBS = {
  bench:    [["machine", "machine_chest_press"], ["dumbbell", "incline_db"], ["bodyweight", "pushup"]],
  cgbench:  [["machine", "tricep_pushdown"], ["dumbbell", "incline_db"], ["bodyweight", "diamond_pushup"]],
  incline_db: [["machine", "machine_chest_press"], ["bodyweight", "decline_pushup"]],
  squat:    [["machine", "leg_press"], ["dumbbell", "goblet_squat"], ["bodyweight", "air_squat"]],
  deadlift: [["dumbbell", "rdl"], ["kettlebell", "kb_swing"], ["bodyweight", "glute_bridge"]],
  rdl:      [["kettlebell", "kb_swing"], ["dumbbell", "hip_thrust"], ["bodyweight", "glute_bridge"]],
  row:      [["machine", "seated_cable_row"], ["dumbbell", "chest_supported_row"], ["bands", "face_pull"], ["bodyweight", "inverted_row"]],
  pullup:   [["machine", "lat_pulldown"], ["pullup_bar", "chinup"], ["bands", "face_pull"], ["bodyweight", "inverted_row"]],
  ohp:      [["dumbbell", "arnold_press"], ["bands", "champagne"], ["bodyweight", "pike_pushup"]],
  dip:      [["machine", "tricep_pushdown"], ["bodyweight", "diamond_pushup"]],
  farmer:   [["dumbbell", "suitcase"], ["bodyweight", "plank"]],
  lunge:    [["dumbbell", "step_up"], ["bodyweight", "air_squat"]],
  bss:      [["dumbbell", "step_up"], ["bodyweight", "air_squat"]],
  lat_raise:[["machine", "rear_delt_fly"], ["bands", "champagne"], ["bodyweight", "pike_pushup"]]
};

// Equipment an exercise needs (anything not listed is treated as bodyweight).
const EX_EQUIP = {
  bench: "barbell", cgbench: "barbell", squat: "barbell", deadlift: "barbell",
  rdl: "barbell", row: "barbell", ohp: "dumbbell", incline_db: "dumbbell",
  dip: "bodyweight", farmer: "dumbbell", lunge: "dumbbell", bss: "dumbbell",
  lat_raise: "dumbbell", pullup: "pullup_bar", face_pull: "bands",
  // Wave 2 catalog
  front_squat: "barbell", goblet_squat: "dumbbell", leg_press: "machine", hack_squat: "machine",
  leg_ext: "machine", leg_curl: "machine", calf_raise: "machine", step_up: "dumbbell",
  glute_bridge: "bodyweight", bb_hip_thrust: "barbell", kb_swing: "kettlebell",
  lat_pulldown: "machine", seated_cable_row: "machine", chest_supported_row: "dumbbell",
  inverted_row: "bodyweight", chinup: "pullup_bar", shrug: "dumbbell",
  machine_chest_press: "machine", cable_fly: "machine", pec_deck: "machine",
  pike_pushup: "bodyweight", decline_pushup: "bodyweight", diamond_pushup: "bodyweight",
  bb_ohp: "barbell", arnold_press: "dumbbell", rear_delt_fly: "dumbbell",
  bb_curl: "barbell", db_curl: "dumbbell", hammer_curl: "dumbbell", cable_curl: "machine",
  tricep_pushdown: "machine", skullcrusher: "barbell", overhead_ext: "dumbbell",
  hanging_leg_raise: "pullup_bar", cable_crunch: "machine", russian_twist: "bodyweight",
  side_plank: "bodyweight", mountain_climber: "bodyweight",
  row_erg: "machine", bike_erg: "machine", jump_rope: "bodyweight", box_jump: "bodyweight", wall_ball: "machine"
};

export function exerciseNeeds(eid) { return EX_EQUIP[eid] || "bodyweight"; }

// Return an eid the user can actually perform with their equipment.
export function substituteEid(eid, equip) {
  const set = equipmentSet(equip);
  const need = exerciseNeeds(eid);
  if (need === "bodyweight" || set.has(need)) return eid;
  const subs = SUBS[eid] || [];
  for (const [req, altEid] of subs) {
    if (req === "bodyweight" || set.has(req)) return altEid;
  }
  return eid; // no known sub — leave as-is (caller may still show it)
}

/* ---------- 3. GOAL-AWARE PERIODIZATION ---------- */
// Each goal gets its own 13-week shape. We keep 4 visual phases + deloads at
// wk 4 & 8 so the existing timeline UI stays valid, but reps/sets/intensity
// and the week-13 semantics differ per goal.

export function isDeloadWeek(w) { return w === 4 || w === 8; }

// Only strength/hybrid peak toward a true max test at wk 13.
export function peakIsMaxTest(goal) { return goal === "strength" || goal === "hybrid"; }

export function phaseLabel(goal, w) {
  if (goal === "fat_loss") return w <= 4 ? "Base" : w <= 8 ? "Build" : w <= 12 ? "Burn" : "Benchmark";
  if (goal === "muscle")   return w <= 4 ? "Volume" : w <= 8 ? "Overload" : w <= 12 ? "Intensify" : "Pump Peak";
  // strength / hybrid (legacy labels preserved)
  return w <= 4 ? "Hypertrophy" : w <= 8 ? "Strength" : w <= 12 ? "Peak" : "Test";
}

// Top-set intensity as a fraction of e1RM, per goal per week.
const WK_FACTOR = {
  strength: [.62, .65, .68, .60, .72, .76, .79, .65, .80, .84, .88, .92, .85],
  hybrid:   [.62, .65, .68, .60, .72, .76, .79, .65, .80, .84, .88, .92, .85],
  muscle:   [.65, .68, .70, .60, .70, .72, .74, .64, .72, .75, .77, .78, .70],
  fat_loss: [.55, .58, .60, .52, .60, .62, .64, .56, .62, .64, .66, .66, .60]
};
export function wkFactorFor(goal, w) {
  const arr = WK_FACTOR[goal] || WK_FACTOR.strength;
  const i = Math.max(1, Math.min(13, w)) - 1;
  return arr[i];
}

// Rep targets [primaryHeavy, mainWork, ...] per goal/week.
export function phaseRepsFor(goal, w) {
  if (goal === "muscle")   return w <= 4 ? [12, 12, 10, 12] : w <= 8 ? [10, 10, 8, 10] : w <= 12 ? [8, 8, 6, 8] : [12, 15, 12, 15];
  if (goal === "fat_loss") return w <= 4 ? [15, 12, 15, 12] : w <= 8 ? [12, 12, 12, 15] : w <= 12 ? [12, 10, 12, 15] : [15, 20, 15, 20];
  // strength / hybrid (legacy)
  return w <= 4 ? [10, 8, 8, 6] : w <= 8 ? [6, 5, 4, 3] : w <= 12 ? [4, 3, 2, 2] : [3, 2, 1, 1];
}

export function phaseSetsFor(goal, w) {
  if (isDeloadWeek(w)) return goal === "fat_loss" ? 2 : 3;
  if (goal === "muscle")   return w <= 4 ? 4 : w <= 8 ? 4 : w <= 12 ? 5 : 4;
  if (goal === "fat_loss") return 3;
  return w <= 4 ? 4 : w <= 12 ? 5 : 3; // strength / hybrid
}

/* ---------- 4. COMPUTED WARMUP SETS ---------- */
// Replaces hard-coded "bar×10, 95×8, 135×5" with a ramp scaled to the actual
// top set. Never prescribes a warmup heavier than ~90% of the work weight.

export function warmupSets(topSetLb, opts) {
  const o = opts || {};
  const bar = o.bar != null ? o.bar : 45;
  const unit = o.unit || "lb";
  const top = Number(topSetLb) || 0;
  if (top <= bar * 1.2) return []; // light enough that warmup ramp is moot
  const round = (n) => Math.round(n / 5) * 5;
  const steps = [
    { pct: 0,    reps: 10, w: bar },           // empty bar
    { pct: 0.5,  reps: 8 },
    { pct: 0.7,  reps: 5 },
    { pct: 0.85, reps: 3 }
  ];
  const out = [];
  let lastW = -1;
  for (const s of steps) {
    let w = s.w != null ? s.w : round(top * s.pct);
    if (w >= top * 0.9) break;       // don't warm up at the working weight
    if (w < bar) w = bar;
    if (w === lastW) continue;        // skip duplicate rungs for light loads
    lastW = w;
    out.push({ weight: w, reps: s.reps, unit });
  }
  return out;
}

export function warmupText(topSetLb, opts) {
  const sets = warmupSets(topSetLb, opts);
  if (!sets.length) return "";
  const unit = (opts && opts.unit) || "lb";
  return sets.map((s, i) => (i === 0 && s.weight === ((opts && opts.bar) || 45))
    ? `bar×${s.reps}`
    : `${s.weight}${unit}×${s.reps}`).join(", ");
}

/* ---------- 5. ROLLING e1RM FROM LOGGED PERFORMANCE ---------- */
// Recompute a working 1RM estimate from recent logged sets so the program
// gets smarter as the user logs, instead of trusting a frozen onboarding max.

export function epley(w, r) { return (r <= 0 || w <= 0) ? 0 : w * (1 + r / 30); }

// logs: [{date, exercise, aW, aR}], exerciseName: display name to match.
// Returns the best e1RM seen in the recent window, or 0 if none.
export function recentBestE1RM(logs, exerciseName, opts) {
  const o = opts || {};
  const windowDays = o.windowDays || 56;
  const nowMs = o.now != null ? o.now : Date.now();
  const cutoff = nowMs - windowDays * 864e5;
  let best = 0;
  for (const l of (logs || [])) {
    if (!l || l.exercise !== exerciseName) continue;
    const t = new Date(String(l.date) + "T12:00:00").getTime();
    if (!Number.isNaN(t) && t < cutoff) continue;
    const e = epley(Number(l.aW) || 0, Number(l.aR) || 0);
    if (e > best) best = e;
  }
  return Math.round(best);
}

// Blend a frozen profile max with recent logged performance. We trust logged
// data but clamp how far a single window can move the working max (anti-fluke).
export function workingMax(profileMax, recentBest, opts) {
  const o = opts || {};
  const pm = Number(profileMax) || 0;
  const rb = Number(recentBest) || 0;
  if (rb <= 0) return pm;
  if (pm <= 0) return rb;
  const maxUp = o.maxUp != null ? o.maxUp : 0.12;   // +12% per window cap
  const maxDown = o.maxDown != null ? o.maxDown : 0.10; // -10% cap
  const hi = pm * (1 + maxUp), lo = pm * (1 - maxDown);
  return Math.round(Math.max(lo, Math.min(hi, rb)));
}

/* ---------- 6. PLAN SCORING (the keystone) ---------- */
// Score a generated plan object {id,name,goal,slots} against the user profile.
// Higher = better fit. Pure: caller passes everything in.

export function scorePlan(plan, ctx) {
  const { goal, sex, trainingDays, sessionMin, experienceMonths } = ctx;
  let s = 0;
  // Goal match dominates.
  if (plan.goal === goal) s += 100;
  else if ((goal === "hybrid" && plan.goal === "strength") ||
           (goal === "strength" && plan.goal === "hybrid")) s += 40;
  else if ((goal === "fat_loss" && plan.goal === "hybrid") ||
           (goal === "muscle" && plan.goal === "strength")) s += 30;

  // Sex match (women's vs men's template).
  const wantWomen = sex === "female";
  const isWomen = /Women/i.test(plan.name);
  if (wantWomen === isWomen) s += 30;

  // Frequency: plan slot count vs available training days.
  const days = Math.max(1, (trainingDays || []).length || 5);
  const slots = (plan.slots || []).length || 3;
  s -= Math.abs(slots - days) * 8;
  // Frequency tier tag in name ("5-6 Day" vs "3-4 Day").
  const planHiFreq = /5-6 Day/i.test(plan.name);
  if ((days >= 5) === planHiFreq) s += 15;

  // Session length: Express (<=30min) vs Full.
  const wantExpress = (sessionMin || 45) <= 30;
  const isExpress = /Express/i.test(plan.name);
  if (wantExpress === isExpress) s += 12;

  // Experience: Advanced vs Foundation.
  const advanced = (experienceMonths || 0) >= 18;
  const isAdvanced = /Advanced/i.test(plan.name);
  if (advanced === isAdvanced) s += 12;

  return s;
}

// Rank all plans; returns array sorted best-first with {plan, score, why}.
export function rankPlans(plans, ctx) {
  const ranked = plans.map((plan) => ({ plan, score: scorePlan(plan, ctx), why: whyPlan(plan, ctx) }));
  ranked.sort((a, b) => b.score - a.score || a.plan.id - b.plan.id);
  return ranked;
}

export function bestPlanId(plans, ctx) {
  const r = rankPlans(plans, ctx);
  return r.length ? r[0].plan.id : 0;
}

// One-line human rationale for a recommendation.
export function whyPlan(plan, ctx) {
  const bits = [];
  const goalName = { strength: "strength", hybrid: "hybrid", fat_loss: "fat loss", muscle: "muscle" }[plan.goal] || plan.goal;
  if (plan.goal === ctx.goal) bits.push(`matches your ${goalName} goal`);
  const days = (ctx.trainingDays || []).length || 5;
  const slots = (plan.slots || []).length;
  if (Math.abs(slots - days) <= 1) bits.push(`fits ${days} training day${days !== 1 ? "s" : ""}/week`);
  if (((ctx.sessionMin || 45) <= 30) === /Express/i.test(plan.name)) {
    bits.push(/Express/i.test(plan.name) ? "short sessions" : "full sessions");
  }
  if (((ctx.experienceMonths || 0) >= 18) === /Advanced/i.test(plan.name)) {
    bits.push(/Advanced/i.test(plan.name) ? "advanced progression" : "beginner-friendly ramp");
  }
  return bits.length ? bits.join(" · ") : "balanced general fit";
}

/* ---------- 7. MEDIA URL NORMALIZATION ---------- */
// Convert any YouTube URL (watch / shorts / youtu.be / embed) into a clean
// /embed/ URL so inline players actually load.

export function toEmbedUrl(url) {
  if (!url || typeof url !== "string") return url;
  let id = "";
  let m;
  if ((m = url.match(/[?&]v=([\w-]{6,})/))) id = m[1];
  else if ((m = url.match(/youtu\.be\/([\w-]{6,})/))) id = m[1];
  else if ((m = url.match(/\/shorts\/([\w-]{6,})/))) id = m[1];
  else if ((m = url.match(/\/embed\/([\w-]{6,})/))) id = m[1];
  if (!id) return url;
  return `https://www.youtube.com/embed/${id}`;
}
