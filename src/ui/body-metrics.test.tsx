// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render } from "preact";
import { BodyMetrics, type BodyMetricsProps } from "./body-metrics";

function mount(over: Partial<BodyMetricsProps> = {}) {
  const el = document.createElement("div");
  const props: BodyMetricsProps = {
    unit: "lb", hasWeight: true, weightPoints: [188, 186, 185, 183], currentWeight: "183",
    deltaLabel: "−5 lb since start", deltaDir: 1, goalLabel: "Goal 175 lb", goalPct: 62,
    comp: [{ label: "Body Fat", value: "18%" }, { label: "Waist / Hip", value: "0.85", sub: "lower = leaner" }],
    ...over,
  };
  render(<BodyMetrics {...props} />, el);
  return el;
}

describe("BodyMetrics", () => {
  it("shows current weight, delta (colored toward goal), sparkline and goal bar", () => {
    const el = mount();
    expect(el.querySelector(".bm-weight-num")!.textContent).toContain("183");
    const delta = el.querySelector(".bm-delta") as HTMLElement;
    expect(delta.classList.contains("up")).toBe(true); // deltaDir 1 → toward goal
    expect(el.querySelector(".bm-spark")).toBeTruthy();
    expect((el.querySelector(".bm-goal-fill") as HTMLElement).style.width).toBe("62%");
    expect(el.querySelector(".bm-goal-lbl")!.textContent).toContain("Goal 175 lb");
  });

  it("renders composition tiles with optional subs", () => {
    const el = mount();
    const tiles = [...el.querySelectorAll(".bm-tile")];
    expect(tiles.length).toBe(2);
    expect(tiles[0].textContent).toContain("18%");
    expect(tiles[1].querySelector(".bm-tile-sub")!.textContent).toBe("lower = leaner");
  });

  it("omits the sparkline with <2 points and the weight block when no weight", () => {
    expect(mount({ weightPoints: [183] }).querySelector(".bm-spark")).toBeNull();
    const noWeight = mount({ hasWeight: false });
    expect(noWeight.querySelector(".bm-weight-num")).toBeNull();
    expect(noWeight.querySelector(".bm-comp")!.classList.contains("bm-comp-top")).toBe(true);
  });
});
