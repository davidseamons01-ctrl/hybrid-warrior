// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { PlanView, type PlanProps, type PlanActions, type PlanWeek, type PlanDay } from "./plan";

const noopActions: PlanActions = {
  toggleCompact: () => {}, jumpCurrent: () => {}, selectWeek: () => {}, toggleWeek: () => {}, reorder: () => {},
};

function day(over: Partial<PlanDay> = {}): PlanDay {
  return {
    dateIso: "2026-06-11", dateLong: "Thursday, Jun 11, 2026", dow: "Thu",
    sessIdx: 1, total: 3, isToday: true, estMin: 52, focusHead: "Lower power",
    phaseColor: "var(--ice)", phaseClass: "phase-hyp", phaseAbbrev: "Hyp", phaseName: "Hypertrophy",
    exercises: [
      { eid: "squat", name: "Back Squat", rx: "3×5 @ 225" },
      { eid: "rdl", name: "Romanian Deadlift", rx: "3×8 @ 185" },
    ],
    recovery: false, finisher: "AMRAP push-ups",
    ...over,
  };
}

function week(over: Partial<PlanWeek> = {}): PlanWeek {
  return {
    week: 1, phaseName: "Hypertrophy", phaseBadgeClass: "badge-hyp", deload: false,
    isCurrent: true, isOpen: false, logLabel: "scheduled", rhythmHtml: "<div class='rhythm'>rhythm</div>",
    days: null, emptyReason: "", ...over,
  };
}

function mount(over: Partial<PlanProps> = {}, actions: Partial<PlanActions> = {}) {
  const el = document.createElement("div");
  const props: PlanProps = {
    compact: false, womenSimple: false, toggleLabel: "Simpler view",
    context: { week: 1, phaseName: "Hypertrophy", slots: 3, slotsPlural: true },
    heatmap: { glutes: 12, core: 9, back: 7, posture: 5 },
    women: null,
    anchorSummaryHtml: "<div class='anchor'>anchor</div>",
    nextDotsHtml: "<div class='nextdots'>dots</div>",
    timeline: Array.from({ length: 13 }, (_, i) => ({
      week: i + 1, phaseClass: "phase-hyp", current: i === 0, complete: false, deload: i === 3 || i === 7, phaseName: "Hypertrophy",
    })),
    weeks: Array.from({ length: 13 }, (_, i) => week({ week: i + 1, isCurrent: i === 0, isOpen: i === 0, days: i === 0 ? [day()] : null })),
    actions: { ...noopActions, ...actions },
    ...over,
  };
  render(<PlanView {...props} />, el);
  return el;
}

describe("PlanView", () => {
  it("renders 13 timeline cells and 13 week cards", () => {
    const el = mount();
    expect(el.querySelectorAll(".timeline .tl-wk").length).toBe(13); // legend swatches reuse tl-wk, so scope to .timeline
    expect(el.querySelectorAll(".pw-card").length).toBe(13);
  });

  it("renders the open week's exercises and passes through trusted HTML panels", () => {
    const el = mount();
    expect(el.textContent).toContain("Back Squat");
    expect(el.textContent).toContain("3×5 @ 225");
    expect(el.querySelector(".anchor")).toBeTruthy();
    expect(el.querySelector(".nextdots")).toBeTruthy();
    expect(el.querySelector(".rhythm")).toBeTruthy(); // per-week rhythm strip, open week only
  });

  it("clicking a timeline cell calls selectWeek with that week number", () => {
    const selectWeek = vi.fn();
    const el = mount({}, { selectWeek });
    (el.querySelectorAll(".timeline .tl-wk")[4] as HTMLElement).click();
    expect(selectWeek).toHaveBeenCalledWith(5);
  });

  it("clicking a week head calls toggleWeek", () => {
    const toggleWeek = vi.fn();
    const el = mount({}, { toggleWeek });
    (el.querySelector(".pw-head") as HTMLElement).click();
    expect(toggleWeek).toHaveBeenCalledWith(1);
  });

  it("compact toggle button calls toggleCompact", () => {
    const toggleCompact = vi.fn();
    const el = mount({}, { toggleCompact });
    (el.querySelector("#plan-compact-toggle") as HTMLButtonElement).click();
    expect(toggleCompact).toHaveBeenCalled();
  });

  it("dragging one exercise row onto another calls reorder(date, from, to)", async () => {
    const reorder = vi.fn();
    const el = mount({}, { reorder });
    const flush = () => new Promise((r) => setTimeout(r, 0));
    const dt = { setData() {}, getData: () => "squat", effectAllowed: "", dropEffect: "" };
    // happy-dom lacks reflected on* DnD props, so Preact registers PascalCase event
    // names; a real browser uses lowercase. Fire both so the test is env-agnostic.
    const fire = (node: Element, names: string[]) => names.forEach((n) =>
      node.dispatchEvent(Object.assign(new Event(n, { bubbles: true, cancelable: true }), { dataTransfer: dt })));
    let rows = el.querySelectorAll(".pw-ex-drag");
    expect(rows.length).toBe(2);
    fire(rows[0], ["dragstart", "DragStart"]);
    await flush(); // let Preact flush the setDrag state update so the drop handler sees it
    rows = el.querySelectorAll(".pw-ex-drag");
    fire(rows[1], ["drop", "Drop"]);
    expect(reorder).toHaveBeenCalledWith("2026-06-11", "squat", "rdl");
  });

  it("shows women's summary only when provided", () => {
    expect(mount({ women: null }).textContent).not.toContain("Women's Program Summary");
    const withWomen = mount({
      women: { label: "Hourglass", tier: "Intermediate", life: "General", eq: "Gym", style: "Balanced", tracks: ["Glute focus"], fa: ["Shape"] },
    });
    expect(withWomen.textContent).toContain("Women's Program Summary");
    expect(withWomen.textContent).toContain("Glute focus");
  });
});
