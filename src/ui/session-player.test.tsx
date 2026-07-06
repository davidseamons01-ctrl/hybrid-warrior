// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { SessionPlayer, type SessionPlayerProps, type PlayerExercise } from "./session-player";

const mkEx = (over: Partial<PlayerExercise> = {}): PlayerExercise => ({
  eid: "squat", origEid: "squat", name: "Back Squat", sets: 2, reps: 8, tReps: 8, target: 65, weightLb: 65, stepLb: 5,
  restSec: 60, isRun: false, runTempo: false, doneSets: 0, cue: "Brace and sit back.", rx: "2×8 @ 65 lb",
  howTo: ["Bar on upper traps.", "Sit back and down."], videoUrl: "https://youtube.com/watch?v=x", plateHtml: "", group: "main",
  ...over,
});

function mount(over: Partial<SessionPlayerProps> = {}, actions: Partial<SessionPlayerProps["actions"]> = {}) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const props: SessionPlayerProps = {
    title: "Full Body",
    coached: false,
    exercises: [mkEx(), mkEx({ eid: "bench", name: "Bench Press", sets: 1, weightLb: 50, rx: "1×8 @ 50 lb" })],
    warmup: [],
    finisherOffer: "",
    finisherText: "",
    formatW: (lb) => `${lb} lb`,
    actions: {
      logSet: vi.fn(async () => ({ ok: true })), toggleWarmup: vi.fn(),
      addFinisher: vi.fn(async () => []),
      getAlternatives: vi.fn(async () => [{ eid: "front_squat", name: "Front Squat", tag: "quads" }]),
      swapExercise: vi.fn(async () => [mkEx({ eid: "front_squat", name: "Front Squat" })]),
      finish: vi.fn(), exit: vi.fn(), ...actions,
    },
    ...over,
  };
  render(<SessionPlayer {...props} />, el);
  return { el, props };
}

const flush = () => new Promise((r) => setTimeout(r, 0));
const btn = (el: HTMLElement, text: string) =>
  [...el.querySelectorAll("button")].find((b) => b.textContent?.trim() === text) as HTMLButtonElement;

describe("SessionPlayer", () => {
  it("shows the first exercise with set counter and prescription", () => {
    const { el } = mount();
    expect(el.textContent).toContain("Back Squat");
    expect(el.textContent).toContain("Set 1 of 2");
    expect(el.textContent).toContain("2×8 @ 65 lb");
  });

  it("logging passes the exercise descriptor and enters rest with a −30s control", async () => {
    const { el, props } = mount();
    btn(el, "Log set").click();
    await flush();
    const call = (props.actions.logSet as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0].eid).toBe("squat");
    expect(call[1]).toEqual({ reps: 8, weightLb: 65, outcome: "ok" });
    expect(el.textContent).toContain("Rest");
    expect(btn(el, "−30s")).toBeTruthy();
    btn(el, "Skip rest").click();
    await flush();
    expect(el.textContent).toContain("Set 2 of 2");
  });

  it("warm-up phase shows first when items exist, toggles persist, and skips to main work", async () => {
    const { el, props } = mount({ warmup: [{ idx: 0, line: "5 min cardio", checked: false }] });
    expect(el.textContent).toContain("Warm-up");
    expect(el.textContent).toContain("5 min cardio");
    btn(el, "5 min cardio")?.click();
    ([...el.querySelectorAll(".sp-wu-item")][0] as HTMLButtonElement).click();
    await flush();
    expect(props.actions.toggleWarmup).toHaveBeenCalled();
    btn(el, "Start main work").click();
    await flush();
    expect(el.textContent).toContain("Back Squat");
  });

  it("how-to sheet opens with instructions and video link", async () => {
    const { el } = mount();
    btn(el, "How to & video").click();
    await flush();
    expect(el.textContent).toContain("Bar on upper traps.");
    expect(el.querySelector(".sp-video-link")).toBeTruthy();
    btn(el, "Back to the set").click();
    await flush();
    expect(el.querySelector(".sp-sheet")).toBeFalsy();
  });

  it("X opens the exit sheet; Finish & save appears once sets are logged and calls finish", async () => {
    const { el, props } = mount();
    btn(el, "Log set").click();
    await flush();
    (el.querySelector(".sp-close") as HTMLButtonElement).click();
    await flush();
    expect(el.textContent).toContain("Done for today?");
    btn(el, "Finish & save").click();
    expect(props.actions.finish).toHaveBeenCalled();
  });

  it("exit sheet without logged sets offers leave, not finish", async () => {
    const { el } = mount();
    (el.querySelector(".sp-close") as HTMLButtonElement).click();
    await flush();
    expect(btn(el, "Finish & save")).toBeFalsy();
    expect(btn(el, "Leave — resume later")).toBeTruthy();
  });

  it("done screen offers the finisher; adding it appends exercises and continues", async () => {
    const base = mkEx({ sets: 1 });
    const finisherEx = mkEx({ eid: "cable_crunch", name: "Cable Crunch", sets: 1, group: "finisher" });
    const addFinisher = vi.fn(async () => [ { ...base, doneSets: 1 }, finisherEx ]);
    const { el } = mount({ exercises: [base], finisherOffer: "Add 5-min core finisher" }, { addFinisher });
    btn(el, "Log set").click();
    await flush();
    expect(el.textContent).toContain("Session complete");
    btn(el, "Add 5-min core finisher").click();
    await flush();
    expect(addFinisher).toHaveBeenCalled();
    expect(el.textContent).toContain("Cable Crunch");
    expect(el.textContent).toContain("Finisher");
  });

  it("swap sheet lists alternatives and swapping replaces the exercise", async () => {
    const { el, props } = mount({ exercises: [mkEx()] });
    btn(el, "Swap").click();
    await flush();
    await flush();
    expect(el.textContent).toContain("Front Squat");
    (el.querySelector(".sp-swap-opt") as HTMLButtonElement).click();
    await flush();
    expect(props.actions.swapExercise).toHaveBeenCalled();
    expect((el.querySelector(".sp-exname") as HTMLElement).textContent).toBe("Front Squat");
  });

  it("uncalibrated lift shows BW and + starts at the empty bar", async () => {
    const { el } = mount({ exercises: [mkEx({ weightLb: 0, plateHtml: "<b>bar</b>" })] });
    expect(el.textContent).toContain("BW");
    (el.querySelector('[aria-label="Increase load"]') as HTMLButtonElement).click();
    await flush();
    expect(el.textContent).toContain("45 lb");
  });

  it("completing every set reaches done and finish calls the action", async () => {
    const { el, props } = mount({ exercises: [mkEx({ sets: 1 })] });
    btn(el, "Log set").click();
    await flush();
    expect(el.textContent).toContain("Session complete");
    btn(el, "Finish session").click();
    expect(props.actions.finish).toHaveBeenCalled();
  });
});
