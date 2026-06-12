// Exercise card — the per-exercise unit of a training session (video, muscle
// map, feel chips, per-set quick-log, log-all, notes, rest/skip/swap). This is
// the heart of the Train screen and the riskiest code in the app, so step 1 of
// its port is deliberately conservative: a STATELESS component that renders the
// exact same DOM (ids/classes/data-attributes) the previous string template did.
// It is mounted once per render and never updates, so the proven imperative
// wiring in ui.js (bindToday) keeps driving every interaction on the real DOM —
// nothing about logging/PR/adaptation behavior changes. A selector-contract test
// pins the markup so a binding can never silently break. Interactivity will be
// lifted into the component in a later, isolated step.
import { render } from "preact";

export interface ExerciseCardProps {
  i: number;
  eid: string;
  originalEid: string;
  num: number;          // 1-based position
  done: boolean;
  exNm: string;
  rxText: string;       // formatPrescribedRx(ex)
  reason: string;
  repLab: string;       // Reps / Minutes / Intervals / Seconds
  restHuman: string;
  restTitle: string;
  unit: string;         // mass unit label
  feelLead: string;
  runEx: boolean;
  sets: number;
  reps: number;
  activeSet: number;
  wStep: number;        // load stepper delta
  quickWVal: string;    // tq-w initial value (load display or pace mm:ss)
  gridWVal: string;     // t-w initial value
  savedNote: string;
  hasShoe: boolean;
  // trusted, app-generated HTML fragments (rendered without an extra layout box)
  plateMathHtml: string;
  ghostHtml: string;
  cueRowHtml: string;
  mainVideoHtml: string;
  quickVideoHtml: string;
  howBlockHtml: string;
  anatomyHtml: string;
  runRpeSelectHtml: string;
  shoeHtml: string;
  lastLine: string;
  actions: ExerciseCardActions;
}

// Interaction handlers, lifted out of bindToday. Each takes the clicked/edited
// element and runs the same imperative DOM work the old global wiring did — so
// the component owns the wiring without holding state (no re-render hazard).
export interface ExerciseCardActions {
  noteInput: (el: HTMLTextAreaElement) => void;
  feelClick: (el: HTMLElement) => void;
  skip: (el: HTMLElement) => void;
  rest: (el: HTMLElement) => void;
  toggleBody: (el: HTMLElement) => void;
  step: (el: HTMLElement) => void;
  logSet: (el: HTMLElement) => void;
  copyPrev: (el: HTMLElement) => void;
  saveAll: (el: HTMLElement) => void;
}

/** Render trusted, app-generated HTML without adding a layout box. */
function Html({ html }: { html: string }) {
  return <div style="display:contents" dangerouslySetInnerHTML={{ __html: html }} />;
}

function Stepper({ id, value, delta, min, step, label, repLab, onStep }: {
  id: string; value: string | number; delta: number; min: number; step?: string; label?: string; repLab?: string; onStep: (el: HTMLElement) => void;
}) {
  return (
    <div>
      <label>{label ?? repLab}</label>
      <div class="stepper">
        <button type="button" class="step-btn" data-target={id} data-delta={-delta} onClick={(e) => onStep(e.currentTarget as HTMLElement)}>−</button>
        <input type="number" class="input-sm" id={id} value={value} min={min} step={step} />
        <button type="button" class="step-btn" data-target={id} data-delta={delta} onClick={(e) => onStep(e.currentTarget as HTMLElement)}>+</button>
      </div>
    </div>
  );
}

