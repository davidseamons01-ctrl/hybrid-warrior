import { describe, it, expect } from "vitest";
import {
  VIBE_SCHEMES, PARTNER_COMPOUNDS, roundToIncrement, scaleLoad,
  calibrationToMax, estimateMaxFromBodyweight, resolveMax,
  fitScore, canPerform, suggestSharedLifts, buildSharedLiftPlan, mergeSession,
  type PartnerUser,
} from "./partner";

// The husband/wife scenario from the spec.
const husband: PartnerUser = {
  uid: "h", name: "Dave",
  maxes: { bench: 225, squat: 315, deadlift: 405, hipthrust: 300 },
  focus: ["chest", "push", "upper", "strength"],
  equipment: ["barbell", "dumbbell", "machine"],
  todayEids: ["bench", "incline", "row", "tricep"],
};
const wife: PartnerUser = {
  uid: "w", name: "Sarah",
  maxes: { hipthrust: 185, squat: 135 },
  focus: ["glutes", "posterior", "legs"],
  equipment: ["barbell", "dumbbell", "machine"],
  bodyweightLb: 140,
  todayEids: ["hipthrust", "lunge", "abduction"],
};

describe("load scaling", () => {
  it("scales each lifter to their own max (the 50%-each example)", () => {
    expect(scaleLoad(225, 50)).toBe(115); // 112.5 → nearest 5
    expect(scaleLoad(100, 50)).toBe(50);
    expect(scaleLoad(315, VIBE_SCHEMES.hypertrophy.intensityPct)).toBe(220); // 315×0.7
    expect(scaleLoad(135, VIBE_SCHEMES.hypertrophy.intensityPct)).toBe(95);  // 135×0.7
  });
  it("rounds to the equipment increment and guards zero/negative", () => {
    expect(roundToIncrement(112.5, 5)).toBe(115);
    expect(roundToIncrement(112, 5)).toBe(110);
    expect(roundToIncrement(100, 0)).toBe(100); // bodyweight / no increment
    expect(scaleLoad(0, 70)).toBe(0);
    expect(scaleLoad(225, 0)).toBe(0);
    expect(scaleLoad(225, 70, 10)).toBe(160); // 157.5 → nearest 10
  });
});

describe("max resolution ladder", () => {
  it("prefers a logged max, then a bodyweight estimate, else none", () => {
    expect(resolveMax(wife, "squat")).toEqual({ value: 135, source: "logged" });
    const est = resolveMax(wife, "bench"); // no max, has bodyweight
    expect(est.source).toBe("estimated");
    expect(est.value).toBe(140); // 140 × 1.0
    const none = resolveMax({ ...wife, bodyweightLb: undefined }, "bench");
    expect(none).toEqual({ value: 0, source: "none" });
  });
  it("derives a provisional 1RM from a calibration set (Epley)", () => {
    expect(calibrationToMax(135, 5)).toBe(158); // 135×(1+5/30)
    expect(calibrationToMax(0, 5)).toBe(0);
  });
  it("estimates from bodyweight × experience", () => {
    expect(estimateMaxFromBodyweight("squat", 140, "intermediate")).toBe(195);
    expect(estimateMaxFromBodyweight("squat", 140, "beginner")).toBeLessThan(195);
    expect(estimateMaxFromBodyweight("unknownlift", 140)).toBe(0);
  });
});

