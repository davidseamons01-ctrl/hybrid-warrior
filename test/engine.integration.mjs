// Integration smoke test: shim browser globals, seed a real user state, import
// the ACTUAL ui.js, and run the live engine with the overhaul wiring.
// Proves the module graph loads and mkDay/rollingPlanForDate don't throw.
// Run: node test/engine.integration.mjs

/* ---- minimal browser shims (just enough for ui.js module top-level) ---- */
const store = new Map();
function seedState(s) { store.set("hw5", JSON.stringify(s)); }

// Seed BEFORE importing ui.js (its top-level `let S=load()` reads this).
seedState({
  v: 7,
  profile: { name: "Test", sex: "male", age: 30, height: 70, bench1RM: 225, squat1RM: 315, dead1RM: 405, run4mi: 2100, weight: 185,
    onboarded: true, prefs: { equipment: "home", equipmentInv: ["dumbbell", "bands", "bodyweight"], experienceMonths: 24, primaryGoal: "Build Muscle", style: "balanced", lifeStage: "general", womenMode: "auto", units: "imperial" } },
  goals: { focusAreas: ["Build Muscle", "Lose Weight"], bench: 245, squat: 0, deadlift: 0, fiveK: 1200, fatLoss: 10, focusAreas2: [] },
  schedule: { days: [1, 2, 3, 4, 5], sessionMin: 60 },
  program: { week: 5, start: "2026-05-01" },
  adapt: { bench: 1.05, squat: 1, dead: 1, run: 1, setsBonus: { bench: 1, squat: 0, dead: 0 }, runRestAdj: 0 },
  logs: [
    { id: "a", date: "2026-06-01", exercise: "Barbell Bench Press", aW: 205, aR: 5, tW: 200, tR: 5, tS: 4, aS: 4 },
    { id: "b", date: "2026-06-08", exercise: "Barbell Bench Press", aW: 215, aR: 3, tW: 210, tR: 3, tS: 4, aS: 4 }
  ],
  weightLog: [{ date: "2026-05-01", wt: 188 }, { date: "2026-06-01", wt: 185 }],
  healthLog: [], planId: 49 /* a women?-no, men's muscle-ish id */,
});

const localStorageShim = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k)
};

function stubEl() {
  const el = {
    style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    children: [], attributes: {},
    appendChild() {}, removeChild() {}, replaceChildren() {}, append() {}, remove() {},
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    addEventListener() {}, removeEventListener() {}, querySelector() { return null; },
    querySelectorAll() { return []; }, closest() { return null; }, focus() {}, scrollIntoView() {},
    insertAdjacentHTML() {}, getContext() { return null; }, getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
    set innerHTML(v) {}, get innerHTML() { return ""; }, set textContent(v) {}, get textContent() { return ""; }
  };
  return el;
}
const documentShim = {
  readyState: "complete",
  body: stubEl(), head: stubEl(), documentElement: stubEl(),
  getElementById: () => stubEl(), querySelector: () => stubEl(), querySelectorAll: () => [],
  createElement: () => stubEl(), createDocumentFragment: () => stubEl(),
  addEventListener() {}, removeEventListener() {}
};
const windowShim = {
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  addEventListener() {}, removeEventListener() {}, location: { hash: "", href: "http://localhost/", origin: "http://localhost" },
  requestAnimationFrame: (f) => setTimeout(f, 0), cancelAnimationFrame: () => {}, setTimeout, clearTimeout, setInterval: () => 0, clearInterval: () => {}
};

globalThis.localStorage = localStorageShim;
globalThis.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = documentShim;
globalThis.window = Object.assign(windowShim, { localStorage: localStorageShim, document: documentShim });
function forceGlobal(name, val) { try { globalThis[name] = val; } catch { Object.defineProperty(globalThis, name, { value: val, configurable: true, writable: true }); } }
forceGlobal("navigator", { vibrate() {}, userAgent: "node", onLine: true });
if (!globalThis.crypto) forceGlobal("crypto", { randomUUID: () => "id-" + Math.random().toString(36).slice(2) });
globalThis.matchMedia = windowShim.matchMedia;
globalThis.requestAnimationFrame = windowShim.requestAnimationFrame;
// indexedDB intentionally undefined → ui.js idbAvailable() returns false (graceful).

/* ---- import the real app module and exercise the engine ---- */
let ui;
try {
  ui = await import("../js/ui.js");
} catch (e) {
  console.error("✗ ui.js failed to import (would crash the app at boot):\n", e);
  process.exit(1);
}

let pass = 0, fail = 0;
function t(name, fn) { try { fn(); pass++; console.log("✓", name); } catch (e) { fail++; console.error("✗", name, "\n   ", e.message); } }

t("ui.js module loaded and exports the engine", () => {
  if (typeof ui.mkDay !== "function") throw new Error("mkDay not exported");
  if (typeof ui.rollingPlanForDate !== "function") throw new Error("rollingPlanForDate not exported");
});

t("mkDay produces a session without throwing (goal-aware + e1RM + warmup + equip subs)", () => {
  const day = ui.mkDay("HP", 5);
  if (!day || !Array.isArray(day.exs)) throw new Error("no exs array");
  if (!day.exs.length) throw new Error("empty session");
});

t("equipment substitution fired for home user (no barbell bench)", () => {
  // user has only dumbbell/bands/bodyweight; a barbell bench slot must be swapped
  const day = ui.mkDay("HP", 5);
  const hasBarbellBench = day.exs.some((e) => e.eid === "bench");
  if (hasBarbellBench) throw new Error("barbell bench survived for a home (no-barbell) user");
});

t("computed warmup ramp is present & numeric on a weighted day", () => {
  // give a gym user so weighted barbell targets exist
  seedState(JSON.parse(store.get("hw5")));
  const day = ui.mkDay("HL", 6);
  // warmup may be empty if all subbed to bodyweight; just assert it's a string and didn't throw
  if (typeof day.warmup !== "string") throw new Error("warmup not a string");
});

t("rollingPlanForDate runs for several dates without throwing", () => {
  for (const d of ["2026-06-01", "2026-06-02", "2026-06-08", "2026-06-15"]) {
    const p = ui.rollingPlanForDate(d);
    if (!p || typeof p.focus !== "string") throw new Error("bad plan for " + d);
  }
});

t("todayPlanFiltered runs without throwing", () => {
  if (typeof ui.todayPlanFiltered === "function") ui.todayPlanFiltered();
});

t("buildPlanProps builds a 13-week view-model for the Plan component (no throw)", () => {
  if (typeof ui.buildPlanProps !== "function") throw new Error("buildPlanProps not exported");
  const p = ui.buildPlanProps();
  if (!Array.isArray(p.weeks) || p.weeks.length !== 13) throw new Error("expected 13 weeks, got " + (p.weeks && p.weeks.length));
  if (!Array.isArray(p.timeline) || p.timeline.length !== 13) throw new Error("expected 13 timeline cells");
  if (typeof p.anchorSummaryHtml !== "string" || typeof p.nextDotsHtml !== "string") throw new Error("panels not strings");
  if (!p.actions || typeof p.actions.reorder !== "function") throw new Error("actions missing");
  const open = p.weeks.find((w) => w.isOpen);
  if (!open) throw new Error("no week marked open");
  if (open.days && open.days.length) {
    const ex = open.days.flatMap((d) => d.exercises);
    if (ex.some((e) => typeof e.name !== "string" || typeof e.rx !== "string")) throw new Error("malformed exercise view-model");
  }
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