/** Load column with a bar-load helper (lift only); runs render a pace input. */
function LoadCol({ id, val, wStep, unit, i, onStep }: { id: string; val: string; wStep: number; unit: string; i: number; onStep: (el: HTMLElement) => void }) {
  return (
    <div>
      <label>Load ({unit})</label>
      <div class="stepper">
        <button type="button" class="step-btn" data-target={id} data-delta={-wStep} onClick={(e) => onStep(e.currentTarget as HTMLElement)}>−</button>
        <input type="number" class="input-sm" id={id} value={val} min="0" step="any" />
        <button type="button" class="step-btn" data-target={id} data-delta={wStep} onClick={(e) => onStep(e.currentTarget as HTMLElement)}>+</button>
        <button type="button" class="icon-btn q-load-helper" data-i={i} title="Open bar load helper" aria-label="Open bar load helper for load">🏋️</button>
      </div>
    </div>
  );
}

function PaceCol({ id, val }: { id: string; val: string }) {
  return (
    <div>
      <label>Pace (mm:ss/mi)</label>
      <input type="text" class="input-sm input-mmss" id={id} value={val} placeholder="8:42" inputmode="numeric" autocomplete="off" spellcheck={false} aria-label="Pace per mile" />
    </div>
  );
}

function OutcomeSelect({ id }: { id: string }) {
  return (
    <div>
      <label>Outcome</label>
      <select id={id} class="input-sm">
        <option value="ok">Completed</option>
        <option value="fail">Failed rep target</option>
        <option value="time">Time-capped</option>
      </select>
    </div>
  );
}

