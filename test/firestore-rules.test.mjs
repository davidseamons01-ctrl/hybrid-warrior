// Firestore security-rules tests for firestore.rules.
// Run:  npm run test:rules   (boots the Firestore emulator via firebase-tools)
// Requires: Java 11+ and network on first run (downloads the emulator). The
// emulator host is injected by `firebase emulators:exec`.
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";

const testEnv = await initializeTestEnvironment({
  projectId: "hw-rules-test",
  firestore: { rules: readFileSync("firestore.rules", "utf8") },
});

const host = testEnv.authenticatedContext("host").firestore();
const guest = testEnv.authenticatedContext("guest").firestore();
const stranger = testEnv.authenticatedContext("stranger").firestore();

let pass = 0, fail = 0;
async function t(name, fn) {
  try { await fn(); pass++; console.log("✓", name); }
  catch (e) { fail++; console.error("✗", name, "\n   ", e.message); }
}

// ── hw/{uid} ──
await t("owner writes own hw doc", () => assertSucceeds(setDoc(doc(host, "hw/host"), { x: 1 })));
await t("other user cannot write your hw doc", () => assertFails(setDoc(doc(guest, "hw/host"), { x: 2 })));

// ── community ──
await t("owner writes community profile", () => assertSucceeds(setDoc(doc(host, "community/host"), { handle: "h" })));
await t("non-owner cannot write community profile", () => assertFails(setDoc(doc(guest, "community/host"), { handle: "x" })));
await t("any signed-in user reads community", () => assertSucceeds(getDoc(doc(guest, "community/host"))));

// ── session_codes ──
await t("host creates a code for itself", () => assertSucceeds(setDoc(doc(host, "session_codes/ABC23X"), { sessionId: "s1", hostUid: "host", expiresAt: 9e15 })));
await t("cannot create a code naming someone else as host", () => assertFails(setDoc(doc(guest, "session_codes/XYZ"), { sessionId: "s1", hostUid: "host", expiresAt: 9e15 })));
await t("any signed-in user reads a code", () => assertSucceeds(getDoc(doc(guest, "session_codes/ABC23X"))));

// ── partner_sessions ──
const session = (uid, extra = {}) => ({ hostUid: "host", status: "lobby", participants: { [uid]: { uid } }, ...extra });
await t("host creates a session with itself as a participant", () => assertSucceeds(setDoc(doc(host, "partner_sessions/s1"), session("host"))));
await t("non-host cannot create a session", () => assertFails(setDoc(doc(guest, "partner_sessions/s2"), session("guest", { hostUid: "host" }))));
await t("any signed-in user reads a session (needed to join)", () => assertSucceeds(getDoc(doc(guest, "partner_sessions/s1"))));
await t("a guest can add only themselves", () => assertSucceeds(setDoc(doc(guest, "partner_sessions/s1"), { participants: { guest: { uid: "guest" } } }, { merge: true })));
await t("a non-participant stranger cannot update", () => assertFails(setDoc(doc(stranger, "partner_sessions/s1"), { status: "active" }, { merge: true })));
await t("a participant can append to the feed (attributed to self)", () => assertSucceeds(setDoc(doc(guest, "partner_sessions/s1/feed/e1"), { uid: "guest", eid: "squat", weight: 95, reps: 8, ts: 1 })));
await t("cannot append a feed event attributed to someone else", () => assertFails(setDoc(doc(guest, "partner_sessions/s1/feed/e2"), { uid: "host", eid: "squat", weight: 225, reps: 5, ts: 1 })));
await t("a guest cannot delete the session", () => assertFails(deleteDoc(doc(guest, "partner_sessions/s1"))));
await t("the host can delete the session", () => assertSucceeds(deleteDoc(doc(host, "partner_sessions/s1"))));

// ── partner_invites ──
await t("a sender can drop an invite into an inbox", () => assertSucceeds(setDoc(doc(host, "partner_invites/guest/items/i1"), { fromUid: "host", fromHandle: "h", sessionId: "s1", createdAt: 1 })));
await t("cannot forge an invite from someone else", () => assertFails(setDoc(doc(stranger, "partner_invites/guest/items/i2"), { fromUid: "host" })));
await t("the inbox owner reads their invites", () => assertSucceeds(getDoc(doc(guest, "partner_invites/guest/items/i1"))));
await t("a non-owner cannot read your invites", () => assertFails(getDoc(doc(stranger, "partner_invites/guest/items/i1"))));

console.log(`\n${pass} passed, ${fail} failed`);
await testEnv.cleanup();
process.exit(fail ? 1 : 0);
