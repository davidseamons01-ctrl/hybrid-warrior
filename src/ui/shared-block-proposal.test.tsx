// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { SharedBlockProposal, type SharedBlockProposalProps, type SharedBlockProposalActions, type ProposalLift } from "./shared-block-proposal";

const squat: ProposalLift = {
  eid: "squat", name: "Back Squat", reason: "Fits everyone's goals",
  scheme: { sets: 4, reps: 8, intensityPct: 70 },
  loads: [
    { uid: "h", name: "Dave", load: 220, unit: "lb", maxSource: "logged", needsCalibration: false },
    { uid: "w", name: "Sarah", load: 95, unit: "lb", maxSource: "estimated", needsCalibration: false },
  ],
};
const vibes = [{ id: "strength", label: "Strength" }, { id: "hypertrophy", label: "Hypertrophy" }, { id: "pump", label: "Pump" }];

function spies(): SharedBlockProposalActions {
  return { setVibe: vi.fn(), removeLift: vi.fn(), addLift: vi.fn(), calibrate: vi.fn(), confirm: vi.fn(), back: vi.fn() };
}
function mount(over: Partial<SharedBlockProposalProps> = {}, actions = spies()) {
  const el = document.createElement("div");
  render(<SharedBlockProposal vibe="hypertrophy" vibes={vibes} lifts={[squat]} meUid="h" actions={actions} {...over} />, el);
  return { el, actions };
}
const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));

describe("SharedBlockProposal", () => {
  it("shows each lift's scheme and both lifters' scaled loads", () => {
    const { el } = mount();
    expect(el.querySelector(".sbp-lift-scheme")!.textContent).toContain("4×8");
    const vals = [...el.querySelectorAll(".sbp-load-val")].map((n) => n.textContent);
    expect(vals[0]).toContain("220");
    expect(vals[1]).toContain("95");
    expect(el.querySelector(".sbp-load-src")!.textContent).toContain("est."); // estimated badge for Sarah
  });

  it("marks the active vibe and dispatches a change", () => {
    const { el, actions } = mount();
    expect((el.querySelector(".sbp-vibe.on") as HTMLElement).textContent).toBe("Hypertrophy");
    click([...el.querySelectorAll(".sbp-vibe")].find((b) => b.textContent === "Strength")!);
    expect(actions.setVibe).toHaveBeenCalledWith("strength");
  });

  it("blocks Start + offers calibration for MY missing max; partners set theirs on their phone", () => {
    // I (h) have no max → Start blocked + my own "Set a max" button
    const myCal: ProposalLift = { ...squat, loads: [{ uid: "h", name: "Dave", load: 0, unit: "lb", maxSource: "none", needsCalibration: true }, squat.loads[1]] };
    const mine = mount({ lifts: [myCal] });
    expect((mine.el.querySelector(".sbp-confirm") as HTMLButtonElement).disabled).toBe(true);
    click(mine.el.querySelector(".sbp-cal-btn"));
    expect(mine.actions.calibrate).toHaveBeenCalledWith("squat", "h");
    // a partner (w) has no max → I'm NOT blocked; it shows "sets on their phone", no button for me
    const theirCal: ProposalLift = { ...squat, loads: [squat.loads[0], { uid: "w", name: "Sarah", load: 0, unit: "lb", maxSource: "none", needsCalibration: true }] };
    const theirs = mount({ lifts: [theirCal] });
    expect((theirs.el.querySelector(".sbp-confirm") as HTMLButtonElement).disabled).toBe(false);
    expect(theirs.el.querySelector(".sbp-load-pending")).toBeTruthy();
    expect(theirs.el.querySelector(".sbp-cal-btn")).toBeNull();
  });

  it("remove / confirm dispatch when ready", () => {
    const { el, actions } = mount();
    click(el.querySelector(".sbp-remove"));
    expect(actions.removeLift).toHaveBeenCalledWith("squat");
    expect((el.querySelector(".sbp-confirm") as HTMLButtonElement).disabled).toBe(false);
    click(el.querySelector(".sbp-confirm"));
    expect(actions.confirm).toHaveBeenCalled();
  });
});
