// Pure-logic tests for js/programming.js — run with: node test/programming.test.mjs
import assert from "node:assert/strict";
import {
  goalFromFocus, equipmentSet, substituteEid, exerciseNeeds,
  wkFactorFor, phaseRepsFor, phaseSetsFor, peakIsMaxTest, phaseLabel, isDeloadWeek,
  warmupSets, warmupText, epley, recentBestE1RM, workingMax,
  scorePlan, rankPlans, bestPlanId, whyPlan, toEmbedUrl,
  e1rmSeries, detectPlateau, projectWeeksToGoal
} from "../js/programming.js";

let pass = 0, fail = 0;
function t(name, fn) { try { fn(); pass++; } catch (e) { fail++; console.error("✗", name, "\n   ", e.message); } }

/* --- goal detection --- */
t("running + lifting → hybrid leaning", () => {
  assert.equal(goalFromFocus(["5K Running", "Improve Conditioning"]).goal, "hybrid");
});
t("lose weight dominates", () => {
  assert.equal(goalFromFocus(["Lose Weight"]).goal, "fat_loss");
});
t("build muscle dominates", () => {
  assert.equal(goalFromFocus(["Build Muscle", "Hourglass Shape"]).goal, "muscle");
});
t("pure barbell focus → strength", () => {
  assert.equal(goalFromFocus(["Bench Press", "Squat", "Deadlift"]).goal, "strength");
});
t("empty focus → hybrid default", () => {
  assert.equal(goalFromFocus([]).goal, "hybrid");
});
t("primary goal override wins", () => {
  assert.equal(goalFromFocus(["Bench Press", "Squat"], "Lose Weight").goal, "fat_loss");
});

/* --- equipment --- */
t("home equipment set excludes barbell, includes bodyweight", () => {
  const s = equipmentSet("home");
  assert.ok(!s.has("barbell"));
  assert.ok(s.has("bodyweight"));
});
t("array inventory always gains bodyweight", () => {
  assert.ok(equipmentSet(["barbell"]).has("bodyweight"));
});
t("bench subs to incline_db with dumbbells only", () => {
  assert.equal(substituteEid("bench", "home"), "incline_db");
});
t("bench subs to pushup with bodyweight only", () => {
  assert.equal(substituteEid("bench", "none"), "pushup");
});
t("squat stays squat at full gym", () => {
  assert.equal(substituteEid("squat", "gym"), "squat");
});
t("deadlift → rdl at home", () => {
  assert.equal(substituteEid("deadlift", "home"), "rdl");
});
t("bodyweight move unaffected", () => {
  assert.equal(exerciseNeeds("pushup"), "bodyweight");
  assert.equal(substituteEid("pushup", "none"), "pushup");
});
t("machine user gets machine sub for bench", () => {
  assert.equal(substituteEid("bench", ["machine", "bodyweight"]), "machine_chest_press");
});
t("machine user gets leg press for squat", () => {
  assert.equal(substituteEid("squat", ["machine", "bodyweight"]), "leg_press");
});
t("kettlebell-only user gets swing for deadlift", () => {
  assert.equal(substituteEid("deadlift", ["kettlebell", "bodyweight"]), "kb_swing");
});
t("machine user gets lat pulldown for pullup", () => {
  assert.equal(substituteEid("pullup", ["machine", "bodyweight"]), "lat_pulldown");
});
t("new catalog moves know their equipment", () => {
  assert.equal(exerciseNeeds("leg_press"), "machine");
  assert.equal(exerciseNeeds("kb_swing"), "kettlebell");
  assert.equal(exerciseNeeds("pike_pushup"), "bodyweight");
});

/* --- periodization --- */
t("fat loss never max-tests at wk13", () => {
  assert.equal(peakIsMaxTest("fat_loss"), false);
  assert.equal(phaseLabel("fat_loss", 13), "Benchmark");
});
t("strength still tests at wk13", () => {
  assert.equal(peakIsMaxTest("strength"), true);
  assert.equal(phaseLabel("strength", 13), "Test");
});
t("fat loss reps higher than strength reps wk1", () => {
  assert.ok(phaseRepsFor("fat_loss", 1)[0] > phaseRepsFor("strength", 1)[0]);
});
t("muscle intensity below strength peak", () => {
  assert.ok(wkFactorFor("muscle", 11) < wkFactorFor("strength", 11));
});
t("deload weeks identified", () => {
  assert.ok(isDeloadWeek(4) && isDeloadWeek(8) && !isDeloadWeek(5));
});
t("sets drop on deload", () => {
  assert.ok(phaseSetsFor("strength", 4) < phaseSetsFor("strength", 6));
});
t("wkFactor clamps out-of-range weeks", () => {
  assert.equal(wkFactorFor("strength", 99), wkFactorFor("strength", 13));
  assert.equal(wkFactorFor("strength", 0), wkFactorFor("strength", 1));
});

