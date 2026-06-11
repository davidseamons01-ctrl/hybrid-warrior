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
  const round = (n) => Math.round(n / 5) * 5;
  const steps = [
    { pct: 0, reps: 10, w: bar },
    { pct: 0.5, reps: 8 },
    { pct: 0.7, reps: 5 },
    { pct: 0.85, reps: 3 }
  ];
  const out = [];
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
export {
  ALL_EQUIPMENT,
  ALL_GOALS,
  BASE_GOALS,
  accessoryReps,
  accessoryRx,
  bestPlanId,
  detectPlateau,
  e1rmSeries,
  epley,
  equipmentSet,
  eventToLog,
  exerciseNeeds,
  fromLegacyLogs,
  goalFromFocus,
  isDeloadWeek,
  mergeEvents,
  mergeLogSets,
  peakIsMaxTest,
  phaseLabel,
  phaseRepsFor,
  phaseSetsFor,
  projectLogs,
  projectWeeksToGoal,
  rankPlans,
  recentBestE1RM,
  scorePlan,
  setDeletedEvent,
  setLoggedFromLog,
  substituteEid,
  toEmbedUrl,
  warmupSets,
  warmupText,
  whyPlan,
  wkFactorFor,
  workingMax
};
