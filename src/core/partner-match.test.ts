import { describe, it, expect } from "vitest";
import {
  liftKeyForName, resolveJointRx, buildJointPlan, accessoriesFor, jointLiftsFromMap, needsCalibration,
  type LifterProfile, type JointLift,
} from "./partner-match";
import { VIBE_SCHEMES } from "./partner";

// Dave's programmed day (strength phase): Bench 5×5@180, Row 4×8@135, + accessories.
const dave: LifterProfile = {
  unit: "lb",
  scheme: VIBE_SCHEMES.strength, // 5×3 @ 85%
  strengthByKey: { bench: 225, row: 155 }, // no hip-thrust strength on file
  dayPlan: [
    { eid: "bench", name: "Bench Press", sets: 5, reps: 5, load: 180 },
    { eid: "row", name: "Barbell Row", sets: 4, reps: 8, load: 135 },
    { eid: "decline-pushup", name: "Decline Push-up", sets: 4, reps: 8, load: 0 },
    { eid: "inv-row", name: "Inverted Row", sets: 4, reps: 8, load: 0 },
    { eid: "skull", name: "Skullcrusher", sets: 3, reps: 12, load: 55 },
  ],
};

// Kaylee's programmed day (pump/tone): Hip Thrust 3×17@45 + glute accessories.
const kaylee: LifterProfile = {
  unit: "lb",
  scheme: VIBE_SCHEMES.pump, // 3×12 @ 60%
  strengthByKey: { hipthrust: 135, bench: 95 }, // has bench strength, no row
  dayPlan: [
    { eid: "db-hipthrust", name: "DB Hip Thrust", sets: 3, reps: 17, load: 45 },
    { eid: "fire-hydrant", name: "Fire Hydrant", sets: 3, reps: 22, load: 0 },
    { eid: "clamshell", name: "Banded Clamshell", sets: 3, reps: 22, load: 0 },
    { eid: "donkey-kick", name: "Donkey Kick", sets: 3, reps: 22, load: 0 },
    { eid: "leg-raise", name: "Side-lying Leg Raise", sets: 3, reps: 22, load: 0 },
  ],
};

const joints: JointLift[] = [
  { key: "bench", eid: "bench", name: "Bench Press", addedBy: "dave", addedAt: 1 },
  { key: "row", eid: "row", name: "Barbell Row", addedBy: "dave", addedAt: 2 },
  { key: "hipthrust", eid: "db-hipthrust", name: "DB Hip Thrust", addedBy: "kaylee", addedAt: 3 },
];

describe("liftKeyForName", () => {
  it("maps the big lifts to canonical keys", () => {
    expect(liftKeyForName("Bench Press")).toBe("bench");
    expect(liftKeyForName("Barbell Row")).toBe("row");
    expect(liftKeyForName("DB Hip Thrust")).toBe("hipthrust");
    expect(liftKeyForName("Standing Overhead Press")).toBe("ohp");
    expect(liftKeyForName("Weighted Pull-up")).toBe("pullup");
    expect(liftKeyForName("Romanian Deadlift")).toBe("deadlift");
    expect(liftKeyForName("Banded Clamshell")).toBe("banded-clamshell"); // slug fallback
  });
});

describe("resolveJointRx / buildJointPlan", () => {
  it("keeps Dave's own programming for lifts he already has, estimates the borrowed one", () => {
    const plan = buildJointPlan(dave, joints);
    const bench = plan.find((p) => p.key === "bench")!;
    expect(bench).toMatchObject({ sets: 5, reps: 5, load: 180, source: "programmed" }); // his prescription, not the scheme
    const row = plan.find((p) => p.key === "row")!;
    expect(row).toMatchObject({ sets: 4, reps: 8, load: 135, source: "programmed" });
    const hip = plan.find((p) => p.key === "hipthrust")!;
    expect(hip.source).toBe("needs-calibration"); // Dave has no hip-thrust strength on file
    expect(hip.sets).toBe(5); // falls back to his strength scheme for sets/reps
  });

  it("keeps Kaylee's hip thrust, estimates her borrowed bench from her phase + strength", () => {
    const plan = buildJointPlan(kaylee, joints);
    const hip = plan.find((p) => p.key === "hipthrust")!;
    expect(hip).toMatchObject({ sets: 3, reps: 17, load: 45, source: "programmed" });
    const bench = plan.find((p) => p.key === "bench")!;
    // pump scheme 3×12 @ 60% of her 95 lb bench → scaleLoad(95, 60, 5) = round(57→55)
    expect(bench).toMatchObject({ sets: 3, reps: 12, load: 55, source: "estimated" });
    const row = plan.find((p) => p.key === "row")!;
    expect(row.source).toBe("needs-calibration"); // no row strength for her
  });
});

describe("accessoriesFor", () => {
  it("returns each lifter's plan minus the shared lifts", () => {
    expect(accessoriesFor(dave, joints).map((a) => a.eid)).toEqual(["decline-pushup", "inv-row", "skull"]);
    expect(accessoriesFor(kaylee, joints).map((a) => a.eid)).toEqual(["fire-hydrant", "clamshell", "donkey-kick", "leg-raise"]);
  });
});

describe("jointLiftsFromMap / needsCalibration", () => {
  it("drops removed (null) entries and orders by addedAt", () => {
    const map = {
      row: { key: "row", eid: "row", name: "Barbell Row", addedBy: "dave", addedAt: 2 },
      bench: { key: "bench", eid: "bench", name: "Bench Press", addedBy: "dave", addedAt: 1 },
      squat: null,
    };
    expect(jointLiftsFromMap(map).map((j) => j.key)).toEqual(["bench", "row"]);
  });
  it("flags lifts a lifter still needs to calibrate", () => {
    expect(needsCalibration(dave, joints).map((r) => r.key)).toEqual(["hipthrust"]);
    expect(needsCalibration(kaylee, joints).map((r) => r.key)).toEqual(["row"]);
  });
});
