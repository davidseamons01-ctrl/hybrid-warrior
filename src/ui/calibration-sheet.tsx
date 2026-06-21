// Partner Sessions — calibration sheet (M4b). When a lifter has no max for a
// shared lift, they do one set here and we derive a provisional 1RM (Epley) so
// their load can scale like everyone else's. Each person calibrates on their own
// device; ui.js/PartnerApp writes the result into their session participant.
import { render } from "preact";
import { useState } from "preact/hooks";
import { calibrationToMax } from "../core/partner";

export interface CalibrationSheetProps {
  liftName: string;
  unit: string;
  onSubmit: (max: number) => void;
  onCancel: () => void;
}

function CalibrationSheet(p: CalibrationSheetProps) {
  const [w, setW] = useState("");
  const [r, setR] = useState("5");
  const max = calibrationToMax(Number(w) || 0, Number(r) || 0);
  return (
    <div class="cal-overlay" role="dialog" aria-modal="true" aria-labelledby="cal-title" onClick={(e) => { if (e.target === e.currentTarget) p.onCancel(); }}>
      <div class="cal-sheet">
        <div class="cal-title" id="cal-title">Set your {p.liftName} max</div>
        <p class="cal-sub">No logged max yet — do one solid set and enter it. We'll estimate your working load and refine it as you train.</p>
        <div class="cal-row">
          <div><label>Weight ({p.unit})</label><input type="number" class="cal-w input-sm" value={w} min="0" step="any" inputmode="decimal" onInput={(e) => setW((e.target as HTMLInputElement).value)} /></div>
          <div><label>Reps</label><input type="number" class="cal-r input-sm" value={r} min="1" inputmode="numeric" onInput={(e) => setR((e.target as HTMLInputElement).value)} /></div>
        </div>
        <div class="cal-est">{max > 0 ? <>≈ <b>{max} {p.unit}</b> estimated 1RM</> : "Enter a set above"}</div>
        <div class="cal-actions">
          <button type="button" class="btn btn-ghost cal-cancel" onClick={() => p.onCancel()}>Cancel</button>
          <button type="button" class="btn btn-cta btn-block cal-submit" disabled={!(max > 0)} onClick={() => p.onSubmit(max)}>Set max</button>
        </div>
      </div>
    </div>
  );
}

export { CalibrationSheet };
export function mountCalibrationSheet(container: Element, props: CalibrationSheetProps): void {
  render(<CalibrationSheet {...props} />, container as unknown as import("preact").ContainerNode);
}
