// ⚠️ AUTO-GENERATED from src/core/*.ts — do not edit by hand.
// Regenerate with:  npm run build:core

// src/core/goals.ts
var BASE_GOALS = ["strength", "hybrid", "fat_loss", "muscle"];
var ALL_GOALS = [
  "strength",
  "hybrid",
  "fat_loss",
  "muscle",
  "beginner",
  "powerlifting",
  "endurance"
];
var FOCUS_GOAL_WEIGHTS = {
  "Bench Press": { strength: 3, muscle: 1 },
  Squat: { strength: 3, muscle: 1 },
  Deadlift: { strength: 3, muscle: 1 },
  "5K Running": { hybrid: 3, fat_loss: 1 },
  "Improve Conditioning": { hybrid: 3, fat_loss: 2 },
  "Lose Weight": { fat_loss: 4 },
  "Build Muscle": { muscle: 4 },
  "General Fitness": { hybrid: 2, muscle: 1, fat_loss: 1 },
  "Hourglass Shape": { muscle: 3, fat_loss: 1 },
  "Glute Shelf": { muscle: 3, strength: 1 },
  "Posture & Back Tone": { muscle: 2, hybrid: 1 },
  "Pilates Plus Tone": { fat_loss: 2, muscle: 1 },
  "Home-Friendly Workouts": { hybrid: 1, fat_loss: 1, muscle: 1 },
  "Pregnancy Safe": { hybrid: 1 },
  "Postpartum Recovery": { hybrid: 1 },
  // Wave-2 archetype focus areas
  "Brand New to Training": { beginner: 6 },
  "Powerlifting Total": { powerlifting: 6, strength: 1 },
  "Run a Race (5K/10K/Half)": { endurance: 6, hybrid: 1 }
};
function goalFromFocus(focusAreas, primaryGoal) {
  const scores = {};
  for (const g of ALL_GOALS) scores[g] = 0;
  for (const fa of focusAreas || []) {
    const w = FOCUS_GOAL_WEIGHTS[fa];
    if (!w) continue;
    for (const g of Object.keys(w)) scores[g] += w[g];
  }
  if (primaryGoal && FOCUS_GOAL_WEIGHTS[primaryGoal]) {
    const w = FOCUS_GOAL_WEIGHTS[primaryGoal];
    for (const g of Object.keys(w)) scores[g] += w[g] * 2;
  }
  let goal = "hybrid";
  let best = -1;
  for (const g of ALL_GOALS)
    if (scores[g] > best) {
      best = scores[g];
      goal = g;
    }
  if (best <= 0) goal = "hybrid";
  return { goal, scores };
}

// src/core/equipment.ts
var ALL_EQUIPMENT = [
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "bands",
  "pullup_bar",
  "bench",
  "bodyweight"
];
function equipmentSet(equip) {
  if (Array.isArray(equip)) {
    const s = new Set(equip);
    s.add("bodyweight");
    return s;
  }
  if (equip === "home") return /* @__PURE__ */ new Set(["dumbbell", "bands", "bodyweight"]);
  if (equip === "minimal" || equip === "none") return /* @__PURE__ */ new Set(["bodyweight"]);
  return new Set(ALL_EQUIPMENT);
}
var SUBS = {
  bench: [["machine", "machine_chest_press"], ["dumbbell", "incline_db"], ["bodyweight", "pushup"]],
  cgbench: [["machine", "tricep_pushdown"], ["dumbbell", "incline_db"], ["bodyweight", "diamond_pushup"]],
  incline_db: [["machine", "machine_chest_press"], ["bodyweight", "decline_pushup"]],
  squat: [["machine", "leg_press"], ["dumbbell", "goblet_squat"], ["bodyweight", "air_squat"]],
  deadlift: [["dumbbell", "rdl"], ["kettlebell", "kb_swing"], ["bodyweight", "glute_bridge"]],
  rdl: [["kettlebell", "kb_swing"], ["dumbbell", "hip_thrust"], ["bodyweight", "glute_bridge"]],
  row: [["machine", "seated_cable_row"], ["dumbbell", "chest_supported_row"], ["bands", "face_pull"], ["bodyweight", "inverted_row"]],
  pullup: [["machine", "lat_pulldown"], ["pullup_bar", "chinup"], ["bands", "face_pull"], ["bodyweight", "inverted_row"]],
  ohp: [["dumbbell", "arnold_press"], ["bands", "champagne"], ["bodyweight", "pike_pushup"]],
  dip: [["machine", "tricep_pushdown"], ["bodyweight", "diamond_pushup"]],
  farmer: [["dumbbell", "suitcase"], ["bodyweight", "plank"]],
  lunge: [["dumbbell", "step_up"], ["bodyweight", "air_squat"]],
  bss: [["dumbbell", "step_up"], ["bodyweight", "air_squat"]],
  lat_raise: [["machine", "rear_delt_fly"], ["bands", "champagne"], ["bodyweight", "pike_pushup"]]
};
var EX_EQUIP = {
  bench: "barbell",
  cgbench: "barbell",
  squat: "barbell",
  deadlift: "barbell",
  rdl: "barbell",
  row: "barbell",
  ohp: "dumbbell",
  incline_db: "dumbbell",
  dip: "bodyweight",
  farmer: "dumbbell",
  lunge: "dumbbell",
  bss: "dumbbell",
  lat_raise: "dumbbell",
  pullup: "pullup_bar",
  face_pull: "bands",
  // Wave 2 catalog
  front_squat: "barbell",
  goblet_squat: "dumbbell",
  leg_press: "machine",
  hack_squat: "machine",
  leg_ext: "machine",
  leg_curl: "machine",
  calf_raise: "machine",
  step_up: "dumbbell",
  glute_bridge: "bodyweight",
  bb_hip_thrust: "barbell",
  kb_swing: "kettlebell",
  lat_pulldown: "machine",
  seated_cable_row: "machine",
  chest_supported_row: "dumbbell",
  inverted_row: "bodyweight",
  chinup: "pullup_bar",
  shrug: "dumbbell",
  machine_chest_press: "machine",
  cable_fly: "machine",
  pec_deck: "machine",
  pike_pushup: "bodyweight",
  decline_pushup: "bodyweight",
  diamond_pushup: "bodyweight",
  bb_ohp: "barbell",
  arnold_press: "dumbbell",
  rear_delt_fly: "dumbbell",
  bb_curl: "barbell",
  db_curl: "dumbbell",
  hammer_curl: "dumbbell",
  cable_curl: "machine",
  tricep_pushdown: "machine",
  skullcrusher: "barbell",
  overhead_ext: "dumbbell",
  hanging_leg_raise: "pullup_bar",
  cable_crunch: "machine",
  russian_twist: "bodyweight",
  side_plank: "bodyweight",
  mountain_climber: "bodyweight",
  row_erg: "machine",
  bike_erg: "machine",
  jump_rope: "bodyweight",
  box_jump: "bodyweight",
  wall_ball: "machine"
};
function exerciseNeeds(eid) {
  return EX_EQUIP[eid] || "bodyweight";
}
function substituteEid(eid, equip) {
  const set = equipmentSet(equip);
  const need = exerciseNeeds(eid);
  if (need === "bodyweight" || set.has(need)) return eid;
  const subs = SUBS[eid] || [];
  for (const [req, altEid] of subs) {
    if (req === "bodyweight" || set.has(req)) return altEid;
  }
  return eid;
}

