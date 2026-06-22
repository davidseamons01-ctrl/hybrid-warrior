// Flexible weekly schedule planner. A board for one calendar week: each day gets
// a session (or Rest), with an optional per-day equipment override. Stateful and
// self-contained — ui.js opens it as an overlay and persists the result, either
// as a one-week override ("Apply this week") or the standing default ("Save as
// default"). Tap-friendly selects (no drag) so it's reliable on phones.
import { render } from "preact";
import { useState } from "preact/hooks";

export interface PlannerDay { date: string; dow: number; label: string; slot: string | null; equip?: string; isToday?: boolean }
export interface PlannerSessionOpt { slot: string; label: string }
export interface SchedulePlannerActions {
  apply: (days: PlannerDay[]) => void;
  saveDefault: (days: PlannerDay[]) => void;
  reset?: () => void;
  cancel: () => void;
}
export interface SchedulePlannerProps {
  weekLabel: string;
  days: PlannerDay[];
  sessionOptions: PlannerSessionOpt[];
  equipOptions: { value: string; label: string }[];
  canReset?: boolean;   // a custom default is active → offer "back to automatic"
  busy?: boolean;
  actions: SchedulePlannerActions;
}

function SchedulePlanner(p: SchedulePlannerProps) {
  const [board, setBoard] = useState<PlannerDay[]>(p.days);
  const set = (i: number, patch: Partial<PlannerDay>) => setBoard((b) => b.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const trainingDays = board.filter((d) => d.slot).length;
  const a = p.actions;

  return (
    <div class="sp-overlay" role="dialog" aria-modal="true" aria-label="Weekly schedule planner" onClick={(e) => { if (e.target === e.currentTarget) a.cancel(); }}>
      <div class="sp-sheet">
        <div class="sp-head">
          <div><h2>Plan your week</h2><span class="sp-week">{p.weekLabel}</span></div>
          <span class="sp-count">{trainingDays} training day{trainingDays === 1 ? "" : "s"}</span>
        </div>
        <p class="sp-sub">Put each session on the day that fits — or set a day to Rest. Switch a day to Home if you won't have your full gym; the workout adapts.</p>

        <div class="sp-rows">
          {board.map((d, i) => (
            <div class={`sp-row${d.slot ? " on" : ""}${d.isToday ? " today" : ""}`} key={d.date}>
              <div class="sp-day">{d.label}{d.isToday ? <span class="sp-today">today</span> : null}</div>
              <select class="sp-slot input-sm" value={d.slot ?? "rest"} onChange={(e) => set(i, { slot: (e.target as HTMLSelectElement).value === "rest" ? null : (e.target as HTMLSelectElement).value })}>
                <option value="rest">Rest / off</option>
                {p.sessionOptions.map((o) => <option value={o.slot} key={o.slot}>{o.label}</option>)}
              </select>
              {d.slot ? (
                <select class="sp-equip input-sm" value={d.equip || p.equipOptions[0]?.value} onChange={(e) => set(i, { equip: (e.target as HTMLSelectElement).value })}>
                  {p.equipOptions.map((o) => <option value={o.value} key={o.value}>{o.label}</option>)}
                </select>
              ) : <span class="sp-rest-lbl">—</span>}
            </div>
          ))}
        </div>

        <div class="sp-actions">
          <button type="button" class="btn btn-ghost sp-cancel" onClick={() => a.cancel()}>Cancel</button>
          <button type="button" class="btn btn-secondary-solid sp-save-default" disabled={!!p.busy} onClick={() => a.saveDefault(board)}>Save as my default</button>
          <button type="button" class="btn btn-cta sp-apply" disabled={!!p.busy} onClick={() => a.apply(board)}>Apply to this week</button>
        </div>
        <p class="sp-foot">“Apply to this week” changes just this week. “Save as my default” makes this your standing weekly pattern going forward.{p.canReset && p.actions.reset ? <> · <button type="button" class="sp-reset" onClick={() => p.actions.reset!()}>Back to my program’s automatic schedule</button></> : null}</p>
      </div>
    </div>
  );
}

export { SchedulePlanner };
export function mountSchedulePlanner(container: Element, props: SchedulePlannerProps): void {
  render(<SchedulePlanner {...props} />, container as unknown as import("preact").ContainerNode);
}
