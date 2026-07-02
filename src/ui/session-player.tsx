// Session Player (UI overhaul phase 3) — the full-screen, one-exercise-at-a-time
// workout experience behind "Start session". Owns its own in-workout state
// (current exercise, set count, rest countdown, adjustments); the data layer
// stays in ui.js behind actions (logSet persists an event-sourced set, finish
// runs day adaptation + summary). Coached mode speaks plain language; Pro mode
// shows the prescription. Unmounted wholesale on exit — nothing here re-renders
// the app behind it.
import { render } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

export interface PlayerExercise {
  eid: string;
  name: string;
  sets: number;
  reps: number;
  weightLb: number;   // pace sec/mi for runs
  stepLb: number;     // weight increment (pace step for runs)
  restSec: number;
  isRun: boolean;
  runTempo: boolean;  // minutes-style run (vs intervals)
  doneSets: number;   // already logged today
  cue: string;
  rx: string;
}

export interface SessionPlayerActions {
  logSet: (i: number, data: { reps: number; weightLb: number; outcome: string }) => Promise<{ ok: boolean; isPR?: boolean }>;
  finish: () => void;
  exit: () => void;
}

export interface SessionPlayerProps {
  title: string;
  coached: boolean;
  exercises: PlayerExercise[];
  formatW: (lb: number, isRun: boolean) => string;
  actions: SessionPlayerActions;
}

type Phase = "lift" | "rest" | "done";

function fmtClock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const FEELS: ReadonlyArray<readonly [string, string, string]> = [
  ["easy", "Too easy", "Easy"],
  ["ok", "Just right", "Solid"],
  ["hard", "Too hard", "Grind"],
];

