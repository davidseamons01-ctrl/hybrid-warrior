// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { ProfileSettings, type ProfileSettingsProps, type ProfileSettingsActions, type ProfileFormValues } from "./profile-settings";

const initial: ProfileFormValues = {
  bench: "225", squat: "315", dead: "405", weight: "185", goalWt: "175", run: "35:00",
  waist: "34", hips: "40", shoulders: "46", bodyFat: "18", neck: "15.5", age: "30",
  sex: "male", lifeStage: "general", womenMode: "auto", equipment: "gym", style: "balanced", units: "imperial", quick: "0",
  light: false, oled: false, womenSimpleUi: true, audioCues: false, altitude: false, biometric: false,
};

const noopActions: ProfileSettingsActions = {
  save: () => {}, applyAppearance: () => {}, applyUnits: () => {},
  setAudioCues: () => {}, setAltitude: () => {}, setBiometric: () => true, resetAdaptation: () => {},
};

function mount(actions: Partial<ProfileSettingsActions> = {}, over: Partial<ProfileSettingsProps> = {}) {
  const el = document.createElement("div");
  const props: ProfileSettingsProps = {
    initial,
    massLabel: "lb",
    isFemale: false,
    biometricAvailable: false,
    womenModeOptions: [["auto", "Auto"]],
    adapt: { bench: 1, squat: 1, dead: 1, run: 1 },
    actions: { ...noopActions, ...actions },
    ...over,
  };
  render(<ProfileSettings {...props} />, el);
  return el;
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("ProfileSettings", () => {
  it("renders initial field values", () => {
    const el = mount();
    const nums = [...el.querySelectorAll('input[type="number"]')] as HTMLInputElement[];
    expect(nums[0].value).toBe("225"); // bench
    expect(el.querySelector('input.input-mmss') as HTMLInputElement).toBeTruthy();
    expect((el.querySelector('input.input-mmss') as HTMLInputElement).value).toBe("35:00");
  });

  it("hides women-only fields for male, shows for female", () => {
    expect(mount({}, { isFemale: false }).textContent).not.toContain("Women's Mode");
    expect(mount({}, { isFemale: true }).textContent).toContain("Women's Mode");
  });

  it("toggling light mode calls applyAppearance immediately", () => {
    const applyAppearance = vi.fn();
    const el = mount({ applyAppearance });
    const lightCb = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
    lightCb.checked = true;
    lightCb.dispatchEvent(new Event("change", { bubbles: true }));
    expect(applyAppearance).toHaveBeenCalledWith(true, false);
  });

  it("Save collects the edited form", async () => {
    const save = vi.fn();
    const el = mount({ save });
    const bench = el.querySelector('input[type="number"]') as HTMLInputElement;
    bench.value = "235";
    bench.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    const btn = [...el.querySelectorAll("button")].find((b) => b.textContent?.includes("Save")) as HTMLButtonElement;
    btn.click();
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0].bench).toBe("235");
  });

  it("reset adaptation button calls resetAdaptation", () => {
    const resetAdaptation = vi.fn();
    const el = mount({ resetAdaptation });
    ([...el.querySelectorAll("button")].find((b) => b.textContent?.includes("Reset to 1.000")) as HTMLButtonElement).click();
    expect(resetAdaptation).toHaveBeenCalled();
  });
});
