// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { PartnerLobby, type PartnerLobbyProps, type LobbyParticipant, type PartnerLobbyActions } from "./partner-lobby";

const host: LobbyParticipant = { uid: "h", name: "Dave", handle: "dave", role: "host", ready: false, online: true, maxesShared: true };
const guest: LobbyParticipant = { uid: "w", name: "Sarah", handle: "sarah", role: "guest", ready: false, online: true, maxesShared: false };

function spies(): PartnerLobbyActions { return { toggleReady: vi.fn(), start: vi.fn(), invite: vi.fn(), leave: vi.fn() }; }
function mount(over: Partial<PartnerLobbyProps>, actions = spies()) {
  const el = document.createElement("div");
  render(<PartnerLobby participants={[host, guest]} meUid="h" isHost actions={actions} {...over} />, el);
  return { el, actions };
}
const click = (el: Element | null) => el && el.dispatchEvent(new Event("click", { bubbles: true }));

describe("PartnerLobby", () => {
  it("lists members with online + ready state and a maxes-not-shared marker", () => {
    const { el } = mount({});
    expect(el.querySelectorAll(".pn-member").length).toBe(2);
    expect(el.querySelectorAll(".pn-dot.pn-on").length).toBe(2);
    expect(el.querySelectorAll(".pn-noshare").length).toBe(1); // only guest didn't share maxes
  });

  it("host's start is gated until everyone is ready with 2+ in", () => {
    expect((mount({}).el.querySelector(".pn-start-session") as HTMLButtonElement).disabled).toBe(true);
    const ready = mount({ participants: [{ ...host, ready: true }, { ...guest, ready: true }] });
    expect((ready.el.querySelector(".pn-start-session") as HTMLButtonElement).disabled).toBe(false);
    click(ready.el.querySelector(".pn-start-session"));
    expect(ready.actions.start).toHaveBeenCalled();
  });

  it("ready toggle flips my state; a guest sees no start button", () => {
    const { el, actions } = mount({}); // I'm host, not ready
    click(el.querySelector(".pn-toggle-ready"));
    expect(actions.toggleReady).toHaveBeenCalledWith(true);
    const asGuest = mount({ meUid: "w", isHost: false });
    expect(asGuest.el.querySelector(".pn-start-session")).toBeNull();
    expect(asGuest.el.querySelector(".pn-hint")).toBeTruthy();
  });
});
