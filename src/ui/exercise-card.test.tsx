// @vitest-environment happy-dom
// Binding-contract test: the card is mounted once and bindToday (in ui.js) wires
// every control by id/class/data-attr. These assertions pin that exact surface so
// a markup change can never silently break a handler. If you rename/remove any
// selector here, update bindToday in lockstep.
import { describe, it, expect } from "vitest";
import { render } from "preact";
import { ExerciseCard, type ExerciseCardProps } from "./exercise-card";

function baseProps(over: Partial<ExerciseCardProps> = {}): ExerciseCardProps {
  return {
    i: 0, eid: "bench", originalEid: "bench", num: 1, done: false,
    exNm: "Barbell Bench Press", rxText: "4×5 @ 205 lb", reason: "Top set @ 85% 1RM",
    repLab: "Reps", restHuman: "1:30", restTitle: "~90s", unit: "lb", feelLead: "This lift felt:",
    runEx: false, sets: 4, reps: 5, activeSet: 1, wStep: 5, quickWVal: "205", gridWVal: "205",
    savedNote: "", hasShoe: false,
    plateMathHtml: "<div class='inline-plate'>45+25</div>", ghostHtml: "<div class='ghost'>vs 4wk ago</div>",
    cueRowHtml: "<div class='ex-cue-row'><p class='ex-cue'>Drive through mid-foot</p></div>",
    mainVideoHtml: "<div class='lite-video' data-vid='abc'><button class='lite-video-play'></button></div>",
    quickVideoHtml: "<div class='ex-quick-video-wrap'><button class='ex-quick-video-toggle' data-i='0'>Show quick video</button><div class='ex-quick-video-panel' id='exq-0' hidden></div></div>",
    howBlockHtml: "<div class='ex-howto'><ol><li>Set up</li></ol></div>",
    anatomyHtml: "<div class='anatomy'>svg</div>", runRpeSelectHtml: "", shoeHtml: "",
    lastLine: "Last: 200 lb × 5",
    ...over,
  };
}

function mount(over: Partial<ExerciseCardProps> = {}) {
  const el = document.createElement("div");
  render(<ExerciseCard {...baseProps(over)} />, el);
  return el;
}

describe("ExerciseCard markup contract", () => {
  it("exposes every selector bindToday wires (lift card)", () => {
    const el = mount();
    // structural ids
    expect(el.querySelector("#exc-0")).toBeTruthy();
    expect(el.querySelector("#exb-0")).toBeTruthy();
    expect(el.querySelector("#tq-set-lbl0")).toBeTruthy();
    expect(el.querySelector("#expdf-0")).toBeTruthy();
    // per-set quick-log inputs
    expect(el.querySelector("#tq-r0")).toBeTruthy();
    expect(el.querySelector("#tq-w0")).toBeTruthy();
    expect(el.querySelector("#tq-o0")).toBeTruthy();
    // log-all inputs
    expect(el.querySelector("#t-s0")).toBeTruthy();
    expect(el.querySelector("#t-r0")).toBeTruthy();
    expect(el.querySelector("#t-w0")).toBeTruthy();
    expect(el.querySelector("#t-o0")).toBeTruthy();
    // action controls
    expect(el.querySelector(".q-save[data-i='0']")).toBeTruthy();
    expect(el.querySelector(".ex-save[data-i='0']")).toBeTruthy();
    expect(el.querySelector(".ex-copyprev[data-i='0']")).toBeTruthy();
    expect(el.querySelector(".ex-rest[data-i='0']")).toBeTruthy();
    expect(el.querySelector(".ex-toggle[data-i='0']")).toBeTruthy();
    expect(el.querySelector(".ex-skip[data-eid='bench']")).toBeTruthy();
    expect(el.querySelector(".ex-swap[data-orig='bench']")).toBeTruthy();
    expect(el.querySelector(".q-load-helper[data-i='0']")).toBeTruthy();
    expect(el.querySelector(".ex-note-input[data-eid='bench']")).toBeTruthy();
    // feel chips: three, middle one preselected
    const chips = [...el.querySelectorAll(".feel-chip")];
    expect(chips.length).toBe(3);
    expect(chips[1].classList.contains("on")).toBe(true);
    // steppers carry target + delta for the imperative handler
    const steps = [...el.querySelectorAll(".step-btn")] as HTMLElement[];
    expect(steps.some((s) => s.dataset.target === "tq-r0")).toBe(true);
    expect(steps.some((s) => s.dataset.target === "tq-w0" && s.dataset.delta === "5")).toBe(true);
    expect(steps.some((s) => s.dataset.target === "t-w0" && s.dataset.delta === "-5")).toBe(true);
  });

  it("renders a pace input + shoe slot for run exercises and no load helper", () => {
    const el = mount({ runEx: true, hasShoe: true, shoeHtml: "<select class='shoe-select'></select>", quickWVal: "8:42", gridWVal: "8:42", repLab: "Minutes" });
    const tqw = el.querySelector("#tq-w0") as HTMLInputElement;
    expect(tqw.classList.contains("input-mmss")).toBe(true);
    expect(tqw.value).toBe("8:42");
    expect(el.querySelector(".q-load-helper")).toBeNull(); // runs use pace, not the bar helper
    expect(el.querySelector("#shoe-pick-0 .shoe-select")).toBeTruthy();
  });

  it("escapes user text (exercise name, saved note) instead of injecting HTML", () => {
    const el = mount({ exNm: "<img src=x onerror=alert(1)>", savedNote: "<b>hi</b>" });
    expect(el.querySelector("img")).toBeNull();
    const ta = el.querySelector(".ex-note-input") as HTMLTextAreaElement;
    expect(ta.value).toBe("<b>hi</b>"); // literal text, not parsed markup
    expect(ta.querySelector("b")).toBeNull();
  });

  it("passes through trusted helper HTML (video, anatomy, plate math, cue)", () => {
    const el = mount();
    expect(el.querySelector(".lite-video")).toBeTruthy();
    expect(el.querySelector(".ex-quick-video-toggle")).toBeTruthy();
    expect(el.querySelector(".anatomy")).toBeTruthy();
    expect(el.querySelector(".inline-plate")).toBeTruthy();
    expect(el.querySelector(".ex-cue")).toBeTruthy();
  });

  it("survives being unwrapped from its mount host (the ui.js mountTrainCards pattern)", () => {
    // ui.js mounts each card into a placeholder host, then replaces the host with
    // the rendered .ex-card so DOM position (and :last-child CSS) is unchanged.
    const group = document.createElement("div");
    group.className = "superset-group";
    const h1 = document.createElement("div"); h1.className = "exercise-card-host";
    const h2 = document.createElement("div"); h2.className = "exercise-card-host";
    group.append(h1, h2);
    render(<ExerciseCard {...baseProps({ i: 0, eid: "a" })} />, h1);
    render(<ExerciseCard {...baseProps({ i: 1, eid: "b" })} />, h2);
    for (const h of [h1, h2]) { const c = h.firstElementChild; if (c) h.replaceWith(c); }
    const cards = group.querySelectorAll(".ex-card");
    expect(cards.length).toBe(2);
    expect([...group.children].every((c) => c.classList.contains("ex-card"))).toBe(true); // no host wrappers left
    expect(group.querySelector(".ex-card:last-child")).toBe(cards[1]); // structural selector restored
  });

  it("marks a completed exercise with ex-done + check", () => {
    const el = mount({ done: true });
    expect((el.querySelector(".ex-card") as HTMLElement).classList.contains("ex-done")).toBe(true);
    expect((el.querySelector(".ex-check") as HTMLElement).textContent).toBe("✓");
  });
});
