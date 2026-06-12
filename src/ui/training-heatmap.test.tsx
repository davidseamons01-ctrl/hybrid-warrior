// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render } from "preact";
import { TrainingHeatmap, type TrainingHeatmapProps, type HMCell } from "./training-heatmap";

const cell = (level: number, isToday = false): HMCell => ({ level, isToday, title: "x" });

function mount(over: Partial<TrainingHeatmapProps> = {}) {
  const el = document.createElement("div");
  const props: TrainingHeatmapProps = {
    weeks: [
      [cell(0), cell(1), cell(2), cell(3), cell(4), cell(0), cell(0)],
      [cell(2), cell(0), cell(4, true)],
    ],
    windowWeeks: 13, currentStreak: 5, longestStreak: 12, thisMonth: 9, totalDays: 47,
    ...over,
  };
  render(<TrainingHeatmap {...props} />, el);
  return el;
}

describe("TrainingHeatmap", () => {
  it("renders the four consistency stats", () => {
    const el = mount();
    const vals = [...el.querySelectorAll(".hm-stat-val")].map((n) => n.textContent);
    expect(vals).toEqual(["5", "12", "9", "47"]);
  });

  it("renders columns and intensity-leveled cells", () => {
    const el = mount();
    expect(el.querySelectorAll(".hm-col").length).toBe(2);
    // 7 + 3 grid cells, plus 5 legend swatches = 15 .hm-cell total
    expect(el.querySelectorAll(".hm-grid .hm-cell").length).toBe(10);
    expect(el.querySelector(".hm-grid .hm-l4")).toBeTruthy();
    expect(el.querySelector(".hm-grid .hm-l0")).toBeTruthy();
  });

  it("marks today's cell", () => {
    const el = mount();
    const today = el.querySelector(".hm-today") as HTMLElement;
    expect(today).toBeTruthy();
    expect(today.classList.contains("hm-l4")).toBe(true); // the cell(4,true)
  });

  it("shows a streak badge only when current streak > 0, and the legend", () => {
    expect(mount({ currentStreak: 0 }).querySelector(".badge")).toBeNull();
    expect(mount().querySelector(".badge")!.textContent).toContain("5 day streak");
    expect(mount().querySelectorAll(".hm-legend .hm-cell").length).toBe(5);
  });
});
