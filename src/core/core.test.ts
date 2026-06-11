import { describe, it, expect } from "vitest";
import {
  goalFromFocus,
  equipmentSet,
  substituteEid,
  exerciseNeeds,
  wkFactorFor,
  phaseRepsFor,
  phaseSetsFor,
  peakIsMaxTest,
  phaseLabel,
  isDeloadWeek,
  warmupSets,
  warmupText,
  epley,
  recentBestE1RM,
  workingMax,
  e1rmSeries,
  detectPlateau,
  projectWeeksToGoal,
  accessoryReps,
  accessoryRx,
  scorePlan,
  rankPlans,
  bestPlanId,
  toEmbedUrl,
  type PlanLite,
  type Goal,
} from "./index";

describe("goal detection", () => {
  it("running + lifting → hybrid", () => expect(goalFromFocus(["5K Running", "Improve Conditioning"]).goal).toBe("hybrid"));
  it("lose weight dominates", () => expect(goalFromFocus(["Lose Weight"]).goal).toBe("fat_loss"));
  it("build muscle dominates", () => expect(goalFromFocus(["Build Muscle", "Hourglass Shape"]).goal).toBe("muscle"));
  it("pure barbell → strength", () => expect(goalFromFocus(["Bench Press", "Squat", "Deadlift"]).goal).toBe("strength"));
  it("empty → hybrid default", () => expect(goalFromFocus([]).goal).toBe("hybrid"));
  it("primary goal override wins", () => expect(goalFromFocus(["Bench Press", "Squat"], "Lose Weight").goal).toBe("fat_loss"));
  it("brand-new → beginner", () => expect(goalFromFocus(["Brand New to Training"]).goal).toBe("beginner"));
  it("powerlifting total → powerlifting", () => expect(goalFromFocus(["Powerlifting Total"]).goal).toBe("powerlifting"));
  it("run a race → endurance", () => expect(goalFromFocus(["Run a Race (5K/10K/Half)"]).goal).toBe("endurance"));
});

describe("equipment & substitution", () => {
  it("home set excludes barbell, includes bodyweight", () => {
    const s = equipmentSet("home");
    expect(s.has("barbell")).toBe(false);
    expect(s.has("bodyweight")).toBe(true);
  });
  it("array inventory gains bodyweight", () => expect(equipmentSet(["barbell"]).has("bodyweight")).toBe(true));
  it("bench → incline_db at home", () => expect(substituteEid("bench", "home")).toBe("incline_db"));
  it("bench → pushup bodyweight-only", () => expect(substituteEid("bench", "none")).toBe("pushup"));
  it("squat stays at gym", () => expect(substituteEid("squat", "gym")).toBe("squat"));
  it("deadlift → rdl at home", () => expect(substituteEid("deadlift", "home")).toBe("rdl"));
  it("machine user → machine press for bench", () => expect(substituteEid("bench", ["machine", "bodyweight"])).toBe("machine_chest_press"));
  it("machine user → leg press for squat", () => expect(substituteEid("squat", ["machine", "bodyweight"])).toBe("leg_press"));
  it("kettlebell user → swing for deadlift", () => expect(substituteEid("deadlift", ["kettlebell", "bodyweight"])).toBe("kb_swing"));
  it("new catalog moves know equipment", () => {
    expect(exerciseNeeds("leg_press")).toBe("machine");
    expect(exerciseNeeds("kb_swing")).toBe("kettlebell");
    expect(exerciseNeeds("pike_pushup")).toBe("bodyweight");
  });
});

