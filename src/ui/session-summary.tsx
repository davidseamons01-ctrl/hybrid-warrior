// Post-workout session summary (feature, styled in Blackout Pro) — shown when a
// session is finalized. A celebratory recap: total volume hero number, sets/reps/
// exercises/streak stat grid, personal-record callouts, the muscle map worked,
// and session feel. Pure presentation; ui.js computes the numbers and owns close.
import { render } from "preact";

export interface SummaryStat { label: string; value: string; accent?: boolean }
export interface SummaryPR { name: string; detail: string }

export interface SessionSummaryProps {
  dateLabel: string;
  volume: string;        // preformatted (tabular, thousands-separated)
  volumeUnit: string;
  stats: SummaryStat[];  // Sets / Reps / Exercises / Streak
  prs: SummaryPR[];
  feelLabel: string;     // "" when not rated
  runLabel: string;      // "" when no cardio
  anatomyHtml: string;   // trusted muscle map (mergeZones → anatomyContainer)
  adaptationApplied: boolean;
  onClose: () => void;
  onViewLog: () => void;
}

function SessionSummary(p: SessionSummaryProps) {
  return (
    <div class="ss-overlay" role="dialog" aria-modal="true" aria-labelledby="ss-title" onClick={(e) => { if (e.target === e.currentTarget) p.onClose(); }}>
      <div class="ss-card">
        <button type="button" class="ss-close" aria-label="Close" onClick={() => p.onClose()}>×</button>
        <div class="ss-kicker">✓ Session Complete</div>
        <div class="ss-date" id="ss-title">{p.dateLabel}</div>

        <div class="ss-hero">
          <div class="ss-hero-num">{p.volume}</div>
          <div class="ss-hero-lbl">{p.volumeUnit} total volume</div>
        </div>

        <div class="ss-stats">
          {p.stats.map((s) => (
            <div class={"ss-stat" + (s.accent ? " ss-stat-accent" : "")} key={s.label}>
              <div class="ss-stat-val">{s.value}</div>
              <div class="ss-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {p.prs.length ? (
          <div class="ss-section ss-prs">
            <div class="ss-section-lbl">🏆 Personal Records</div>
            {p.prs.map((pr, i) => (
              <div class="ss-pr-row" key={i}>
                <span class="ss-pr-name">{pr.name}</span>
                <span class="ss-pr-detail">{pr.detail}</span>
              </div>
            ))}
          </div>
        ) : null}

        {p.runLabel ? <div class="ss-line"><span class="ss-line-lbl">Cardio</span><span class="ss-line-val">{p.runLabel}</span></div> : null}
        {p.feelLabel ? <div class="ss-line"><span class="ss-line-lbl">Felt</span><span class="ss-line-val">{p.feelLabel}</span></div> : null}

        <div class="ss-section">
          <div class="ss-section-lbl">Muscles worked</div>
          <div class="ss-anatomy" dangerouslySetInnerHTML={{ __html: p.anatomyHtml }} />
        </div>

        {p.adaptationApplied ? <p class="ss-adapt">Adaptation applied — tomorrow's targets are updated.</p> : null}

        <div class="ss-actions">
          <button type="button" class="btn btn-secondary-solid btn-block" onClick={() => p.onViewLog()}>View log</button>
          <button type="button" class="btn btn-cta btn-block" onClick={() => p.onClose()}>Done</button>
        </div>
      </div>
    </div>
  );
}

export { SessionSummary };

/** Mount the summary into a container (ui.js creates/removes it). */
export function mountSessionSummary(container: Element, props: SessionSummaryProps): void {
  render(<SessionSummary {...props} />, container as unknown as import("preact").ContainerNode);
}
