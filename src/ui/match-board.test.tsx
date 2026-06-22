// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { MatchBoard, type MatchBoardProps } from "./match-board";
import type { JointRx } from "../core/partner-match";

const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));

function mount(over: Partial<MatchBoardProps> = {}) {
  const actions = { toggle: vi.fn(), remove: vi.fn(), calibrate: vi.fn(), start: vi.fn(), back: vi.fn(), ...(over.actions || {}) };
  const props: MatchBoardProps = {
    meUid: "dave", unit: "lb",
    participants: [
      {
        uid: "dave", name: "Dave",
        dayPlan: [
          { eid: "bench", name: "Bench Press", sets: 5, reps: 5, load: 180 },
          { eid: "row", name: "Barbell Row", sets: 4, reps: 8, load: 135 },
          { eid: "skull", name: "Skullcrusher", sets: 3, reps: 12, load: 55 },
        ],
        rx: [
          { eid: "bench", key: "bench", name: "Bench Press", sets: 5, reps: 5, load: 180, unit: "lb", source: "programmed" },
          { eid: "db-hipthrust", key: "hipthrust", name: "DB Hip Thrust", sets: 5, reps: 3, load: 0, unit: "lb", source: "needs-calibration" },
        ] as JointRx[],
      },
      {
        uid: "kaylee", name: "Kaylee",
        dayPlan: [{ eid: "db-hipthrust", name: "DB Hip Thrust", sets: 3, reps: 17, load: 45 }],
        rx: [
          { eid: "bench", key: "bench", name: "Bench Press", sets: 3, reps: 12, load: 55, unit: "lb", source: "estimated" },
          { eid: "db-hipthrust", key: "hipthrust", name: "DB Hip Thrust", sets: 3, reps: 17, load: 45, unit: "lb", source: "programmed" },
        ] as JointRx[],
      },
    ],
    joints: [
      { eid: "bench", key: "bench", name: "Bench Press", addedBy: "dave", addedAt: 1 },
      { eid: "db-hipthrust", key: "hipthrust", name: "DB Hip Thrust", addedBy: "kaylee", addedAt: 2 },
    ],
    ...over, actions,
  };
  const el = document.createElement("div");
  render(<MatchBoard {...props} />, el);
  return { el, actions };
}

describe("MatchBoard", () => {
  it("renders my plan, the partner's plan, and the shared middle with each lifter's load", () => {
    const { el } = mount();
    expect(el.querySelectorAll(".mb-col-me .mb-tile").length).toBe(3);
    expect(el.querySelector(".mb-col-partner")!.textContent).toContain("Kaylee's plan");
    // shared bench shows Dave's programmed 180 and Kaylee's estimated 55
    const benchLift = [...el.querySelectorAll(".mb-joint-lift")].find((n) => n.textContent!.includes("Bench Press"))!;
    expect(benchLift.textContent).toContain("180 lb");
    expect(benchLift.textContent).toContain("55 lb");
    expect(benchLift.querySelector(".mb-load-est")!.textContent).toContain("est.");
  });

  it("marks shared tiles and toggles on tap", () => {
    const { el, actions } = mount();
    const benchTile = [...el.querySelectorAll(".mb-col-me .mb-tile")].find((t) => t.textContent!.includes("Bench Press"))!;
    expect(benchTile.className).toContain("in"); // already shared
    const skull = [...el.querySelectorAll(".mb-col-me .mb-tile")].find((t) => t.textContent!.includes("Skullcrusher"))!;
    expect(skull.className).not.toContain("in");
    click(skull);
    expect(actions.toggle).toHaveBeenCalledWith(expect.objectContaining({ eid: "skull" }));
  });

  it("blocks start until I calibrate my borrowed lift, then surfaces the sheet", () => {
    const { el, actions } = mount();
    const start = el.querySelector(".mb-start") as HTMLButtonElement;
    expect(start.disabled).toBe(true);
    expect(start.textContent).toContain("Set your max first");
    // my hip-thrust load shows a Set-a-max button; the partner's never does
    const hip = [...el.querySelectorAll(".mb-joint-lift")].find((n) => n.textContent!.includes("Hip Thrust"))!;
    const calBtn = hip.querySelector(".mb-load-cal") as HTMLButtonElement;
    expect(calBtn).toBeTruthy();
    click(calBtn);
    expect(actions.calibrate).toHaveBeenCalledWith(expect.objectContaining({ eid: "db-hipthrust" }));
  });

  it("enables start once nothing of mine needs calibration", () => {
    const { el } = mount({
      participants: [
        { uid: "dave", name: "Dave", dayPlan: [{ eid: "bench", name: "Bench Press", sets: 5, reps: 5, load: 180 }],
          rx: [{ eid: "bench", key: "bench", name: "Bench Press", sets: 5, reps: 5, load: 180, unit: "lb", source: "programmed" }] },
      ],
      joints: [{ eid: "bench", key: "bench", name: "Bench Press", addedBy: "dave", addedAt: 1 }],
    });
    const start = el.querySelector(".mb-start") as HTMLButtonElement;
    expect(start.disabled).toBe(false);
    expect(start.textContent).toContain("Start lifting");
  });
});
