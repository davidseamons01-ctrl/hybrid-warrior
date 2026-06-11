// "Profile, body & app settings" form — second screen of the UI rebuild, and
// the first CONTROLLED FORM in the component model. Owns its field state; the
// data layer (writing S, persist, theme) stays in ui.js behind action props.
import { render } from "preact";
import { useState } from "preact/hooks";

export interface ProfileFormValues {
  bench: string; squat: string; dead: string;
  weight: string; goalWt: string; run: string;
  waist: string; hips: string; shoulders: string;
  bodyFat: string; neck: string; age: string;
  sex: string; lifeStage: string; womenMode: string;
  equipment: string; style: string; units: string; quick: string;
  light: boolean; oled: boolean; womenSimpleUi: boolean;
  audioCues: boolean; altitude: boolean; biometric: boolean;
}

export interface ProfileSettingsActions {
  save: (form: ProfileFormValues) => void;
  applyAppearance: (light: boolean, oled: boolean) => void; // live, no re-render
  applyUnits: (units: string) => void;                      // re-renders (reconverts)
  setAudioCues: (v: boolean) => void;
  setAltitude: (v: boolean) => void;
  setBiometric: (v: boolean) => Promise<boolean> | boolean;
  resetAdaptation: () => void;
}

export interface ProfileSettingsProps {
  initial: ProfileFormValues;
  massLabel: string;
  isFemale: boolean;
  biometricAvailable: boolean;
  womenModeOptions: ReadonlyArray<readonly [string, string]>;
  adapt: { bench: number; squat: number; dead: number; run: number };
  actions: ProfileSettingsActions;
}

function Num({ label, value, step, onInput }: { label: string; value: string; step?: string; onInput: (v: string) => void }) {
  return (
    <div>
      <label>{label}</label>
      <input type="number" step={step || "any"} value={value} onInput={(e) => onInput((e.target as HTMLInputElement).value)} />
    </div>
  );
}

function Toggle({ id, checked, onChange, title, desc }: { id: string; checked: boolean; onChange: (v: boolean) => void; title: string; desc: string }) {
  return (
    <div class="settings-toggle-row" style="margin-top:10px;padding:12px;background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border-lit)">
      <label class="settings-switch-label">
        <input type="checkbox" checked={checked} onChange={(e) => onChange((e.target as HTMLInputElement).checked)} />
        <span>
          <b style="color:var(--text)">{title}</b> — {desc}
        </span>
      </label>
    </div>
  );
}

