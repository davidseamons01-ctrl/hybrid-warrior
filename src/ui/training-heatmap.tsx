// Training Consistency heatmap (feature) — a GitHub-contributions-style grid of
// the last 13 weeks, each day shaded by training volume (orange intensity), with
// current/longest streak, this-month, and total-days stats. Blackout-Pro styled.
// Pure presentation; ui.js computes the grid + stats from the log.
import { render } from "preact";

export interface HMCell { level: number; isToday: boolean; title: string }
export interface TrainingHeatmapProps {
  weeks: HMCell[][];
  windowWeeks: number;
  currentStreak: number;
  longestStreak: number;
  thisMonth: number;
  totalDays: number;
}

function Stat({ val, label }: { val: number; label: string }) {
  return (
    <div class="hm-stat">
      <div class="hm-stat-val">{val}</div>
      <div class="hm-stat-lbl">{label}</div>
    </div>
  );
}

function TrainingHeatmap(p: TrainingHeatmapProps) {
  return (
    <div class="hm-board card dash-span-full">
      <div class="card-h">
        <h2>Training Consistency</h2>
        {p.currentStreak > 0 ? <span class="badge badge-fire">🔥 {p.currentStreak} day streak</span> : null}
      </div>

      <div class="hm-stats">
        <Stat val={p.currentStreak} label="Current" />
        <Stat val={p.longestStreak} label="Longest" />
        <Stat val={p.thisMonth} label="This month" />
        <Stat val={p.totalDays} label="Total days" />
      </div>

      <div class="hm-grid-wrap">
        <div class="hm-grid">
          {p.weeks.map((wk, i) => (
            <div class="hm-col" key={i}>
              {wk.map((c, j) => (
                <div key={j} class={"hm-cell hm-l" + c.level + (c.isToday ? " hm-today" : "")} title={c.title}></div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div class="hm-foot">
        <span class="hm-caption">Last {p.windowWeeks} weeks</span>
        <span class="hm-legend">
          Less
          <span class="hm-cell hm-l0"></span>
          <span class="hm-cell hm-l1"></span>
          <span class="hm-cell hm-l2"></span>
          <span class="hm-cell hm-l3"></span>
          <span class="hm-cell hm-l4"></span>
          More
        </span>
      </div>
    </div>
  );
}

export { TrainingHeatmap };

/** Mount the heatmap (ui.js mounts + unwraps it into the dashboard grid). */
export function mountTrainingHeatmap(container: Element, props: TrainingHeatmapProps): void {
  render(<TrainingHeatmap {...props} />, container as unknown as import("preact").ContainerNode);
}
