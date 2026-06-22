// Partner Sessions — program-based matchmaking board (redesign). Each lifter taps
// exercises from their OWN programmed day into the shared middle column; whatever's
// left stays as their solo accessories. The middle shows every lifter's resolved
// load (programmed kept, borrowed estimated). Stateless — PartnerApp owns the
// session writes (toggle/remove patch the jointLifts map; calibrate opens the sheet).
import { render } from "preact";
import type { DayPlanItem, JointLift, JointRx } from "../core/partner-match";

export interface MatchParticipant { uid: string; name: string; dayPlan: DayPlanItem[]; rx: JointRx[] }
export interface MatchBoardActions {
  toggle: (item: DayPlanItem) => void;
  remove: (eid: string) => void;
  calibrate: (rx: JointRx) => void;
  start: () => void;
  back: () => void;
}
export interface MatchBoardProps {
  meUid: string;
  participants: MatchParticipant[];
  joints: JointLift[];
  unit: string;
  busy?: boolean;
  actions: MatchBoardActions;
}

const rxFor = (p: MatchParticipant, eid: string) => p.rx.find((r) => r.eid === eid);
function loadLabel(rx: JointRx | undefined, unit: string): { text: string; cls: string } {
  if (!rx) return { text: "…", cls: "mb-load-wait" };
  if (rx.source === "needs-calibration") return { text: "Set a max", cls: "mb-load-cal" };
  if (rx.load <= 0) return { text: `BW · ${rx.sets}×${rx.reps}`, cls: "mb-load-bw" };
  return { text: `${rx.load} ${unit} · ${rx.sets}×${rx.reps}${rx.source === "estimated" ? " est." : ""}`, cls: rx.source === "estimated" ? "mb-load-est" : "mb-load-prog" };
}

function Tile(p: { item: DayPlanItem; inJoint: boolean; unit: string; onTap: () => void }) {
  const { item } = p;
  const load = item.load > 0 ? `${item.load} ${p.unit}` : "BW";
  return (
    <button type="button" class={`mb-tile${p.inJoint ? " in" : ""}`} onClick={p.onTap} aria-pressed={p.inJoint}>
      <span class="mb-tile-name">{item.name}</span>
      <span class="mb-tile-rx">{item.sets}×{item.reps} · {load}</span>
      <span class="mb-tile-mark">{p.inJoint ? "✓ shared" : "+ share"}</span>
    </button>
  );
}

function MatchBoard(p: MatchBoardProps) {
  const a = p.actions;
  const me = p.participants.find((x) => x.uid === p.meUid);
  const others = p.participants.filter((x) => x.uid !== p.meUid);
  const jointEids = new Set(p.joints.map((j) => j.eid));
  const myNeedsCal = (me?.rx || []).filter((r) => jointEids.has(r.eid) && r.source === "needs-calibration");
  const canStart = p.joints.length > 0 && myNeedsCal.length === 0;

  return (
    <div class="mb-flow">
      <div class="mb-head"><h2>Build today together</h2><span class="mb-sub">Tap your lifts into the middle to do them together — each at your own load. The rest you'll do solo.</span></div>

      <div class="mb-board">
        {/* My plan */}
        <div class="mb-col mb-col-me">
          <div class="mb-col-h">Your plan</div>
          {me && me.dayPlan.length
            ? me.dayPlan.map((it) => <Tile key={it.eid} item={it} unit={p.unit} inJoint={jointEids.has(it.eid)} onTap={() => a.toggle(it)} />)
            : <div class="mb-empty">No lifts programmed today — your partner can still pull you into theirs.</div>}
        </div>

        {/* Shared middle */}
        <div class="mb-col mb-col-joint">
          <div class="mb-col-h">Together <span class="mb-count">{p.joints.length}</span></div>
          {p.joints.length === 0 ? <div class="mb-empty">Nothing shared yet. Tap a lift from either side.</div> : null}
          {p.joints.map((j) => (
            <div class="mb-joint-lift" key={j.eid}>
              <div class="mb-joint-top">
                <span class="mb-joint-name">{j.name}</span>
                <button type="button" class="mb-remove" aria-label={`Remove ${j.name}`} onClick={() => a.remove(j.eid)}>×</button>
              </div>
              {p.participants.map((pt) => {
                const rx = rxFor(pt, j.eid);
                const lbl = loadLabel(rx, p.unit);
                const mine = pt.uid === p.meUid;
                return (
                  <div class="mb-load-row" key={pt.uid}>
                    <span class="mb-load-who">{pt.name}</span>
                    {lbl.cls === "mb-load-cal"
                      ? (mine
                          ? <button type="button" class="mb-load-cal" onClick={() => rx && a.calibrate(rx)}>Set a max</button>
                          : <span class="mb-load-wait">sets on their phone</span>)
                      : <span class={`mb-load ${lbl.cls}`}>{lbl.text}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Partner plan(s) */}
        <div class="mb-col mb-col-partner">
          {others.map((o) => (
            <div class="mb-partner" key={o.uid}>
              <div class="mb-col-h">{o.name}'s plan</div>
              {o.dayPlan.length
                ? o.dayPlan.map((it) => (
                    <div class={`mb-ptile${jointEids.has(it.eid) ? " in" : ""}`} key={it.eid}>
                      <span class="mb-tile-name">{it.name}</span>
                      <span class="mb-tile-rx">{it.sets}×{it.reps}{it.load > 0 ? ` · ${it.load} ${p.unit}` : ""}</span>
                      {jointEids.has(it.eid) ? <span class="mb-tile-mark">✓</span> : null}
                    </div>
                  ))
                : <div class="mb-empty">No lifts today.</div>}
            </div>
          ))}
        </div>
      </div>

      <div class="mb-actions">
        <button type="button" class="btn btn-ghost mb-back" onClick={() => a.back()}>Back</button>
        <button type="button" class="btn btn-cta mb-start" disabled={!canStart || !!p.busy} onClick={() => a.start()}>
          {p.joints.length === 0 ? "Pick a shared lift" : myNeedsCal.length ? "Set your max first" : "Start lifting →"}
        </button>
      </div>
    </div>
  );
}

export { MatchBoard };
export function mountMatchBoard(container: Element, props: MatchBoardProps): void {
  render(<MatchBoard {...props} />, container as unknown as import("preact").ContainerNode);
}
