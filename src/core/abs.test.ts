import { describe, it, expect } from "vitest";
import {
  AB_TEMPLATES, resolveAbRx, buildAbFinisher, selectAbTemplate, abTemplateById,
  type AbCtx, type AbSpec,
} from "./abs";

const ctx = (over: Partial<AbCtx> = {}): AbCtx => ({
  historyByEid: {}, maxes: { bench: 200, squat: 300, deadlift: 350 }, bodyweightLb: 180, unit: "lb", ...over,
});

describe("AB_TEMPLATES", () => {
  it("are ~5-min circuits of real catalog exercises", () => {
    expect(AB_TEMPLATES.length).toBeGreaterThanOrEqual(5);
    for (const t of AB_TEMPLATES) {
      expect(t.minutes).toBe(5);
      expect(t.exercises.length).toBeGreaterThanOrEqual(2);
      expect(t.exercises.every((e) => e.eid && e.sets > 0 && e.base > 0)).toBe(true);
    }
  });
});

describe("resolveAbRx — adaptive dose", () => {
  const crunch: AbSpec = { eid: "cable_crunch", name: "Cable Crunch", region: "upper", mode: "weighted", base: 12, sets: 3, restSec: 45, seed: { from: "bench", pct: 0.35 }, increment: 10 };

  it("seeds a first weighted load from a lift max", () => {
    const rx = resolveAbRx(crunch, ctx());
    expect(rx.load).toBe(70); // 35% of 200 bench, rounded to 10
    expect(rx.reps).toBe(12);
    expect(rx.source).toBe("seeded");
  });

  it("progresses load when the lifter hit the target reps last time", () => {
    const rx = resolveAbRx(crunch, ctx({ historyByEid: { cable_crunch: { weight: 70, reps: 12, daysAgo: 3 } } }));
    expect(rx.load).toBe(80); // +10
    expect(rx.reps).toBe(12);
    expect(rx.source).toBe("progressed");
  });

  it("holds load and chases a rep when the lifter fell short", () => {
    const rx = resolveAbRx(crunch, ctx({ historyByEid: { cable_crunch: { weight: 70, reps: 9, daysAgo: 3 } } }));
    expect(rx.load).toBe(70);
    expect(rx.reps).toBe(12); // base, since last (9) < base (12)
  });

  it("adds a rep on a bodyweight move from history", () => {
    const hlr: AbSpec = { eid: "hanging_leg_raise", name: "Hanging Leg Raise", region: "lower", mode: "reps", base: 10, sets: 3, restSec: 45 };
    expect(resolveAbRx(hlr, ctx()).reps).toBe(10); // no history → base
    expect(resolveAbRx(hlr, ctx({ historyByEid: { hanging_leg_raise: { weight: 0, reps: 14, daysAgo: 5 } } })).reps).toBe(15);
  });

  it("adds time on a hold from history", () => {
    const plank: AbSpec = { eid: "plank", name: "Plank Hold", region: "stability", mode: "time", base: 45, sets: 3, restSec: 30 };
    expect(resolveAbRx(plank, ctx()).seconds).toBe(45);
    expect(resolveAbRx(plank, ctx({ historyByEid: { plank: { weight: 0, reps: 50, daysAgo: 2 } } })).seconds).toBe(55);
  });

  it("seeds from bodyweight when that's the rule", () => {
    const legRaise: AbSpec = { eid: "db_leg_raise", name: "DB Leg Raise", region: "lower", mode: "weighted", base: 12, sets: 3, restSec: 45, seed: { from: "bodyweight", pct: 0.08 }, increment: 5 };
    expect(resolveAbRx(legRaise, ctx()).load).toBe(15); // 8% of 180 = 14.4 → 15
  });
});

describe("buildAbFinisher / selectAbTemplate", () => {
  it("builds a prescription per exercise in the template", () => {
    const t = abTemplateById("weighted-core")!;
    const rx = buildAbFinisher(t, ctx());
    expect(rx.length).toBe(t.exercises.length);
    expect(rx[0].load).toBeGreaterThan(0); // cable crunch seeded
  });

  it("favours the least-recently-trained circuit", () => {
    // train everything in 'weighted-core' very recently → it should NOT be picked
    const recent = { cable_crunch: { weight: 70, reps: 12, daysAgo: 0 }, db_leg_raise: { weight: 15, reps: 12, daysAgo: 0 }, suitcase: { weight: 0, reps: 30, daysAgo: 0 } };
    const pick = selectAbTemplate(ctx({ historyByEid: recent }));
    expect(pick.id).not.toBe("weighted-core");
  });

  it("defaults sensibly with no history", () => {
    expect(selectAbTemplate(ctx())).toBeTruthy();
  });
});
