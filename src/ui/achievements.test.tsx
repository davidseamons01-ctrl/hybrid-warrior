// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render } from "preact";
import { AchievementsWall, type AchievementsProps, type Achievement } from "./achievements";

const ach = (over: Partial<Achievement>): Achievement => ({
  icon: "🥉", title: "100K lb", desc: "Lifetime volume", earned: false, progressPct: 40, progressLabel: "40,000 / 100,000", ...over,
});

function mount(over: Partial<AchievementsProps> = {}) {
  const el = document.createElement("div");
  const props: AchievementsProps = {
    earnedCount: 2, totalCount: 4,
    badges: [
      ach({ title: "100K lb", earned: true }),
      ach({ icon: "🔥", title: "7-Day Streak", earned: true }),
      ach({ icon: "🦾", title: "30-Day Streak", earned: false, progressPct: 23, progressLabel: "7 / 30" }),
      ach({ icon: "🏅", title: "Block Finisher", earned: false, progressPct: 2, progressLabel: "0 / 1" }),
    ],
    ...over,
  };
  render(<AchievementsWall {...props} />, el);
  return el;
}

describe("AchievementsWall", () => {
  it("shows the unlocked count and renders every badge", () => {
    const el = mount();
    expect(el.querySelector(".badge")!.textContent).toContain("2/4");
    expect(el.querySelectorAll(".ach-item").length).toBe(4);
  });

  it("marks earned badges and shows progress on locked ones", () => {
    const el = mount();
    expect(el.querySelectorAll(".ach-earned").length).toBe(2);
    expect(el.querySelectorAll(".ach-locked").length).toBe(2);
    const earned = el.querySelector(".ach-earned")!;
    expect(earned.querySelector(".ach-status")!.textContent).toContain("Unlocked");
    expect(earned.querySelector(".ach-progress")).toBeNull();
    const locked = el.querySelector(".ach-locked")!;
    expect(locked.querySelector(".ach-bar-fill")).toBeTruthy();
    expect(locked.querySelector(".ach-prog-lbl")!.textContent).toContain("/");
  });

  it("sizes the progress bar to progressPct", () => {
    const el = mount();
    const fill = el.querySelectorAll(".ach-locked .ach-bar-fill")[0] as HTMLElement;
    expect(fill.style.width).toBe("23%");
  });
});
