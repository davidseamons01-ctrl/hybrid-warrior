import { describe, it, expect } from "vitest";
import {
  createInMemoryBackend, fsMerge,
  hostCreateSession, joinByCode, setReadyRemote, heartbeat,
  setSharedBlock, transition, logSharedSet, advanceTurn,
} from "./partner-session";
import { allReady, isOnline } from "./partner-pairing";

const dave = { uid: "h", handle: "dave", name: "Dave", maxes: { squat: 315 } };
const sarah = { uid: "w", handle: "sarah", name: "Sarah", maxes: { hipthrust: 185 } };
const mike = { uid: "m", handle: "mike", name: "Mike", maxes: { squat: 405 } };

function backend(now = { t: 1000 }) {
  return createInMemoryBackend({ now: () => now.t, idSeq: (() => { let n = 0; return () => "sess" + ++n; })() });
}

describe("fsMerge (Firestore set-merge semantics)", () => {
  it("deep-merges objects but replaces arrays/primitives", () => {
    expect(fsMerge({ a: { x: 1, y: 2 }, list: [1, 2] }, { a: { y: 9 }, list: [3] }))
      .toEqual({ a: { x: 1, y: 9 }, list: [3] });
  });
});

describe("host + join over a shared backend", () => {
  it("a guest joins by code and the host's live watcher sees it", async () => {
    const now = { t: 1000 };
    const be = backend(now);
    // host creates; another client watches the same session live
    const { session, code } = await hostCreateSession(be, dave, { vibe: "hypertrophy", shareMaxes: true, ttlMs: 10000 });
    let live: any = null;
    const unsub = be.watchSession(session.id, (s) => { live = s; });
    expect(Object.keys(live.participants)).toEqual(["h"]);

    now.t = 2000;
    const res = await joinByCode(be, sarah, code.toLowerCase(), { shareMaxes: true });
    expect(res.ok).toBe(true);
    // the host's live snapshot updated via the watcher
    expect(Object.keys(live.participants).sort()).toEqual(["h", "w"]);
    expect(live.participants.w.maxes).toEqual({ hipthrust: 185 }); // consented
    unsub();
  });

  it("withholds maxes when the joiner hasn't consented", async () => {
    const be = backend();
    const { code } = await hostCreateSession(be, dave, {});
    const res = await joinByCode(be, sarah, code); // shareMaxes omitted
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.session.participants.w.maxes).toEqual({});
  });

  it("rejects unknown / expired / closed codes", async () => {
    const now = { t: 1000 };
    const be = backend(now);
    expect((await joinByCode(be, sarah, "ZZZ999")).ok).toBe(false); // unknown code
    const exp = await hostCreateSession(be, dave, { ttlMs: 500 });
    now.t = 1600; // past TTL
    expect(await joinByCode(be, sarah, exp.code)).toEqual({ ok: false, error: "expired" });
    now.t = 2000; // fresh, long-lived code, but the session gets closed
    const open = await hostCreateSession(be, mike, { ttlMs: 100000 });
    await transition(be, open.session.id, "abandoned");
    expect(await joinByCode(be, sarah, open.code)).toEqual({ ok: false, error: "closed" });
  });
});

describe("ready / presence", () => {
  it("tracks ready + heartbeat presence across clients", async () => {
    const now = { t: 1000 };
    const be = backend(now);
    const { session, code } = await hostCreateSession(be, dave, {});
    await joinByCode(be, sarah, code);
    await setReadyRemote(be, session.id, "h", true);
    await setReadyRemote(be, session.id, "w", true);
    expect(allReady((await be.getSession(session.id))!)).toBe(true);

    now.t = 50000;
    await heartbeat(be, session.id, "w");
    const s = (await be.getSession(session.id))!;
    expect(isOnline(s.participants.w, 50000)).toBe(true);
    expect(isOnline(s.participants.h, 50000)).toBe(false); // host never beat → stale
  });
});

describe("status flow + shared block", () => {
  it("host sets the shared block and drives the status flow", async () => {
    const be = backend();
    const { session } = await hostCreateSession(be, dave, {});
    await setSharedBlock(be, session.id, [{ eid: "squat", name: "Back Squat", order: 0, scheme: { sets: 4, reps: 8, intensityPct: 70 } }], "hypertrophy");
    expect((await be.getSession(session.id))!.sharedLifts.length).toBe(1);
    expect(await transition(be, session.id, "active")).toBe(false); // must propose first
    expect(await transition(be, session.id, "proposing")).toBe(true);
    expect(await transition(be, session.id, "active")).toBe(true);
    expect(await transition(be, session.id, "split")).toBe(true);
  });
});

describe("live feed + turn-taking", () => {
  it("feed is shared, idempotent by id, and ordered by time", async () => {
    const be = backend();
    const { session } = await hostCreateSession(be, dave, {});
    const seen: any[] = [];
    be.watchFeed(session.id, (e) => seen.push(e));
    await logSharedSet(be, session.id, { id: "e1", uid: "h", handle: "dave", eid: "squat", name: "Back Squat", weight: 225, reps: 5, ts: 10 });
    await logSharedSet(be, session.id, { id: "e1", uid: "h", handle: "dave", eid: "squat", name: "Back Squat", weight: 225, reps: 5, ts: 10 }); // dupe id
    await logSharedSet(be, session.id, { id: "e2", uid: "w", handle: "sarah", eid: "squat", name: "Back Squat", weight: 95, reps: 8, ts: 5 });
    const last = seen[seen.length - 1];
    expect(last.length).toBe(2); // dedup by id
    expect(last.map((x: any) => x.id)).toEqual(["e2", "e1"]); // sorted by ts
  });

  it("rotates the bar through the group and bumps the set on wrap", async () => {
    const be = backend();
    const { session } = await hostCreateSession(be, dave, {});
    await joinByCode(be, sarah, (await be.getCode(session.joinCode!))!.code);
    const order = ["h", "w", "m"];
    await advanceTurn(be, session.id, order); // first → h, set 1
    expect((await be.getSession(session.id))!.liveState.turn).toEqual({ uid: "h", setNo: 1 });
    await advanceTurn(be, session.id, order); // → w
    await advanceTurn(be, session.id, order); // → m
    expect((await be.getSession(session.id))!.liveState.turn).toEqual({ uid: "m", setNo: 1 });
    await advanceTurn(be, session.id, order); // wrap → h, set 2
    expect((await be.getSession(session.id))!.liveState.turn).toEqual({ uid: "h", setNo: 2 });
  });
});
