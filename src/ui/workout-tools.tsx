// Workout-tools fold (UI rebuild #4d) — the in-session "Workout tools" <details>:
// equipment + 15-min toggles, plate-helper / health / ease shortcuts, adjust-
// schedule, and the caffeine pre-workout timer. Stateless: the eq/quick toggles
// re-render the pane (so labels/btn-fire come from props on each mount); the rest
// scroll/navigate/persist via actions. "Adjust schedule" intentionally has no
// handler here — it stays wired by bindToday's missed-session group.
import { render } from "preact";

export interface WorkoutToolsActions {
  eqToggle: () => void;
  quickToggle: () => void;
  openPlates: () => void;
  openHealth: () => void;
  openEase: () => void;
  caffeineToggle: (el: HTMLElement) => void;
}

export interface WorkoutToolsProps {
  eqHome: boolean;
  qmOn: boolean;
  actions: WorkoutToolsActions;
}

function WorkoutTools({ eqHome, qmOn, actions: a }: WorkoutToolsProps) {
  return (
    <details class="train-tools section">
      <summary class="train-tools-summary">Workout tools</summary>
      <div class="train-tools-body">
        <button type="button" class={"btn btn-secondary-solid" + (eqHome ? " btn-fire" : "")} id="train-eq-toggle" onClick={() => a.eqToggle()}>{eqHome ? "Equipment: Home" : "Equipment: Gym"}</button>
        <button type="button" class={"btn btn-secondary-solid" + (qmOn ? " btn-fire" : "")} id="train-quick" onClick={() => a.quickToggle()}>{qmOn ? "15-min mode on" : "Minimum session (~15 min)"}</button>
        <button type="button" class="btn btn-ghost" id="train-open-plates" onClick={() => a.openPlates()}>Plate helper</button>
        <button type="button" class="btn btn-ghost" id="train-open-health" onClick={() => a.openHealth()}>Health metrics</button>
        <button type="button" class="btn btn-ghost" id="train-open-ease" onClick={() => a.openEase()}>Ease load…</button>
        <button type="button" class="btn btn-ghost btn-sm" id="train-adjust-schedule" title="Re-open choices for missed sessions">Adjust schedule</button>
        <div class="caffeine-timer-row">
          <button type="button" class="btn btn-secondary-solid btn-sm" id="caffeine-start" onClick={(e) => a.caffeineToggle(e.currentTarget as HTMLElement)}>☕ Pre-workout (45 min)</button>
          <span id="caffeine-time" class="caffeine-time-label"></span>
        </div>
      </div>
    </details>
  );
}

export { WorkoutTools };
export function mountWorkoutToolsCard(container: Element, props: WorkoutToolsProps): void {
  render(<WorkoutTools {...props} />, container as unknown as import("preact").ContainerNode);
}
