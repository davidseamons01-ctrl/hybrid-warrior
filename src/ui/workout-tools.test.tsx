// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { WorkoutTools, type WorkoutToolsActions } from "./workout-tools";

function spies(): WorkoutToolsActions {
  return { eqToggle: vi.fn(), quickToggle: vi.fn(), openPlates: vi.fn(), openHealth: vi.fn(), openEase: vi.fn(), caffeineToggle: vi.fn() };
}
function mount(eqHome: boolean, qmOn: boolean, actions: WorkoutToolsActions) {
  const el = document.createElement("div");
  render(<WorkoutTools eqHome={eqHome} qmOn={qmOn} actions={actions} />, el);
  return el;
}
const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));

describe("WorkoutTools", () => {
  it("reflects gym/full state in labels and btn-fire", () => {
    const el = mount(false, false, spies());
    const eq = el.querySelector("#train-eq-toggle") as HTMLElement;
    const q = el.querySelector("#train-quick") as HTMLElement;
    expect(eq.textContent).toBe("Equipment: Gym");
    expect(q.textContent).toContain("Minimum session");
    expect(eq.classList.contains("btn-fire")).toBe(false);
    expect(q.classList.contains("btn-fire")).toBe(false);
  });

  it("reflects home/15-min state", () => {
    const el = mount(true, true, spies());
    const eq = el.querySelector("#train-eq-toggle") as HTMLElement;
    const q = el.querySelector("#train-quick") as HTMLElement;
    expect(eq.textContent).toBe("Equipment: Home");
    expect(q.textContent).toBe("15-min mode on");
    expect(eq.classList.contains("btn-fire")).toBe(true);
    expect(q.classList.contains("btn-fire")).toBe(true);
  });

  it("dispatches each button's action", () => {
    const a = spies();
    const el = mount(false, false, a);
    click(el.querySelector("#train-eq-toggle"));
    click(el.querySelector("#train-quick"));
    click(el.querySelector("#train-open-plates"));
    click(el.querySelector("#train-open-health"));
    click(el.querySelector("#train-open-ease"));
    const caf = el.querySelector("#caffeine-start") as HTMLButtonElement;
    click(caf);
    expect(a.eqToggle).toHaveBeenCalledTimes(1);
    expect(a.quickToggle).toHaveBeenCalledTimes(1);
    expect(a.openPlates).toHaveBeenCalledTimes(1);
    expect(a.openHealth).toHaveBeenCalledTimes(1);
    expect(a.openEase).toHaveBeenCalledTimes(1);
    expect(a.caffeineToggle).toHaveBeenCalledTimes(1);
    expect((a.caffeineToggle as any).mock.calls[0][0]).toBe(caf);
  });

  it("renders the adjust-schedule button + caffeine label slot bindToday still uses", () => {
    const el = mount(false, false, spies());
    // Adjust schedule has no component handler — bindToday's miss group wires it by id.
    expect(el.querySelector("#train-adjust-schedule")).toBeTruthy();
    expect(el.querySelector("#caffeine-time")).toBeTruthy();
  });
});
