import { describe, it, expect } from "vitest";
import {
  participantFromUser, newPartnerSession, withParticipant, setReady, touchPresence,
  isOnline, participantCount, allReady, canTransition,
  makeJoinCode, normalizeJoinCode, isValidJoinCode, JOIN_CODE_ALPHABET,
  codeRecord, isCodeExpired, joinHash, parseJoinHash,
  addGymBuddy, removeGymBuddy, hasGymBuddy, makeInvite,
} from "./partner-pairing";

const dave = { uid: "h", handle: "dave", name: "Dave", maxes: { squat: 315, bench: 225 } };
const sarah = { uid: "w", handle: "sarah", name: "Sarah", maxes: { hipthrust: 185 } };

describe("session + participants", () => {
  it("creates a lobby session with the host, gating maxes on consent", () => {
    const shared = newPartnerSession(dave, { id: "s1", code: "ABC23X", shareMaxes: true, now: 1000 });
    expect(shared.status).toBe("lobby");
    expect(shared.hostUid).toBe("h");
    expect(shared.participants.h.role).toBe("host");
    expect(shared.participants.h.maxes).toEqual({ squat: 315, bench: 225 });
    expect(shared.participants.h.maxesShared).toBe(true);

    const priv = newPartnerSession(dave, { id: "s2", shareMaxes: false });
    expect(priv.participants.h.maxes).toEqual({}); // not shared → withheld
    expect(priv.participants.h.maxesShared).toBe(false);
  });

  it("adds a guest, tracks ready state and presence/online", () => {
    let s = newPartnerSession(dave, { id: "s1", now: 1000 });
    s = withParticipant(s, participantFromUser(sarah, { role: "guest", shareMaxes: true, now: 1000 }));
    expect(participantCount(s)).toBe(2);
    expect(allReady(s)).toBe(false);
    s = setReady(s, "h", true, 2000);
    s = setReady(s, "w", true, 2000);
    expect(allReady(s)).toBe(true);

    s = touchPresence(s, "w", 100000);
    expect(isOnline(s.participants.w, 100000)).toBe(true);
    expect(isOnline(s.participants.w, 100000 + 31000)).toBe(false); // stale > 30s
  });

  it("enforces the status flow (and abandon from any non-complete state)", () => {
    expect(canTransition("lobby", "proposing")).toBe(true);
    expect(canTransition("lobby", "active")).toBe(false); // must propose first
    expect(canTransition("active", "split")).toBe(true);
    expect(canTransition("active", "abandoned")).toBe(true);
    expect(canTransition("complete", "abandoned")).toBe(false);
  });
});

describe("join codes", () => {
  it("generates codes from the unambiguous alphabet", () => {
    const seq = [0, 0.5, 0.99, 0.2, 0.7, 0.1];
    let i = 0;
    const code = makeJoinCode(6, () => seq[i++ % seq.length]);
    expect(code.length).toBe(6);
    expect([...code].every((c) => JOIN_CODE_ALPHABET.includes(c))).toBe(true);
    expect(/[IO01]/.test(code)).toBe(false); // no ambiguous chars
  });

  it("normalizes and validates user input", () => {
    expect(normalizeJoinCode(" abc-23x ")).toBe("ABC23X");
    expect(isValidJoinCode("abc23x")).toBe(true);
    expect(isValidJoinCode("ABC230")).toBe(false); // 0 not in alphabet
    expect(isValidJoinCode("ABC2")).toBe(false);   // too short
  });

  it("makes code records with TTL and detects expiry", () => {
    const rec = codeRecord("abc23x", "s1", "h", { ttlMs: 1000, now: 5000 });
    expect(rec).toEqual({ code: "ABC23X", sessionId: "s1", hostUid: "h", expiresAt: 6000 });
    expect(isCodeExpired(rec, 5999)).toBe(false);
    expect(isCodeExpired(rec, 6000)).toBe(true);
    expect(isCodeExpired(null)).toBe(true);
  });

  it("round-trips the QR deep-link hash", () => {
    expect(joinHash("abc23x")).toBe("#join=ABC23X");
    expect(parseJoinHash("https://app/#join=ABC23X")).toBe("ABC23X");
    expect(parseJoinHash("#join=ABC230")).toBeNull(); // invalid code rejected
    expect(parseJoinHash("#train")).toBeNull();
  });
});

describe("gym buddies + invites", () => {
  it("adds (dedup by uid), removes, and checks buddies", () => {
    let list = addGymBuddy([], { uid: "w", handle: "sarah", since: 1 });
    list = addGymBuddy(list, { uid: "w", handle: "sarah_new", since: 2 }); // dedup → replaces
    expect(list.length).toBe(1);
    expect(list[0].handle).toBe("sarah_new");
    expect(hasGymBuddy(list, "w")).toBe(true);
    list = removeGymBuddy(list, "w");
    expect(list.length).toBe(0);
  });

  it("builds an invite addressed from the sender", () => {
    const inv = makeInvite({ uid: "h", handle: "dave" }, "s1", { now: 1000 });
    expect(inv).toMatchObject({ fromUid: "h", fromHandle: "dave", sessionId: "s1", createdAt: 1000 });
    expect(inv.id).toBe("h_1000");
  });
});
