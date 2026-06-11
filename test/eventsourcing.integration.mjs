// Integration test for the event-sourced log (overhaul 2b): boots the real
// ui.js with browser shims and drives the actual log helpers, asserting that
// S.events is the source of truth and S.logs always equals projectLogs(events).
const store = new Map();
const seed = (s) => store.set("hw5", JSON.stringify(s));

// Seed BEFORE import: a returning user with legacy logs and NO events array.
seed({
  v: 7,
  profile: { sex: "male", weight: 185, bench1RM: 225, squat1RM: 315, dead1RM: 405, run4mi: 2100, onboarded: true, prefs: { equipment: "gym", units: "imperial" } },
  goals: { focusAreas: ["Bench Press"] },
  schedule: { days: [1, 2, 3, 4, 5], sessionMin: 60 },
  program: { week: 6, start: "2026-04-01" },
  adapt: { bench: 1, squat: 1, dead: 1, run: 1, setsBonus: { bench: 0, squat: 0, dead: 0 }, runRestAdj: 0 },
  logs: [
    { id: "L1", date: "2026-06-01", exercise: "Back Squat", aW: 225, aR: 5, aS: 1, week: 5, score: 1 },
    { id: "L2", date: "2026-06-03", exercise: "Barbell Bench Press", aW: 185, aR: 5, aS: 1, week: 5, score: 1 },
  ],
  weightLog: [], healthLog: [], planId: 9,
});

const ls = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
function el() { return { style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, appendChild() {}, replaceChildren() {}, setAttribute() {}, getAttribute() { return null; }, addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; }, focus() {}, scrollIntoView() {}, getContext() { return null; }, getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }, set innerHTML(v) {}, get innerHTML() { return ""; }, set textContent(v) {}, get textContent() { return ""; } }; }
const doc = { readyState: "complete", body: el(), head: el(), documentElement: el(), getElementById: () => el(), querySelector: () => el(), querySelectorAll: () => [], createElement: () => el(), createDocumentFragment: () => el(), addEventListener() {} };
const win = { matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }), addEventListener() {}, location: { hash: "", href: "http://localhost/", origin: "http://localhost" }, requestAnimationFrame: (f) => setTimeout(f, 0), setTimeout, clearTimeout, setInterval: () => 0, clearInterval: () => {} };
globalThis.localStorage = ls; globalThis.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} }; globalThis.document = doc; globalThis.window = Object.assign(win, { localStorage: ls, document: doc });
function fg(n, v) { try { globalThis[n] = v; } catch { Object.defineProperty(globalThis, n, { value: v, configurable: true, writable: true }); } }
fg("navigator", { vibrate() {}, userAgent: "node" }); if (!globalThis.crypto) fg("crypto", { randomUUID: () => "id-" + Math.random().toString(36).slice(2) });
globalThis.requestAnimationFrame = win.requestAnimationFrame; globalThis.matchMedia = win.matchMedia;

const ui = await import("../js/ui.js");
const { projectLogs } = await import("../js/programming.js");

let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; console.log("✓", name); } catch (e) { fail++; console.error("✗", name, "\n   ", e.message); } };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}: ${a} !== ${b}`); };
const invariant = () => {
  const proj = projectLogs(ui.S.events).slice(-1000);
  eq(ui.S.logs.length, proj.length, "logs length matches projection");
  for (let i = 0; i < proj.length; i++) eq(ui.S.logs[i].id, proj[i].id, "log id matches projection at " + i);
};

t("load() backfilled events from legacy logs", () => {
  eq(Array.isArray(ui.S.events), true, "events is array");
  eq(ui.S.events.length, 2, "two events backfilled");
  eq(ui.S.events[0].type, "SetLogged", "event type");
  invariant();
});

t("recordLoggedSet appends an event + reprojects", () => {
  const before = ui.S.events.length;
  ui.recordLoggedSet({ id: "L3", date: "2026-06-10", exercise: "Deadlift", aW: 315, aR: 3, aS: 1 });
  eq(ui.S.events.length, before + 1, "one event added");
  eq(ui.S.logs.some((l) => l.id === "L3"), true, "log appears in read model");
  invariant();
});

t("tombstoneLogs removes a set via a delete event", () => {
  const before = ui.S.events.length;
  const removed = ui.tombstoneLogs((l) => l.id === "L1");
  eq(removed.length, 1, "one log matched");
  eq(ui.S.events.length, before + 1, "tombstone event added");
  eq(ui.S.events.some((e) => e.type === "SetDeleted" && e.logId === "L1"), true, "tombstone present");
  eq(ui.S.logs.some((l) => l.id === "L1"), false, "log gone from read model");
  invariant();
});

t("undo by restoring the event snapshot brings the set back", () => {
  const snap = ui.S.events.slice();
  ui.tombstoneLogs((l) => l.id === "L2");
  eq(ui.S.logs.some((l) => l.id === "L2"), false, "L2 deleted");
  // restore snapshot in place + reproject (mirrors the undo handlers)
  ui.S.events.length = 0;
  for (const e of snap) ui.S.events.push(e);
  ui.reprojectLogs();
  eq(ui.S.logs.some((l) => l.id === "L2"), true, "L2 restored");
  invariant();
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
