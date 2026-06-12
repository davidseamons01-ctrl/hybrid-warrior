// Strength Progress (feature) — per-lift estimated-1RM trend sparklines + weekly
// volume bars, on the You / Overview dashboard, in the Blackout-Pro language.
// Pure SVG (no chart lib); ui.js computes the series from the log.
import { render } from "preact";

export interface SPLift { label: string; has: boolean; points: number[]; current: string; deltaPct: number }
export interface SPVolBar { week: string; value: number }
export interface StrengthProgressProps {
  unit: string;
  lifts: SPLift[];
  volumeBars: SPVolBar[];
  volumeMax: number;
}

function Sparkline({ points }: { points: number[] }) {
  const W = 100, H = 32, P = 3;
  const min = Math.min(...points), max = Math.max(...points), range = (max - min) || 1;
  const X = (i: number) => P + (points.length < 2 ? 0 : (i / (points.length - 1)) * (W - 2 * P));
  const Y = (v: number) => P + (1 - (v - min) / range) * (H - 2 * P);
  const line = points.map((v, i) => `${X(i).toFixed(2)},${Y(v).toFixed(2)}`).join(" ");
  const area = `${X(0).toFixed(2)},${H - P} ${line} ${X(points.length - 1).toFixed(2)},${H - P}`;
  return (
    <svg class="sp-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <polygon class="sp-spark-area" points={area} />
      <polyline class="sp-spark-line" points={line} />
      <circle class="sp-spark-dot" cx={X(points.length - 1)} cy={Y(points[points.length - 1])} r="2" />
    </svg>
  );
}

function StrengthProgress(p: StrengthProgressProps) {
  const lifts = p.lifts.filter((l) => l.has);
  return (
    <div class="sp-board card dash-span-full">
      <div class="card-h"><h2>Strength Progress</h2><span class="badge badge-ice">e1RM</span></div>

      {lifts.length ? (
        <div class="sp-lifts">
          {lifts.map((l) => (
            <div class="sp-lift" key={l.label}>
              <div class="sp-lift-head">
                <span class="sp-lift-label">{l.label}</span>
                <span class="sp-lift-cur">{l.current}<span class="sp-unit"> {p.unit}</span></span>
                {l.deltaPct !== 0 ? <span class={"sp-delta " + (l.deltaPct > 0 ? "up" : "down")}>{l.deltaPct > 0 ? "▲" : "▼"} {Math.abs(l.deltaPct)}%</span> : null}
              </div>
              <Sparkline points={l.points} />
            </div>
          ))}
        </div>
      ) : (
        <p class="sp-empty">Log a main lift across two sessions to see your trend.</p>
      )}

      {p.volumeBars.length ? (
        <div class="sp-vol-section">
          <div class="sp-section-lbl">Weekly volume · {p.unit}</div>
          <div class="sp-vol">
            {p.volumeBars.map((b, i) => (
              <div class="sp-vol-col-wrap" key={i} title={`${b.week}: ${b.value.toLocaleString()} ${p.unit}`}>
                <div class="sp-vol-col" style={`height:${p.volumeMax > 0 ? Math.max(3, (b.value / p.volumeMax) * 100) : 3}%`}></div>
                <div class="sp-vol-x">{b.week}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { StrengthProgress };

/** Mount the progress board (ui.js mounts + unwraps it into the dashboard grid). */
export function mountStrengthProgress(container: Element, props: StrengthProgressProps): void {
  render(<StrengthProgress {...props} />, container as unknown as import("preact").ContainerNode);
}
