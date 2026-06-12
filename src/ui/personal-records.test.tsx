// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render } from "preact";
import { PersonalRecords, type PersonalRecordsProps } from "./personal-records";

function mount(over: Partial<PersonalRecordsProps> = {}) {
  const el = document.createElement("div");
  const props: PersonalRecordsProps = {
    unit: "lb", total: "1,005", totalHas: true,
    big3: [
      { label: "Bench Press", has: true, e1rm: "245", set: "225 lb × 3", date: "Jun 8, 2026" },
      { label: "Back Squat", has: true, e1rm: "350", set: "315 lb × 4", date: "Jun 5, 2026" },
      { label: "Deadlift", has: false, e1rm: "—", set: "No logs yet", date: "" },
    ],
    others: [{ name: "Overhead Press", e1rm: "155", set: "135 lb × 6" }],
    ...over,
  };
  render(<PersonalRecords {...props} />, el);
  return el;
}

describe("PersonalRecords", () => {
  it("shows the big-3 total hero", () => {
    expect(mount().querySelector(".pr-total-num")!.textContent).toBe("1,005");
    expect(mount({ totalHas: false, total: "" }).querySelector(".pr-total-num")!.textContent).toBe("—");
  });

  it("renders a card per main lift with e1RM + set, marking empty lifts", () => {
    const el = mount();
    const lifts = [...el.querySelectorAll(".pr-lift")];
    expect(lifts.length).toBe(3);
    expect(lifts[0].querySelector(".pr-lift-e1rm")!.textContent).toContain("245");
    expect(lifts[0].textContent).toContain("225 lb × 3");
    expect(lifts[2].classList.contains("pr-lift-empty")).toBe(true); // deadlift has no log
    expect(lifts[2].querySelector(".pr-lift-date")).toBeNull();
  });

  it("lists other lifts when present, hides the section when empty", () => {
    expect(mount().querySelector(".pr-others")!.textContent).toContain("Overhead Press");
    expect(mount({ others: [] }).querySelector(".pr-others")).toBeNull();
  });

  it("renders as a full-width dashboard card", () => {
    expect((mount().firstElementChild as HTMLElement).classList.contains("dash-span-full")).toBe(true);
  });
});
