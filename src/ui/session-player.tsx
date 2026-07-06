// Session Player (overhaul phase 7) — THE single container for a workout.
// Owns warm-up, one-exercise-at-a-time logging, rest countdown, on-demand
// exercise education (how-to + video), the optional finisher, and finishing
// (full or early). The data layer stays in ui.js behind actions. Coached mode
// speaks plain language; Pro mode shows prescriptions. Unmounted wholesale on
// exit — nothing here re-renders the app behind it.
import { render } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

export interface PlayerExercise {
  eid: string;
  origEid: string;   // programmed exercise id (swap key)
  name: string;
  sets: number;
  reps: number;       // working value (player-adjustable)
  tReps: number;      // prescribed reps (for the log's target fields)
  target: number;     // prescribed load lb / pace sec-mi (for tW)
  weightLb: number;   // working load (pace sec/mi for runs)
  stepLb: number;
  restSec: number;
  isRun: boolean;
  runTempo: boolean;
  doneSets: number;
  cue: string;
  rx: string;
  howTo: string[];
  videoUrl: string;   // watch URL, "" if none
  plateHtml: string;  // trusted plate-math HTML, "" if none
  group: "main" | "finisher";
}

export interface PlayerWarmupItem { idx: number; line: string; checked: boolean }

export interface SwapAlternative { eid: string; name: string; tag: string }

export interface SessionPlayerActions {
  logSet: (ex: PlayerExercise, data: { reps: number; weightLb: number; outcome: string }) => Promise<{ ok: boolean; isPR?: boolean }>;
  toggleWarmup: (idx: number, checked: boolean) => void;
  addFinisher: () => Promise<PlayerExercise[]>; // returns the FULL new exercise list
  getAlternatives: (ex: PlayerExercise) => Promise<SwapAlternative[]>;
  swapExercise: (ex: PlayerExercise, altEid: string) => Promise<PlayerExercise[]>; // FULL new list
  finish: () => void;
  exit: () => void;
}

export interface SessionPlayerProps {
  title: string;
  coached: boolean;
  exercises: PlayerExercise[];
  warmup: PlayerWarmupItem[];
  finisherOffer: string;  // "" when none available / already added
  finisherText: string;   // plan.finisher free text, "" if none
  formatW: (lb: number, isRun: boolean) => string;
  actions: SessionPlayerActions;
}

