// "Plan" tab — the 13-week training block: timeline, week accordion, and
// drag-to-reorder of exercises within a session. Third screen of the UI rebuild.
//
// The component owns view + interaction (expand/collapse, compact toggle, jump,
// drag-drop). The data layer (autoWeek, projections, persist, render) stays in
// ui.js behind typed action props and a pre-built view-model. Decorative panels
// that are produced by existing string-template helpers (anchor summary, "next
// training" dots, per-week rhythm strip) are passed through as TRUSTED html.
import { render } from "preact";
import { useState } from "preact/hooks";

export interface PlanExercise { eid: string; name: string; rx: string }

export interface PlanDay {
  dateIso: string; dateLong: string; dow: string;
  sessIdx: number; total: number; isToday: boolean; estMin: number;
  focusHead: string; phaseColor: string; phaseClass: string; phaseAbbrev: string; phaseName: string;
  exercises: PlanExercise[]; recovery: boolean; finisher: string | null;
}

export interface PlanWeek {
  week: number; phaseName: string; phaseBadgeClass: string; deload: boolean;
  isCurrent: boolean; isOpen: boolean; logLabel: string;
  rhythmHtml: string; days: PlanDay[] | null; emptyReason: string;
}

export interface PlanTimelineCell {
  week: number; phaseClass: string; current: boolean; complete: boolean; deload: boolean; phaseName: string;
}

export interface PlanHeatmap { glutes: number; core: number; back: number; posture: number }

export interface PlanWomenSummary {
  label: string; tier: string; life: string; eq: string; style: string;
  tracks: string[]; fa: string[];
}

export interface PlanActions {
  toggleCompact: () => void;
  jumpCurrent: () => void;
  selectWeek: (w: number) => void;   // timeline dot: set expanded week
  toggleWeek: (w: number) => void;   // accordion head: toggle expanded week
  reorder: (dateIso: string, fromEid: string, toEid: string) => void;
}

export interface PlanProps {
  compact: boolean;
  womenSimple: boolean;
  toggleLabel: string;
  context: { week: number; phaseName: string; slots: number; slotsPlural: boolean };
  heatmap: PlanHeatmap;
  women: PlanWomenSummary | null;
  anchorSummaryHtml: string;
  nextDotsHtml: string;
  timeline: PlanTimelineCell[];
  weeks: PlanWeek[];
  actions: PlanActions;
}

/** Render trusted, app-generated HTML without adding a layout box. */
function Html({ html }: { html: string }) {
  return <div style="display:contents" dangerouslySetInnerHTML={{ __html: html }} />;
}

type DragState = { eid: string; date: string } | null;

function ExRow({ ex, day, drag, setDrag, over, setOver, reorder }: {
  ex: PlanExercise; day: PlanDay; drag: DragState; setDrag: (d: DragState) => void;
  over: string | null; setOver: (e: string | null) => void;
  reorder: (dateIso: string, fromEid: string, toEid: string) => void;
}) {
  const isDragging = !!drag && drag.eid === ex.eid && drag.date === day.dateIso;
  const isOver = over === ex.eid && !!drag && drag.date === day.dateIso && drag.eid !== ex.eid;
  const cls = "pw-ex-row pw-ex-drag" + (isDragging ? " pw-ex-dragging" : "") + (isOver ? " pw-ex-drop-over" : "");
  return (
    <div
      class={cls}
      draggable
      data-date={day.dateIso}
      data-eid={ex.eid}
      onDragStart={(e) => {
        setDrag({ eid: ex.eid, date: day.dateIso });
        try { e.dataTransfer!.setData("text/plain", ex.eid); e.dataTransfer!.effectAllowed = "move"; } catch { /* noop */ }
      }}
      onDragOver={(e) => {
        if (!drag || drag.date !== day.dateIso) return;
        e.preventDefault();
        try { e.dataTransfer!.dropEffect = "move"; } catch { /* noop */ }
        if (over !== ex.eid) setOver(ex.eid);
      }}
      onDragLeave={() => { if (over === ex.eid) setOver(null); }}
      onDrop={(e) => {
        if (!drag || drag.date !== day.dateIso) return;
        e.preventDefault();
        const fromEid = drag.eid;
        setOver(null);
        if (fromEid && fromEid !== ex.eid) reorder(day.dateIso, fromEid, ex.eid);
      }}
      onDragEnd={() => { setDrag(null); setOver(null); }}
    >
      <span class="pw-ex-drag-hint" aria-hidden="true" title="Drag to reorder">⋮⋮</span>
      <span class={`pw-phase-tag ${day.phaseClass}`} title={day.phaseName}>{day.phaseAbbrev}</span>
      <div class="pw-ex-main"><b>{ex.name}</b><span>{ex.rx}</span></div>
    </div>
  );
}

