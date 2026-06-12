// Focus-mode shell (UI rebuild #4e) — the single-exercise carousel: top bar with
// exit + pagination dots, the swipeable viewport/track, prev/next nav, and the
// complete-session footer. The slides are exercise-card host placeholders that
// ui.js fills via mountTrainCards (the cards are already components). Stateless
// (swipe start tracked in a ref, no re-render): exit/prev/next and swipe dispatch
// to actions that move trainFocusIdx + re-render. train-clear-date and the
// session-finalize footer stay wired by bindToday (shared with normal mode).
import { render } from "preact";
import { useRef } from "preact/hooks";

export interface FocusShellActions {
  exit: () => void;
  prev: () => void;
  next: () => void;
}

export interface FocusShellProps {
  n: number;
  idx: number;
  day: string;
  breadcrumb: string;
  finalized: boolean;
  showClearDate: boolean;
  trainSessionDate: string;
  showCatchBanner: boolean;
  overlayHtml: string;       // setLoadOverlayHtml() — trusted
  actions: FocusShellActions;
}

const BLOCK_SEL = "button,a,input,select,textarea,label,iframe,.ex-log-grid,.quick-log-row,.feel-chips";

function FocusShell(p: FocusShellProps) {
  const a = p.actions;
  const n = p.n, idx = p.idx, tx = -(idx * 100) / n;
  const sx = useRef<number | null>(null);
  return (
    <div id="p-today" class="train-focus-mode train-session-active">
      {p.showClearDate
        ? <div class="session-banner" role="status"><span>Viewing <b style="color:var(--text)">{p.trainSessionDate}</b> — not today on the calendar.</span> <button type="button" class="btn btn-sm btn-secondary-solid" id="train-clear-date">Back to today</button></div>
        : null}
      {p.showCatchBanner
        ? <div class="session-banner" role="status">Catch-up session loaded — this is the workout that moved from a missed day. Log when done; the queue clears after you train.</div>
        : null}
      <div class="focus-session-bar">
        <button type="button" class="btn btn-ghost btn-sm" id="focus-exit" onClick={() => a.exit()}>← Full session</button>
        <span class="focus-session-title">Focused workout</span>
        <div class="focus-session-dots-wrap" aria-label="Exercise pagination" role="status">
          <div class="focus-session-dots">
            {Array.from({ length: n }, (_, i) => <span key={i} class={i === idx ? "on" : ""} title={`Exercise ${i + 1} of ${n}`}></span>)}
          </div>
        </div>
      </div>
      <div class="hero-title" style="font-size:17px;margin-bottom:2px">{p.day}</div>
      <div class="breadcrumb" style="font-size:12px;margin-bottom:8px">{p.breadcrumb}</div>
      <div
        class="focus-session-viewport"
        onPointerDown={(e) => { if (!e.isPrimary) return; const t = e.target as HTMLElement; if (t.closest && t.closest(BLOCK_SEL)) return; sx.current = e.clientX; }}
        onPointerUp={(e) => { if (!e.isPrimary || sx.current === null) return; const d = e.clientX - sx.current; sx.current = null; if (Math.abs(d) < 50) return; if (d < 0) a.next(); else a.prev(); }}
        onPointerCancel={() => { sx.current = null; }}
      >
        <div class="focus-session-track" style={`width:${n * 100}%;transform:translateX(${tx}%)`}>
          {Array.from({ length: n }, (_, i) => (
            <div key={i} class="focus-session-slide" style={`width:${100 / n}%;flex-shrink:0`}>
              <div class="exercise-card-host" data-card-i={i}></div>
            </div>
          ))}
        </div>
      </div>
      <div class="focus-nav-row">
        {idx > 0 ? <button type="button" class="btn btn-secondary-solid btn-sm" id="focus-prev" aria-label="Previous exercise" onClick={() => a.prev()}>‹ Previous</button> : null}
        {idx < n - 1 ? <button type="button" class="btn btn-ghost btn-sm" id="focus-next-skip" aria-label="Next exercise" onClick={() => a.next()}>Next ›</button> : null}
      </div>
      <p class="focus-hint">Use <b style="color:var(--text)">‹ ›</b> to change lifts. Tap <b style="color:var(--text)">Save all</b> to log this exercise.</p>
      <div class="train-session-footer"><button type="button" class="btn btn-mint btn-block session-finalize-sync">{p.finalized ? "Session complete" : "Complete session"}</button></div>
      <div style="display:contents" dangerouslySetInnerHTML={{ __html: p.overlayHtml }} />
    </div>
  );
}

export { FocusShell };

/** Mount the focus carousel into a host, then unwrap so #p-today sits where the
 *  slot was (byte-identical placement; mountTrainCards then fills the slides). */
export function mountFocusShell(container: Element, props: FocusShellProps): void {
  render(<FocusShell {...props} />, container as unknown as import("preact").ContainerNode);
}