describe("shared-lift suggestion (joint fit)", () => {
  it("counts focus-tag overlap and gates on equipment/safety", () => {
    const squat = PARTNER_COMPOUNDS.find((c) => c.eid === "squat")!;
    expect(fitScore(wife, squat)).toBe(3); // glutes + posterior + legs
    expect(fitScore(husband, squat)).toBe(1); // strength
    expect(canPerform(wife, squat)).toBe(true);
    expect(canPerform({ ...wife, equipment: ["dumbbell"] }, squat)).toBe(false); // no barbell
    expect(canPerform({ ...wife, blockedEids: ["squat"] }, squat)).toBe(false);
  });

  it("ranks lifts that serve EVERYONE above one-sided lifts", () => {
    const s = suggestSharedLifts([husband, wife]);
    expect(s[0].eid).toBe("squat"); // best joint fit
    const eids = s.map((x) => x.eid);
    expect(eids).toContain("deadlift"); // also serves both
    expect(eids).not.toContain("bench"); // great for him, nothing for her → not top-3
    // every top suggestion serves both lifters at least a little
    for (const sug of s) {
      expect(Math.min(fitScore(husband, PARTNER_COMPOUNDS.find((c) => c.eid === sug.eid)!),
                      fitScore(wife, PARTNER_COMPOUNDS.find((c) => c.eid === sug.eid)!))).toBeGreaterThan(0);
    }
  });

  it("respects the requested count and excludes lifts nobody wants", () => {
    expect(suggestSharedLifts([husband, wife], PARTNER_COMPOUNDS, { max: 2 }).length).toBe(2);
    // a lone user whose focus matches nothing in a 1-item catalog → no suggestions
    const odd = suggestSharedLifts([{ ...husband, focus: ["mobility"] }],
      [{ eid: "squat", name: "Back Squat", tags: ["legs"], equipment: "barbell", increment: 5 }]);
    expect(odd.length).toBe(0);
  });
});

describe("mergeSession", () => {
  it("builds a shared block with per-user loads and splits off each program", () => {
    const sugs = suggestSharedLifts([husband, wife], PARTNER_COMPOUNDS, { max: 1 }); // [squat]
    const merged = mergeSession([husband, wife], sugs, {
      h: ["bench", "incline", "row", "tricep"],
      w: ["hipthrust", "lunge", "abduction"],
    }, { vibe: "hypertrophy" });

    expect(merged.shared.length).toBe(1);
    const squat = merged.shared[0];
    expect(squat.scheme).toEqual({ sets: 4, reps: 8, intensityPct: 70 });
    expect(squat.loads.find((l) => l.uid === "h")!.load).toBe(220);
    expect(squat.loads.find((l) => l.uid === "w")!.load).toBe(95);
    // accessories: each program, minus any shared lift already done
    expect(merged.splits.h).toEqual(["bench", "incline", "row", "tricep"]);
    expect(merged.splits.w).toEqual(["hipthrust", "lunge", "abduction"]);
  });

  it("removes a shared lift from a user's split when it was in their plan", () => {
    const sugs = [{ eid: "hipthrust", name: "Hip Thrust", jointScore: 1, reason: "" }];
    const merged = mergeSession([husband, wife], sugs, {
      h: ["bench"], w: ["hipthrust", "lunge", "abduction"],
    });
    expect(merged.splits.w).toEqual(["lunge", "abduction"]); // hipthrust pulled into shared block
  });

  it("flags users who need a calibration set and honors scheme overrides", () => {
    const rookie: PartnerUser = { uid: "r", name: "New", maxes: {}, focus: ["legs"], equipment: ["barbell"] };
    const plan = buildSharedLiftPlan({ eid: "squat", name: "Back Squat", jointScore: 1, reason: "" }, [husband, rookie],
      VIBE_SCHEMES.strength, 5);
    expect(plan.loads.find((l) => l.uid === "h")!.needsCalibration).toBe(false);
    const r = plan.loads.find((l) => l.uid === "r")!;
    expect(r.needsCalibration).toBe(true); // no max, no bodyweight
    expect(r.load).toBe(0);

    const merged = mergeSession([husband], [{ eid: "bench", name: "Bench", jointScore: 1, reason: "" }],
      { h: [] }, { vibe: "pump", schemeOverrides: { bench: { sets: 4, reps: 8, intensityPct: 75 } } });
    expect(merged.shared[0].scheme.intensityPct).toBe(75); // override beats the pump vibe
    expect(merged.shared[0].loads[0].load).toBe(170); // 225 × 0.75
  });
});
