// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { CalibrationSheet } from "./calibration-sheet";

function mount(a = { onSubmit: vi.fn(), onCancel: vi.fn() }) {
  const el = document.createElement("div");
  render(<CalibrationSheet liftName="Back Squat" unit="lb" onSubmit={a.onSubmit} onCancel={a.onCancel} />, el);
  return { el, ...a };
}
const setInput = (el: Element, sel: string, val: string) => {
  const i = el.querySelector(sel) as HTMLInputElement; i.value = val; i.dispatchEvent(new Event("input", { bubbles: true }));
};
const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("CalibrationSheet", () => {
  it("estimates a 1RM from a set (Epley) and enables submit", async () => {
    const { el } = mount();
    expect((el.querySelector(".cal-submit") as HTMLButtonElement).disabled).toBe(true);
    setInput(el, ".cal-w", "135"); setInput(el, ".cal-r", "5");
    await flush();
    expect(el.querySelector(".cal-est")!.textContent).toContain("158"); // 135 × (1 + 5/30)
    expect((el.querySelector(".cal-submit") as HTMLButtonElement).disabled).toBe(false);
  });

  it("submits the estimated max; cancel + backdrop dismiss", async () => {
    const a = { onSubmit: vi.fn(), onCancel: vi.fn() };
    const { el } = mount(a);
    setInput(el, ".cal-w", "225"); setInput(el, ".cal-r", "3");
    await flush();
    click(el.querySelector(".cal-submit"));
    expect(a.onSubmit).toHaveBeenCalledWith(248); // round(225 × 1.1)
    click(el.querySelector(".cal-cancel"));
    click(el.querySelector(".cal-overlay")); // backdrop
    expect(a.onCancel).toHaveBeenCalledTimes(2);
  });
});
