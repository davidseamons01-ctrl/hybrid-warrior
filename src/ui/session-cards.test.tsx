// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { ReadinessCard, SessionFeelCard, WarmupChecklist } from "./session-cards";

function mount(node: any) {
  const el = document.createElement("div");
  render(node, el);
  return el;
}
const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));

describe("ReadinessCard", () => {
  it("marks normal as on when readiness is unset, and selects on click", () => {
    const onSelect = vi.fn();
    const el = mount(<ReadinessCard readiness="" onSelect={onSelect} />);
    const btns = [...el.querySelectorAll(".readiness-btn")] as HTMLElement[];
    expect(btns.length).toBe(3);
    expect(btns[1].classList.contains("readiness-on")).toBe(true); // normal-on by default
    click(btns[2]);
    expect(onSelect).toHaveBeenCalledWith("fatigued");
  });

  it("shows the eased hint when fatigued, nudge hint when strong", () => {
    expect(mount(<ReadinessCard readiness="fatigued" onSelect={() => {}} />).textContent).toContain("Loads eased");
    expect(mount(<ReadinessCard readiness="strong" onSelect={() => {}} />).textContent).toContain("nudged up");
    expect(mount(<ReadinessCard readiness="normal" onSelect={() => {}} />).textContent).not.toContain("eased");
  });
});

describe("SessionFeelCard", () => {
  it("highlights the saved feel and reveals Clear", () => {
    const el = mount(<SessionFeelCard sf="hard" savedLbl="Hard (~RPE 9+)" finalized={false} dayIso="2026-06-11" onFeel={() => {}} onClear={() => {}} />);
    const hard = el.querySelector('[data-sfeel="hard"]') as HTMLElement;
    expect(hard.classList.contains("btn-fire")).toBe(true);
    expect(el.textContent).toContain("Saved:");
    expect(el.querySelector("#sfeel-clear")).toBeTruthy();
  });

  it("hides Clear and shows the finalized note when adapted", () => {
    const el = mount(<SessionFeelCard sf="" savedLbl="" finalized={true} dayIso="2026-06-11" onFeel={() => {}} onClear={() => {}} />);
    expect(el.querySelector("#sfeel-clear")).toBeNull();
    expect(el.textContent).toContain("Adaptation applied for 2026-06-11");
  });

  it("dispatches onFeel / onClear", () => {
    const onFeel = vi.fn(), onClear = vi.fn();
    const el = mount(<SessionFeelCard sf="ok" savedLbl="Solid" finalized={false} dayIso="d" onFeel={onFeel} onClear={onClear} />);
    click(el.querySelector('[data-sfeel="easy"]'));
    click(el.querySelector("#sfeel-clear"));
    expect(onFeel).toHaveBeenCalledWith("easy");
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe("WarmupChecklist", () => {
  it("renders steps and reports toggles with index + checked", () => {
    const onToggle = vi.fn();
    const items = [
      { idx: 0, line: "5 min bike", checked: false },
      { idx: 1, line: "Band pull-aparts", checked: true },
    ];
    const el = mount(<WarmupChecklist mode="list" items={items} text="" onToggle={onToggle} />);
    const cbs = [...el.querySelectorAll(".wu-step-cb")] as HTMLInputElement[];
    expect(cbs.length).toBe(2);
    expect(cbs[1].checked).toBe(true);
    cbs[0].checked = true;
    cbs[0].dispatchEvent(new Event("change", { bubbles: true }));
    expect(onToggle).toHaveBeenCalledWith(0, true);
  });

  it("renders the plain-text variant without checkboxes", () => {
    const el = mount(<WarmupChecklist mode="text" items={[]} text="Easy 5-minute walk" onToggle={() => {}} />);
    expect(el.querySelector(".wu-step-cb")).toBeNull();
    expect(el.textContent).toContain("Easy 5-minute walk");
  });

  it("escapes warm-up text instead of injecting markup", () => {
    const el = mount(<WarmupChecklist mode="text" items={[]} text="<img src=x onerror=alert(1)>" onToggle={() => {}} />);
    expect(el.querySelector("img")).toBeNull();
  });
});
