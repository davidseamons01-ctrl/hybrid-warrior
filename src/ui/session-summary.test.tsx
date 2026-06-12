// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { SessionSummary, type SessionSummaryProps } from "./session-summary";

function mount(over: Partial<SessionSummaryProps> = {}) {
  const el = document.createElement("div");
  const props: SessionSummaryProps = {
    dateLabel: "Thursday, Jun 11",
    volume: "12,450", volumeUnit: "lb",
    stats: [
      { label: "Sets", value: "18" },
      { label: "Reps", value: "96" },
      { label: "Lifts", value: "5" },
      { label: "Streak", value: "7", accent: true },
    ],
    prs: [{ name: "Barbell Bench Press", detail: "225 lb" }],
    feelLabel: "Solid · ~RPE 7–8", runLabel: "",
    anatomyHtml: "<svg class='anat'></svg>", adaptationApplied: true,
    onClose: () => {}, onViewLog: () => {},
    ...over,
  };
  render(<SessionSummary {...props} />, el);
  return el;
}
const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));

describe("SessionSummary", () => {
  it("shows the volume hero, unit, and all four stats", () => {
    const el = mount();
    expect(el.querySelector(".ss-hero-num")!.textContent).toBe("12,450");
    expect(el.querySelector(".ss-hero-lbl")!.textContent).toContain("lb");
    const stats = [...el.querySelectorAll(".ss-stat")];
    expect(stats.length).toBe(4);
    expect(el.querySelector(".ss-stat-accent .ss-stat-val")!.textContent).toBe("7"); // streak accented
  });

  it("renders PR rows when present and hides the section when empty", () => {
    expect(mount().querySelector(".ss-pr-row")!.textContent).toContain("Barbell Bench Press");
    expect(mount({ prs: [] }).querySelector(".ss-prs")).toBeNull();
  });

  it("passes through the muscle map and shows the adaptation note", () => {
    const el = mount();
    expect(el.querySelector(".ss-anatomy .anat")).toBeTruthy();
    expect(el.textContent).toContain("Adaptation applied");
  });

  it("shows feel / cardio lines only when provided", () => {
    expect(mount({ feelLabel: "", runLabel: "" }).querySelector(".ss-line")).toBeNull();
    const el = mount({ feelLabel: "Solid", runLabel: "2 cardio efforts" });
    expect([...el.querySelectorAll(".ss-line")].length).toBe(2);
  });

  it("Done / close / backdrop fire onClose; View log fires onViewLog", () => {
    const onClose = vi.fn(), onViewLog = vi.fn();
    const el = mount({ onClose, onViewLog });
    click(el.querySelector(".ss-close"));
    click([...el.querySelectorAll("button")].find((b) => b.textContent === "Done")!);
    click(el.querySelector(".ss-overlay")); // backdrop (event target === overlay)
    click([...el.querySelectorAll("button")].find((b) => b.textContent === "View log")!);
    expect(onClose).toHaveBeenCalledTimes(3);
    expect(onViewLog).toHaveBeenCalledTimes(1);
  });
});