describe("periodization", () => {
  it("fat loss never max-tests; strength does", () => {
    expect(peakIsMaxTest("fat_loss")).toBe(false);
    expect(peakIsMaxTest("strength")).toBe(true);
    expect(peakIsMaxTest("powerlifting")).toBe(true);
    expect(phaseLabel("fat_loss", 13)).toBe("Benchmark");
    expect(phaseLabel("strength", 13)).toBe("Test");
  });
  it("beginner gentler than powerlifting peak", () => expect(wkFactorFor("beginner", 11)).toBeLessThan(wkFactorFor("powerlifting", 11)));
  it("endurance tapers at the end", () => expect(wkFactorFor("endurance", 13)).toBeLessThan(wkFactorFor("endurance", 11)));
  it("powerlifting low reps, beginner higher", () => {
    expect(phaseRepsFor("powerlifting", 11)[0]).toBeLessThanOrEqual(3);
    expect(phaseRepsFor("beginner", 1)[0]).toBeGreaterThanOrEqual(10);
  });
  it("deload weeks + trimmed sets", () => {
    expect(isDeloadWeek(4) && isDeloadWeek(8) && !isDeloadWeek(5)).toBe(true);
    expect(phaseSetsFor("strength", 4)).toBeLessThan(phaseSetsFor("strength", 6));
  });
  it("wkFactor clamps out-of-range weeks", () => {
    expect(wkFactorFor("strength", 99)).toBe(wkFactorFor("strength", 13));
    expect(wkFactorFor("strength", 0)).toBe(wkFactorFor("strength", 1));
  });
});

describe("warmups", () => {
  it("heavy bench ramps below working weight", () => {
    const w = warmupSets(225, { unit: "lb" });
    expect(w.length).toBeGreaterThanOrEqual(2);
    expect(w.every((s) => s.weight < 225 * 0.9)).toBe(true);
  });
  it("light load → no ramp", () => expect(warmupSets(50)).toEqual([]));
  it("never exceeds working weight (beginner)", () => expect(warmupSets(95).every((s) => s.weight < 95)).toBe(true));
  it("text starts with bar", () => expect(warmupText(225).startsWith("bar×")).toBe(true));
});

describe("e1RM", () => {
  it("epley basic", () => expect(Math.round(epley(200, 5))).toBe(233));
  it("recentBest picks best recent set", () => {
    const now = Date.parse("2026-06-10T12:00:00");
    const logs = [
      { date: "2026-06-01", exercise: "Bench", aW: 185, aR: 5 },
      { date: "2026-06-08", exercise: "Bench", aW: 205, aR: 3 },
      { date: "2020-01-01", exercise: "Bench", aW: 999, aR: 5 },
    ];
    expect(recentBestE1RM(logs, "Bench", { now })).toBe(Math.round(epley(205, 3)));
  });
  it("workingMax never drops below stored max", () => {
    expect(workingMax(225, 200)).toBe(225);
    expect(workingMax(225, 0)).toBe(225);
  });
  it("workingMax caps a fluke +12%", () => expect(workingMax(200, 400)).toBe(Math.round(200 * 1.12)));
  it("workingMax raises for a real PR", () => expect(workingMax(225, 235)).toBe(235));
});

describe("plateau & projection", () => {
  it("flat series plateaus, progressing does not", () => {
    expect(detectPlateau([200, 201, 200, 200]).plateaued).toBe(true);
    expect(detectPlateau([200, 210, 220, 235]).plateaued).toBe(false);
    expect(detectPlateau([200, 205]).plateaued).toBe(false);
  });
  it("e1rmSeries best-per-day, chronological", () => {
    const s = e1rmSeries(
      [
        { date: "2026-06-03", exercise: "Squat", aW: 200, aR: 5 },
        { date: "2026-06-01", exercise: "Squat", aW: 185, aR: 5 },
        { date: "2026-06-03", exercise: "Squat", aW: 225, aR: 2 },
      ],
      "Squat"
    );
    expect(s.length).toBe(2);
    expect(s[0]).toBeLessThan(s[1]);
  });
  it("projection: gain, loss, away, flat", () => {
    expect(projectWeeksToGoal(225, 245, 2)).toEqual({ weeks: 10 });
    expect(projectWeeksToGoal(200, 185, -1.5)).toEqual({ weeks: 10 });
    expect(projectWeeksToGoal(225, 245, -2)).toBeNull();
    expect(projectWeeksToGoal(225, 245, 0)).toBeNull();
  });
});

