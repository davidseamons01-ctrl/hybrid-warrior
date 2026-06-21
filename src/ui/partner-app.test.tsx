// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { PartnerApp, type PartnerCtx } from "./partner-app";
import { createInMemoryBackend, joinByCode, setReadyRemote } from "../core/partner-session";

const flush = async () => { for (let i = 0; i < 6; i++) await new Promise((r) => setTimeout(r, 0)); };
const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));

const dave: PartnerCtx = {
  uid: "h", handle: "dave", name: "Dave", maxes: { squat: 315, bench: 225, deadlift: 405 },
  focus: ["chest", "push", "strength"], equipment: ["barbell", "dumbbell", "machine"], unit: "lb",
  planEids: ["bench", "tricep"], shareMaxes: true,
};
const sarah = {
  uid: "w", handle: "sarah", name: "Sarah", maxes: { hipthrust: 185, squat: 135 },
  focus: ["glutes", "posterior", "legs"], equipment: ["barbell", "dumbbell", "machine"], unit: "lb",
  planEids: ["hipthrust", "abduction"], shareMaxes: true,
};

function mountHost(be: ReturnType<typeof createInMemoryBackend>) {
  const el = document.createElement("div");
  render(<PartnerApp backend={be} ctx={dave} heartbeatMs={0} onExit={() => {}} />, el);
  return el;
}

describe("PartnerApp end-to-end over the in-memory backend", () => {
  it("host creates → guest joins → both ready → engine proposes joint lifts with per-user loads", async () => {
    let t = 1000;
    const be = createInMemoryBackend({ now: () => t, idSeq: (() => { let n = 0; return () => "S" + ++n; })() });
    const el = mountHost(be);

    // entry → start a session
    expect(el.querySelector(".pn-start")).toBeTruthy();
    click(el.querySelector(".pn-start"));
    await flush();
    // now in the lobby with a join code shown to the host
    expect(el.querySelector(".pn-lobby")).toBeTruthy();
    const code = [...be._codes.keys()][0];
    expect(el.querySelector(".pn-lobby-code")!.textContent).toContain(code);
    expect(el.querySelectorAll(".pn-member").length).toBe(1);

    // a guest joins (simulated on the same shared backend) → host's live watcher updates
    t = 2000;
    await joinByCode(be, sarah, code, { shareMaxes: true });
    await flush();
    expect(el.querySelectorAll(".pn-member").length).toBe(2);

    // ready everyone up → host's Continue unlocks
    click(el.querySelector(".pn-toggle-ready")); // host readies via the UI
    await setReadyRemote(be, [...be._sessions.keys()][0], "w", true); // guest readies
    await flush();
    const cont = el.querySelector(".pn-start-session") as HTMLButtonElement;
    expect(cont.disabled).toBe(false);

    // host continues → the engine proposes shared lifts scaled per lifter
    click(cont);
    await flush();
    const names = [...el.querySelectorAll(".sbp-lift-name")].map((n) => n.textContent);
    expect(names).toContain("Back Squat"); // best joint-fit for strength + glutes
    const firstLoads = [...el.querySelectorAll(".sbp-lift")][0].querySelectorAll(".sbp-load-val");
    expect(firstLoads[0].textContent).toContain("220"); // Dave: 315 × 70%
    expect(firstLoads[1].textContent).toContain("95");  // Sarah: 135 × 70%
  });

  it("a bad join code surfaces an error and stays on entry", async () => {
    const be = createInMemoryBackend();
    const el = document.createElement("div");
    render(<PartnerApp backend={be} ctx={dave} heartbeatMs={0} initialJoinCode="ZZZ999" onExit={() => {}} />, el);
    await flush();
    expect(el.querySelector(".pn-entry")).toBeTruthy(); // didn't enter a session
  });
});
