// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { FocusShell, type FocusShellProps, type FocusShellActions } from "./focus-shell";

function spies(): FocusShellActions {
  return { exit: vi.fn(), prev: vi.fn(), next: vi.fn() };
}
function mount(over: Partial<FocusShellProps> = {}, actions: FocusShellActions = spies()) {
  const el = document.createElement("div");
  const props: FocusShellProps = {
    n: 4, idx: 1, day: "Thursday", breadcrumb: "Week 5 · Strength", finalized: false,
    showClearDate: false, trainSessionDate: "", showCatchBanner: false,
    overlayHtml: "<div id='set-load-overlay'></div>",
    actions, ...over,
  };
  render(<FocusShell {...props} />, el);
  return { el, actions };
}
const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));

describe("FocusShell", () => {
  it("renders n dots (current marked) and n card-host slides", () => {
    const { el } = mount({ n: 4, idx: 1 });
    const dots = [...el.querySelectorAll(".focus-session-dots span")];
    expect(dots.length).toBe(4);
    expect(dots[1].classList.contains("on")).toBe(true);
    const hosts = [...el.querySelectorAll(".focus-session-slide .exercise-card-host")] as HTMLElement[];
    expect(hosts.length).toBe(4);
    expect(hosts.map((h) => h.dataset.cardI)).toEqual(["0", "1", "2", "3"]);
  });

  it("translates the track to the current index", () => {
    const { el } = mount({ n: 4, idx: 2 });
    const track = el.querySelector(".focus-session-track") as HTMLElement;
    expect(track.style.transform).toBe("translateX(-50%)"); // -(2*100)/4
    expect(track.style.width).toBe("400%");
  });

  it("shows Previous only when idx>0 and Next only when idx<n-1", () => {
    expect(mount({ n: 3, idx: 0 }).el.querySelector("#focus-prev")).toBeNull();
    expect(mount({ n: 3, idx: 0 }).el.querySelector("#focus-next-skip")).toBeTruthy();
    expect(mount({ n: 3, idx: 2 }).el.querySelector("#focus-next-skip")).toBeNull();
    expect(mount({ n: 3, idx: 2 }).el.querySelector("#focus-prev")).toBeTruthy();
  });

  it("dispatches exit / prev / next", () => {
    const { el, actions } = mount({ n: 4, idx: 1 });
    click(el.querySelector("#focus-exit"));
    click(el.querySelector("#focus-prev"));
    click(el.querySelector("#focus-next-skip"));
    expect(actions.exit).toHaveBeenCalledTimes(1);
    expect(actions.prev).toHaveBeenCalledTimes(1);
    expect(actions.next).toHaveBeenCalledTimes(1);
  });

  it("survives the nested mount→unwrap pipeline ui.js uses (shell unwrap, then card fill)", () => {
    // 1) renderToday emits a slot inside #train-inner
    const trainInner = document.createElement("div");
    trainInner.id = "train-inner";
    const slot = document.createElement("div");
    slot.id = "focus-shell-mount";
    trainInner.appendChild(slot);
    // 2) mountFocusShellTab: render the shell into the slot, then unwrap #p-today over it
    render(<FocusShell {...({ n: 3, idx: 0, day: "Mon", breadcrumb: "wk", finalized: false, showClearDate: false, trainSessionDate: "", showCatchBanner: false, overlayHtml: "", actions: spies() } as FocusShellProps)} />, slot);
    const pt = slot.firstElementChild as HTMLElement;
    slot.replaceWith(pt);
    expect(trainInner.firstElementChild).toBe(pt);           // #p-today sits where the slot was
    expect(pt.id).toBe("p-today");
    // 3) mountTrainCards: fill each host with a card, then unwrap the host
    trainInner.querySelectorAll(".exercise-card-host").forEach((h, i) => {
      const card = document.createElement("div");
      card.className = "ex-card";
      card.id = "exc-" + i;
      h.appendChild(card);
      h.replaceWith(card);
    });
    expect(trainInner.querySelectorAll(".exercise-card-host").length).toBe(0); // all hosts consumed
    const cards = trainInner.querySelectorAll(".focus-session-slide > .ex-card");
    expect(cards.length).toBe(3); // a card is the direct child of each slide
  });

  it("renders the finalized footer label and passes through the overlay + keeps shared ids", () => {
    const { el } = mount({ finalized: true, showClearDate: true, trainSessionDate: "2026-06-09" });
    expect(el.querySelector(".session-finalize-sync")!.textContent).toBe("Session complete");
    expect(el.querySelector("#set-load-overlay")).toBeTruthy();    // overlay passthrough
    expect(el.querySelector("#train-clear-date")).toBeTruthy();    // bindToday still wires this
    expect(el.textContent).toContain("2026-06-09");
  });
});
