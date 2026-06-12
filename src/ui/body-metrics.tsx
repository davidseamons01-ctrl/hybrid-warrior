// Body Metrics (feature) — body-weight trend (the one body metric the app logs
// over time) with goal progress, plus a composition snapshot (body fat, waist/hip,
// V-taper, …). Blackout-Pro styled; weight uses a cooler ice accent to read as
// neutral data rather than "more = better". ui.js computes everything.
import { render } from "preact";

export interface BMTile { label: string; value: string; sub?: string }
export interface BodyMetricsProps {
  unit: string;
  hasWeight: boolean;
  weightPoints: number[];
  currentWeight: string;
  deltaLabel: string;
  deltaDir: number;        // 1 toward goal, -1 away, 0 flat/none
  goalLabel: string;
  goalPct: number;
  comp: BMTile[];
}

function Spark({ points }: { points: number[] }) {
  const W = 100, H = 34, P = 3;
  const min = Math.min(...points), max = Math.max(...points), range = (max - min) || 1;
  const X = (i: number) => P + (i / (points.length - 1)) * (W - 2 * P);
  const Y = (v: number) => P + (1 - (v - min) / range) * (H - 2 * P);
  const line = points.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const area = `${X(0).toFixed(1)},${H - P} ${line} ${X(points.length - 1).toFixed(1)},${H - P}`;
  return (
    <svg class="bm-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <polygon class="bm-spark-area" points={area} />
      <polyline class="bm-spark-line" points={line} />
      <circle class="bm-spark-dot" cx={X(points.length - 1)} cy={Y(points[points.length - 1])} r="2" />
    </svg>
  );
}

function BodyMetrics(p: BodyMetricsProps) {
  const dir = p.deltaDir > 0 ? "up" : p.deltaDir < 0 ? "down" : "flat";
  return (
    <div class="bm-board card dash-span-full">
      <div class="card-h"><h2>Body Metrics</h2></div>

      {p.hasWeight ? (
        <div class="bm-weight">
          <div class="bm-weight-num">{p.currentWeight}<span class="bm-unit"> {p.unit}</span></div>
          {p.deltaLabel ? <div class={"bm-delta " + dir}>{p.deltaLabel}</div> : null}
          {p.weightPoints.length >= 2 ? <Spark points={p.weightPoints} /> : null}
          {p.goalLabel ? (
            <div class="bm-goal">
              <div class="bm-goal-bar"><div class="bm-goal-fill" style={`width:${p.goalPct}%`}></div></div>
              <div class="bm-goal-lbl">{p.goalLabel} · {p.goalPct}%</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {p.comp.length ? (
        <div class={"bm-comp" + (p.hasWeight ? "" : " bm-comp-top")}>
          <div class="bm-section-lbl">Composition</div>
          <div class="bm-comp-grid">
            {p.comp.map((c, i) => (
              <div class="bm-tile" key={i}>
                <div class="bm-tile-val">{c.value}</div>
                <div class="bm-tile-lbl">{c.label}</div>
                {c.sub ? <div class="bm-tile-sub">{c.sub}</div> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { BodyMetrics };

/** Mount the body-metrics board (ui.js mounts + unwraps it into the grid). */
export function mountBodyMetrics(container: Element, props: BodyMetricsProps): void {
  render(<BodyMetrics {...props} />, container as unknown as import("preact").ContainerNode);
}
