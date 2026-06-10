// ═══════════════════════════════════════════════════════════
//  programming.js — PURE programming brain (no DOM / storage / network)
//  Everything here is side-effect-free and unit-testable in Node.
//  Imported by ui.js. Keep it dependency-free so it never crashes the app.
// ═══════════════════════════════════════════════════════════

/* ---------- 1. GOAL / ARCHETYPE MODEL ---------- */

// Base goals match the 4 goals the original generator builds; ALL_GOALS adds
// the Wave-2 archetypes (the generator appends them at plan ids 64+).
export const BASE_GOALS = ["strength", "hybrid", "fat_loss", "muscle"];
export const ALL_GOALS = ["strength", "hybrid", "fat_loss", "muscle", "beginner", "powerlifting", "endurance"];

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
  "Postpartum Recovery":  { hybrid: 1 },
  // Wave-2 archetype focus areas
  "Brand New to Training": { beginner: 6 },
  "Powerlifting Total":    { powerlifting: 6, strength: 1 },
  "Run a Race (5K/10K/Half)": { endurance: 6, hybrid: 1 }
};

// Returns { goal, scores } — the dominant goal plus the full weight map.
export function goalFromFocus(focusAreas, primaryGoal) {
  const scores = {}; for (const g of ALL_GOALS) scores[g] = 0;
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
  for (const g of ALL_GOALS) if (scores[g] > best) { best = scores[g]; goal = g; }
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

// Strength / hybrid / powerlifting peak toward a true max test at wk 13.
export function peakIsMaxTest(goal) { return goal === "strength" || goal === "hybrid" || goal === "powerlifting"; }

export function phaseLabel(goal, w) {
  if (goal === "fat_loss") return w <= 4 ? "Base" : w <= 8 ? "Build" : w <= 12 ? "Burn" : "Benchmark";
  if (goal === "muscle")   return w <= 4 ? "Volume" : w <= 8 ? "Overload" : w <= 12 ? "Intensify" : "Pump Peak";
  if (goal === "beginner") return w <= 4 ? "Learn" : w <= 8 ? "Build" : w <= 12 ? "Grow" : "Check-In";
  if (goal === "endurance")return w <= 4 ? "Base" : w <= 8 ? "Build" : w <= 12 ? "Peak" : "Taper";
  // strength / hybrid / powerlifting
  return w <= 4 ? "Hypertrophy" : w <= 8 ? "Strength" : w <= 12 ? "Peak" : "Test";
}

// Top-set intensity as a fraction of e1RM, per goal per week.
const WK_FACTOR = {
  strength: [.62, .65, .68, .60, .72, .76, .79, .65, .80, .84, .88, .92, .85],
  hybrid:   [.62, .65, .68, .60, .72, .76, .79, .65, .80, .84, .88, .92, .85],
  muscle:   [.65, .68, .70, .60, .70, .72, .74, .64, .72, .75, .77, .78, .70],
  fat_loss: [.55, .58, .60, .52, .60, .62, .64, .56, .62, .64, .66, .66, .60],
  // Gentle, slow climb — never near a true max.
  beginner:    [.50, .52, .55, .50, .58, .60, .62, .56, .64, .66, .68, .68, .65],
  // Heaviest curve, true peak/test.
  powerlifting:[.65, .68, .72, .62, .76, .80, .84, .68, .86, .90, .93, .95, .90],
  // Low lifting intensity (running is the stimulus); tapers at the end.
  endurance:   [.55, .58, .60, .52, .62, .64, .66, .58, .66, .66, .64, .58, .55]
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
  if (goal === "beginner") return w <= 4 ? [12, 12, 12, 12] : w <= 8 ? [10, 10, 10, 12] : w <= 12 ? [8, 10, 8, 10] : [10, 12, 10, 12];
  if (goal === "powerlifting") return w <= 4 ? [6, 5, 5, 5] : w <= 8 ? [5, 4, 3, 4] : w <= 12 ? [3, 2, 2, 2] : [2, 1, 1, 1];
  if (goal === "endurance") return w <= 4 ? [10, 10, 8, 10] : w <= 8 ? [8, 8, 8, 10] : w <= 12 ? [8, 6, 8, 8] : [10, 10, 10, 12];
  // strength / hybrid (legacy)
  return w <= 4 ? [10, 8, 8, 6] : w <= 8 ? [6, 5, 4, 3] : w <= 12 ? [4, 3, 2, 2] : [3, 2, 1, 1];
}

export function phaseSetsFor(goal, w) {
  if (isDeloadWeek(w)) return goal === "fat_loss" ? 2 : 3;
  if (goal === "muscle")   return w <= 4 ? 4 : w <= 8 ? 4 : w <= 12 ? 5 : 4;
  if (goal === "fat_loss") return 3;
  if (goal === "beginner") return 3;                 // keep volume modest while learning
  if (goal === "endurance") return 3;                // preserve legs for running
  if (goal === "powerlifting") return w <= 4 ? 4 : w <= 12 ? 5 : 3;
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

// Working max for load math. The stored profile max is already ratcheted UP by
// applyDayAdaptation whenever a logged set's e1RM beats it, so this only ever
// RAISES the working max for a genuine recent PR — it never drops below the
// stored max (logged working sets estimate below a true 1RM, so pulling toward
// them would wrongly lighten everything). A fluke PR is capped via maxUp.
export function workingMax(profileMax, recentBest, opts) {
  const o = opts || {};
  const pm = Number(profileMax) || 0;
  const rb = Number(recentBest) || 0;
  if (pm <= 0) return Math.round(rb);
  if (rb <= 0) return pm;
  const maxUp = o.maxUp != null ? o.maxUp : 0.12;        // anti-fluke ceiling on a single PR
  const cappedUp = Math.min(rb, pm * (1 + maxUp));
  return Math.round(Math.max(pm, cappedUp));             // never below the stored max
}

/* ---------- 5b. PLATEAU DETECTION & GOAL PROJECTION ---------- */

// Chronological best-e1RM-per-day series for one exercise.
export function e1rmSeries(logs, exerciseName) {
  const byDate = {};
  for (const l of (logs || [])) {
    if (!l || l.exercise !== exerciseName) continue;
    const e = epley(Number(l.aW) || 0, Number(l.aR) || 0);
    if (e > (byDate[l.date] || 0)) byDate[l.date] = e;
  }
  return Object.keys(byDate).sort().map((d) => byDate[d]);
}

// Stall detector: no meaningful gain (and no fresh peak) over the recent window.
export function detectPlateau(series, opts) {
  const o = opts || {};
  const min = o.minSessions || 4;
  const tol = o.tol != null ? o.tol : 0.01;
  const s = (series || []).filter((n) => n > 0);
  if (s.length < min) return { plateaued: false, reason: "insufficient data", sessions: s.length };
  const recent = s.slice(-min);
  const first = recent[0], last = recent[recent.length - 1];
  const best = Math.max.apply(null, recent);
  const gain = first > 0 ? (last - first) / first : 0;
  const freshPeak = best > recent[0] * (1 + tol);
  if (gain <= tol && !freshPeak) return { plateaued: true, reason: `no progress in last ${min} sessions`, sessions: min };
  return { plateaued: false, sessions: min };
}

// Weeks to reach a target at a given per-week rate. Returns null if the rate is
// flat or moving the wrong direction (handles both gain and loss goals).
export function projectWeeksToGoal(current, target, perWeek) {
  const c = Number(current), t = Number(target), r = Number(perWeek);
  if (![c, t, r].every(Number.isFinite) || r === 0) return null;
  const remaining = t - c;
  if (remaining === 0) return { weeks: 0 };
  if (Math.sign(remaining) !== Math.sign(r)) return null; // trending away from goal
  const weeks = Math.ceil(remaining / r);
  return { weeks: Math.max(0, weeks) };
}

/* ---------- 5c. DATA-DRIVEN ACCESSORY PRESCRIPTION ---------- */
// Accessory reps follow the goal/phase; isolation runs higher than compound.
export function accessoryReps(goal, w, isolation) {
  const strengthy = goal === "strength" || goal === "powerlifting" || goal === "hybrid";
  const lean = goal === "fat_loss" || goal === "endurance";
  if (isolation) {
    if (strengthy) return w <= 8 ? 12 : 10;
    if (lean) return 15;
    return w <= 4 ? 15 : w <= 12 ? 12 : 15;          // hypertrophy / beginner
  }
  if (strengthy) return w <= 4 ? 10 : w <= 8 ? 8 : w <= 12 ? 6 : 8;
  if (lean) return 12;
  return w <= 4 ? 12 : w <= 12 ? 10 : 12;
}

// Sets, reps, and load for an accessory — personalized to phase, experience,
// and the user's own logged history for that movement. Pure: caller passes the
// estimate, last logged load, and recent feel/whether they beat the target.
export function accessoryRx(opts) {
  const o = opts || {};
  const goal = o.goal || "strength";
  const w = Math.max(1, Number(o.week) || 1);
  const iso = !!o.isolation;
  const exp = Number(o.experienceMonths) || 0;
  const deload = isDeloadWeek(w);
  const reps = accessoryReps(goal, w, iso);
  let sets = exp >= 18 ? (iso ? 3 : 4) : exp >= 6 ? 3 : 2;   // experience-scaled volume
  if (deload) sets = Math.max(2, sets - 1);
  let target = Number(o.estTarget) || 0;
  let basis = "scaled to your strength";
  const last = Number(o.lastLogged) || 0;
  if (last > 0) {
    target = last;
    basis = "from your last session";
    if (o.lastFeel === "easy" || o.beatTarget) { target = last * 1.04; basis = "progressed from last time"; }
    else if (o.lastFeel === "hard") { basis = "held (last time was hard)"; }
  }
  return { sets, reps, target: Math.max(0, target), basis };
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
  const goalName = { strength: "strength", hybrid: "hybrid", fat_loss: "fat loss", muscle: "muscle", beginner: "beginner", powerlifting: "powerlifting", endurance: "endurance" }[plan.goal] || plan.goal;
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