function SessionPlayer(p: SessionPlayerProps) {
  const a = p.actions;
  const exs = p.exercises;
  const firstOpen = Math.max(0, exs.findIndex((e) => e.doneSets < e.sets));
  const [idx, setIdx] = useState(firstOpen);
  const [done, setDone] = useState(() => exs.map((e) => e.doneSets));
  const [wLb, setWLb] = useState(() => exs.map((e) => e.weightLb));
  const [reps, setReps] = useState(() => exs.map((e) => e.reps));
  const [feel, setFeel] = useState("ok");
  const [phase, setPhase] = useState<Phase>(exs.every((e) => e.doneSets >= e.sets) ? "done" : "lift");
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(1);
  const [restNext, setRestNext] = useState("");
  const [prFlash, setPrFlash] = useState(false);
  const [busy, setBusy] = useState(false);
  const restUntil = useRef(0);
  const startTs = useRef(Date.now());

  const ex = exs[idx];
  const totalSets = exs.reduce((t, e) => t + e.sets, 0);
  const doneTotal = done.reduce((t, d, i) => t + Math.min(d, exs[i].sets), 0);
  const pct = totalSets ? Math.round((100 * doneTotal) / totalSets) : 0;

  useEffect(() => {
    if (phase !== "rest") return;
    const t = setInterval(() => {
      const left = (restUntil.current - Date.now()) / 1000;
      if (left <= 0) {
        clearInterval(t);
        setPhase("lift");
        try { if (navigator.vibrate) navigator.vibrate([60, 40, 60]); } catch {}
      } else setRestLeft(left);
    }, 200);
    return () => clearInterval(t);
  }, [phase]);

  const nextIncomplete = (from: number, doneArr: number[]): number | null => {
    for (let k = 0; k < exs.length; k++) {
      const i = (from + k) % exs.length;
      if (doneArr[i] < exs[i].sets) return i;
    }
    return null;
  };

  const startRest = (sec: number, label: string) => {
    restUntil.current = Date.now() + Math.max(5, sec) * 1000;
    setRestTotal(Math.max(5, sec));
    setRestLeft(Math.max(5, sec));
    setRestNext(label);
    setPhase("rest");
  };

  const adj = (kind: "w" | "r", dir: 1 | -1) => {
    if (kind === "w") setWLb((arr) => arr.map((v, i) => (i === idx ? Math.max(0, v + dir * ex.stepLb) : v)));
    else setReps((arr) => arr.map((v, i) => (i === idx ? Math.max(1, v + dir) : v)));
  };

  const logCurrent = async () => {
    if (busy) return;
    setBusy(true);
    const r = await a.logSet(idx, { reps: reps[idx], weightLb: wLb[idx], outcome: feel });
    setBusy(false);
    if (!r.ok) return;
    if (r.isPR) { setPrFlash(true); setTimeout(() => setPrFlash(false), 2200); }
    const nd = done.slice();
    nd[idx] = nd[idx] + 1;
    setDone(nd);
    setFeel("ok");
    if (nd[idx] >= ex.sets) {
      const n = nextIncomplete(idx + 1, nd);
      if (n == null) { setPhase("done"); return; }
      setIdx(n);
      startRest(ex.restSec, `Next up: ${exs[n].name}`);
    } else {
      startRest(ex.restSec, `Next: set ${nd[idx] + 1} of ${ex.sets} — ${ex.name}`);
    }
  };

  const skipExercise = () => {
    const n = nextIncomplete(idx + 1, done);
    if (n == null || n === idx) { setPhase("done"); return; }
    setIdx(n);
    setPhase("lift");
  };

  const elapsed = fmtClock((Date.now() - startTs.current) / 1000);
  const repLab = ex ? (ex.runTempo ? "min" : ex.isRun ? "intervals" : "reps") : "reps";
  const R = 84, CIRC = 2 * Math.PI * R;

  return (
    <div class="sp-overlay" role="dialog" aria-modal="true" aria-label="Workout session">
      <div class="sp-top">
        <button type="button" class="sp-close" aria-label="Exit session" onClick={() => a.exit()}>×</button>
        <div class="sp-top-mid">
          <div class="sp-top-title">{p.title}</div>
          <div class="sp-top-sub">{doneTotal} of {totalSets} sets · {exs.length} exercise{exs.length !== 1 ? "s" : ""}</div>
        </div>
        <div class="sp-top-count">{Math.min(idx + 1, exs.length)}/{exs.length}</div>
      </div>
      <div class="sp-progress"><div class="sp-progress-fill" style={`width:${pct}%`}></div></div>

      {phase === "lift" && ex ? (
        <div class="sp-main">
          <div class="sp-kicker">Set {Math.min(done[idx] + 1, ex.sets)} of {ex.sets}</div>
          <div class="sp-exname">{ex.name}</div>
          {p.coached
            ? (ex.cue ? <p class="sp-cue">{ex.cue}</p> : null)
            : <p class="sp-rx">{ex.rx}{ex.restSec ? ` · rest ${fmtClock(ex.restSec)}` : ""}</p>}
          <div class="sp-adjust-row">
            <div class="sp-adjust">
              <button type="button" class="sp-step" aria-label="Decrease load" onClick={() => adj("w", -1)}>−</button>
              <div class="sp-adjust-val"><b>{p.formatW(wLb[idx], ex.isRun)}</b><span>{ex.isRun ? "pace" : "load"}</span></div>
              <button type="button" class="sp-step" aria-label="Increase load" onClick={() => adj("w", 1)}>+</button>
            </div>
            <div class="sp-adjust">
              <button type="button" class="sp-step" aria-label="Decrease reps" onClick={() => adj("r", -1)}>−</button>
              <div class="sp-adjust-val"><b>{reps[idx]}</b><span>{repLab}</span></div>
              <button type="button" class="sp-step" aria-label="Increase reps" onClick={() => adj("r", 1)}>+</button>
            </div>
          </div>
          <div class="sp-feel-row" role="radiogroup" aria-label="How did that feel">
            {FEELS.map(([v, coachedLbl, proLbl]) => (
              <button key={v} type="button" role="radio" aria-checked={feel === v} class={`sp-feel ${feel === v ? "on" : ""}`} onClick={() => setFeel(v)}>{p.coached ? coachedLbl : proLbl}</button>
            ))}
          </div>
          <button type="button" class="sp-log" onClick={logCurrent} disabled={busy}>{busy ? "Saving…" : "Log set"}</button>
          {prFlash ? <div class="sp-pr" role="status">🏆 New record!</div> : null}
          <div class="sp-secondary-row">
            <button type="button" class="sp-ghost-btn" onClick={skipExercise}>Skip exercise</button>
          </div>
        </div>
      ) : null}

      {phase === "rest" ? (
        <div class="sp-main sp-rest" aria-live="polite">
          <div class="sp-kicker">Rest</div>
          <div class="sp-ring-wrap">
            <svg class="sp-ring" viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r={R} class="sp-ring-track" />
              <circle cx="100" cy="100" r={R} class="sp-ring-fill" style={`stroke-dasharray:${CIRC};stroke-dashoffset:${CIRC * (1 - restLeft / restTotal)}`} />
            </svg>
            <div class="sp-ring-time">{fmtClock(restLeft)}</div>
          </div>
          <p class="sp-rest-next">{restNext}</p>
          <div class="sp-rest-actions">
            <button type="button" class="sp-ghost-btn" onClick={() => { restUntil.current += 30000; setRestTotal((t) => t + 30); }}>+30s</button>
            <button type="button" class="sp-log sp-log-sm" onClick={() => { setPhase("lift"); }}>Skip rest</button>
          </div>
        </div>
      ) : null}

      {phase === "done" ? (
        <div class="sp-main sp-done">
          <div class="sp-done-check" aria-hidden="true">✓</div>
          <div class="sp-exname">Session complete</div>
          <p class="sp-done-stats">{doneTotal} set{doneTotal !== 1 ? "s" : ""} logged · {elapsed} elapsed</p>
          <p class="sp-cue">{p.coached ? "Great work. Finishing updates tomorrow's targets from what you just did." : "Finalize to run day adaptation on today's log."}</p>
          <button type="button" class="sp-log" onClick={() => a.finish()}>Finish session</button>
          <div class="sp-secondary-row">
            <button type="button" class="sp-ghost-btn" onClick={() => a.exit()}>Back to Today</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { SessionPlayer };

/** Mount the full-screen session player into a host element (called from ui.js). */
export function mountSessionPlayer(container: Element, props: SessionPlayerProps): void {
  render(<SessionPlayer {...props} />, container as unknown as import("preact").ContainerNode);
}

/** Unmount (ui.js calls before removing the host). */
export function unmountSessionPlayer(container: Element): void {
  render(null, container as unknown as import("preact").ContainerNode);
}
