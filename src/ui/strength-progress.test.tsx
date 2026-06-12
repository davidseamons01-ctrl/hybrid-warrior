// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render } from "preact";
import { StrengthProgress, type StrengthProgressProps } from "./strength-progress";

function mount(over: Partial<StrengthProgressProps> = {}) {
  const el = document.createElement("div");
  const props: StrengthProgressProps = {
    unit: "lb",
    lifts: [
      { label: "Bench", has: true, points: [200, 210, 225, 240], current: "240", deltaPct: 20 },
      { label: "Squat", has: true, points: [300, 295, 320], current: "320", deltaPct: -3 },
      { label: "Deadlift", has: false, points: [], current: "0", deltaPct: 0 },
    ],
    volumeBars: [{ week: "W1", value: 8000 }, { week: "W2", value: 12000 }, { week: "W3", value: 10000 }],
    volumeMax: 12000,
    ...over,
  };
  render(<StrengthProgress {...props} />, el);
  return el;
}

describe("StrengthProgress", () => {
  it("renders a sparkline only for lifts with a trend (>=2 points)", () => {
    const el = mount();
    const lifts = [...el.querySelectorAll(".sp-lift")];
    expect(lifts.length).toBe(2); // deadlift (has:false) skipped
    expect(el.querySelectorAll(".sp-spark").length).toBe(2);
    expect(el.querySelectorAll(".sp-spark-line").length).toBe(2);
  });

  it("shows up/down delta with the right class", () => {
    const el = mount();
    const deltas = [...el.querySelectorAll(".sp-delta")];
    expect(deltas[0].classList.contains("up")).toBe(true);
    expect(deltas[0].textContent).toContain("20%");
    expect(deltas[1].classList.contains("down")).toBe(true);
    expect(deltas[1].textContent).toContain("3%");
  });

  it("sizes the volume bars relative to the max", () => {
    const el = mount();
    const cols = [...el.querySelectorAll(".sp-vol-col")] as HTMLElement[];
    expect(cols.length).toBe(3);
    expect(cols[1].style.height).toBe("100%"); // 12000 is the max
    expect(parseFloat(cols[0].style.height)).toBeCloseTo(8000 / 12000 * 100, 0);
  });

  it("shows the empty state when no lift has a trend", () => {
    const el = mount({ lifts: [{ label: "Bench", has: false, points: [], current: "0", deltaPct: 0 }] });
    expect(el.querySelector(".sp-empty")).toBeTruthy();
    expect(el.querySelector(".sp-spark")).toBeNull();
  });
});
