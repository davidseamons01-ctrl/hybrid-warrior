import { describe, it, expect } from "vitest";
import {
  addDaysIso, dowOf, daysBetween, weekStart, weekDates, calendarBlockWeek, weekFromAnchor,
  defaultPlacement, overridesFromBoard, boardStatus, type DayPlan,
} from "./schedule";

describe("date helpers (UTC, date-only)", () => {
  it("adds days and computes weekday + spans", () => {
    expect(addDaysIso("2026-06-22", 5)).toBe("2026-06-27");
    expect(addDaysIso("2026-06-30", 1)).toBe("2026-07-01");
    expect(dowOf("2026-06-22")).toBe(1); // Monday
    expect(dowOf("2026-06-27")).toBe(6); // Saturday
    expect(daysBetween("2026-06-22", "2026-06-29")).toBe(7);
  });
  it("finds the Monday-based week and its 7 dates", () => {
    expect(weekStart("2026-06-27", 1)).toBe("2026-06-22"); // Sat → that Monday
    const wk = weekDates("2026-06-24", 1);
    expect(wk[0]).toBe("2026-06-22");
    expect(wk).toHaveLength(7);
    expect(wk[6]).toBe("2026-06-28");
  });
  it("derives calendar block week from the program anchor", () => {
    expect(calendarBlockWeek("2026-06-01", "2026-06-01")).toBe(1);
    expect(calendarBlockWeek("2026-06-01", "2026-06-08")).toBe(2);
    expect(calendarBlockWeek("2026-06-01", "2026-05-20")).toBe(1); // before start
    expect(calendarBlockWeek("2026-06-01", "2027-01-01", 13)).toBe(13); // capped
  });

  it("weekFromAnchor advances by calendar from a pinned {date, week} and is schedule-stable", () => {
    // pinned: on 2026-06-22 the lifter was in week 5
    expect(weekFromAnchor("2026-06-22", 5, "2026-06-22")).toBe(5);   // same day → unchanged
    expect(weekFromAnchor("2026-06-22", 5, "2026-06-28")).toBe(5);   // +6 days, same week
    expect(weekFromAnchor("2026-06-22", 5, "2026-06-29")).toBe(6);   // +7 days → next week
    expect(weekFromAnchor("2026-06-22", 5, "2026-06-15")).toBe(4);   // a week earlier
    expect(weekFromAnchor("2026-06-22", 12, "2026-08-01", 13)).toBe(13); // capped at total
  });
});

describe("defaultPlacement", () => {
  const week = weekDates("2026-06-22", 1); // Mon 22 … Sun 28
  it("lays the week's slots onto the default training weekdays in order", () => {
    // user trains Mon/Tue/Wed/Thu/Fri (1-5), plan = L,R,L,R,L
    const placed = defaultPlacement(week, [1, 2, 3, 4, 5], ["L", "R", "L", "R", "L"]);
    expect(placed.map((d) => d.slot)).toEqual(["L", "R", "L", "R", "L", null, null]); // Sat/Sun rest
    expect(placed[0].date).toBe("2026-06-22");
  });
  it("stops placing once slots run out and rests the rest", () => {
    const placed = defaultPlacement(week, [1, 2, 3, 4, 5], ["L", "R", "L"]); // only 3 sessions
    expect(placed.map((d) => d.slot)).toEqual(["L", "R", "L", null, null, null, null]);
  });
});

describe("overridesFromBoard", () => {
  const week = weekDates("2026-06-22", 1);
  const def = defaultPlacement(week, [1, 2, 3, 4, 5], ["L", "R", "L", "R", "L"]);

  it("persists only the days that differ from the default", () => {
    // user's new week: Tue/Thu/Fri lift, Wed/Sat run, Mon off
    const board: DayPlan[] = [
      { date: "2026-06-22", dow: 1, slot: null },  // Mon off (was L)
      { date: "2026-06-23", dow: 2, slot: "L" },    // Tue lift (was R) → changed
      { date: "2026-06-24", dow: 3, slot: "R" },    // Wed run (was L) → changed
      { date: "2026-06-25", dow: 4, slot: "L" },    // Thu lift (was R) → changed
      { date: "2026-06-26", dow: 5, slot: "L" },    // Fri lift (was L) → same
      { date: "2026-06-27", dow: 6, slot: "R" },    // Sat run (was off) → changed
      { date: "2026-06-28", dow: 0, slot: null },   // Sun off (was off) → same
    ];
    const ov = overridesFromBoard(board, def);
    expect(Object.keys(ov).sort()).toEqual(["2026-06-22", "2026-06-23", "2026-06-24", "2026-06-25", "2026-06-27"]);
    expect(ov["2026-06-22"]).toEqual({ slot: null }); // Mon rested
    expect(ov["2026-06-27"]).toEqual({ slot: "R" });   // Sat added
    expect(ov["2026-06-26"]).toBeUndefined();          // unchanged Fri not stored
  });

  it("captures a per-day equipment override even when the slot is unchanged", () => {
    const board: DayPlan[] = def.map((d) => ({ ...d }));
    board[2].equip = "home"; // Wed at home
    const ov = overridesFromBoard(board, def);
    expect(ov["2026-06-24"]).toEqual({ slot: "L", equip: "home" });
  });
});

describe("boardStatus", () => {
  it("counts placed sessions vs the program's intended count", () => {
    const board: DayPlan[] = [
      { date: "a", dow: 1, slot: "L" }, { date: "b", dow: 2, slot: "R" }, { date: "c", dow: 3, slot: null },
    ];
    expect(boardStatus(board, ["L", "R", "L"])).toEqual({ trainingDays: 2, total: 3, complete: false });
    expect(boardStatus(board, ["L", "R"])).toEqual({ trainingDays: 2, total: 2, complete: true });
  });
});
