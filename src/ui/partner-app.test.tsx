// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { PartnerApp, type PartnerCtx } from "./partner-app";
import { createInMemoryBackend, joinByCode, setReadyRemote, toggleJointLift } from "../core/partner-session";
import { VIBE_SCHEMES } from "../core/partner";
import type { JointRx } from "../core/partner-match";

const flush = async () => { for (let i = 0; i < 8; i++) await new Promise((r) => setTimeout(r, 0)); };
const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));
const setInput = (el: Element, sel: string, val: string) => {
  const i = el.querySelector(sel) as HTMLInputElement; i.value = val; i.dispatchEvent(new Event("input", { bubbles: true }));
};

// Dave: strength phase, Bench 5×5@180 + Row 4×8@135 programmed.
const dave: PartnerCtx = {
  uid: "h", handle: "dave", name: "Dave", maxes: { bench: 225, row: 155 },
  strengthByKey: { bench: 225, row: 155 }, scheme: VIBE_SCHEMES.strength, bodyweightKeys: ["pullup"],
  dayPlan: [
    { eid: "bench", name: "Bench Press", sets: 5, reps: 5, load: 180 },
    { eid: "row", name: "Barbell Row", sets: 4, reps: 8, load: 135 },
  ],
  focus: ["chest", "push", "strength"], equipment: ["barbell", "dumbbell", "machine"], unit: "lb",
  planEids: ["bench", "row"], shareMaxes: true,
};
// Sarah joins with her own programmed day (Hip Thrust).
const sarah = {
  uid: "w", handle: "sarah", name: "Sarah",
  focus: ["glutes", "legs"], equipment: ["barbell", "dumbbell", "machine"],
  dayPlan: [{ eid: "db-hipthrust", name: "DB Hip Thrust", sets: 3, reps: 17, load: 45 }],
};

describe("PartnerApp — program-based matchmaking over the in-memory backend", () => {
  it("host → guest join → match plans → calibrate a borrowed lift → hand off to Train", async () => {
    let t = 1000;
    const be = createInMemoryBackend({ now: () => t, idSeq: (() => { let n = 0; return () => "S" + ++n; })() });
    const onStartJoint = vi.fn();
    const el = document.createElement("div");
    render(<PartnerApp backend={be} ctx={dave} heartbeatMs={0} onStartJoint={onStartJoint} onExit={() => {}} />, el);

    // entry → start → lobby with a code
    click(el.querySelector(".pn-start"));
    await flush();
    expect(el.querySelector(".pn-lobby")).toBeTruthy();
    const sid = [...be._sessions.keys()][0];
    const code = [...be._codes.keys()][0];

    // guest joins (publishes her day plan), both ready, host continues to matchmaking
    t = 2000;
    await joinByCode(be, sarah, code, { shareMaxes: true });
    await flush();
    click(el.querySelector(".pn-toggle-ready"));
    await setReadyRemote(be, sid, "w", true);
    await flush();
    click(el.querySelector(".pn-start-session"));
    await flush();

    // the three-column board: my plan (2), Sarah's plan in the partner column
    expect(el.querySelector(".mb-board")).toBeTruthy();
    expect(el.querySelectorAll(".mb-col-me .mb-tile").length).toBe(2);
    expect(el.querySelector(".mb-col-partner")!.textContent).toContain("Sarah's plan");

    // Dave taps his Bench into the shared block → middle shows his programmed 180
    const benchTile = [...el.querySelectorAll(".mb-col-me .mb-tile")].find((t) => t.textContent!.includes("Bench Press"))!;
    click(benchTile);
    await flush();
    const benchLift = [...el.querySelectorAll(".mb-joint-lift")].find((n) => n.textContent!.includes("Bench Press"))!;
    expect(benchLift.textContent).toContain("180 lb");

    // Sarah adds her Hip Thrust (simulated on the shared backend) → Dave borrows it, needs a max
    t = 3000;
    await toggleJointLift(be, sid, { eid: "db-hipthrust", key: "hipthrust", name: "DB Hip Thrust", addedBy: "w", addedAt: t }, "db-hipthrust");
    await flush();
    let start = el.querySelector(".mb-start") as HTMLButtonElement;
    expect(start.disabled).toBe(true);
    expect(start.textContent).toContain("Set your max first");

    // Dave calibrates the borrowed hip thrust → start unlocks
    click(el.querySelector(".mb-load-cal"));
    await flush();
    setInput(el, ".cal-w", "200"); setInput(el, ".cal-r", "5");
    await flush();
    click(el.querySelector(".cal-submit"));
    await flush();
    start = el.querySelector(".mb-start") as HTMLButtonElement;
    expect(start.disabled).toBe(false);
    expect(start.textContent).toContain("Start lifting");

    // start → hands off my resolved joint plan to the Train session
    click(start);
    await flush();
    expect(onStartJoint).toHaveBeenCalledTimes(1);
    const rx: JointRx[] = onStartJoint.mock.calls[0][0];
    const bench = rx.find((r) => r.eid === "bench")!;
    expect(bench).toMatchObject({ sets: 5, reps: 5, load: 180, source: "programmed" });
    const hip = rx.find((r) => r.eid === "db-hipthrust")!;
    expect(hip.source).toBe("estimated"); // from Dave's calibrated 200 + strength phase
    expect(hip.load).toBeGreaterThan(0);
  });

  it("a bad join code surfaces an error and stays on entry", async () => {
    const be = createInMemoryBackend();
    const el = document.createElement("div");
    render(<PartnerApp backend={be} ctx={dave} heartbeatMs={0} initialJoinCode="ZZZ999" onExit={() => {}} />, el);
    await flush();
    expect(el.querySelector(".pn-entry")).toBeTruthy(); // didn't enter a session
  });

  it("shows the one-time setup notice when the backend denies the write", async () => {
    const be = createInMemoryBackend();
    be.createSession = () => Promise.reject(Object.assign(new Error("Missing or insufficient permissions."), { code: "permission-denied" }));
    const toasts: string[] = [];
    const el = document.createElement("div");
    render(<PartnerApp backend={be} ctx={dave} heartbeatMs={0} onToast={(m) => toasts.push(m)} onExit={() => {}} />, el);
    click(el.querySelector(".pn-start"));
    await flush();
    expect(el.querySelector(".pn-setup")).toBeTruthy();
    expect(el.querySelector(".pn-setup-steps")).toBeTruthy();
    expect(toasts.join(" ")).toMatch(/setup/i);
    click(el.querySelector(".pn-setup-retry"));
    await flush();
    expect(el.querySelector(".pn-start")).toBeTruthy();
  });
});
