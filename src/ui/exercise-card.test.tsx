// @vitest-environment happy-dom
// Two contracts pinned here:
//  1. The component dispatches every interaction to its `actions` (lifted out of
//     bindToday) — q-save, save-all, copy-prev, skip, rest, toggle, feel, steppers, notes.
//  2. The markup still exposes the ids/classes/data-attrs that bindToday STILL
//     wires (q-load-helper, ex-swap, quick-video, lite-video) and that the
//     enhancers need (input-mmss, numeric inputs, anatomy). Don't rename without
//     updating bindToday in lockstep.
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { ExerciseCard, type ExerciseCardProps, type ExerciseCardActions } from "./exercise-card";

function noopActions(): ExerciseCardActions {
  return { noteInput() {}, feelClick() {}, skip() {}, rest() {}, toggleBody() {}, step() {}, logSet() {}, copyPrev() {}, saveAll() {} };
}

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
    actions: noopActions(),
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

  it("renders rxText as HTML (rx-tag badges), not escaped text", () => {
    // formatPrescribedRx returns trusted markup (warm-up/tempo/set-type spans).
    const el = mount({ rxText: '<span class="rx-tag rx-tag-warmup">Warm-up</span> 1×8 @ 75 lb' });
    const tag = el.querySelector(".ex-rx-lg .rx-tag") as HTMLElement;
    expect(tag).toBeTruthy();
    expect(tag.textContent).toBe("Warm-up");
    expect(el.querySelector(".ex-rx-lg")!.textContent).toContain("1×8 @ 75 lb");
    expect(el.querySelector(".ex-rx-lg")!.innerHTML).not.toContain("&lt;span"); // not escaped to literal text
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

describe("ExerciseCard interaction wiring", () => {
  function mountWithSpies() {
    const actions = { ...noopActions() };
    for (const k of Object.keys(actions) as (keyof ExerciseCardActions)[]) actions[k] = vi.fn();
    const el = document.createElement("div");
    render(<ExerciseCard {...baseProps({ actions })} />, el);
    return { el, actions };
  }
  const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));

  it("Complete-set button dispatches logSet with its element", () => {
    const { el, actions } = mountWithSpies();
    const btn = el.querySelector(".q-save") as HTMLButtonElement;
    click(btn);
    expect(actions.logSet).toHaveBeenCalledTimes(1);
    expect((actions.logSet as any).mock.calls[0][0]).toBe(btn);
  });

  it("log-all Save/Copy dispatch saveAll/copyPrev", () => {
    const { el, actions } = mountWithSpies();
    click(el.querySelector(".ex-save"));
    click(el.querySelector(".ex-copyprev"));
    expect(actions.saveAll).toHaveBeenCalledTimes(1);
    expect(actions.copyPrev).toHaveBeenCalledTimes(1);
  });

  it("skip / rest / details dispatch skip / rest / toggleBody", () => {
    const { el, actions } = mountWithSpies();
    click(el.querySelector(".ex-skip"));
    click(el.querySelector(".ex-rest"));
    click(el.querySelector(".ex-toggle"));
    expect(actions.skip).toHaveBeenCalledTimes(1);
    expect(actions.rest).toHaveBeenCalledTimes(1);
    expect(actions.toggleBody).toHaveBeenCalledTimes(1);
  });

  it("feel chips dispatch feelClick with the clicked chip", () => {
    const { el, actions } = mountWithSpies();
    const chips = [...el.querySelectorAll(".feel-chip")];
    click(chips[0]);
    click(chips[2]);
    expect(actions.feelClick).toHaveBeenCalledTimes(2);
    expect((actions.feelClick as any).mock.calls[1][0]).toBe(chips[2]);
  });

  it("steppers dispatch step for both quick-log and log-all inputs", () => {
    const { el, actions } = mountWithSpies();
    el.querySelectorAll(".step-btn").forEach((b) => click(b));
    // 2 (tq-r) + 2 (tq-w load) + 2 (t-s) + 2 (t-r) + 2 (t-w load) = 10 step buttons on a lift card
    expect(actions.step).toHaveBeenCalledTimes(10);
  });

  it("editing a note dispatches noteInput with the textarea", () => {
    const { el, actions } = mountWithSpies();
    const ta = el.querySelector(".ex-note-input") as HTMLTextAreaElement;
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    expect(actions.noteInput).toHaveBeenCalledTimes(1);
    expect((actions.noteInput as any).mock.calls[0][0]).toBe(ta);
  });
});
