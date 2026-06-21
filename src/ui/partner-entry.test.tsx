// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { PartnerEntry, type PartnerEntryProps, type PartnerEntryActions } from "./partner-entry";

function spies(): PartnerEntryActions {
  return { startSession: vi.fn(), openJoin: vi.fn(), submitJoin: vi.fn(), cancel: vi.fn() };
}
function mount(over: Partial<PartnerEntryProps>, actions = spies()) {
  const el = document.createElement("div");
  render(<PartnerEntry mode="idle" actions={actions} {...over} />, el);
  return { el, actions };
}
const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));

describe("PartnerEntry", () => {
  it("idle: start / join dispatch", () => {
    const { el, actions } = mount({ mode: "idle" });
    click(el.querySelector(".pn-start"));
    click(el.querySelector(".pn-open-join"));
    expect(actions.startSession).toHaveBeenCalled();
    expect(actions.openJoin).toHaveBeenCalled();
  });

  it("hosting: shows the code (one box per char) + a QR slot", () => {
    const { el } = mount({ mode: "hosting", code: "ABC23X" });
    const chars = [...el.querySelectorAll(".pn-code-char")];
    expect(chars.map((c) => c.textContent).join("")).toBe("ABC23X");
    expect((el.querySelector(".pn-qr") as HTMLElement).dataset.code).toBe("ABC23X");
  });

  it("joining: submitting passes the entered code, shows errors", () => {
    const { el, actions } = mount({ mode: "joining", joinError: "Code expired" });
    expect(el.querySelector(".pn-error")!.textContent).toContain("expired");
    const input = el.querySelector(".pn-code-input") as HTMLInputElement;
    input.value = "xyz789";
    (el.querySelector(".pn-joining") as HTMLFormElement).dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(actions.submitJoin).toHaveBeenCalledWith("xyz789");
  });
});
