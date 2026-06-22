// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { SchedulePlanner, type SchedulePlannerProps, type PlannerDay } from "./schedule-planner";

const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));
const flush = () => new Promise((r) => setTimeout(r, 0));
function selectVal(el: Element, sel: string, val: string) {
  const s = el.querySelector(sel) as HTMLSelectElement; s.value = val; s.dispatchEvent(new Event("change", { bubbles: true }));
}

function mount(over: Partial<SchedulePlannerProps> = {}) {
  const actions = { apply: vi.fn(), saveDefault: vi.fn(), cancel: vi.fn(), ...(over.actions || {}) };
  const days: PlannerDay[] = [
    { date: "2026-06-22", dow: 1, label: "Mon 22", slot: "HP", isToday: true },
    { date: "2026-06-23", dow: 2, label: "Tue 23", slot: "SR" },
    { date: "2026-06-24", dow: 3, label: "Wed 24", slot: null },
  ];
  const props: SchedulePlannerProps = {
    weekLabel: "Week of Jun 22", days,
    sessionOptions: [{ slot: "HP", label: "Heavy Push" }, { slot: "SR", label: "Speed Work" }],
    equipOptions: [{ value: "gym", label: "Gym" }, { value: "home", label: "Home" }],
    ...over, actions,
  };
  const el = document.createElement("div");
  render(<SchedulePlanner {...props} />, el);
  return { el, actions };
}

describe("SchedulePlanner", () => {
  it("renders a row per day, the training-day count, and equipment only on session days", () => {
    const { el } = mount();
    expect(el.querySelectorAll(".sp-row").length).toBe(3);
    expect(el.querySelector(".sp-count")!.textContent).toContain("2 training days");
    expect(el.querySelectorAll(".sp-equip").length).toBe(2); // Mon + Tue have sessions; Wed is rest
    expect(el.querySelector(".sp-row.today")).toBeTruthy();
  });

  it("applies the edited board (slot change + rest + equipment) on Apply", async () => {
    const { el, actions } = mount();
    selectVal(el, ".sp-row:nth-child(1) .sp-slot", "rest"); await flush(); // Mon → rest
    selectVal(el, ".sp-row:nth-child(3) .sp-slot", "SR"); await flush();   // Wed → Speed Work
    selectVal(el, ".sp-row:nth-child(3) .sp-equip", "home"); await flush(); // Wed at home
    click(el.querySelector(".sp-apply"));
    const board = actions.apply.mock.calls[0][0] as PlannerDay[];
    expect(board[0].slot).toBeNull();              // Mon rested
    expect(board[2].slot).toBe("SR");              // Wed assigned
    expect(board[2].equip).toBe("home");           // Wed equipment
  });

  it("updates the live training-day count as sessions are toggled", async () => {
    const { el } = mount();
    selectVal(el, ".sp-row:nth-child(1) .sp-slot", "rest"); await flush();
    expect(el.querySelector(".sp-count")!.textContent).toContain("1 training day");
  });

  it("save-as-default and cancel route to their handlers", () => {
    const { el, actions } = mount();
    click(el.querySelector(".sp-save-default"));
    expect(actions.saveDefault).toHaveBeenCalledTimes(1);
    click(el.querySelector(".sp-cancel"));
    expect(actions.cancel).toHaveBeenCalledTimes(1);
  });
});
