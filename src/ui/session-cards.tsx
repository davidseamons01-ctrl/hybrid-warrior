// Session-shell cards (UI rebuild #4c) — the self-contained interactive cards of
// the Train screen: pre-session readiness, post-session intensity rating, and the
// warm-up checklist. Each is stateless: clicks dispatch to ui.js actions that own
// the data layer (persist/render). readiness + session-feel re-render the whole
// pane (so they read their current value from props each mount); warm-up persists
// without re-render, so its checkboxes are effectively uncontrolled.
import { render } from "preact";

/* ── Readiness: how are you feeling? ─────────────────────────────────────── */
export interface ReadinessProps { readiness: string; onSelect: (v: string) => void }

function ReadinessCard({ readiness, onSelect }: ReadinessProps) {
  const Btn = ({ v, emoji, label, on }: { v: string; emoji: string; label: string; on: boolean }) => (
    <button type="button" class={"btn btn-sm readiness-btn" + (on ? " readiness-on" : "")} data-ready={v} onClick={() => onSelect(v)}>
      <span style="font-size:15px">{emoji}</span> {label}
    </button>
  );
  return (
    <div class="card section readiness-card">
      <div style="font-size:13px;font-weight:600;margin-bottom:6px">How are you feeling?</div>
      <div class="readiness-row">
        <Btn v="strong" emoji="💪" label="Strong" on={readiness === "strong"} />
        <Btn v="normal" emoji="👍" label="Normal" on={readiness === "normal" || !readiness} />
        <Btn v="fatigued" emoji="😴" label="Fatigued" on={readiness === "fatigued"} />
      </div>
      {readiness === "fatigued"
        ? <p style="font-size:11px;color:var(--gold);margin-top:8px;line-height:1.45">Loads eased ~5% for this session only — your program stays intact.</p>
        : readiness === "strong"
          ? <p style="font-size:11px;color:var(--mint);margin-top:8px;line-height:1.45">Targets nudged up ~3% — push it today.</p>
          : null}
    </div>
  );
}

export { ReadinessCard };
export function mountReadinessCard(container: Element, props: ReadinessProps): void {
  render(<ReadinessCard {...props} />, container as unknown as import("preact").ContainerNode);
}

/* ── Rate intensity: post-session RPE feel ───────────────────────────────── */
export interface SessionFeelProps {
  sf: string; savedLbl: string; finalized: boolean; dayIso: string;
  onFeel: (v: string) => void; onClear: () => void;
}

function SessionFeelCard({ sf, savedLbl, finalized, dayIso, onFeel, onClear }: SessionFeelProps) {
  const FBtn = ({ v, label }: { v: string; label: string }) => (
    <button type="button" class={"btn btn-sm " + (sf === v ? "btn-fire" : "btn-secondary-solid")} data-sfeel={v} onClick={() => onFeel(v)}>{label}</button>
  );
  return (
    <div class="card section" id="session-after-card">
      <div style="font-size:13px;font-weight:600;margin-bottom:4px">Rate intensity</div>
      <p style="font-size:11px;color:var(--text3);margin-bottom:10px;line-height:1.45">Rough session RPE — pairs with <b style="color:var(--text)">Complete session</b> below so tomorrow's targets stay honest.</p>
      {sf ? <div style="font-size:12px;color:var(--mint);margin-bottom:6px">Saved: <b>{savedLbl}</b></div> : null}
      <div class="row" style="flex-wrap:wrap;gap:8px">
        <FBtn v="easy" label="Light · ~RPE 6" />
        <FBtn v="ok" label="Solid · ~RPE 7–8" />
        <FBtn v="hard" label="Hard · ~RPE 9+" />
        {sf ? <button type="button" class="btn btn-sm btn-ghost" id="sfeel-clear" onClick={() => onClear()}>Clear</button> : null}
      </div>
      {finalized
        ? <p style="font-size:11px;color:var(--mint);margin-top:10px;margin-bottom:0">Adaptation applied for {dayIso}.</p>
        : <p style="font-size:11px;color:var(--text3);margin-top:10px;margin-bottom:0">When you're done lifting, tap Complete session in the bar below.</p>}
    </div>
  );
}

export { SessionFeelCard };
export function mountSessionFeelCard(container: Element, props: SessionFeelProps): void {
  render(<SessionFeelCard {...props} />, container as unknown as import("preact").ContainerNode);
}

/* ── Warm-up checklist ───────────────────────────────────────────────────── */
export interface WarmupItem { idx: number; line: string; checked: boolean }
export interface WarmupProps {
  mode: "list" | "text"; items: WarmupItem[]; text: string;
  onToggle: (idx: number, checked: boolean) => void;
}

function WarmupChecklist({ mode, items, text, onToggle }: WarmupProps) {
  if (mode === "text") {
    return (
      <div class="card section" style="border-left:3px solid var(--ice)">
        <div style="font-size:11px;font-weight:700;color:var(--ice);margin-bottom:4px">Warm-up</div>
        <div style="font-size:12px;color:var(--text2)">{text}</div>
      </div>
    );
  }
  return (
    <div class="card section wu-card" style="border-left:3px solid var(--ice)">
      <div style="font-size:11px;font-weight:700;color:var(--ice);margin-bottom:8px">Warm-up checklist</div>
      <ul class="wu-list">
        {items.map((it) => (
          <li class="wu-item" key={it.idx}>
            <label class="wu-label">
              <input type="checkbox" class="wu-step-cb" data-wu-idx={it.idx} checked={it.checked} onChange={(e) => onToggle(it.idx, (e.target as HTMLInputElement).checked)} />
              <span class="wu-text">{it.line}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { WarmupChecklist };
export function mountWarmupChecklist(container: Element, props: WarmupProps): void {
  render(<WarmupChecklist {...props} />, container as unknown as import("preact").ContainerNode);
}