function ExerciseCard(p: ExerciseCardProps) {
  const { i, unit } = p;
  const a = p.actions;
  return (
    <div class={"ex-card" + (p.done ? " ex-done" : "")} id={"exc-" + i} data-eid={p.eid}>
      <div class="ex-top ex-top-row">
        <div class="ex-check">{p.done ? "✓" : ""}</div>
        <div class="ex-num">{p.num}</div>
        <div class="ex-info">
          <div class="ex-name-lg">{p.exNm}</div>
          {/* rxText is trusted app-generated HTML (rx-tag spans for warm-up/tempo/set-type) */}
          <div class="ex-rx-lg" dangerouslySetInnerHTML={{ __html: p.rxText }} />
          <Html html={p.plateMathHtml} />
          {p.lastLine ? <div class="ex-last-inline" style="font-size:11px;color:var(--ice);margin-top:2px">{p.lastLine}</div> : null}
          <Html html={p.ghostHtml} />
          <div class="ex-reason">{p.reason}</div>
          <Html html={p.cueRowHtml} />
        </div>
        <div class="ex-actions ex-actions-stack">
          <div class="ex-actions-primary">
            <button type="button" class="btn btn-sm btn-secondary-solid ex-rest" data-i={i} title={`Rest timer (${p.restTitle})`} onClick={(e) => a.rest(e.currentTarget as HTMLElement)}>Rest · {p.restHuman}</button>
            <button type="button" class="btn btn-sm btn-cta ex-toggle" data-i={i} onClick={(e) => a.toggleBody(e.currentTarget as HTMLElement)}>Details &amp; video</button>
          </div>
          <div class="ex-actions-secondary">
            <button type="button" class="ex-link-btn ex-skip" data-eid={p.eid} title="Remove from today's checklist" onClick={(e) => a.skip(e.currentTarget as HTMLElement)}>Skip</button>
            <span class="ex-actions-sep" aria-hidden="true">·</span>
            <button type="button" class="ex-link-btn ex-swap" data-orig={p.originalEid} title="Replace with a similar movement">Swap</button>
          </div>
        </div>
      </div>
      <div class="ex-body" id={"exb-" + i}>
        <div class="ex-video"><Html html={p.mainVideoHtml} /><Html html={p.quickVideoHtml} /></div>
        <Html html={p.howBlockHtml} />
        <div class="fig-wrap">
          <div class="fig-title">Muscle emphasis</div>
          <Html html={p.anatomyHtml} />
          <div class="fig-legend">
            <span><span class="dot" style="background:#00e676;opacity:1"></span>Primary</span>
            <span><span class="dot" style="background:#00e676;opacity:.72"></span>Secondary</span>
            <span><span class="dot" style="background:#00e676;opacity:.45"></span>Tertiary</span>
            <span><span class="dot" style="background:#ff6b35;opacity:.65"></span>Burn</span>
          </div>
        </div>
        <div class="feel-chips">
          <span>{p.feelLead}</span>
          <button type="button" class="feel-chip" data-feel="easy" data-i={i} onClick={(e) => a.feelClick(e.currentTarget as HTMLElement)}>Too easy (RPE &lt; 7)</button>
          <button type="button" class="feel-chip on" data-feel="ok" data-i={i} onClick={(e) => a.feelClick(e.currentTarget as HTMLElement)}>Just right (RPE 7-8)</button>
          <button type="button" class="feel-chip" data-feel="hard" data-i={i} onClick={(e) => a.feelClick(e.currentTarget as HTMLElement)}>Too hard (RPE 9+)</button>
        </div>
        <Html html={p.runRpeSelectHtml} />
        <div class="ex-note-wrap">
          <label class="ex-note-label">My notes for {p.exNm}</label>
          <textarea class="ex-note-input" data-eid={p.eid} placeholder="Cues, grip width, stance notes…" rows={2} maxlength={500} value={p.savedNote} onInput={(e) => a.noteInput(e.currentTarget as HTMLTextAreaElement)} />
          {p.savedNote ? <span class="ex-note-saved">Saved</span> : null}
        </div>
        <div class="quick-log-row">
          <span class="quick-set-indicator" id={"tq-set-lbl" + i} style="font-size:11px;color:var(--text3);align-self:center">Set {p.activeSet} of {p.sets}</span>
          <Stepper id={"tq-r" + i} value={p.reps} delta={1} min={1} repLab={p.repLab} onStep={a.step} />
          {p.runEx ? <PaceCol id={"tq-w" + i} val={p.quickWVal} /> : <LoadCol id={"tq-w" + i} val={p.quickWVal} wStep={p.wStep} unit={unit} i={i} onStep={a.step} />}
          <OutcomeSelect id={"tq-o" + i} />
          {p.runEx && p.hasShoe ? <div id={"shoe-pick-" + i}><Html html={p.shoeHtml} /></div> : null}
          <button type="button" class="btn btn-cta btn-block q-save" data-i={i} onClick={(e) => a.logSet(e.currentTarget as HTMLElement)}>Complete set &amp; start rest</button>
        </div>
        <details class="ex-logall-details" style="margin-top:6px">
          <summary style="font-size:11px;color:var(--text3);cursor:pointer">Log all sets at once</summary>
          <div class="ex-log-grid" style="margin-top:8px">
            <Stepper id={"t-s" + i} value={p.sets} delta={1} min={1} label="Sets" onStep={a.step} />
            <Stepper id={"t-r" + i} value={p.reps} delta={1} min={1} repLab={p.repLab} onStep={a.step} />
            {p.runEx ? <PaceCol id={"t-w" + i} val={p.gridWVal} /> : <LoadCol id={"t-w" + i} val={p.gridWVal} wStep={p.wStep} unit={unit} i={i} onStep={a.step} />}
            <OutcomeSelect id={"t-o" + i} />
            <button type="button" class="btn btn-sm btn-secondary-solid ex-copyprev" data-i={i} onClick={(e) => a.copyPrev(e.currentTarget as HTMLElement)}>Copy previous set</button>
            <button type="button" class="btn btn-cta btn-sm ex-save" data-i={i} onClick={(e) => a.saveAll(e.currentTarget as HTMLElement)}>Save all</button>
          </div>
        </details>
        <div id={"expdf-" + i} class="ex-pdf-area"></div>
      </div>
    </div>
  );
}

export { ExerciseCard };

/** Mount one exercise card into a host placeholder (called from ui.js). */
export function mountExerciseCard(container: Element, props: ExerciseCardProps): void {
  render(<ExerciseCard {...props} />, container as unknown as import("preact").ContainerNode);
}