function DayCard({ day, drag, setDrag, over, setOver, reorder }: {
  day: PlanDay; drag: DragState; setDrag: (d: DragState) => void;
  over: string | null; setOver: (e: string | null) => void;
  reorder: (dateIso: string, fromEid: string, toEid: string) => void;
}) {
  return (
    <div
      class={"pw-day" + (day.isToday ? " pw-day-today" : "")}
      style={`border-left:3px solid ${day.phaseColor};padding-left:10px;border-radius:8px;box-sizing:border-box`}
    >
      <div class="pw-day-label">
        <span class="pw-date-line" style={`color:${day.phaseColor}`}>{day.dateLong}</span>{" "}
        <span class="pw-day-dow">{day.dow}</span>{" "}
        <span class="pw-meta-muted">· Sess {day.sessIdx}/{day.total}</span>
        {day.isToday ? <>{" "}<span class="badge badge-ice pw-today-badge">Today</span></> : null}
        {day.estMin > 0 ? <>{" "}<span class="pw-est-min" title="Rough session length">~{day.estMin} min</span></> : null}{" "}
        <span class="badge pw-focus-badge" title="Session theme">{day.focusHead}</span>
      </div>
      {day.recovery ? (
        <div class="pw-ex-row pw-ex-recovery">
          <span class={`pw-phase-tag ${day.phaseClass}`} title={day.phaseName}>{day.phaseAbbrev}</span>
          <span>Recovery — walk or easy mobility</span>
        </div>
      ) : (
        day.exercises.map((ex) => (
          <ExRow key={ex.eid} ex={ex} day={day} drag={drag} setDrag={setDrag} over={over} setOver={setOver} reorder={reorder} />
        ))
      )}
      {day.finisher ? (
        <div class="pw-finisher-block" role="group" aria-label="Finisher">
          <span class="pw-finisher-label">Finisher</span>
          <div class="pw-finisher-txt">{day.finisher}</div>
        </div>
      ) : null}
    </div>
  );
}

function WeekCard({ wk, drag, setDrag, over, setOver, a }: {
  wk: PlanWeek; drag: DragState; setDrag: (d: DragState) => void;
  over: string | null; setOver: (e: string | null) => void; a: PlanActions;
}) {
  return (
    <div class={"pw-card" + (wk.isCurrent ? " pw-current" : "")}>
      <div class="pw-head" data-w={wk.week} onClick={() => a.toggleWeek(wk.week)}>
        <span class={"arrow" + (wk.isOpen ? " open" : "")}>▸</span>
        <span style="font-weight:700;font-size:13px">Week {wk.week}</span>
        <span class={`badge ${wk.phaseBadgeClass}`} style="font-size:9px">{wk.phaseName}{wk.deload ? " · Deload" : ""}</span>
        {wk.isCurrent ? <span class="badge badge-ice" style="font-size:9px">This training week</span> : null}
        <span style="font-size:10px;color:var(--text3);margin-left:auto">{wk.logLabel}</span>
      </div>
      <div class={"pw-body" + (wk.isOpen ? " open" : "")}>
        {wk.isOpen ? (
          wk.days && wk.days.length ? (
            <>
              <Html html={wk.rhythmHtml} />
              {wk.days.map((day) => (
                <DayCard key={day.dateIso} day={day} drag={drag} setDrag={setDrag} over={over} setOver={setOver} reorder={a.reorder} />
              ))}
            </>
          ) : (
            <div class="pw-ex-row" style="color:var(--text3)">{wk.emptyReason}</div>
          )
        ) : null}
      </div>
    </div>
  );
}