/* --- warmups --- */
t("heavy bench gets a ramp, all below working weight", () => {
  const w = warmupSets(225, { unit: "lb" });
  assert.ok(w.length >= 2);
  assert.ok(w.every((s) => s.weight < 225 * 0.9));
});
t("light load gets no warmup ramp", () => {
  assert.deepEqual(warmupSets(50, { unit: "lb" }), []);
});
t("warmup never exceeds working weight (beginner bug)", () => {
  const w = warmupSets(95, { unit: "lb" });
  assert.ok(w.every((s) => s.weight < 95));
});
t("warmup text formats with bar first", () => {
  const txt = warmupText(225, { unit: "lb" });
  assert.ok(txt.startsWith("bar×"));
});

/* --- e1RM --- */
t("epley basic", () => { assert.equal(Math.round(epley(200, 5)), 233); });
t("recentBestE1RM picks best recent set", () => {
  const now = Date.parse("2026-06-10T12:00:00");
  const logs = [
    { date: "2026-06-01", exercise: "Barbell Bench Press", aW: 185, aR: 5 },
    { date: "2026-06-08", exercise: "Barbell Bench Press", aW: 205, aR: 3 },
    { date: "2020-01-01", exercise: "Barbell Bench Press", aW: 999, aR: 5 } // too old
  ];
  const best = recentBestE1RM(logs, "Barbell Bench Press", { now });
  assert.equal(best, Math.round(epley(205, 3)));
});
t("workingMax clamps fluke upward", () => {
  // recent best wildly high should be capped at +12%
  assert.equal(workingMax(200, 400), Math.round(200 * 1.12));
});
t("workingMax falls back to profile when no logs", () => {
  assert.equal(workingMax(225, 0), 225);
});

/* --- plan scoring --- */
const PLANS = (function () {
  const G = ["strength", "hybrid", "fat_loss", "muscle"];
  const gN = ["Strength", "Hybrid Athlete", "Fat Loss", "Hypertrophy"];
  const fN = ["3-4 Day", "5-6 Day"], dN = ["Express", "Full"], sN = ["Men's", "Women's"], eN = ["Foundation", "Advanced"];
  const base = {
    strength: { "00": ["FB", "SR", "FB"], "01": ["HP", "SR", "HL", "TR"], "10": ["HP", "SR", "HL", "TR", "HB"], "11": ["HP", "HPL", "HL", "SR", "PW"] },
    hybrid: { "00": ["FB", "SR", "FB"], "01": ["HP", "SR", "HL", "TR"], "10": ["HP", "SR", "HL", "TR", "HB"], "11": ["HP", "SR", "HL", "TR", "HB"] },
    fat_loss: { "00": ["CT", "SR", "FBC"], "01": ["HB", "SR", "CT", "TR"], "10": ["CT", "SR", "HB", "TR", "CT"], "11": ["HB", "SR", "HL", "TR", "CT"] },
    muscle: { "00": ["FB", "FB", "FB"], "01": ["HYP", "HYG", "HYL"], "10": ["HYP", "HYL", "HYG", "HB", "CT"], "11": ["HYP", "HYL", "HYG", "HP", "HL"] }
  };
  const plans = [];
  for (let g = 0; g < 4; g++) for (let f = 0; f < 2; f++) for (let d = 0; d < 2; d++) for (let s = 0; s < 2; s++) for (let e = 0; e < 2; e++) {
    let sl = [...base[G[g]]["" + f + d]];
    plans.push({ id: g * 16 + f * 8 + d * 4 + s * 2 + e, name: `${sN[s]} ${gN[g]} · ${fN[f]} ${dN[d]} (${eN[e]})`, goal: G[g], slots: sl });
  }
  return plans;
})();

