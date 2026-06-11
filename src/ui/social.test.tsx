// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { SocialView, type SocialProps, type SocialActions } from "./social";

const noop: SocialActions = {
  join: () => {}, editHandle: () => {}, pushStats: () => {}, leave: () => {},
  setLeaderTab: () => {}, post: () => {}, heart: () => {}, del: () => {},
};

function mount(props: Partial<SocialProps>, actions: Partial<SocialActions> = {}): HTMLElement {
  const el = document.createElement("div");
  const full: SocialProps = {
    mode: "active",
    totalAthletes: 3,
    optedIn: true,
    handle: "Dave",
    myStats: { level: 24, streak: 3, bench1RM: 222, squat1RM: 251, deadlift1RM: 368, monthMiles: 0 },
    leaderTab: "hybrid",
    leaderRows: [],
    posts: [],
    ...props,
    actions: { ...noop, ...actions },
  };
  render(<SocialView {...full} />, el);
  return el;
}

describe("SocialView", () => {
  it("renders the community header + handle", () => {
    const el = mount({ handle: "SteelMike" });
    expect(el.textContent).toContain("Community");
    expect(el.textContent).toContain("SteelMike");
  });

  it("ESCAPES a malicious handle — no element is injected (XSS fix)", () => {
    const el = mount({ optedIn: true, handle: "<img src=x onerror=alert(1)>" });
    expect(el.querySelector("img")).toBeNull();
    expect(el.textContent).toContain("<img src=x onerror=alert(1)>");
  });

  it("ESCAPES malicious post text and leaderboard handles", () => {
    const el = mount({
      posts: [{ id: "p1", uid: "u", handle: "<script>x</script>", text: "<b>hi</b> <script>bad</script>", ago: "1m ago", liked: false, own: false, hearts: 0 }],
      leaderRows: [{ uid: "u", handle: "<svg/onload=1>", level: 5, sex: "male", me: false, rank: 1, display: "1000 lb" }],
    });
    expect(el.querySelector("script")).toBeNull();
    expect(el.querySelector("svg")).toBeNull();
    expect(el.textContent).toContain("<b>hi</b>"); // rendered as text, not bold
    expect(el.textContent).toContain("<script>bad</script>");
    expect(el.textContent).toContain("<svg/onload=1>");
  });

  it("shows the join card when not opted in", () => {
    expect(mount({ optedIn: false }).textContent).toContain("Join the Hybrid Community");
  });

  it("renders signed-out and offline states", () => {
    expect(mount({ mode: "signed-out" }).textContent).toContain("Sign in to connect");
    expect(mount({ mode: "offline" }).textContent).toContain("need an internet connection");
  });

  it("wires deterministic actions (leaderboard tab, heart, delete, MeCard buttons)", () => {
    const setLeaderTab = vi.fn(), heart = vi.fn(), del = vi.fn(), pushStats = vi.fn(), leave = vi.fn(), editHandle = vi.fn();
    const el = mount(
      { posts: [{ id: "p9", uid: "me", handle: "Me", text: "go", ago: "now", liked: false, own: true, hearts: 2 }] },
      { setLeaderTab, heart, del, pushStats, leave, editHandle }
    );
    ([...el.querySelectorAll(".lb-tab")].find((b) => b.textContent === "Bench 1RM") as HTMLButtonElement).click();
    expect(setLeaderTab).toHaveBeenCalledWith("bench");
    (el.querySelector(".feed-heart") as HTMLButtonElement).click();
    expect(heart).toHaveBeenCalledWith("p9");
    (el.querySelector(".feed-del") as HTMLButtonElement).click();
    expect(del).toHaveBeenCalledWith("p9");
    (el.querySelector(".community-me-actions button") as HTMLButtonElement).click();
    expect(pushStats).toHaveBeenCalled();
    (el.querySelector(".community-me-head button") as HTMLButtonElement).click();
    expect(editHandle).toHaveBeenCalled();
  });
});
