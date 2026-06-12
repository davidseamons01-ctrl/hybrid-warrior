// Personal Records board (feature) — an all-time PR board on the You / Overview
// dashboard, styled in Blackout Pro. Big-3 estimated-1RM total hero, a card per
// main lift (best e1RM + the set that earned it + date), then other lifts ranked
// by e1RM. ui.js computes everything from the log; this is pure presentation.
import { render } from "preact";

export interface PRLift { label: string; e1rm: string; set: string; date: string; has: boolean }
export interface PROther { name: string; e1rm: string; set: string }
export interface PersonalRecordsProps {
  unit: string;
  total: string;
  totalHas: boolean;
  big3: PRLift[];
  others: PROther[];
}

function PersonalRecords(p: PersonalRecordsProps) {
  return (
    <div class="pr-board card dash-span-full">
      <div class="card-h"><h2>Personal Records</h2><span class="badge badge-fire">e1RM</span></div>

      <div class="pr-total">
        <div class="pr-total-num">{p.totalHas ? p.total : "—"}</div>
        <div class="pr-total-lbl">{p.unit} · Big 3 estimated total</div>
      </div>

      <div class="pr-big3">
        {p.big3.map((b) => (
          <div class={"pr-lift" + (b.has ? "" : " pr-lift-empty")} key={b.label}>
            <div class="pr-lift-label">{b.label}</div>
            <div class="pr-lift-e1rm">{b.has ? b.e1rm : "—"}{b.has ? <span class="pr-unit">{p.unit}</span> : null}</div>
            <div class="pr-lift-set">{b.set}</div>
            {b.date ? <div class="pr-lift-date">{b.date}</div> : null}
          </div>
        ))}
      </div>

      {p.others.length ? (
        <div class="pr-others">
          <div class="pr-others-lbl">More lifts</div>
          {p.others.map((o, i) => (
            <div class="pr-row" key={i}>
              <span class="pr-row-name">{o.name}</span>
              <span class="pr-row-meta"><b>{o.e1rm} {p.unit}</b> · {o.set}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { PersonalRecords };

/** Mount the PR board into a container (ui.js mounts + unwraps it into the grid). */
export function mountPersonalRecords(container: Element, props: PersonalRecordsProps): void {
  render(<PersonalRecords {...props} />, container as unknown as import("preact").ContainerNode);
}
