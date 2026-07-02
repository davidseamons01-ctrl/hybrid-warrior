// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { CoachCard, type CoachCardProps, type CoachInsight } from "./coach-card";

const ins = (over: Partial<CoachInsight> = {}): CoachInsight => ({
  k: "today", tone: "push", title: "Today: Full Body", body: "4 exercises · ~45 min.",
  why: "It's a scheduled training day.", action: { label: "Start now", hash: "#train" },
  ...over,
});

function mount(over: Partial<CoachCardProps> = {}) {
  const el = document.createElement("div");
  const props: CoachCardProps = {
    headline: "Good evening, Sam",
    sub: "Week 2 of 13 · 1 of 3 sessions this week",
    insights: [ins()],
    coached: true,
    onAction: vi.fn(),
    ...over,
  };
  render(<CoachCard {...props} />, el);
  return { el, props };
}

describe("CoachCard", () => {
  it("renders headline, sub, and insight content", () => {
    const { el } = mount();
    expect(el.textContent).toContain("Good evening, Sam");
    expect(el.textContent).toContain("1 of 3 sessions this week");
    expect(el.textContent).toContain("Today: Full Body");
  });

  it("why toggle reveals the reasoning", async () => {
    const { el } = mount();
    expect(el.textContent).not.toContain("It's a scheduled training day.");
    ([...el.querySelectorAll("button")].find((b) => b.textContent === "Why?") as HTMLButtonElement).click();
    await new Promise((r) => setTimeout(r, 0));
    expect(el.textContent).toContain("It's a scheduled training day.");
  });

  it("action button dispatches its hash", () => {
    const { el, props } = mount();
    ([...el.querySelectorAll("button")].find((b) => b.textContent === "Start now") as HTMLButtonElement).click();
    expect(props.onAction).toHaveBeenCalledWith("#train");
  });

  it("empty insights show the getting-started line", () => {
    const { el } = mount({ insights: [] });
    expect(el.textContent).toContain("Log a few sessions");
  });
});