// src/core/periodization.ts
function isDeloadWeek(w) {
  return w === 4 || w === 8;
}
function peakIsMaxTest(goal) {
  return goal === "strength" || goal === "hybrid" || goal === "powerlifting";
}
function phaseLabel(goal, w) {
  if (goal === "fat_loss") return w <= 4 ? "Base" : w <= 8 ? "Build" : w <= 12 ? "Burn" : "Benchmark";
  if (goal === "muscle") return w <= 4 ? "Volume" : w <= 8 ? "Overload" : w <= 12 ? "Intensify" : "Pump Peak";
  if (goal === "beginner") return w <= 4 ? "Learn" : w <= 8 ? "Build" : w <= 12 ? "Grow" : "Check-In";
  if (goal === "endurance") return w <= 4 ? "Base" : w <= 8 ? "Build" : w <= 12 ? "Peak" : "Taper";
  return w <= 4 ? "Hypertrophy" : w <= 8 ? "Strength" : w <= 12 ? "Peak" : "Test";
}
var WK_FACTOR = {
  strength: [0.62, 0.65, 0.68, 0.6, 0.72, 0.76, 0.79, 0.65, 0.8, 0.84, 0.88, 0.92, 0.85],
  hybrid: [0.62, 0.65, 0.68, 0.6, 0.72, 0.76, 0.79, 0.65, 0.8, 0.84, 0.88, 0.92, 0.85],
  muscle: [0.65, 0.68, 0.7, 0.6, 0.7, 0.72, 0.74, 0.64, 0.72, 0.75, 0.77, 0.78, 0.7],
  fat_loss: [0.55, 0.58, 0.6, 0.52, 0.6, 0.62, 0.64, 0.56, 0.62, 0.64, 0.66, 0.66, 0.6],
  beginner: [0.5, 0.52, 0.55, 0.5, 0.58, 0.6, 0.62, 0.56, 0.64, 0.66, 0.68, 0.68, 0.65],
  powerlifting: [0.65, 0.68, 0.72, 0.62, 0.76, 0.8, 0.84, 0.68, 0.86, 0.9, 0.93, 0.95, 0.9],
  endurance: [0.55, 0.58, 0.6, 0.52, 0.62, 0.64, 0.66, 0.58, 0.66, 0.66, 0.64, 0.58, 0.55]
};
function wkFactorFor(goal, w) {
  const arr = WK_FACTOR[goal] || WK_FACTOR.strength;
  const i = Math.max(1, Math.min(13, w)) - 1;
  return arr[i];
}
function phaseRepsFor(goal, w) {
  if (goal === "muscle") return w <= 4 ? [12, 12, 10, 12] : w <= 8 ? [10, 10, 8, 10] : w <= 12 ? [8, 8, 6, 8] : [12, 15, 12, 15];
  if (goal === "fat_loss") return w <= 4 ? [15, 12, 15, 12] : w <= 8 ? [12, 12, 12, 15] : w <= 12 ? [12, 10, 12, 15] : [15, 20, 15, 20];
  if (goal === "beginner") return w <= 4 ? [12, 12, 12, 12] : w <= 8 ? [10, 10, 10, 12] : w <= 12 ? [8, 10, 8, 10] : [10, 12, 10, 12];
  if (goal === "powerlifting") return w <= 4 ? [6, 5, 5, 5] : w <= 8 ? [5, 4, 3, 4] : w <= 12 ? [3, 2, 2, 2] : [2, 1, 1, 1];
  if (goal === "endurance") return w <= 4 ? [10, 10, 8, 10] : w <= 8 ? [8, 8, 8, 10] : w <= 12 ? [8, 6, 8, 8] : [10, 10, 10, 12];
  return w <= 4 ? [10, 8, 8, 6] : w <= 8 ? [6, 5, 4, 3] : w <= 12 ? [4, 3, 2, 2] : [3, 2, 1, 1];
}
function phaseSetsFor(goal, w) {
  if (isDeloadWeek(w)) return goal === "fat_loss" ? 2 : 3;
  if (goal === "muscle") return w <= 4 ? 4 : w <= 8 ? 4 : w <= 12 ? 5 : 4;
  if (goal === "fat_loss") return 3;
  if (goal === "beginner") return 3;
  if (goal === "endurance") return 3;
  if (goal === "powerlifting") return w <= 4 ? 4 : w <= 12 ? 5 : 3;
  return w <= 4 ? 4 : w <= 12 ? 5 : 3;
}
function warmupSets(topSetLb, opts) {
  const o = opts || {};
  const bar = o.bar != null ? o.bar : 45;
  const unit = o.unit || "lb";
  const top = Number(topSetLb) || 0;
  if (top <= bar * 1.2) return [];
  const round2 = (n) => Math.round(n / 5) * 5;
  const steps = [
    { pct: 0, reps: 10, w: bar },
    { pct: 0.5, reps: 8 },
    { pct: 0.7, reps: 5 },
    { pct: 0.85, reps: 3 }
  ];
  const out = [];
  let lastW = -1;
  for (const s of steps) {
    let w = s.w != null ? s.w : round2(top * s.pct);
    if (w >= top * 0.9) break;
    if (w < bar) w = bar;
    if (w === lastW) continue;
    lastW = w;
    out.push({ weight: w, reps: s.reps, unit });
  }
  return out;
}
function warmupText(topSetLb, opts) {
  const sets = warmupSets(topSetLb, opts);
  if (!sets.length) return "";
  const unit = opts && opts.unit || "lb";
  return sets.map(
    (s, i) => i === 0 && s.weight === (opts && opts.bar || 45) ? `bar\xD7${s.reps}` : `${s.weight}${unit}\xD7${s.reps}`
  ).join(", ");
}
function accessoryReps(goal, w, isolation) {
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
function accessoryRx(opts) {
  const o = opts || {};
  const goal = o.goal || "strength";
  const w = Math.max(1, Number(o.week) || 1);
  const iso = !!o.isolation;
  const exp = Number(o.experienceMonths) || 0;
  const deload = isDeloadWeek(w);
  const reps = accessoryReps(goal, w, iso);
  let sets = exp >= 18 ? iso ? 3 : 4 : exp >= 6 ? 3 : 2;
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

// src/core/strength.ts
function epley(w, r) {
  return r <= 0 || w <= 0 ? 0 : w * (1 + r / 30);
}
function recentBestE1RM(logs, exerciseName, opts) {
  const o = opts || {};
  const windowDays = o.windowDays || 56;
  const nowMs = o.now != null ? o.now : Date.now();
  const cutoff = nowMs - windowDays * 864e5;
  let best = 0;
  for (const l of logs || []) {
    if (!l || l.exercise !== exerciseName) continue;
    const t = (/* @__PURE__ */ new Date(String(l.date) + "T12:00:00")).getTime();
    if (!Number.isNaN(t) && t < cutoff) continue;
    const e = epley(Number(l.aW) || 0, Number(l.aR) || 0);
    if (e > best) best = e;
  }
  return Math.round(best);
}
function workingMax(profileMax, recentBest, opts) {
  const o = opts || {};
  const pm = Number(profileMax) || 0;
  const rb = Number(recentBest) || 0;
  if (pm <= 0) return Math.round(rb);
  if (rb <= 0) return pm;
  const maxUp = o.maxUp != null ? o.maxUp : 0.12;
  const cappedUp = Math.min(rb, pm * (1 + maxUp));
  return Math.round(Math.max(pm, cappedUp));
}
function e1rmSeries(logs, exerciseName) {
  const byDate = {};
  for (const l of logs || []) {
    if (!l || l.exercise !== exerciseName) continue;
    const e = epley(Number(l.aW) || 0, Number(l.aR) || 0);
    if (e > (byDate[l.date] || 0)) byDate[l.date] = e;
  }
  return Object.keys(byDate).sort().map((d) => byDate[d]);
}
function detectPlateau(series, opts) {
  const o = opts || {};
  const min = o.minSessions || 4;
  const tol = o.tol != null ? o.tol : 0.01;
  const s = (series || []).filter((n) => n > 0);
  if (s.length < min) return { plateaued: false, reason: "insufficient data", sessions: s.length };
  const recent = s.slice(-min);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const best = Math.max.apply(null, recent);
  const gain = first > 0 ? (last - first) / first : 0;
  const freshPeak = best > recent[0] * (1 + tol);
  if (gain <= tol && !freshPeak) return { plateaued: true, reason: `no progress in last ${min} sessions`, sessions: min };
  return { plateaued: false, sessions: min };
}
function projectWeeksToGoal(current, target, perWeek) {
  const c = Number(current);
  const t = Number(target);
  const r = Number(perWeek);
  if (![c, t, r].every(Number.isFinite) || r === 0) return null;
  const remaining = t - c;
  if (remaining === 0) return { weeks: 0 };
  if (Math.sign(remaining) !== Math.sign(r)) return null;
  const weeks = Math.ceil(remaining / r);
  return { weeks: Math.max(0, weeks) };
}

// src/core/scoring.ts
function scorePlan(plan, ctx) {
  const { goal, sex, trainingDays, sessionMin, experienceMonths } = ctx;
  let s = 0;
  if (plan.goal === goal) s += 100;
  else if (goal === "hybrid" && plan.goal === "strength" || goal === "strength" && plan.goal === "hybrid") s += 40;
  else if (goal === "fat_loss" && plan.goal === "hybrid" || goal === "muscle" && plan.goal === "strength") s += 30;
  const wantWomen = sex === "female";
  const isWomen = /Women/i.test(plan.name);
  if (wantWomen === isWomen) s += 30;
  const days = Math.max(1, (trainingDays || []).length || 5);
  const slots = (plan.slots || []).length || 3;
  s -= Math.abs(slots - days) * 8;
  const planHiFreq = /5-6 Day/i.test(plan.name);
  if (days >= 5 === planHiFreq) s += 15;
  const wantExpress = (sessionMin || 45) <= 30;
  const isExpress = /Express/i.test(plan.name);
  if (wantExpress === isExpress) s += 12;
  const advanced = (experienceMonths || 0) >= 18;
  const isAdvanced = /Advanced/i.test(plan.name);
  if (advanced === isAdvanced) s += 12;
  return s;
}
function rankPlans(plans, ctx) {
  const ranked = plans.map((plan) => ({ plan, score: scorePlan(plan, ctx), why: whyPlan(plan, ctx) }));
  ranked.sort((a, b) => b.score - a.score || a.plan.id - b.plan.id);
  return ranked;
}
function bestPlanId(plans, ctx) {
  const r = rankPlans(plans, ctx);
  return r.length ? r[0].plan.id : 0;
}
var GOAL_NAMES = {
  strength: "strength",
  hybrid: "hybrid",
  fat_loss: "fat loss",
  muscle: "muscle",
  beginner: "beginner",
  powerlifting: "powerlifting",
  endurance: "endurance"
};
function whyPlan(plan, ctx) {
  const bits = [];
  const goalName = GOAL_NAMES[plan.goal] || plan.goal;
  if (plan.goal === ctx.goal) bits.push(`matches your ${goalName} goal`);
  const days = (ctx.trainingDays || []).length || 5;
  const slots = (plan.slots || []).length;
  if (Math.abs(slots - days) <= 1) bits.push(`fits ${days} training day${days !== 1 ? "s" : ""}/week`);
  if ((ctx.sessionMin || 45) <= 30 === /Express/i.test(plan.name)) {
    bits.push(/Express/i.test(plan.name) ? "short sessions" : "full sessions");
  }
  if ((ctx.experienceMonths || 0) >= 18 === /Advanced/i.test(plan.name)) {
    bits.push(/Advanced/i.test(plan.name) ? "advanced progression" : "beginner-friendly ramp");
  }
  return bits.length ? bits.join(" \xB7 ") : "balanced general fit";
}

// src/core/media.ts
function toEmbedUrl(url) {
  if (!url || typeof url !== "string") return url;
  let id = "";
  let m;
  if (m = url.match(/[?&]v=([\w-]{6,})/)) id = m[1];
  else if (m = url.match(/youtu\.be\/([\w-]{6,})/)) id = m[1];
  else if (m = url.match(/\/shorts\/([\w-]{6,})/)) id = m[1];
  else if (m = url.match(/\/embed\/([\w-]{6,})/)) id = m[1];
  if (!id) return url;
  return `https://www.youtube.com/embed/${id}`;
}

// src/core/events.ts
function dateTs(date) {
  const t = (/* @__PURE__ */ new Date(String(date) + "T12:00:00")).getTime();
  return Number.isNaN(t) ? 0 : t;
}
function setLoggedFromLog(log) {
  const logId = String(
    log.id != null ? log.id : `${log.date}|${log.exercise}|${log.aW}|${log.aR}|${log.aS}`
  );
  const e = {
    id: "ev_" + logId,
    ts: dateTs(String(log.date)),
    type: "SetLogged",
    logId,
    date: String(log.date),
    exercise: String(log.exercise),
    weight: Number(log.aW) || 0,
    reps: Number(log.aR) || 0,
    sets: Number(log.aS) || 0
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
function setDeletedEvent(logId, ts) {
  const t = ts != null ? ts : Date.now();
  return { id: "del_" + String(logId), ts: t, type: "SetDeleted", logId: String(logId) };
}
function eventToLog(e) {
  const log = {
    id: e.logId,
    date: e.date,
    exercise: e.exercise,
    aW: e.weight,
    aR: e.reps,
    aS: e.sets
  };
  if (e.targetWeight !== void 0) log.tW = e.targetWeight;
  if (e.targetReps !== void 0) log.tR = e.targetReps;
  if (e.targetSets !== void 0) log.tS = e.targetSets;
  if (e.feel !== void 0) log.liftFeel = e.feel;
  if (e.outcome !== void 0) log.outcome = e.outcome;
  if (e.week !== void 0) log.week = e.week;
  if (e.score !== void 0) log.score = e.score;
  if (e.note !== void 0) log.note = e.note;
  return log;
}

// src/core/eventlog.ts
function mergeEvents(a, b) {
  const byId = /* @__PURE__ */ new Map();
  for (const e of a || []) if (e && e.id) byId.set(e.id, e);
  for (const e of b || []) if (e && e.id && !byId.has(e.id)) byId.set(e.id, e);
  return [...byId.values()].sort((x, y) => x.ts - y.ts || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
}
function projectLogs(events) {
  const deleted = /* @__PURE__ */ new Set();
  for (const e of events || []) if (e.type === "SetDeleted") deleted.add(e.logId);
  const latest = /* @__PURE__ */ new Map();
  for (const e of events || []) {
    if (e.type !== "SetLogged" || deleted.has(e.logId)) continue;
    latest.set(e.logId, e);
  }
  return [...latest.values()].sort((a, b) => a.ts - b.ts || (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)).map(eventToLog);
}
function fromLegacyLogs(logs) {
  return (logs || []).map(setLoggedFromLog);
}
function mergeLogSets(localLogs, remoteLogs) {
  return projectLogs(mergeEvents(fromLegacyLogs(localLogs), fromLegacyLogs(remoteLogs)));
}

// src/core/partner.ts
var VIBE_SCHEMES = {
  strength: { sets: 5, reps: 3, intensityPct: 85 },
  hypertrophy: { sets: 4, reps: 8, intensityPct: 70 },
  pump: { sets: 3, reps: 12, intensityPct: 60 }
};
var PARTNER_COMPOUNDS = [
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
  { eid: "legpress", name: "Leg Press", tags: ["legs", "quads", "glutes"], equipment: "machine", increment: 10 }
];
function roundToIncrement(load, increment) {
  if (!(increment > 0)) return Math.max(0, Math.round(load));
  return Math.max(0, Math.round(load / increment) * increment);
}
function scaleLoad(max, intensityPct, increment = 5) {
  if (!(max > 0) || !(intensityPct > 0)) return 0;
  return roundToIncrement(max * intensityPct / 100, increment);
}
function calibrationToMax(weight, reps) {
  return Math.round(epley(weight, reps));
}
var BW_MULT = {
  squat: 1.4,
  frontsquat: 1.1,
  bench: 1,
  incline: 0.85,
  deadlift: 1.75,
  rdl: 1.4,
  hipthrust: 1.6,
  ohp: 0.6,
  row: 0.9,
  lunge: 0.5,
  legpress: 2.2,
  pullup: 0
};
var EXP_FACTOR = { beginner: 0.65, intermediate: 1, advanced: 1.3 };
function estimateMaxFromBodyweight(eid, bodyweightLb, experience = "intermediate") {
  const m = BW_MULT[eid];
  if (m == null || !(bodyweightLb > 0)) return 0;
  const f = EXP_FACTOR[experience] ?? 1;
  return Math.round(bodyweightLb * m * f / 5) * 5;
}
function resolveMax(user, eid) {
  const logged = Number(user.maxes?.[eid]) || 0;
  if (logged > 0) return { value: logged, source: "logged" };
  const est = user.bodyweightLb ? estimateMaxFromBodyweight(eid, user.bodyweightLb, user.experience) : 0;
  if (est > 0) return { value: est, source: "estimated" };
  return { value: 0, source: "none" };
}
function fitScore(user, c) {
  const focus = new Set(user.focus || []);
  let s = 0;
  for (const t of c.tags) if (focus.has(t)) s++;
  return s;
}
function canPerform(user, c) {
  if ((user.blockedEids || []).includes(c.eid)) return false;
  if (c.equipment !== "bodyweight" && !(user.equipment || []).includes(c.equipment)) return false;
  return true;
}
function suggestSharedLifts(users, catalog = PARTNER_COMPOUNDS, opts = {}) {
  const max = opts.max ?? 3;
  const out = [];
  for (const c of catalog) {
    if (!users.length || !users.every((u) => canPerform(u, c))) continue;
    const fits = users.map((u) => fitScore(u, c));
    const minFit = Math.min(...fits);
    const sumFit = fits.reduce((a, b) => a + b, 0);
    const continuity = users.filter((u) => (u.todayEids || []).includes(c.eid)).length;
    const jointScore = minFit * 100 + sumFit * 10 + continuity;
    if (jointScore <= 0) continue;
    const reason = continuity ? "In a program today, fits everyone" : minFit > 0 ? "Fits everyone's goals" : "Shared compound";
    out.push({ eid: c.eid, name: c.name, jointScore, reason });
  }
  out.sort((a, b) => b.jointScore - a.jointScore || a.eid.localeCompare(b.eid));
  return out.slice(0, Math.max(0, max));
}
function buildSharedLiftPlan(sug, users, scheme, increment = 5) {
  const loads = users.map((u) => {
    const rm = resolveMax(u, sug.eid);
    return {
      uid: u.uid,
      name: u.name,
      load: scaleLoad(rm.value, scheme.intensityPct, increment),
      maxSource: rm.source,
      needsCalibration: rm.source === "none"
    };
  });
  return { eid: sug.eid, name: sug.name, scheme, loads };
}
function mergeSession(users, suggestions, planByUid, opts = {}) {
  const vibe = opts.vibe ?? "hypertrophy";
  const baseScheme = VIBE_SCHEMES[vibe];
  const catalog = opts.catalog ?? PARTNER_COMPOUNDS;
  const incrByEid = {};
  for (const c of catalog) incrByEid[c.eid] = c.increment;
  const overrides = opts.schemeOverrides || {};
  const shared = suggestions.map(
    (s) => buildSharedLiftPlan(s, users, overrides[s.eid] || baseScheme, incrByEid[s.eid] ?? 5)
  );
  const sharedEids = new Set(suggestions.map((s) => s.eid));
  const splits = {};
  for (const u of users) {
    splits[u.uid] = (planByUid[u.uid] || []).filter((eid) => !sharedEids.has(eid));
  }
  return { vibe, shared, splits };
}

// src/core/partner-pairing.ts
function participantFromUser(u, opts) {
  return {
    uid: u.uid,
    handle: u.handle,
    name: u.name || u.handle,
    role: opts.role,
    maxes: opts.shareMaxes ? u.maxes || {} : {},
    maxesShared: !!opts.shareMaxes,
    focus: u.focus || [],
    equipment: u.equipment || [],
    dayPlan: u.dayPlan || [],
    ready: false,
    lastSeen: opts.now ?? Date.now(),
    progress: { sharedDone: 0, splitDone: 0 }
  };
}
function newPartnerSession(host, opts) {
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
    jointLifts: {},
    liveState: { currentLiftIndex: 0, turn: null, restEndsAt: null }
  };
}
function withParticipant(s, p) {
  return { ...s, participants: { ...s.participants, [p.uid]: p }, updatedAt: p.lastSeen };
}
function setReady(s, uid, ready, now = Date.now()) {
  const p = s.participants[uid];
  if (!p) return s;
  return withParticipant({ ...s, updatedAt: now }, { ...p, ready, lastSeen: now });
}
function touchPresence(s, uid, now = Date.now()) {
  const p = s.participants[uid];
  if (!p) return s;
  return { ...s, participants: { ...s.participants, [uid]: { ...p, lastSeen: now } } };
}
function isOnline(p, now = Date.now(), staleMs = 3e4) {
  return !!p && now - p.lastSeen <= staleMs;
}
function participantCount(s) {
  return Object.keys(s.participants || {}).length;
}
function allReady(s) {
  const ps = Object.values(s.participants || {});
  return ps.length > 0 && ps.every((p) => p.ready);
}
var FLOW = {
  lobby: ["proposing", "abandoned"],
  proposing: ["active", "lobby", "abandoned"],
  active: ["split", "abandoned"],
  split: ["complete", "abandoned"],
  complete: [],
  abandoned: []
};
function canTransition(from, to) {
  return to === "abandoned" ? from !== "complete" : (FLOW[from] || []).includes(to);
}
var JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var DEFAULT_CODE_TTL_MS = 10 * 60 * 1e3;
function makeJoinCode(len = 6, rand = Math.random) {
  let s = "";
  for (let i = 0; i < len; i++) s += JOIN_CODE_ALPHABET[Math.floor(rand() * JOIN_CODE_ALPHABET.length)];
  return s;
}
function normalizeJoinCode(input) {
  return String(input || "").toUpperCase().replace(/[\s-]+/g, "");
}
function isValidJoinCode(input, len = 6) {
  const c = normalizeJoinCode(input);
  return c.length === len && [...c].every((ch) => JOIN_CODE_ALPHABET.includes(ch));
}
function codeRecord(code, sessionId, hostUid, opts = {}) {
  const now = opts.now ?? Date.now();
  return { code: normalizeJoinCode(code), sessionId, hostUid, expiresAt: now + (opts.ttlMs ?? DEFAULT_CODE_TTL_MS) };
}
function isCodeExpired(rec, now = Date.now()) {
  return !rec || now >= rec.expiresAt;
}
function joinHash(code) {
  return "#join=" + normalizeJoinCode(code);
}
function parseJoinHash(hash) {
  const m = String(hash || "").match(/[#&]join=([A-Za-z0-9-]+)/);
  if (!m) return null;
  const c = normalizeJoinCode(m[1]);
  return isValidJoinCode(c) ? c : null;
}
function addGymBuddy(list, buddy) {
  return [...(list || []).filter((b) => b.uid !== buddy.uid), buddy];
}
function removeGymBuddy(list, uid) {
  return (list || []).filter((b) => b.uid !== uid);
}
function hasGymBuddy(list, uid) {
  return (list || []).some((b) => b.uid === uid);
}
function makeInvite(from, sessionId, opts = {}) {
  const now = opts.now ?? Date.now();
  return { id: opts.id ?? from.uid + "_" + now, fromUid: from.uid, fromHandle: from.handle, sessionId, createdAt: now };
}

// src/core/partner-session.ts
function fsMerge(base, patch) {
  if (patch === null || typeof patch !== "object" || Array.isArray(patch)) return patch;
  const out = base && typeof base === "object" && !Array.isArray(base) ? { ...base } : {};
  for (const k of Object.keys(patch)) {
    const pv = patch[k];
    const bv = out[k];
    out[k] = pv && typeof pv === "object" && !Array.isArray(pv) && bv && typeof bv === "object" && !Array.isArray(bv) ? fsMerge(bv, pv) : pv;
  }
  return out;
}
var clone = (x) => JSON.parse(JSON.stringify(x));
function createInMemoryBackend(opts = {}) {
  const sessions = /* @__PURE__ */ new Map();
  const codes = /* @__PURE__ */ new Map();
  const feeds = /* @__PURE__ */ new Map();
  const sessionSubs = /* @__PURE__ */ new Map();
  const feedSubs = /* @__PURE__ */ new Map();
  let counter = 0;
  const now = opts.now || (() => Date.now());
  const newId = opts.idSeq || (() => "id" + ++counter);
  const feedArr = (id) => [...(feeds.get(id) || /* @__PURE__ */ new Map()).values()].sort((a, b) => a.ts - b.ts);
  const emitSession = (id) => (sessionSubs.get(id) || []).forEach((cb) => cb(sessions.has(id) ? clone(sessions.get(id)) : null));
  const emitFeed = (id) => (feedSubs.get(id) || []).forEach((cb) => cb(feedArr(id)));
  const be = {
    now,
    newId,
    _sessions: sessions,
    _codes: codes,
    _feeds: feeds,
    async createSession(s) {
      sessions.set(s.id, clone(s));
      emitSession(s.id);
    },
    async getSession(id) {
      return sessions.has(id) ? clone(sessions.get(id)) : null;
    },
    async patchSession(id, patch) {
      const cur = sessions.get(id);
      if (!cur) return;
      sessions.set(id, fsMerge(cur, patch));
      emitSession(id);
    },
    watchSession(id, cb) {
      if (!sessionSubs.has(id)) sessionSubs.set(id, /* @__PURE__ */ new Set());
      sessionSubs.get(id).add(cb);
      cb(sessions.has(id) ? clone(sessions.get(id)) : null);
      return () => {
        sessionSubs.get(id)?.delete(cb);
      };
    },
    async putCode(rec) {
      codes.set(normalizeJoinCode(rec.code), { ...rec });
    },
    async getCode(code) {
      const r = codes.get(normalizeJoinCode(code));
      return r ? { ...r } : null;
    },
    async deleteCode(code) {
      codes.delete(normalizeJoinCode(code));
    },
    async appendFeed(id, ev) {
      if (!feeds.has(id)) feeds.set(id, /* @__PURE__ */ new Map());
      feeds.get(id).set(ev.id, { ...ev });
      emitFeed(id);
    },
    watchFeed(id, cb) {
      if (!feedSubs.has(id)) feedSubs.set(id, /* @__PURE__ */ new Set());
      feedSubs.get(id).add(cb);
      cb(feedArr(id));
      return () => {
        feedSubs.get(id)?.delete(cb);
      };
    }
  };
  return be;
}
async function hostCreateSession(be, host, opts = {}) {
  const id = be.newId();
  const code = normalizeJoinCode(opts.code ?? makeJoinCode(opts.codeLen ?? 6));
  const session = newPartnerSession(host, { id, code, vibe: opts.vibe, shareMaxes: opts.shareMaxes, now: be.now() });
  await be.createSession(session);
  await be.putCode(codeRecord(code, id, host.uid, { ttlMs: opts.ttlMs, now: be.now() }));
  return { session, code };
}
async function joinByCode(be, user, codeInput, opts = {}) {
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
  return { ok: true, session: await be.getSession(rec.sessionId) };
}
async function setReadyRemote(be, id, uid, ready) {
  await be.patchSession(id, { participants: { [uid]: { ready, lastSeen: be.now() } }, updatedAt: be.now() });
}
async function heartbeat(be, id, uid) {
  await be.patchSession(id, { participants: { [uid]: { lastSeen: be.now() } } });
}
async function toggleJointLift(be, id, joint, eid) {
  await be.patchSession(id, { jointLifts: { [eid]: joint }, updatedAt: be.now() });
}
async function publishJointRx(be, id, uid, rx) {
  await be.patchSession(id, { participants: { [uid]: { jointRx: rx } }, updatedAt: be.now() });
}
async function setSharedBlock(be, id, lifts, vibe) {
  const patch = { sharedLifts: lifts, updatedAt: be.now() };
  if (vibe) patch.vibe = vibe;
  await be.patchSession(id, patch);
}
async function transition(be, id, to) {
  const s = await be.getSession(id);
  if (!s || !canTransition(s.status, to)) return false;
  await be.patchSession(id, { status: to, updatedAt: be.now() });
  return true;
}
async function logSharedSet(be, id, ev) {
  await be.appendFeed(id, { ...ev, ts: ev.ts ?? be.now() });
}
async function advanceTurn(be, id, order) {
  if (!order.length) return;
  const s = await be.getSession(id);
  if (!s) return;
  const turn = s.liveState.turn;
  let uid = order[0], setNo = 1;
  if (turn) {
    const i = order.indexOf(turn.uid);
    if (i < 0 || i === order.length - 1) {
      uid = order[0];
      setNo = turn.setNo + 1;
    } else {
      uid = order[i + 1];
      setNo = turn.setNo;
    }
  }
  await be.patchSession(id, { liveState: { turn: { uid, setNo } }, updatedAt: be.now() });
}

// src/core/partner-match.ts
function liftKeyForName(name) {
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
function resolveJointRx(lifter, joint) {
  const mine = lifter.dayPlan.find((it) => it.eid === joint.eid);
  const base = { key: joint.key, eid: joint.eid, name: joint.name, unit: lifter.unit };
  if (mine) {
    return { ...base, sets: mine.sets, reps: mine.reps, load: mine.load, source: "programmed" };
  }
  const sch = lifter.scheme;
  const skey = joint.key || liftKeyForName(joint.name);
  const max = lifter.strengthByKey[skey] || 0;
  if (max > 0) {
    const inc = lifter.incrementByKey && lifter.incrementByKey[skey] || 5;
    return { ...base, sets: sch.sets, reps: sch.reps, load: scaleLoad(max, sch.intensityPct, inc), source: "estimated" };
  }
  if ((lifter.bodyweightKeys || []).includes(skey) || (lifter.bodyweightKeys || []).includes(joint.eid)) {
    return { ...base, sets: sch.sets, reps: sch.reps, load: 0, source: "estimated" };
  }
  return { ...base, sets: sch.sets, reps: sch.reps, load: 0, source: "needs-calibration" };
}
function buildJointPlan(lifter, joints) {
  return joints.map((j) => resolveJointRx(lifter, j));
}
function accessoriesFor(lifter, joints) {
  const taken = new Set(joints.map((j) => j.eid));
  return lifter.dayPlan.filter((it) => !taken.has(it.eid));
}
function jointLiftsFromMap(map) {
  return Object.values(map || {}).filter((j) => !!j).sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0) || a.eid.localeCompare(b.eid));
}
function needsCalibration(lifter, joints) {
  return buildJointPlan(lifter, joints).filter((r) => r.source === "needs-calibration");
}

// src/core/running.ts
var MILE_PER_5K = 3.106855;
function cooperVo2max(distanceMiles) {
  const meters = Math.max(0, distanceMiles) * 1609.344;
  return Math.max(0, Math.round((meters - 504.9) / 44.73 * 10) / 10);
}
function thresholdPaceFromBenchmark(b) {
  if (b.kind === "cooper") {
    const d = Math.max(0.1, b.value);
    const cooperPace = 12 * 60 / d;
    return Math.round(cooperPace * 1.08);
  }
  if (b.kind === "mile") {
    return Math.round(b.value * 1.15);
  }
  const fivekPace = b.value / MILE_PER_5K;
  return Math.round(fivekPace * 1.03);
}
var ZONE_MULT = {
  interval: 0.94,
  tempo: 1,
  steady: 1.1,
  easy: 1.18,
  long: 1.22,
  recovery: 1.3
};
function paceZonesFromBenchmark(b) {
  const t = thresholdPaceFromBenchmark(b);
  return {
    threshold: t,
    interval: Math.round(t * ZONE_MULT.interval),
    tempo: Math.round(t * ZONE_MULT.tempo),
    steady: Math.round(t * ZONE_MULT.steady),
    easy: Math.round(t * ZONE_MULT.easy),
    long: Math.round(t * ZONE_MULT.long),
    recovery: Math.round(t * ZONE_MULT.recovery)
  };
}
function fmtPace(sec) {
  if (!(sec > 0)) return "\u2014";
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
var TRACK_FULL = ["distance", "time", "pace", "hr"];
function benchmarkWorkout(kind) {
  if (kind === "cooper") {
    return {
      type: "benchmark",
      title: "Cooper 12-min Test",
      zone: null,
      targetPaceSecPerMi: null,
      totalMin: 12,
      totalMiles: null,
      segments: [
        { label: "Warm-up", kind: "warmup", durationSec: 600 },
        { label: "Run as far as you can in 12:00", kind: "work", durationSec: 720 },
        { label: "Cool-down", kind: "cooldown", durationSec: 300 }
      ],
      cue: "Even, hard effort \u2014 log the distance you covered. This sets your pace zones.",
      tracks: TRACK_FULL
    };
  }
  if (kind === "mile") {
    return {
      type: "benchmark",
      title: "1-Mile Time Trial",
      zone: null,
      targetPaceSecPerMi: null,
      totalMin: null,
      totalMiles: 1,
      segments: [
        { label: "Warm-up", kind: "warmup", durationSec: 600 },
        { label: "1 mile all-out", kind: "work", distanceMi: 1 },
        { label: "Cool-down", kind: "cooldown", durationSec: 300 }
      ],
      cue: "One hard mile. Log your time \u2014 this sets your pace zones.",
      tracks: TRACK_FULL
    };
  }
  return {
    type: "benchmark",
    title: "5K Time Trial",
    zone: null,
    targetPaceSecPerMi: null,
    totalMin: null,
    totalMiles: MILE_PER_5K,
    segments: [
      { label: "Warm-up", kind: "warmup", durationSec: 600 },
      { label: "5K all-out", kind: "work", distanceMi: MILE_PER_5K },
      { label: "Cool-down", kind: "cooldown", durationSec: 300 }
    ],
    cue: "Race effort over 5K. Log your time \u2014 this sets your pace zones.",
    tracks: TRACK_FULL
  };
}
function steadyRun(z, miles) {
  return {
    type: "steady",
    title: `Steady Run \xB7 ${miles} mi`,
    zone: "steady",
    targetPaceSecPerMi: z.steady,
    totalMin: null,
    totalMiles: miles,
    segments: [{ label: `${miles} mi @ ${fmtPace(z.steady)}/mi`, kind: "steady", distanceMi: miles, paceSecPerMi: z.steady }],
    cue: "Relaxed, conversational-plus. Focus on form and breathing.",
    tracks: TRACK_FULL
  };
}
function longRun(z, miles) {
  return {
    type: "long",
    title: `Long Run \xB7 ${miles} mi`,
    zone: "long",
    targetPaceSecPerMi: z.long,
    totalMin: null,
    totalMiles: miles,
    segments: [{ label: `${miles} mi @ ${fmtPace(z.long)}/mi`, kind: "steady", distanceMi: miles, paceSecPerMi: z.long }],
    cue: "Keep it easy and steady \u2014 time on feet builds the engine. Push the distance.",
    tracks: TRACK_FULL
  };
}
function intervalSession(z, opts = {}) {
  const reps = opts.reps ?? 8;
  const repDist = opts.repDistanceMi ?? 0.25;
  const rec = opts.recoverySec ?? 90;
  const work = { label: `${reps} \xD7 ${Math.round(repDist * 1609)}m @ ${fmtPace(z.interval)}/mi`, kind: "work", reps, distanceMi: repDist, paceSecPerMi: z.interval };
  const recovery = { label: `${rec}s easy jog between`, kind: "recovery", durationSec: rec, paceSecPerMi: z.recovery };
  return {
    type: "intervals",
    title: `Intervals \xB7 ${reps}\xD7${Math.round(repDist * 1609)}m`,
    zone: "interval",
    targetPaceSecPerMi: z.interval,
    totalMin: null,
    totalMiles: Math.round(reps * repDist * 100) / 100,
    segments: [{ label: "Warm-up 10 min easy", kind: "warmup", durationSec: 600, paceSecPerMi: z.easy }, work, recovery, { label: "Cool-down 5 min", kind: "cooldown", durationSec: 300, paceSecPerMi: z.recovery }],
    cue: "Hard but repeatable \u2014 hit each rep at target pace, jog the recovery.",
    tracks: TRACK_FULL
  };
}
function hiitSession(z, opts = {}) {
  const rounds = opts.rounds ?? 8, work = opts.workSec ?? 30, rec = opts.recoverySec ?? 90;
  return {
    type: "intervals",
    title: `HIIT \xB7 ${rounds}\xD7${work}s`,
    zone: "interval",
    targetPaceSecPerMi: z.interval,
    totalMin: Math.round(rounds * (work + rec) / 60) + 15,
    totalMiles: null,
    segments: [
      { label: "Warm-up 10 min easy", kind: "warmup", durationSec: 600, paceSecPerMi: z.easy },
      { label: `${work}s @ 80\u201390% effort`, kind: "work", reps: rounds, durationSec: work, paceSecPerMi: z.interval },
      { label: `${rec}s recovery`, kind: "recovery", durationSec: rec, paceSecPerMi: z.recovery },
      { label: "Cool-down 5 min", kind: "cooldown", durationSec: 300, paceSecPerMi: z.recovery }
    ],
    cue: "All-out on the work bouts, full recovery between. 8\u201310 rounds.",
    tracks: TRACK_FULL
  };
}
function fartlek(z, opts = {}) {
  const total = opts.totalMin ?? 30, surge = opts.surgeSec ?? 30, every = opts.everyMin ?? 4.5;
  return {
    type: "fartlek",
    title: `Fartlek \xB7 ${total} min`,
    zone: "steady",
    targetPaceSecPerMi: z.steady,
    totalMin: total,
    totalMiles: null,
    segments: [
      { label: `${total} min steady @ ~${fmtPace(z.steady)}/mi`, kind: "steady", durationSec: total * 60, paceSecPerMi: z.steady },
      { label: `${surge}s surge @ ${fmtPace(z.interval)}/mi every ${every} min`, kind: "work", durationSec: surge, paceSecPerMi: z.interval }
    ],
    cue: "Cruise the base pace, then surge hard for the bursts. Play with it.",
    tracks: TRACK_FULL
  };
}
function progressionRun(z, opts = {}) {
  const miles = opts.miles ?? 2;
  const steps = Math.max(2, Math.round(miles / 0.5));
  const segs = [];
  for (let i = 0; i < steps; i++) {
    const f = i / (steps - 1);
    const pace = Math.round(z.steady + (z.tempo - z.steady) * f);
    segs.push({ label: `\xBD mi @ ${fmtPace(pace)}/mi`, kind: "steady", distanceMi: 0.5, paceSecPerMi: pace });
  }
  return {
    type: "progression",
    title: `Pace Progression \xB7 ${miles} mi`,
    zone: "tempo",
    targetPaceSecPerMi: z.tempo,
    totalMin: null,
    totalMiles: miles,
    segments: segs,
    cue: "Start steady, drop the pace every half-mile, finish at tempo.",
    tracks: TRACK_FULL
  };
}
function recoveryRun(z, minutes = 20) {
  return {
    type: "recovery",
    title: `Recovery Jog \xB7 ${minutes} min`,
    zone: "recovery",
    targetPaceSecPerMi: z.recovery,
    totalMin: minutes,
    totalMiles: null,
    segments: [{ label: `${minutes} min very easy @ ${fmtPace(z.recovery)}/mi`, kind: "steady", durationSec: minutes * 60, paceSecPerMi: z.recovery }],
    cue: "Easy on purpose. Let the body absorb the work.",
    tracks: ["distance", "time", "pace"]
  };
}
function mindfulRun(minutes = 25) {
  return {
    type: "mindful",
    title: `Mindful Run \xB7 ${minutes} min`,
    zone: null,
    targetPaceSecPerMi: null,
    totalMin: minutes,
    totalMiles: null,
    segments: [{ label: `${minutes} min by feel \u2014 no watch`, kind: "steady", durationSec: minutes * 60 }],
    cue: "Leave the metrics behind. Let the run carry you; just note how you feel after.",
    tracks: ["time"]
  };
}
function progressiveDistance(baseMiles, weeksIn, opts = {}) {
  const pct = opts.weeklyPct ?? 0.1;
  const raw = baseMiles * Math.pow(1 + pct, Math.max(0, weeksIn));
  const capped = opts.capMiles ? Math.min(raw, opts.capMiles) : raw;
  return Math.round(capped * 4) / 4;
}
function latestBenchmark(list) {
  if (!list || !list.length) return null;
  return [...list].sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))).find(() => true) || list[list.length - 1];
}

// src/core/abs.ts
var AB_TEMPLATES = [
  {
    id: "weighted-core",
    name: "Weighted Core",
    focus: "Loaded strength",
    minutes: 5,
    exercises: [
      { eid: "cable_crunch", name: "Cable Crunch", region: "upper", mode: "weighted", base: 12, sets: 3, restSec: 45, seed: { from: "bench", pct: 0.35 }, increment: 10 },
      { eid: "db_leg_raise", name: "DB Leg Raise", region: "lower", mode: "weighted", base: 12, sets: 3, restSec: 45, seed: { from: "bodyweight", pct: 0.08 }, increment: 5 },
      { eid: "suitcase", name: "Suitcase Carry", region: "rotation", mode: "time", base: 30, sets: 2, restSec: 30, perSide: true }
    ]
  },
  {
    id: "lower-ab",
    name: "Lower-Ab Ladder",
    focus: "Lower abs & hip flexors",
    minutes: 5,
    exercises: [
      { eid: "hanging_leg_raise", name: "Hanging Leg Raise", region: "lower", mode: "reps", base: 10, sets: 3, restSec: 45 },
      { eid: "toe_tap", name: "Dead Bug", region: "stability", mode: "reps", base: 10, sets: 3, restSec: 30, perSide: true },
      { eid: "db_leg_raise", name: "DB Leg Raise", region: "lower", mode: "weighted", base: 12, sets: 2, restSec: 30, seed: { from: "bodyweight", pct: 0.06 }, increment: 5 }
    ]
  },
  {
    id: "oblique",
    name: "Oblique & Anti-Rotation",
    focus: "Sides & rotary control",
    minutes: 5,
    exercises: [
      { eid: "side_plank", name: "Side Plank", region: "oblique", mode: "time", base: 30, sets: 2, restSec: 20, perSide: true },
      { eid: "russian_twist", name: "Russian Twist", region: "oblique", mode: "weighted", base: 16, sets: 3, restSec: 40, perSide: false, seed: { from: "bodyweight", pct: 0.05 }, increment: 5 },
      { eid: "suitcase", name: "Suitcase Carry", region: "rotation", mode: "time", base: 30, sets: 2, restSec: 30, perSide: true }
    ]
  },
  {
    id: "stability-brace",
    name: "Stability Brace",
    focus: "Bracing & endurance",
    minutes: 5,
    exercises: [
      { eid: "plank", name: "Plank Hold", region: "stability", mode: "time", base: 45, sets: 3, restSec: 30 },
      { eid: "toe_tap", name: "Dead Bug", region: "stability", mode: "reps", base: 12, sets: 3, restSec: 30, perSide: true },
      { eid: "side_plank", name: "Side Plank", region: "oblique", mode: "time", base: 30, sets: 2, restSec: 20, perSide: true }
    ]
  },
  {
    id: "core-pyramid",
    name: "Core Pyramid",
    focus: "Balanced mix",
    minutes: 5,
    exercises: [
      { eid: "cable_crunch", name: "Cable Crunch", region: "upper", mode: "weighted", base: 12, sets: 3, restSec: 40, seed: { from: "bench", pct: 0.3 }, increment: 10 },
      { eid: "hanging_leg_raise", name: "Hanging Leg Raise", region: "lower", mode: "reps", base: 10, sets: 3, restSec: 40 },
      { eid: "russian_twist", name: "Russian Twist", region: "oblique", mode: "reps", base: 20, sets: 2, restSec: 30 }
    ]
  },
  {
    id: "metabolic",
    name: "Metabolic Core",
    focus: "Conditioning + core",
    minutes: 5,
    exercises: [
      { eid: "mountain_climber", name: "Mountain Climbers", region: "stability", mode: "time", base: 40, sets: 3, restSec: 25 },
      { eid: "russian_twist", name: "Russian Twist", region: "oblique", mode: "reps", base: 20, sets: 3, restSec: 25 },
      { eid: "plank", name: "Plank Hold", region: "stability", mode: "time", base: 40, sets: 2, restSec: 25 }
    ]
  }
];
var round = (n, step) => Math.max(0, Math.round(n / step) * step);
function seedLoad(spec, ctx) {
  if (!spec.seed) return 0;
  const base = spec.seed.from === "bodyweight" ? ctx.bodyweightLb : ctx.maxes[spec.seed.from] || 0;
  return round(base * spec.seed.pct, spec.increment || 5);
}
function resolveAbRx(spec, ctx) {
  const base = { eid: spec.eid, name: spec.name, region: spec.region, mode: spec.mode, sets: spec.sets, unit: ctx.unit, perSide: spec.perSide, load: 0 };
  const h = ctx.historyByEid[spec.eid];
  if (spec.mode === "time") {
    const seconds = h && h.reps > 0 ? Math.min(spec.base * 2, Math.max(spec.base, h.reps + 5)) : spec.base;
    return { ...base, seconds, source: h ? "progressed" : "base", note: h ? "+5s on last hold" : "starting hold" };
  }
  if (spec.mode === "weighted") {
    const inc = spec.increment || 5;
    if (h && h.weight > 0) {
      if (h.reps >= spec.base) return { ...base, load: round(h.weight + inc, inc), reps: spec.base, source: "progressed", note: `+${inc} ${ctx.unit} on last` };
      return { ...base, load: round(h.weight, inc), reps: Math.max(spec.base, h.reps), source: "progressed", note: "match last load, add a rep" };
    }
    const seeded = seedLoad(spec, ctx);
    return { ...base, load: seeded, reps: spec.base, source: seeded > 0 ? "seeded" : "base", note: seeded > 0 ? "seeded from your strength" : "bodyweight to start" };
  }
  const reps = h && h.reps > 0 ? Math.min(spec.base * 2, Math.max(spec.base, h.reps + 1)) : spec.base;
  return { ...base, reps, source: h ? "progressed" : "base", note: h ? "+1 rep on last" : "starting reps" };
}
function buildAbFinisher(template, ctx) {
  return template.exercises.map((s) => resolveAbRx(s, ctx));
}
function abTemplateById(id, templates = AB_TEMPLATES) {
  return templates.find((t) => t.id === id);
}
function selectAbTemplate(ctx, templates = AB_TEMPLATES) {
  const staleness = (t) => t.exercises.reduce((s, e) => s + (ctx.historyByEid[e.eid] ? ctx.historyByEid[e.eid].daysAgo : 999), 0) / t.exercises.length;
  let best = templates[0], bestScore = -1;
  for (const t of templates) {
    const score = staleness(t);
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return best;
}

// src/core/qr.ts
var ECC_L = [
  { ec: 7, data: 19, align: [] },
  // v1, 21×21
  { ec: 10, data: 34, align: [6, 18] },
  // v2, 25×25
  { ec: 15, data: 55, align: [6, 22] },
  // v3, 29×29
  { ec: 20, data: 80, align: [6, 26] },
  // v4, 33×33
  { ec: 26, data: 108, align: [6, 30] }
  // v5, 37×37
];
var EXP = new Array(512);
var LOG = new Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 285;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();
var gfMul = (a, b) => a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
function reedSolomon(data, n) {
  let gen = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j];
      next[j + 1] ^= gfMul(gen[j], EXP[i]);
    }
    gen = next;
  }
  const res = data.concat(new Array(n).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) for (let j = 1; j < gen.length; j++) res[i + j] ^= gfMul(gen[j], coef);
  }
  return res.slice(data.length);
}
function utf8(text) {
  const out = [];
  for (const b of new TextEncoder().encode(text)) out.push(b);
  return out;
}
var getBit = (x, i) => (x >>> i & 1) !== 0;
function newGrid(size) {
  const mod = [];
  const fn = [];
  for (let r = 0; r < size; r++) {
    mod.push(new Array(size).fill(false));
    fn.push(new Array(size).fill(false));
  }
  return { mod, fn };
}
function placeFinder(mod, fn, R, C, size) {
  for (let dr = -1; dr <= 7; dr++) {
    for (let dc = -1; dc <= 7; dc++) {
      const r = R + dr, c = C + dc;
      if (r < 0 || r >= size || c < 0 || c >= size) continue;
      fn[r][c] = true;
      let dark = false;
      if (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) {
        const d = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
        dark = d === 3 || d <= 1;
      }
      mod[r][c] = dark;
    }
  }
}
function placeAlignment(mod, fn, cr, cc) {
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      fn[cr + dr][cc + dc] = true;
      mod[cr + dr][cc + dc] = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
    }
  }
}
function formatBits(mask) {
  const data = 1 << 3 | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = rem << 1 ^ (rem >> 9) * 1335;
  return (data << 10 | rem) ^ 21522;
}
function reserveFormat(fn, size) {
  for (let i = 0; i < 9; i++) {
    fn[8][i] = true;
    fn[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    fn[8][size - 1 - i] = true;
    fn[size - 1 - i][8] = true;
  }
}
function drawFormat(mod, size, mask) {
  const bits = formatBits(mask);
  for (let i = 0; i < 6; i++) mod[i][8] = getBit(bits, i);
  mod[7][8] = getBit(bits, 6);
  mod[8][8] = getBit(bits, 7);
  mod[8][7] = getBit(bits, 8);
  for (let i = 9; i < 15; i++) mod[8][14 - i] = getBit(bits, i);
  for (let i = 0; i < 8; i++) mod[8][size - 1 - i] = getBit(bits, i);
  for (let i = 8; i < 15; i++) mod[size - 15 + i][8] = getBit(bits, i);
  mod[size - 8][8] = true;
}
var MASK_FN = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => r * c % 2 + r * c % 3 === 0,
  (r, c) => (r * c % 2 + r * c % 3) % 2 === 0,
  (r, c) => ((r + c) % 2 + r * c % 3) % 2 === 0
];
function penalty(mod, size) {
  let p = 0;
  for (let i = 0; i < size; i++) {
    let runR = 1, runC = 1;
    for (let j = 1; j < size; j++) {
      if (mod[i][j] === mod[i][j - 1]) {
        runR++;
        if (runR === 5) p += 3;
        else if (runR > 5) p++;
      } else runR = 1;
      if (mod[j][i] === mod[j - 1][i]) {
        runC++;
        if (runC === 5) p += 3;
        else if (runC > 5) p++;
      } else runC = 1;
    }
  }
  for (let r = 0; r < size - 1; r++)
    for (let c = 0; c < size - 1; c++)
      if (mod[r][c] === mod[r][c + 1] && mod[r][c] === mod[r + 1][c] && mod[r][c] === mod[r + 1][c + 1]) p += 3;
  const A = [true, false, true, true, true, false, true, false, false, false, false];
  const B = [false, false, false, false, true, false, true, true, true, false, true];
  const matches = (get, start) => {
    for (let pat = 0; pat < 11; pat++) if (get(start + pat) !== A[pat]) return matchB(get, start);
    return true;
  };
  const matchB = (get, start) => {
    for (let pat = 0; pat < 11; pat++) if (get(start + pat) !== B[pat]) return false;
    return true;
  };
  for (let i = 0; i < size; i++)
    for (let j = 0; j <= size - 11; j++) {
      if (matches((k) => mod[i][k], j)) p += 40;
      if (matches((k) => mod[k][i], j)) p += 40;
    }
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (mod[r][c]) dark++;
  const ratio = dark * 100 / (size * size);
  p += Math.floor(Math.abs(ratio - 50) / 5) * 10;
  return p;
}
function qrMatrix(text) {
  const bytes = utf8(text);
  const need = 4 + 8 + bytes.length * 8;
  let vi = -1;
  for (let i = 0; i < ECC_L.length; i++) if (ECC_L[i].data * 8 >= need) {
    vi = i;
    break;
  }
  if (vi < 0) return null;
  const spec = ECC_L[vi];
  const size = 17 + 4 * (vi + 1);
  const bits = [];
  const push = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push(getBit(val, i));
  };
  push(4, 4);
  push(bytes.length, 8);
  for (const b of bytes) push(b, 8);
  const cap = spec.data * 8;
  for (let i = 0; i < 4 && bits.length < cap; i++) bits.push(false);
  while (bits.length % 8 !== 0) bits.push(false);
  const padBytes = [236, 17];
  for (let i = 0; bits.length < cap; i++) push(padBytes[i % 2], 8);
  const dataCw = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = b << 1 | (bits[i + j] ? 1 : 0);
    dataCw.push(b);
  }
  const all = dataCw.concat(reedSolomon(dataCw, spec.ec));
  const { mod, fn } = newGrid(size);
  placeFinder(mod, fn, 0, 0, size);
  placeFinder(mod, fn, 0, size - 7, size);
  placeFinder(mod, fn, size - 7, 0, size);
  for (let i = 8; i < size - 8; i++) {
    const v = i % 2 === 0;
    if (!fn[6][i]) {
      mod[6][i] = v;
      fn[6][i] = true;
    }
    if (!fn[i][6]) {
      mod[i][6] = v;
      fn[i][6] = true;
    }
  }
  if (spec.align.length) {
    const first = spec.align[0], last = spec.align[spec.align.length - 1];
    for (const r of spec.align) for (const c of spec.align) {
      if (r === first && c === first || r === first && c === last || r === last && c === first) continue;
      placeAlignment(mod, fn, r, c);
    }
  }
  reserveFormat(fn, size);
  fn[size - 8][8] = true;
  let bi = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j;
        const upward = (right + 1 & 2) === 0;
        const row = upward ? size - 1 - vert : vert;
        if (!fn[row][col] && bi < all.length * 8) {
          mod[row][col] = getBit(all[bi >> 3], 7 - (bi & 7));
          bi++;
        }
      }
    }
  }
  let best = -1, bestPenalty = Infinity;
  for (let m = 0; m < 8; m++) {
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!fn[r][c] && MASK_FN[m](r, c)) mod[r][c] = !mod[r][c];
    drawFormat(mod, size, m);
    const pen = penalty(mod, size);
    if (pen < bestPenalty) {
      bestPenalty = pen;
      best = m;
    }
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!fn[r][c] && MASK_FN[m](r, c)) mod[r][c] = !mod[r][c];
  }
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!fn[r][c] && MASK_FN[best](r, c)) mod[r][c] = !mod[r][c];
  drawFormat(mod, size, best);
  return mod;
}
function qrSvg(text, opts = {}) {
  const m = qrMatrix(text);
  if (!m) return null;
  const margin = opts.margin ?? 4;
  const n = m.length;
  const dim = n + margin * 2;
  let path = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (m[r][c]) path += `M${c + margin} ${r + margin}h1v1h-1z`;
  return `<svg viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="${dim}" height="${dim}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
}
export {
  AB_TEMPLATES,
  ALL_EQUIPMENT,
  ALL_GOALS,
  BASE_GOALS,
  DEFAULT_CODE_TTL_MS,
  JOIN_CODE_ALPHABET,
  PARTNER_COMPOUNDS,
  VIBE_SCHEMES,
  abTemplateById,
  accessoriesFor,
  accessoryReps,
  accessoryRx,
  addGymBuddy,
  advanceTurn,
  allReady,
  benchmarkWorkout,
  bestPlanId,
  buildAbFinisher,
  buildJointPlan,
  buildSharedLiftPlan,
  calibrationToMax,
  canPerform,
  canTransition,
  codeRecord,
  cooperVo2max,
  createInMemoryBackend,
  detectPlateau,
  e1rmSeries,
  epley,
  equipmentSet,
  estimateMaxFromBodyweight,
  eventToLog,
  exerciseNeeds,
  fartlek,
  fitScore,
  fmtPace,
  fromLegacyLogs,
  fsMerge,
  goalFromFocus,
  hasGymBuddy,
  heartbeat,
  hiitSession,
  hostCreateSession,
  intervalSession,
  isCodeExpired,
  isDeloadWeek,
  isOnline,
  isValidJoinCode,
  joinByCode,
  joinHash,
  jointLiftsFromMap,
  latestBenchmark,
  liftKeyForName,
  logSharedSet,
  longRun,
  makeInvite,
  makeJoinCode,
  mergeEvents,
  mergeLogSets,
  mergeSession,
  mindfulRun,
  needsCalibration,
  newPartnerSession,
  normalizeJoinCode,
  paceZonesFromBenchmark,
  parseJoinHash,
  participantCount,
  participantFromUser,
  peakIsMaxTest,
  phaseLabel,
  phaseRepsFor,
  phaseSetsFor,
  progressionRun,
  progressiveDistance,
  projectLogs,
  projectWeeksToGoal,
  publishJointRx,
  qrMatrix,
  qrSvg,
  rankPlans,
  recentBestE1RM,
  recoveryRun,
  reedSolomon,
  removeGymBuddy,
  resolveAbRx,
  resolveJointRx,
  resolveMax,
  roundToIncrement,
  scaleLoad,
  scorePlan,
  selectAbTemplate,
  setDeletedEvent,
  setLoggedFromLog,
  setReady,
  setReadyRemote,
  setSharedBlock,
  steadyRun,
  substituteEid,
  suggestSharedLifts,
  thresholdPaceFromBenchmark,
  toEmbedUrl,
  toggleJointLift,
  touchPresence,
  transition,
  warmupSets,
  warmupText,
  whyPlan,
  withParticipant,
  wkFactorFor,
  workingMax
};