function PlanView(props: PlanProps) {
  const a = props.actions;
  const c = props.context;
  const hm = props.heatmap;
  const ws = props.women;
  const [drag, setDrag] = useState<DragState>(null);
  const [over, setOver] = useState<string | null>(null);

  return (
    <div class="plan-root">
      <div class="section">
        <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
          <h2 style="font-size:18px;font-weight:600;letter-spacing:-0.02em">Thirteen-week block</h2>
          <div class="row" style="gap:8px;align-items:center">
            <span style="font-size:12px;color:var(--text3)">Loads follow your logs</span>
            <button type="button" class="btn btn-sm btn-ghost" id="plan-compact-toggle" onClick={() => a.toggleCompact()}>{props.toggleLabel}</button>
          </div>
        </div>

        <div class="plan-context-card card section">
          <div class="plan-context-inner">
            <div>
              <div class="plan-context-kicker">You are here</div>
              <div class="plan-context-title">Week {c.week} of 13 · {c.phaseName}</div>
              <div class="plan-context-sub">{c.slots} session{c.slotsPlural ? "s" : ""} per training week · bar loads follow your logs</div>
            </div>
            <button type="button" class="btn btn-secondary-solid btn-sm" id="plan-jump-current" onClick={() => a.jumpCurrent()}>Open this week</button>
          </div>
        </div>

        <Html html={props.anchorSummaryHtml} />

        {ws ? (
          <div class="card plan-hide-women" style="margin-bottom:10px;border-left:3px solid var(--mint)">
            <div class="card-h"><h2>Women's Program Summary</h2><span class="badge badge-mint">{ws.label}</span></div>
            <div style="font-size:12px;color:var(--text2);margin-bottom:8px">Baseline: <b style="color:var(--text)">{ws.tier}</b> · Life stage: <b style="color:var(--text)">{ws.life}</b> · Equipment: <b style="color:var(--text)">{ws.eq}</b> · Session style: <b style="color:var(--text)">{ws.style}</b></div>
            <div style="display:grid;gap:4px">{ws.tracks.map((t, i) => <div key={i} style="font-size:11px;color:var(--text2)">• {t}</div>)}</div>
            {ws.fa.length ? <div style="margin-top:8px;font-size:10px;color:var(--text3)">Goals: {ws.fa.join(" · ")}</div> : null}
          </div>
        ) : null}

        <div class="card plan-hide-women" style="margin-bottom:10px">
          <div class="card-h"><h2>Expected Changes Heatmap</h2></div>
          <div class="row" style="gap:14px">
            <div style="font-size:11px;color:var(--text2)">Glutes <b style="color:var(--mint)">{hm.glutes}%</b></div>
            <div style="font-size:11px;color:var(--text2)">Core <b style="color:var(--mint)">{hm.core}%</b></div>
            <div style="font-size:11px;color:var(--text2)">Back <b style="color:var(--mint)">{hm.back}%</b></div>
            <div style="font-size:11px;color:var(--text2)">Posture <b style="color:var(--mint)">{hm.posture}%</b></div>
          </div>
        </div>

        <div class="plan-timeline-wrap plan-hide-women">
          <div class="timeline" role="list" aria-label="Training weeks 1 to 13">
            {props.timeline.map((t) => (
              <div
                key={t.week}
                class={`tl-wk ${t.phaseClass} ${t.current ? "current" : ""} ${t.complete ? "complete" : ""}`}
                data-w={t.week}
                role="listitem"
                title={`Week ${t.week} · ${t.phaseName}${t.deload ? " · Deload" : ""}`}
                onClick={() => a.selectWeek(t.week)}
              >{t.week}</div>
            ))}
          </div>
          <p class="plan-timeline-hint">Tap a number to expand that week · color = phase (legend below).</p>
        </div>

        <p class="plan-hide-women" style="font-size:11px;color:var(--text3);margin:8px 0 0;line-height:1.45">Weeks are <b style="color:var(--text2)">training weeks</b> ({c.slots} session{c.slotsPlural ? "s" : ""} each, in order from your start date — not Mon–Sun buckets).</p>

        <details class="plan-phase-legend card section plan-hide-women">
          <summary class="plan-phase-legend-sum">How phase colors work</summary>
          <p class="plan-phase-legend-note">Weeks <b>4</b> and <b>8</b> are deloads inside Hypertrophy and Strength. Week <b>13</b> is test / consolidation.</p>
          <ul class="plan-phase-legend-list">
            <li><span class="plan-phase-swatch tl-wk phase-hyp" aria-hidden="true"></span> Hypertrophy — weeks 1–4</li>
            <li><span class="plan-phase-swatch tl-wk phase-str" aria-hidden="true"></span> Strength — weeks 5–8</li>
            <li><span class="plan-phase-swatch tl-wk phase-peak" aria-hidden="true"></span> Peak — weeks 9–12</li>
            <li><span class="plan-phase-swatch tl-wk phase-test" aria-hidden="true"></span> Test — week 13</li>
          </ul>
        </details>

        <Html html={props.nextDotsHtml} />
      </div>

      <div class="stack" id="pw-list">
        {props.weeks.map((wk) => (
          <WeekCard key={wk.week} wk={wk} drag={drag} setDrag={setDrag} over={over} setOver={setOver} a={a} />
        ))}
      </div>
    </div>
  );
}

export { PlanView };

/** Mount the Plan tab into a container (called from ui.js). */
export function mountPlan(container: Element, props: PlanProps): void {
  render(<PlanView {...props} />, container as unknown as import("preact").ContainerNode);
}
