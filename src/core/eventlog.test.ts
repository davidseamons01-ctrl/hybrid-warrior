import { describe, it, expect } from "vitest";
import {
  mergeEvents,
  projectLogs,
  fromLegacyLogs,
  mergeLogSets,
  setLoggedFromLog,
  setDeletedEvent,
  type LiftLog,
} from "./index";

const log = (id: string, date: string, exercise: string, aW: number, aR: number, extra: Partial<LiftLog> = {}): LiftLog => ({
  id, date, exercise, aW, aR, aS: 1, ...extra,
});

describe("event conversion", () => {
  it("setLoggedFromLog uses a stable id derived from logId", () => {
    const e = setLoggedFromLog(log("abc", "2026-06-01", "Back Squat", 225, 5));
    expect(e.id).toBe("ev_abc");
    expect(e.logId).toBe("abc");
    expect(e.type).toBe("SetLogged");
    expect(e.weight).toBe(225);
  });
  it("captures optional fields only when present", () => {
    const e = setLoggedFromLog(log("a", "2026-06-01", "Bench", 185, 5, { tW: 180, liftFeel: "hard", score: 0.97, week: 3 }));
    expect(e.targetWeight).toBe(180);
    expect(e.feel).toBe("hard");
    expect(e.score).toBe(0.97);
    expect("note" in e).toBe(false);
  });
});

describe("mergeEvents (CRDT properties)", () => {
  const A = fromLegacyLogs([log("1", "2026-06-01", "Squat", 200, 5), log("2", "2026-06-02", "Bench", 150, 5)]);
  const B = fromLegacyLogs([log("2", "2026-06-02", "Bench", 150, 5), log("3", "2026-06-03", "Dead", 300, 3)]);

  it("unions by id (no loss, deduped)", () => {
    const m = mergeEvents(A, B);
    expect(m.map((e) => e.id).sort()).toEqual(["ev_1", "ev_2", "ev_3"]);
  });
  it("is commutative", () => {
    expect(mergeEvents(A, B).map((e) => e.id)).toEqual(mergeEvents(B, A).map((e) => e.id));
  });
  it("is idempotent", () => {
    expect(mergeEvents(A, A).map((e) => e.id)).toEqual(A.map((e) => e.id).sort());
  });
});

describe("projectLogs", () => {
  it("round-trips legacy logs (set-equal by id + fields)", () => {
    const logs = [
      log("1", "2026-06-01", "Back Squat", 225, 5, { tW: 240, tR: 8, tS: 4, week: 3, score: 0.95, outcome: "ok" }),
      log("2", "2026-06-02", "Bench", 185, 3, { liftFeel: "hard" }),
    ];
    const back = projectLogs(fromLegacyLogs(logs));
    expect(back.length).toBe(2);
    const byId = Object.fromEntries(back.map((l) => [l.id, l]));
    expect(byId["1"]).toMatchObject({ date: "2026-06-01", exercise: "Back Squat", aW: 225, aR: 5, tW: 240, week: 3, score: 0.95 });
    expect(byId["2"]).toMatchObject({ exercise: "Bench", aW: 185, liftFeel: "hard" });
  });
  it("respects delete tombstones", () => {
    const events = [...fromLegacyLogs([log("1", "2026-06-01", "Squat", 200, 5), log("2", "2026-06-02", "Bench", 150, 5)]), setDeletedEvent("2", 1)];
    const out = projectLogs(events);
    expect(out.map((l) => l.id)).toEqual(["1"]);
  });
  it("last SetLogged per logId wins (edit)", () => {
    const e1 = setLoggedFromLog(log("1", "2026-06-01", "Squat", 200, 5));
    const e2 = { ...setLoggedFromLog(log("1", "2026-06-01", "Squat", 210, 5)), ts: e1.ts + 100 };
    const out = projectLogs([e1, e2]);
    expect(out.length).toBe(1);
    expect(out[0].aW).toBe(210);
  });
  it("orders chronologically by date", () => {
    const out = projectLogs(fromLegacyLogs([log("b", "2026-06-05", "X", 1, 1), log("a", "2026-06-01", "X", 1, 1)]));
    expect(out.map((l) => l.date)).toEqual(["2026-06-01", "2026-06-05"]);
  });
});

describe("mergeLogSets — the sync primitive", () => {
  it("two devices' concurrent logs union with no loss (the LWW fix)", () => {
    // Device A logged squat + bench; device B (offline) logged deadlift + a 2nd bench.
    const a = [log("s1", "2026-06-01", "Squat", 225, 5), log("b1", "2026-06-02", "Bench", 185, 5)];
    const b = [log("d1", "2026-06-03", "Deadlift", 315, 3), log("b2", "2026-06-04", "Bench", 190, 5)];
    const merged = mergeLogSets(a, b);
    expect(merged.map((l) => l.id).sort()).toEqual(["b1", "b2", "d1", "s1"]);
  });
  it("is a no-op when both sides match (no phantom changes)", () => {
    const logs = [log("1", "2026-06-01", "Squat", 200, 5), log("2", "2026-06-02", "Bench", 150, 5)];
    const merged = mergeLogSets(logs, logs);
    expect(merged.map((l) => l.id).sort()).toEqual(["1", "2"]);
    expect(merged.length).toBe(2);
  });
  it("handles an empty remote (first sync)", () => {
    const logs = [log("1", "2026-06-01", "Squat", 200, 5)];
    expect(mergeLogSets(logs, []).map((l) => l.id)).toEqual(["1"]);
  });
});