function ProfileSettings(props: ProfileSettingsProps) {
  const [f, setF] = useState<ProfileFormValues>(props.initial);
  const set = <K extends keyof ProfileFormValues>(k: K, v: ProfileFormValues[K]) => setF((p) => ({ ...p, [k]: v }));
  const u = props.massLabel;
  const a = props.actions;

  return (
    <div class="card settings-section" id="settings-profile" data-k="profile strength bench squat deadlift weight measurement body sex women life equipment style appearance theme light dark oled units metric audio altitude biometric save">
      <div class="card-h">
        <h2>Training &amp; profile</h2>
      </div>

      <div class="grid3 settings-1rm-grid">
        <Num label={`Bench 1RM (${u})`} value={f.bench} onInput={(v) => set("bench", v)} />
        <Num label={`Squat 1RM (${u})`} value={f.squat} onInput={(v) => set("squat", v)} />
        <Num label={`Deadlift 1RM (${u})`} value={f.dead} onInput={(v) => set("dead", v)} />
      </div>
      <div class="grid3" style="margin-top:8px">
        <Num label={`Weight (${u})`} value={f.weight} onInput={(v) => set("weight", v)} />
        <Num label={`Goal Wt (${u})`} value={f.goalWt} onInput={(v) => set("goalWt", v)} />
        <div>
          <label>4mi pace</label>
          <input class="input-mmss" value={f.run} placeholder="35:00" inputmode="numeric" autocomplete="off" spellcheck={false} aria-label="Four mile time as mm:ss" onInput={(e) => set("run", (e.target as HTMLInputElement).value)} />
        </div>
      </div>
      <div class="grid3" style="margin-top:8px">
        <Num label="Waist (in)" step="0.1" value={f.waist} onInput={(v) => set("waist", v)} />
        <Num label="Hips (in)" step="0.1" value={f.hips} onInput={(v) => set("hips", v)} />
        <Num label="Shoulders (in)" step="0.1" value={f.shoulders} onInput={(v) => set("shoulders", v)} />
      </div>
      <div class="grid3" style="margin-top:8px">
        <Num label="Body Fat %" step="0.1" value={f.bodyFat} onInput={(v) => set("bodyFat", v)} />
        <Num label="Neck (in)" step="0.1" value={f.neck} onInput={(v) => set("neck", v)} />
        <Num label="Age" step="1" value={f.age} onInput={(v) => set("age", v)} />
      </div>

      <div class={(props.isFemale ? "grid3" : "grid2") + " settings-sex-row"} style="margin-top:8px">
        <div>
          <label>Sex</label>
          <select value={f.sex} onChange={(e) => set("sex", (e.target as HTMLSelectElement).value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label>Life Stage</label>
          <select value={f.lifeStage} onChange={(e) => set("lifeStage", (e.target as HTMLSelectElement).value)}>
            <option value="general">General</option>
            <option value="pregnancy">Pregnancy</option>
            <option value="postpartum">Postpartum</option>
          </select>
        </div>
        {props.isFemale ? (
          <div>
            <label>Women's Mode</label>
            <select value={f.womenMode} onChange={(e) => set("womenMode", (e.target as HTMLSelectElement).value)}>
              {props.womenModeOptions.map(([v, l]) => (
                <option value={v}>{l}</option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div class="grid2" style="margin-top:8px">
        <div>
          <label>Equipment</label>
          <select value={f.equipment} onChange={(e) => set("equipment", (e.target as HTMLSelectElement).value)}>
            <option value="gym">Gym</option>
            <option value="home">Home</option>
          </select>
        </div>
        <div>
          <label>Session Style</label>
          <select value={f.style} onChange={(e) => set("style", (e.target as HTMLSelectElement).value)}>
            <option value="balanced">Balanced</option>
            <option value="burner">Burner (10-20 min)</option>
          </select>
        </div>
      </div>

      <Toggle
        id="s-light"
        checked={f.light}
        title="Light mode"
        desc="bright backgrounds and higher contrast for daytime use."
        onChange={(v) => {
          set("light", v);
          a.applyAppearance(v, f.oled);
        }}
      />
      <Toggle
        id="s-oled"
        checked={f.oled}
        title="True Black (OLED)"
        desc="pure #000000 backgrounds to save battery on AMOLED screens."
        onChange={(v) => {
          set("oled", v);
          a.applyAppearance(f.light, v);
        }}
      />

      <div style="margin-top:10px">
        <label>Weight &amp; load units</label>
        <select
          value={f.units}
          onChange={(e) => {
            const v = (e.target as HTMLSelectElement).value;
            set("units", v);
            a.applyUnits(v);
          }}
        >
          <option value="imperial">Imperial (lb)</option>
          <option value="metric">Metric (kg)</option>
        </select>
      </div>

      {props.isFemale ? (
        <div style="margin-top:8px;padding:10px;background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border-lit)">
          <label style="display:flex;gap:10px;align-items:flex-start;cursor:pointer;font-size:12px;color:var(--text2);line-height:1.45">
            <input type="checkbox" style="margin-top:3px;flex-shrink:0" checked={f.womenSimpleUi} onChange={(e) => set("womenSimpleUi", (e.target as HTMLInputElement).checked)} />
            <span>
              <b style="color:var(--text)">Simpler layout &amp; colors</b> — Pinterest-style cards on Home, shorter Plan, pastels. How-to videos prefer female coaches. Turn off anytime.
            </span>
          </label>
        </div>
      ) : null}

      <div style="margin-top:8px">
        <label>When time is tight (Train tab)</label>
        <select value={f.quick} onChange={(e) => set("quick", (e.target as HTMLSelectElement).value)}>
          <option value="0">Full session</option>
          <option value="15">~15 min — first two lifts only</option>
        </select>
      </div>

      <Toggle
        id="s-audio-cues"
        checked={f.audioCues}
        title="Audio cues"
        desc="announce next exercise and target weight when the rest timer finishes. Uses device speech synthesis."
        onChange={(v) => {
          set("audioCues", v);
          a.setAudioCues(v);
        }}
      />
      <Toggle
        id="s-altitude"
        checked={f.altitude}
        title="Training at altitude"
        desc="automatically adjust target running paces 5% slower to account for reduced oxygen availability."
        onChange={(v) => {
          set("altitude", v);
          a.setAltitude(v);
        }}
      />
      {props.biometricAvailable ? (
        <Toggle
          id="s-biometric"
          checked={f.biometric}
          title="Biometric lock"
          desc="require FaceID / TouchID when opening the app."
          onChange={async (v) => {
            const ok = await a.setBiometric(v);
            set("biometric", v ? !!ok : false);
          }}
        />
      ) : null}

      <button class="btn btn-cta btn-block" style="margin-top:10px" onClick={() => a.save(f)}>
        Save &amp; recalculate
      </button>

      <details class="settings-adapt-fold settings-section" data-k="adaptation reset bench squat dead run multiplier advanced deload">
        <summary class="settings-adapt-sum">Advanced · adaptation multipliers</summary>
        <div class="settings-adapt-body">
          <p style="font-size:11px;color:var(--text3);margin:0 0 10px;line-height:1.45">These drift from 1.000 as you log. Reset only if prescriptions feel systematically off.</p>
          <div style="display:flex;gap:10px;font-size:12px;color:var(--text2);flex-wrap:wrap;font-variant-numeric:tabular-nums">
            <span>B <b>{props.adapt.bench.toFixed(3)}</b></span>
            <span>S <b>{props.adapt.squat.toFixed(3)}</b></span>
            <span>D <b>{props.adapt.dead.toFixed(3)}</b></span>
            <span>R <b>{props.adapt.run.toFixed(3)}</b></span>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" style="margin-top:8px" onClick={() => a.resetAdaptation()}>
            Reset to 1.000
          </button>
        </div>
      </details>
    </div>
  );
}

export { ProfileSettings };

/** Mount the profile-settings form into a container (called from ui.js). */
export function mountProfileSettings(container: Element, props: ProfileSettingsProps): void {
  render(<ProfileSettings {...props} />, container as unknown as import("preact").ContainerNode);
}