type Phase = "warmup" | "lift" | "rest" | "done";

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
  const [list, setList] = useState(p.exercises);
  const allDoneAtStart = p.exercises.length > 0 && p.exercises.every((e) => e.doneSets >= e.sets);
  const nothingLogged = p.exercises.every((e) => e.doneSets === 0);
  const [idx, setIdx] = useState(Math.max(0, p.exercises.findIndex((e) => e.doneSets < e.sets)));
  const [done, setDone] = useState(() => p.exercises.map((e) => e.doneSets));
  const [wLb, setWLb] = useState(() => p.exercises.map((e) => e.weightLb));
  const [reps, setReps] = useState(() => p.exercises.map((e) => e.reps));
  const [feel, setFeel] = useState("ok");
  const [phase, setPhase] = useState<Phase>(allDoneAtStart ? "done" : (p.warmup.length && nothingLogged ? "warmup" : "lift"));
  const [wuChecked, setWuChecked] = useState(() => p.warmup.map((w) => w.checked));
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(1);
  const [restNext, setRestNext] = useState("");
  const [prFlash, setPrFlash] = useState(false);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState(false);
  const [exitAsk, setExitAsk] = useState(false);
  const [finisherAdded, setFinisherAdded] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [alts, setAlts] = useState<SwapAlternative[] | null>(null);
  const [prName, setPrName] = useState("");
  const [prWeight, setPrWeight] = useState(0);
  const restUntil = useRef(0);
  const startTs = useRef(Date.now());

  const ex = list[idx];
  const totalSets = list.reduce((t, e) => t + e.sets, 0);
  const doneTotal = done.reduce((t, d, i) => t + Math.min(d, list[i].sets), 0);
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

  const nextIncomplete = (from: number, doneArr: number[], inList: PlayerExercise[]): number | null => {
    for (let k = 0; k < inList.length; k++) {
      const i = (from + k) % inList.length;
      if (doneArr[i] < inList[i].sets) return i;
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
    // First press of + on an unloaded barbell lift starts at the empty bar (45),
    // not 0+5 — an uncalibrated lift should never feel broken.
    if (kind === "w") setWLb((arr) => arr.map((v, i) => (i === idx ? Math.max(0, v === 0 && dir === 1 && ex.plateHtml ? 45 : v + dir * ex.stepLb) : v)));
    else setReps((arr) => arr.map((v, i) => (i === idx ? Math.max(1, v + dir) : v)));
  };

  const openSwap = async () => {
    setSwapOpen(true);
    setAlts(null);
    const list = await a.getAlternatives(ex);
    setAlts(list || []);
  };

  const doSwap = async (altEid: string) => {
    if (busy) return;
    setBusy(true);
    const full = await a.swapExercise(ex, altEid);
    setBusy(false);
    setSwapOpen(false);
    if (!full || !full.length) return;
    setList(full);
    setDone(full.map((e) => e.doneSets));
    setWLb(full.map((e) => e.weightLb));
    setReps(full.map((e) => e.reps));
  };

  const logCurrent = async () => {
    if (busy) return;
    setBusy(true);
    const r = await a.logSet(ex, { reps: reps[idx], weightLb: wLb[idx], outcome: feel });
    setBusy(false);
    if (!r.ok) return;
    if (r.isPR) { setPrName(ex.name); setPrWeight(wLb[idx]); setPrFlash(true); setTimeout(() => setPrFlash(false), 2600); }
    const nd = done.slice();
    nd[idx] = nd[idx] + 1;
    setDone(nd);
    setFeel("ok");
    setInfo(false);
    if (nd[idx] >= ex.sets) {
      const n = nextIncomplete(idx + 1, nd, list);
      if (n == null) { setPhase("done"); return; }
      setIdx(n);
      startRest(ex.restSec, `Next up: ${list[n].name}`);
    } else {
      startRest(ex.restSec, `Next: set ${nd[idx] + 1} of ${ex.sets} — ${ex.name}`);
    }
  };

  const skipExercise = () => {
    const n = nextIncomplete(idx + 1, done, list);
    if (n == null || n === idx) { setPhase("done"); return; }
    setIdx(n);
    setInfo(false);
    setPhase("lift");
  };

  const addFinisher = async () => {
    if (busy) return;
    setBusy(true);
    const full = await a.addFinisher();
    setBusy(false);
    if (!full || full.length <= list.length) return;
    const nd = full.map((e, i) => (i < done.length ? done[i] : e.doneSets));
    setList(full);
    setDone(nd);
    setWLb(full.map((e, i) => (i < wLb.length ? wLb[i] : e.weightLb)));
    setReps(full.map((e, i) => (i < reps.length ? reps[i] : e.reps)));
    setFinisherAdded(true);
    const n = nextIncomplete(list.length, nd, full);
    if (n != null) { setIdx(n); setPhase("lift"); }
  };

  const elapsed = fmtClock((Date.now() - startTs.current) / 1000);
  const repLab = ex ? (ex.runTempo ? "min" : ex.isRun ? "intervals" : "reps") : "reps";
  const R = 84, CIRC = 2 * Math.PI * R;
  const wuAllChecked = wuChecked.every(Boolean);

  return (
    <div class="sp-overlay" role="dialog" aria-modal="true" aria-label="Workout session">
      <div class="sp-top">
        <button type="button" class="sp-close" aria-label="Exit or finish session" onClick={() => setExitAsk(true)}>×</button>
        <div class="sp-top-mid">
          <div class="sp-top-title">{p.title}</div>
          <div class="sp-top-sub">{doneTotal} of {totalSets} sets · {list.length} exercise{list.length !== 1 ? "s" : ""}</div>
        </div>
        <div class="sp-top-count">{Math.min(idx + 1, list.length)}/{list.length}</div>
      </div>
      <div class="sp-progress"><div class="sp-progress-fill" style={`width:${pct}%`}></div></div>

      {phase === "warmup" ? (
        <div class="sp-main sp-warmup">
          <div class="sp-kicker">Warm-up</div>
          <div class="sp-exname" style="font-size:26px">Get the body ready</div>
          <div class="sp-wu-list">
            {p.warmup.map((w, i) => (
              <button key={w.idx} type="button" class={`sp-wu-item ${wuChecked[i] ? "on" : ""}`} onClick={() => { const c = wuChecked.slice(); c[i] = !c[i]; setWuChecked(c); a.toggleWarmup(w.idx, c[i]); }}>
                <span class="sp-wu-box" aria-hidden="true">{wuChecked[i] ? "✓" : ""}</span>{w.line}
              </button>
            ))}
          </div>
          <button type="button" class="sp-log" onClick={() => setPhase("lift")}>{wuAllChecked ? "Start main work" : "Skip to main work"}</button>
        </div>
      ) : null}

      {phase === "lift" && ex ? (
        <div class="sp-main">
          {ex.group === "finisher" ? <div class="sp-kicker" style="color:var(--gold)">Finisher · set {Math.min(done[idx] + 1, ex.sets)} of {ex.sets}</div> : <div class="sp-kicker">Set {Math.min(done[idx] + 1, ex.sets)} of {ex.sets}</div>}
          <div class="sp-exname">{ex.name}</div>
          {p.coached
            ? (ex.cue ? <p class="sp-cue">{ex.cue}</p> : null)
            : <p class="sp-rx">{ex.rx}{ex.restSec ? ` · rest ${fmtClock(ex.restSec)}` : ""}</p>}
          <div class="sp-adjust-row">
            <div class="sp-adjust">
              <button type="button" class="sp-step" aria-label="Decrease load" onClick={() => adj("w", -1)}>−</button>
              <div class="sp-adjust-val">{wLb[idx] === 0 && !ex.isRun
                ? <><b>BW</b><span>{ex.plateHtml ? "tap + to load the bar" : "bodyweight"}</span></>
                : <><b>{p.formatW(wLb[idx], ex.isRun)}</b><span>{ex.isRun ? "pace" : "load"}</span></>}</div>
              <button type="button" class="sp-step" aria-label="Increase load" onClick={() => adj("w", 1)}>+</button>
            </div>
            <div class="sp-adjust">
              <button type="button" class="sp-step" aria-label="Decrease reps" onClick={() => adj("r", -1)}>−</button>
              <div class="sp-adjust-val"><b>{reps[idx]}</b><span>{repLab}</span></div>
              <button type="button" class="sp-step" aria-label="Increase reps" onClick={() => adj("r", 1)}>+</button>
            </div>
          </div>
          {ex.plateHtml ? <div class="sp-plates" dangerouslySetInnerHTML={{ __html: ex.plateHtml }} /> : null}
          <div class="sp-feel-row" role="radiogroup" aria-label="How did that feel">
            {FEELS.map(([v, coachedLbl, proLbl]) => (
              <button key={v} type="button" role="radio" aria-checked={feel === v} class={`sp-feel ${feel === v ? "on" : ""}`} onClick={() => setFeel(v)}>{p.coached ? coachedLbl : proLbl}</button>
            ))}
          </div>
          <button type="button" class="sp-log" onClick={logCurrent} disabled={busy}>{busy ? "Saving…" : "Log set"}</button>
          <div class="sp-secondary-row">
            {(ex.howTo.length || ex.videoUrl) ? <button type="button" class="sp-ghost-btn" onClick={() => setInfo(true)}>How to & video</button> : null}
            {ex.group === "main" ? <button type="button" class="sp-ghost-btn" onClick={openSwap}>Swap</button> : null}
            <button type="button" class="sp-ghost-btn" onClick={skipExercise}>Skip</button>
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
            <button type="button" class="sp-ghost-btn" onClick={() => { restUntil.current = Math.max(Date.now() + 3000, restUntil.current - 30000); }}>−30s</button>
            <button type="button" class="sp-log sp-log-sm" onClick={() => setPhase("lift")}>Skip rest</button>
            <button type="button" class="sp-ghost-btn" onClick={() => { restUntil.current += 30000; setRestTotal((t) => t + 30); }}>+30s</button>
          </div>
        </div>
      ) : null}

      {phase === "done" ? (
        <div class="sp-main sp-done">
          <div class="sp-done-check" aria-hidden="true">✓</div>
          <div class="sp-exname">Session complete</div>
          <p class="sp-done-stats">{doneTotal} set{doneTotal !== 1 ? "s" : ""} logged · {elapsed} elapsed</p>
          {p.finisherOffer && !finisherAdded ? (
            <button type="button" class="sp-finisher-btn" onClick={addFinisher} disabled={busy}>{busy ? "Adding…" : p.finisherOffer}</button>
          ) : null}
          {p.finisherText ? <p class="sp-cue">Optional finisher: {p.finisherText}</p> : null}
          <p class="sp-cue">{p.coached ? "Finishing updates tomorrow's targets from what you just did." : "Finalize to run day adaptation on today's log."}</p>
          <button type="button" class="sp-log" onClick={() => a.finish()}>Finish session</button>
          <div class="sp-secondary-row">
            <button type="button" class="sp-ghost-btn" onClick={() => a.exit()}>Back to Today</button>
          </div>
        </div>
      ) : null}

      {info && ex ? (
        <div class="sp-sheet-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setInfo(false); }}>
          <div class="sp-sheet" role="dialog" aria-label={`How to: ${ex.name}`}>
            <div class="sp-sheet-title">{ex.name}</div>
            {ex.howTo.length ? <ol class="sp-howto">{ex.howTo.map((s, i) => <li key={i}>{s}</li>)}</ol> : <p class="sp-cue">{ex.cue || "No written guide for this one yet."}</p>}
            {ex.videoUrl ? <a class="sp-video-link" href={ex.videoUrl} target="_blank" rel="noopener noreferrer">▶ Watch video demo</a> : null}
            <button type="button" class="sp-log sp-log-sm" onClick={() => setInfo(false)}>Back to the set</button>
          </div>
        </div>
      ) : null}

      {prFlash ? (
        <div class="sp-pr-burst" role="status" aria-live="assertive">
          <div class="sp-pr-card">
            <div class="sp-pr-trophy" aria-hidden="true">🏆</div>
            <div class="sp-pr-title">New record!</div>
            <div class="sp-pr-detail">{prName}{prWeight > 0 ? ` · ${p.formatW(prWeight, false)}` : ""}</div>
          </div>
        </div>
      ) : null}

      {swapOpen && ex ? (
        <div class="sp-sheet-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setSwapOpen(false); }}>
          <div class="sp-sheet" role="dialog" aria-label={`Swap ${ex.name}`}>
            <div class="sp-sheet-title">Swap {ex.name}</div>
            <p class="sp-cue" style="margin:0 0 12px">Alternatives hit the same muscles. Your logged sets stay logged.</p>
            {alts === null ? <p class="sp-cue">Finding matches…</p>
              : alts.length === 0 ? <p class="sp-cue">No close matches in the catalog for this one.</p>
              : <div class="sp-swap-list">{alts.map((alt) => (
                  <button key={alt.eid} type="button" class="sp-swap-opt" disabled={busy} onClick={() => doSwap(alt.eid)}>
                    <span class="sp-swap-name">{alt.name}</span>
                    {alt.tag ? <span class="sp-swap-tag">{alt.tag}</span> : null}
                  </button>
                ))}</div>}
            <button type="button" class="sp-ghost-btn" onClick={() => setSwapOpen(false)}>Keep {ex.name}</button>
          </div>
        </div>
      ) : null}

      {exitAsk ? (
        <div class="sp-sheet-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setExitAsk(false); }}>
          <div class="sp-sheet" role="dialog" aria-label="Leave session">
            <div class="sp-sheet-title">Done for today?</div>
            <p class="sp-cue">{doneTotal > 0 ? `You've logged ${doneTotal} set${doneTotal !== 1 ? "s" : ""}. Finishing saves them and updates tomorrow's targets.` : "Nothing logged yet — you can leave and pick this up later."}</p>
            {doneTotal > 0 ? <button type="button" class="sp-log sp-log-sm" onClick={() => a.finish()}>Finish & save</button> : null}
            <button type="button" class="sp-ghost-btn" onClick={() => a.exit()}>Leave — resume later</button>
            <button type="button" class="sp-ghost-btn" onClick={() => setExitAsk(false)}>Keep training</button>
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
