import { describe, it, expect } from "vitest";
import {
  cooperVo2max, thresholdPaceFromBenchmark, paceZonesFromBenchmark, fmtPace,
  benchmarkWorkout, steadyRun, longRun, intervalSession, hiitSession, fartlek,
  progressionRun, recoveryRun, mindfulRun, progressiveDistance, latestBenchmark,
  type Benchmark,
} from "./running";

describe("benchmark → pace zones", () => {
  it("estimates VO2max from a Cooper distance", () => {
    expect(cooperVo2max(1.5)).toBeCloseTo(42.6, 0); // 1.5 mi in 12 min
  });

  it("derives a sensible threshold pace per benchmark kind", () => {
    expect(thresholdPaceFromBenchmark({ kind: "cooper", value: 1.5 })).toBe(Math.round(480 * 1.08)); // 8:00 cooper pace
    expect(thresholdPaceFromBenchmark({ kind: "mile", value: 420 })).toBe(Math.round(420 * 1.15)); // 7:00 mile
    expect(thresholdPaceFromBenchmark({ kind: "fivek", value: 1500 })).toBeGreaterThan(0); // 25:00 5K
  });

  it("orders the zones from fastest (interval) to slowest (recovery)", () => {
    const z = paceZonesFromBenchmark({ kind: "cooper", value: 1.5 });
    expect(z.interval).toBeLessThan(z.tempo);
    expect(z.tempo).toBeLessThan(z.steady);
    expect(z.steady).toBeLessThan(z.easy);
    expect(z.easy).toBeLessThan(z.long);
    expect(z.long).toBeLessThan(z.recovery);
  });

  it("a faster benchmark yields faster zones", () => {
    const slow = paceZonesFromBenchmark({ kind: "cooper", value: 1.3 });
    const fast = paceZonesFromBenchmark({ kind: "cooper", value: 1.8 });
    expect(fast.tempo).toBeLessThan(slow.tempo);
  });

  it("formats pace as mm:ss", () => {
    expect(fmtPace(480)).toBe("8:00");
    expect(fmtPace(545)).toBe("9:05");
    expect(fmtPace(0)).toBe("—");
  });
});

describe("run-type generators", () => {
  const z = paceZonesFromBenchmark({ kind: "cooper", value: 1.5 });

  it("benchmark workouts carry no pace target and request full tracking", () => {
    const c = benchmarkWorkout("cooper");
    expect(c.type).toBe("benchmark");
    expect(c.targetPaceSecPerMi).toBeNull();
    expect(c.tracks).toContain("hr");
    expect(benchmarkWorkout("mile").totalMiles).toBe(1);
  });

  it("steady & long runs target their own zone pace", () => {
    expect(steadyRun(z, 3).targetPaceSecPerMi).toBe(z.steady);
    expect(longRun(z, 6).targetPaceSecPerMi).toBe(z.long);
    expect(longRun(z, 6).totalMiles).toBe(6);
  });

  it("intervals run at interval pace with a recovery segment", () => {
    const s = intervalSession(z, { reps: 8, repDistanceMi: 0.25, recoverySec: 90 });
    expect(s.targetPaceSecPerMi).toBe(z.interval);
    expect(s.segments.some((g) => g.kind === "recovery")).toBe(true);
    expect(s.segments.some((g) => g.reps === 8)).toBe(true);
    expect(hiitSession(z, { rounds: 10 }).segments.find((g) => g.kind === "work")!.reps).toBe(10);
  });

  it("fartlek and progression sit between steady and tempo", () => {
    expect(fartlek(z).type).toBe("fartlek");
    const prog = progressionRun(z, { miles: 2 });
    const paces = prog.segments.map((g) => g.paceSecPerMi!);
    expect(paces[0]).toBeGreaterThanOrEqual(z.tempo); // starts steady (slower)
    expect(paces[paces.length - 1]).toBe(z.tempo);    // finishes at tempo (faster)
  });

  it("recovery and mindful runs are easy/effort-based", () => {
    expect(recoveryRun(z, 20).targetPaceSecPerMi).toBe(z.recovery);
    const m = mindfulRun(25);
    expect(m.targetPaceSecPerMi).toBeNull();
    expect(m.tracks).toEqual(["time"]);
  });
});

describe("progression + selection helpers", () => {
  it("grows distance ≤10%/week with a cap", () => {
    expect(progressiveDistance(3, 0)).toBe(3);
    expect(progressiveDistance(3, 1)).toBe(3.25); // 3 × 1.1 = 3.3 → nearest 0.25
    expect(progressiveDistance(3, 10, { capMiles: 5 })).toBe(5);
  });
  it("picks the most recent benchmark", () => {
    const list: Benchmark[] = [
      { kind: "cooper", value: 1.4, date: "2026-01-01" },
      { kind: "mile", value: 410, date: "2026-03-01" },
    ];
    expect(latestBenchmark(list)!.kind).toBe("mile");
    expect(latestBenchmark([])).toBeNull();
  });
});
