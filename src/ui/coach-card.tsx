// Coach card (UI overhaul phase 4) — the app's intelligence in one voice at
// the top of Progress. Insights are computed in ui.js from real engine
// signals (plateau detection, e1RM trend forecasts, adaptation drift,
// schedule state); this component just presents them with an optional
// plain-language "why" behind every claim. Coached mode reads like a person;
// Pro mode carries the numbers.
import { render } from "preact";
import { useState } from "preact/hooks";

export interface CoachInsight {
  k: string;
  tone: "push" | "win" | "warn" | "info";
  title: string;
  body: string;
  why?: string;
  action?: { label: string; hash: string };
}

export interface CoachCardProps {
  headline: string;
  sub: string;
  insights: CoachInsight[];
  coached: boolean;
  onAction: (hash: string) => void;
}

function Insight({ ins, onAction }: { ins: CoachInsight; onAction: (h: string) => void }) {
  const [openWhy, setOpenWhy] = useState(false);
  return (
    <div class={`coach-ins coach-${ins.tone}`}>
      <span class="coach-dot" aria-hidden="true"></span>
      <div class="coach-ins-main">
        <div class="coach-ins-title">{ins.title}</div>
        <div class="coach-ins-body">{ins.body}</div>
        {openWhy && ins.why ? <div class="coach-why">{ins.why}</div> : null}
        <div class="coach-ins-row">
          {ins.action ? <button type="button" class="coach-action" onClick={() => onAction(ins.action!.hash)}>{ins.action.label}</button> : null}
          {ins.why ? <button type="button" class="coach-whybtn" aria-expanded={openWhy} onClick={() => setOpenWhy(!openWhy)}>{openWhy ? "Hide why" : "Why?"}</button> : null}
        </div>
      </div>
    </div>
  );
}

function CoachCard(p: CoachCardProps) {
  return (
    <div class="card coach-card section">
      <div class="coach-kicker">Coach</div>
      <div class="coach-headline">{p.headline}</div>
      <div class="coach-sub">{p.sub}</div>
      {p.insights.length
        ? <div class="coach-list">{p.insights.map((ins) => <Insight key={ins.k} ins={ins} onAction={p.onAction} />)}</div>
        : <p class="coach-empty">Log a few sessions and I'll start spotting trends — plateaus, pace, and what to change.</p>}
    </div>
  );
}

export { CoachCard };

export function mountCoachCard(container: Element, props: CoachCardProps): void {
  render(<CoachCard {...props} />, container as unknown as import("preact").ContainerNode);
}