describe("accessories", () => {
  it("isolation reps >= compound", () => expect(accessoryReps("muscle", 2, true)).toBeGreaterThanOrEqual(accessoryReps("muscle", 2, false)));
  it("sets scale with experience, deload trims", () => {
    expect(accessoryRx({ goal: "muscle", week: 2, experienceMonths: 36, estTarget: 100 }).sets).toBeGreaterThan(
      accessoryRx({ goal: "muscle", week: 2, experienceMonths: 1, estTarget: 100 }).sets
    );
    expect(accessoryRx({ goal: "muscle", week: 4, experienceMonths: 36, estTarget: 100 }).sets).toBeLessThan(
      accessoryRx({ goal: "muscle", week: 2, experienceMonths: 36, estTarget: 100 }).sets
    );
  });
  it("uses logged history + progresses on easy", () => {
    expect(accessoryRx({ goal: "muscle", week: 2, estTarget: 100, lastLogged: 130 }).target).toBe(130);
    expect(accessoryRx({ goal: "muscle", week: 2, estTarget: 100, lastLogged: 130, lastFeel: "easy" }).target).toBeGreaterThan(130);
    expect(accessoryRx({ goal: "muscle", week: 2, estTarget: 95 }).basis).toMatch(/strength/);
  });
});

// Mirror the live 112-plan generator for routing tests.
const PLANS: PlanLite[] = (() => {
  const G: Goal[] = ["strength", "hybrid", "fat_loss", "muscle", "beginner", "powerlifting", "endurance"];
  const gN = ["Strength", "Hybrid Athlete", "Fat Loss", "Hypertrophy", "Beginner Foundations", "Powerlifting", "Endurance"];
  const fN = ["3-4 Day", "5-6 Day"], dN = ["Express", "Full"], sN = ["Men's", "Women's"], eN = ["Foundation", "Advanced"];
  const slots = ["A", "B", "C", "D"];
  const out: PlanLite[] = [];
  for (let g = 0; g < G.length; g++)
    for (let f = 0; f < 2; f++)
      for (let d = 0; d < 2; d++)
        for (let s = 0; s < 2; s++)
          for (let e = 0; e < 2; e++)
            out.push({ id: g * 16 + f * 8 + d * 4 + s * 2 + e, name: `${sN[s]} ${gN[g]} · ${fN[f]} ${dN[d]} (${eN[e]})`, goal: G[g], slots });
  return out;
})();

describe("plan scoring", () => {
  it("112 plans, stable ids", () => {
    expect(PLANS.length).toBe(112);
    expect(PLANS[0].id).toBe(0);
  });
  it("postpartum woman/home/glute → women's muscle plan", () => {
    const ctx = { goal: goalFromFocus(["Glute Shelf", "Postpartum Recovery", "Home-Friendly Workouts"]).goal, sex: "female", trainingDays: [1, 3, 5], sessionMin: 45, experienceMonths: 2 };
    const best = PLANS.find((p) => p.id === bestPlanId(PLANS, ctx))!;
    expect(best.goal).toBe("muscle");
    expect(best.name).toMatch(/Women/);
  });
  it("powerlifter routes to powerlifting", () => {
    const ctx = { goal: "powerlifting" as Goal, sex: "male", trainingDays: [1, 2, 4, 5], sessionMin: 90, experienceMonths: 36 };
    expect(PLANS.find((p) => p.id === bestPlanId(PLANS, ctx))!.goal).toBe("powerlifting");
  });
  it("rankPlans returns sorted with rationale", () => {
    const top = rankPlans(PLANS, { goal: "hybrid", sex: "male", trainingDays: [1, 2, 3, 4], sessionMin: 60, experienceMonths: 12 }).slice(0, 3);
    expect(top[0].score).toBeGreaterThanOrEqual(top[1].score);
    expect(top[0].why.length).toBeGreaterThan(0);
  });
});

describe("media", () => {
  it("watch → embed", () => expect(toEmbedUrl("https://www.youtube.com/watch?v=jQ1O7NeLmck")).toBe("https://www.youtube.com/embed/jQ1O7NeLmck"));
  it("shorts → embed", () => expect(toEmbedUrl("https://www.youtube.com/shorts/lqupOdAp2i0")).toBe("https://www.youtube.com/embed/lqupOdAp2i0"));
  it("already-embed unchanged", () => expect(toEmbedUrl("https://www.youtube.com/embed/rT7DgCr-3pg")).toBe("https://www.youtube.com/embed/rT7DgCr-3pg"));
});