t("64 plans generated, stable ids", () => {
  assert.equal(PLANS.length, 64);
  assert.equal(PLANS[0].id, 0);
});
t("postpartum woman, home, glute → women's muscle plan", () => {
  const ctx = { goal: goalFromFocus(["Glute Shelf", "Postpartum Recovery", "Home-Friendly Workouts"]).goal, sex: "female", trainingDays: [1, 3, 5], sessionMin: 45, experienceMonths: 2 };
  const best = PLANS.find((p) => p.id === bestPlanId(PLANS, ctx));
  assert.equal(best.goal, "muscle");
  assert.match(best.name, /Women/);
  assert.match(best.name, /Foundation/);
});
t("experienced male powerlifter → men's strength advanced", () => {
  const ctx = { goal: "strength", sex: "male", trainingDays: [1, 2, 4, 5], sessionMin: 75, experienceMonths: 36 };
  const best = PLANS.find((p) => p.id === bestPlanId(PLANS, ctx));
  assert.equal(best.goal, "strength");
  assert.match(best.name, /Men's/);
  assert.match(best.name, /Advanced/);
});
t("fat-loss woman 5 days short sessions → women's fat loss 5-6 express", () => {
  const ctx = { goal: "fat_loss", sex: "female", trainingDays: [1, 2, 3, 4, 5], sessionMin: 30, experienceMonths: 6 };
  const best = PLANS.find((p) => p.id === bestPlanId(PLANS, ctx));
  assert.equal(best.goal, "fat_loss");
  assert.match(best.name, /Women/);
  assert.match(best.name, /5-6 Day/);
  assert.match(best.name, /Express/);
});
t("recommendation differs from legacy plan 0 for diverse users", () => {
  const ctx = { goal: "fat_loss", sex: "female", trainingDays: [1, 2, 3, 4, 5], sessionMin: 30, experienceMonths: 6 };
  assert.notEqual(bestPlanId(PLANS, ctx), 0);
});
t("rankPlans returns top-3 with rationale", () => {
  const ctx = { goal: "hybrid", sex: "male", trainingDays: [1, 2, 3, 4], sessionMin: 60, experienceMonths: 12 };
  const top = rankPlans(PLANS, ctx).slice(0, 3);
  assert.equal(top.length, 3);
  assert.ok(top[0].why.length > 0);
  assert.ok(top[0].score >= top[1].score && top[1].score >= top[2].score);
});

/* --- archetypes (Wave 2b) --- */
t("brand-new focus → beginner goal", () => {
  assert.equal(goalFromFocus(["Brand New to Training"]).goal, "beginner");
});
t("powerlifting total → powerlifting goal", () => {
  assert.equal(goalFromFocus(["Powerlifting Total"]).goal, "powerlifting");
});
t("run a race → endurance goal", () => {
  assert.equal(goalFromFocus(["Run a Race (5K/10K/Half)"]).goal, "endurance");
});
t("beginner never max-tests; powerlifting does", () => {
  assert.equal(peakIsMaxTest("beginner"), false);
  assert.equal(peakIsMaxTest("powerlifting"), true);
  assert.equal(peakIsMaxTest("endurance"), false);
});
t("beginner intensity stays gentle vs powerlifting peak", () => {
  assert.ok(wkFactorFor("beginner", 11) < wkFactorFor("powerlifting", 11));
  assert.ok(wkFactorFor("powerlifting", 12) > wkFactorFor("strength", 12));
});
t("endurance tapers down at the end", () => {
  assert.ok(wkFactorFor("endurance", 13) < wkFactorFor("endurance", 11));
});
t("powerlifting uses low reps, beginner higher", () => {
  assert.ok(phaseRepsFor("powerlifting", 11)[0] <= 3);
  assert.ok(phaseRepsFor("beginner", 1)[0] >= 10);
});
// rebuild a full 112-plan catalog mirroring the generator (incl. archetypes)
const PLANS2 = (function () {
  const G = ["strength", "hybrid", "fat_loss", "muscle", "beginner", "powerlifting", "endurance"];
  const gN = ["Strength", "Hybrid Athlete", "Fat Loss", "Hypertrophy", "Beginner Foundations", "Powerlifting", "Endurance"];
  const fN = ["3-4 Day", "5-6 Day"], dN = ["Express", "Full"], sN = ["Men's", "Women's"], eN = ["Foundation", "Advanced"];
  const base = {
    strength: { "00": ["FB", "SR", "FB"], "01": ["HP", "SR", "HL", "TR"], "10": ["HP", "SR", "HL", "TR", "HB"], "11": ["HP", "HPL", "HL", "SR", "PW"] },
    hybrid: { "00": ["FB", "SR", "FB"], "01": ["HP", "SR", "HL", "TR"], "10": ["HP", "SR", "HL", "TR", "HB"], "11": ["HP", "SR", "HL", "TR", "HB"] },
    fat_loss: { "00": ["CT", "SR", "FBC"], "01": ["HB", "SR", "CT", "TR"], "10": ["CT", "SR", "HB", "TR", "CT"], "11": ["HB", "SR", "HL", "TR", "CT"] },
    muscle: { "00": ["FB", "FB", "FB"], "01": ["HYP", "HYG", "HYL"], "10": ["HYP", "HYL", "HYG", "HB", "CT"], "11": ["HYP", "HYL", "HYG", "HP", "HL"] },
    beginner: { "00": ["FB", "FB", "FB"], "01": ["FB", "FBC", "FB", "FB"], "10": ["FB", "FBC", "FB", "FBC", "FB"], "11": ["FB", "HP", "HL", "FBC", "FB"] },
    powerlifting: { "00": ["HP", "HL", "HPL"], "01": ["HP", "HL", "HPL", "FB"], "10": ["HP", "HL", "HPL", "HL", "HP"], "11": ["HP", "HL", "HPL", "HL", "HP"] },
    endurance: { "00": ["TR", "SR", "TR"], "01": ["TR", "SR", "TR", "FB"], "10": ["TR", "SR", "TR", "SR", "FB"], "11": ["TR", "SR", "TR", "SR", "HL"] }
  };
  const plans = [];
  for (let g = 0; g < G.length; g++) for (let f = 0; f < 2; f++) for (let d = 0; d < 2; d++) for (let s = 0; s < 2; s++) for (let e = 0; e < 2; e++) {
    let sl = [...base[G[g]]["" + f + d]];
    plans.push({ id: g * 16 + f * 8 + d * 4 + s * 2 + e, name: `${sN[s]} ${gN[g]} · ${fN[f]} ${dN[d]} (${eN[e]})`, goal: G[g], slots: sl });
  }
  return plans;
})();
t("generator now yields 112 plans; legacy ids unchanged", () => {
  assert.equal(PLANS2.length, 112);
  assert.equal(PLANS2[0].id, 0);
  assert.equal(PLANS2[0].goal, "strength");
});
t("beginner user routes to a beginner plan", () => {
  const ctx = { goal: "beginner", sex: "male", trainingDays: [1, 3, 5], sessionMin: 45, experienceMonths: 0 };
  assert.equal(PLANS2.find((p) => p.id === bestPlanId(PLANS2, ctx)).goal, "beginner");
});
t("race goal routes to an endurance plan that keeps runs", () => {
  const ctx = { goal: "endurance", sex: "female", trainingDays: [1, 2, 3, 4], sessionMin: 60, experienceMonths: 12 };
  const best = PLANS2.find((p) => p.id === bestPlanId(PLANS2, ctx));
  assert.equal(best.goal, "endurance");
  assert.ok(best.slots.includes("TR") || best.slots.includes("SR")); // women's endurance still has running
});
t("powerlifter routes to a powerlifting plan", () => {
  const ctx = { goal: "powerlifting", sex: "male", trainingDays: [1, 2, 4, 5], sessionMin: 90, experienceMonths: 36 };
  assert.equal(PLANS2.find((p) => p.id === bestPlanId(PLANS2, ctx)).goal, "powerlifting");
});

/* --- plateau detection & goal projection (Wave 2c) --- */
t("e1rmSeries takes best per day, chronological", () => {
  const logs = [
    { date: "2026-06-03", exercise: "Back Squat", aW: 200, aR: 5 },
    { date: "2026-06-01", exercise: "Back Squat", aW: 185, aR: 5 },
    { date: "2026-06-03", exercise: "Back Squat", aW: 225, aR: 2 }
  ];
  const s = e1rmSeries(logs, "Back Squat");
  assert.equal(s.length, 2);
  assert.ok(s[0] < s[1]); // 06-01 then best of 06-03
});
t("detectPlateau flags a flat series", () => {
  assert.equal(detectPlateau([200, 201, 200, 200]).plateaued, true);
});
t("detectPlateau passes a progressing series", () => {
  assert.equal(detectPlateau([200, 210, 220, 235]).plateaued, false);
});
t("detectPlateau needs enough data", () => {
  assert.equal(detectPlateau([200, 205]).plateaued, false);
});
t("projectWeeksToGoal computes ETA for a gain goal", () => {
  assert.deepEqual(projectWeeksToGoal(225, 245, 2), { weeks: 10 });
});
t("projectWeeksToGoal handles a loss goal (negative rate)", () => {
  assert.deepEqual(projectWeeksToGoal(200, 185, -1.5), { weeks: 10 });
});
t("projectWeeksToGoal null when trending the wrong way", () => {
  assert.equal(projectWeeksToGoal(225, 245, -2), null);
});
t("projectWeeksToGoal null on flat rate", () => {
  assert.equal(projectWeeksToGoal(225, 245, 0), null);
});

/* --- media --- */
t("watch url → embed", () => {
  assert.equal(toEmbedUrl("https://www.youtube.com/watch?v=jQ1O7NeLmck"), "https://www.youtube.com/embed/jQ1O7NeLmck");
});
t("shorts url → embed", () => {
  assert.equal(toEmbedUrl("https://www.youtube.com/shorts/lqupOdAp2i0"), "https://www.youtube.com/embed/lqupOdAp2i0");
});
t("already-embed url unchanged", () => {
  assert.equal(toEmbedUrl("https://www.youtube.com/embed/rT7DgCr-3pg"), "https://www.youtube.com/embed/rT7DgCr-3pg");
});
t("youtu.be url → embed", () => {
  assert.equal(toEmbedUrl("https://youtu.be/abc123XYZ"), "https://www.youtube.com/embed/abc123XYZ");
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
