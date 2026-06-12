// Achievements wall (feature) — a badge grid across volume / streak / session /
// variety / block-completion milestones, each earned (orange, glowing) or locked
// (greyscale, with a progress bar). Builds on the app's existing milestone data.
// Blackout-Pro styled; ui.js computes earned/progress from the log.
import { render } from "preact";

export interface Achievement {
  icon: string;
  title: string;
  desc: string;
  earned: boolean;
  progressPct: number;
  progressLabel: string;
}
export interface AchievementsProps {
  earnedCount: number;
  totalCount: number;
  badges: Achievement[];
}

function AchievementsWall(p: AchievementsProps) {
  return (
    <div class="ach-board card dash-span-full">
      <div class="card-h">
        <h2>Achievements</h2>
        <span class="badge badge-fire">{p.earnedCount}/{p.totalCount} unlocked</span>
      </div>
      <div class="ach-grid">
        {p.badges.map((b, i) => (
          <div class={"ach-item " + (b.earned ? "ach-earned" : "ach-locked")} key={i}>
            <div class="ach-icon">{b.icon}</div>
            <div class="ach-title">{b.title}</div>
            <div class="ach-desc">{b.desc}</div>
            {b.earned ? (
              <div class="ach-status">✓ Unlocked</div>
            ) : (
              <div class="ach-progress">
                <div class="ach-bar"><div class="ach-bar-fill" style={`width:${b.progressPct}%`}></div></div>
                <div class="ach-prog-lbl">{b.progressLabel}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export { AchievementsWall };

/** Mount the achievements wall (ui.js mounts + unwraps it into the grid). */
export function mountAchievements(container: Element, props: AchievementsProps): void {
  render(<AchievementsWall {...props} />, container as unknown as import("preact").ContainerNode);
}
