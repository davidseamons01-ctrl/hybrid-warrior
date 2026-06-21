// Partner Sessions — shared-block proposal (M4 scaffold, the showcase). Shows the
// smart-suggested shared compounds with each lifter's own scaled load, the vibe
// toggle, and a calibration prompt where a partner has no max. ui.js builds the
// props from the merge engine (suggestSharedLifts + mergeSession).
import { render } from "preact";

export interface ProposalLoad {
  uid: string; name: string; load: number; unit: string;
  maxSource: "logged" | "estimated" | "calibrated" | "none";
  needsCalibration: boolean;
}
export interface ProposalLift {
  eid: string; name: string; reason: string;
  scheme: { sets: number; reps: number; intensityPct: number };
  loads: ProposalLoad[];
}
export interface VibeOption { id: string; label: string }
export interface SharedBlockProposalActions {
  setVibe: (id: string) => void;
  removeLift: (eid: string) => void;
  addLift: () => void;
  calibrate: (eid: string, uid: string) => void;
  confirm: () => void;
  back: () => void;
}
export interface SharedBlockProposalProps {
  vibe: string;
  vibes: VibeOption[];
  lifts: ProposalLift[];
  actions: SharedBlockProposalActions;
  meUid: string;
}

const SRC_LABEL: Record<ProposalLoad["maxSource"], string> = {
  logged: "", estimated: "est.", calibrated: "set", none: "",
};

function SharedBlockProposal(p: SharedBlockProposalProps) {
  const a = p.actions;
  // Only MY uncalibrated loads block Start — partners set theirs on their own phones.
  const myCalib = p.lifts.some((l) => l.loads.some((x) => x.needsCalibration && x.uid === p.meUid));
  return (
    <div class="sbp card">
      <div class="card-h"><h2>Shared lifts</h2><span class="badge badge-fire">Together</span></div>
      <p class="sbp-sub">Done together at each lifter's own load, then you split to your own accessories.</p>

      <div class="sbp-vibes" role="tablist" aria-label="Intensity">
        {p.vibes.map((v) => (
          <button type="button" key={v.id} class={"sbp-vibe" + (v.id === p.vibe ? " on" : "")} aria-selected={v.id === p.vibe} onClick={() => a.setVibe(v.id)}>{v.label}</button>
        ))}
      </div>

      {p.lifts.length ? p.lifts.map((l) => (
        <div class="sbp-lift" key={l.eid}>
          <div class="sbp-lift-head">
            <span class="sbp-lift-name">{l.name}</span>
            <span class="sbp-lift-scheme">{l.scheme.sets}×{l.scheme.reps} · {l.scheme.intensityPct}%</span>
            <button type="button" class="sbp-remove" aria-label={`Remove ${l.name}`} onClick={() => a.removeLift(l.eid)}>×</button>
          </div>
          <div class="sbp-lift-reason">{l.reason}</div>
          <div class="sbp-loads">
            {l.loads.map((x) => (
              <div class={"sbp-load" + (x.needsCalibration ? " sbp-needs-cal" : "")} key={x.uid}>
                <span class="sbp-load-name">{x.name}</span>
                {x.needsCalibration ? (
                  x.uid === p.meUid
                    ? <button type="button" class="sbp-cal-btn" onClick={() => a.calibrate(l.eid, x.uid)}>Set a max</button>
                    : <span class="sbp-load-pending">sets on their phone</span>
                ) : (
                  <span class="sbp-load-val">{x.load}<span class="sbp-load-unit"> {x.unit}</span>{SRC_LABEL[x.maxSource] ? <span class="sbp-load-src"> {SRC_LABEL[x.maxSource]}</span> : null}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )) : <p class="sbp-empty">No shared lift works for everyone's equipment/goals — add one manually.</p>}

      <button type="button" class="btn btn-ghost btn-sm btn-block sbp-add" onClick={() => a.addLift()}>+ Add a lift</button>

      <div class="sbp-actions">
        <button type="button" class="btn btn-secondary-solid sbp-back" onClick={() => a.back()}>Back</button>
        <button type="button" class="btn btn-cta btn-block sbp-confirm" disabled={myCalib || !p.lifts.length} onClick={() => a.confirm()}>
          {myCalib ? "Set your max first" : "Start lifting →"}
        </button>
      </div>
    </div>
  );
}

export { SharedBlockProposal };
export function mountSharedBlockProposal(container: Element, props: SharedBlockProposalProps): void {
  render(<SharedBlockProposal {...props} />, container as unknown as import("preact").ContainerNode);
}
