// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { SessionPlayer, type SessionPlayerProps, type PlayerExercise } from "./session-player";

const mkEx = (over: Partial<PlayerExercise> = {}): PlayerExercise => ({
  eid: "squat", name: "Back Squat", sets: 2, reps: 8, weightLb: 65, stepLb: 5,
  restSec: 60, isRun: false, runTempo: false, doneSets: 0, cue: "Brace and sit back.", rx: "2×8 @ 65 lb",
  ...over,
});

function mount(over: Partial<SessionPlayerProps> = {}, actions: Partial<SessionPlayerProps["actions"]> = {}) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const props: SessionPlayerProps = {
    title: "Full Body",
    coached: false,
    exercises: [mkEx(), mkEx({ eid: "bench", name: "Bench Press", sets: 1, weightLb: 50, rx: "1×8 @ 50 lb" })],
    formatW: (lb) => `${lb} lb`,
    actions: { logSet: vi.fn(async () => ({ ok: true })), finish: vi.fn(), exit: vi.fn(), ...actions },
    ...over,
  };
  render(<SessionPlayer {...props} />, el);
  return { el, props };
}

const flush = () => new Promise((r) => setTimeout(r, 0));
const btn = (el: HTMLElement, text: string) =>
  [...el.querySelectorAll("button")].find((b) => b.textContent?.includes(text)) as HTMLButtonElement;

describe("SessionPlayer", () => {
  it("shows the first exercise with set counter and prescription", () => {
    const { el } = mount();
    expect(el.textContent).toContain("Back Squat");
    expect(el.textContent).toContain("Set 1 of 2");
    expect(el.textContent).toContain("2×8 @ 65 lb");
  });

  it("coached mode shows the cue instead of the rx line", () => {
    const { el } = mount({ coached: true });
    expect(el.textContent).toContain("Brace and sit back.");
    expect(el.textContent).not.toContain("2×8 @ 65 lb");
  });

  it("steppers adjust load by the exercise increment", async () => {
    const { el, props } = mount();
    (el.querySelector('[aria-label="Increase load"]') as HTMLButtonElement).click();
    await flush();
    btn(el, "Log set").click();
    await flush();
    expect(props.actions.logSet).toHaveBeenCalledWith(0, { reps: 8, weightLb: 70, outcome: "ok" });
  });

  it("logging a set with sets remaining enters rest, and skip rest returns to lift", async () => {
    const { el } = mount();
    btn(el, "Log set").click();
    await flush();
    expect(el.textContent).toContain("Rest");
    expect(el.textContent).toContain("Next: set 2 of 2");
    btn(el, "Skip rest").click();
    await flush();
    expect(el.textContent).toContain("Set 2 of 2");
  });

  it("selected feel is passed as the set outcome", async () => {
    const { el, props } = mount();
    btn(el, "Grind").click();
    await flush();
    btn(el, "Log set").click();
    await flush();
    expect((props.actions.logSet as ReturnType<typeof vi.fn>).mock.calls[0][1].outcome).toBe("hard");
  });

  it("completing every set reaches the done screen and finish calls the action", async () => {
    const { el, props } = mount({ exercises: [mkEx({ sets: 1 }), mkEx({ eid: "bench", name: "Bench Press", sets: 1 })] });
    btn(el, "Log set").click();
    await flush();
    btn(el, "Skip rest").click();
    await flush();
    expect(el.textContent).toContain("Bench Press");
    btn(el, "Log set").click();
    await flush();
    expect(el.textContent).toContain("Session complete");
    btn(el, "Finish session").click();
    expect(props.actions.finish).toHaveBeenCalled();
  });

  it("starts on the first incomplete exercise and exit calls exit", () => {
    const { el, props } = mount({ exercises: [mkEx({ doneSets: 2 }), mkEx({ eid: "bench", name: "Bench Press" })] });
    expect(el.textContent).toContain("Bench Press");
    (el.querySelector(".sp-close") as HTMLButtonElement).click();
    expect(props.actions.exit).toHaveBeenCalled();
  });
});
