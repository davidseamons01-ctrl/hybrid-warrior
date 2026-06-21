// Partner Sessions — lobby screen (M4 scaffold). Shows who's in, their ready +
// online (presence) state, your ready toggle, and (host) the Continue button.
import { render } from "preact";

export interface LobbyParticipant {
  uid: string; name: string; handle: string;
  role: "host" | "guest"; ready: boolean; online: boolean; maxesShared: boolean;
}
export interface PartnerLobbyActions {
  toggleReady: (ready: boolean) => void;
  start: () => void;
  invite: () => void;
  leave: () => void;
}
export interface PartnerLobbyProps {
  participants: LobbyParticipant[];
  meUid: string;
  isHost: boolean;
  actions: PartnerLobbyActions;
}

function PartnerLobby(p: PartnerLobbyProps) {
  const a = p.actions;
  const me = p.participants.find((x) => x.uid === p.meUid);
  const everyoneReady = p.participants.length > 0 && p.participants.every((x) => x.ready);
  const canStart = p.isHost && p.participants.length >= 2 && everyoneReady;
  return (
    <div class="pn-lobby card">
      <div class="card-h"><h2>Lobby</h2><span class="badge badge-fire">{p.participants.length} in</span></div>

      <div class="pn-roster">
        {p.participants.map((x) => (
          <div class={"pn-member" + (x.uid === p.meUid ? " pn-me" : "")} key={x.uid}>
            <span class={"pn-dot " + (x.online ? "pn-on" : "pn-off")} title={x.online ? "Online" : "Offline"}></span>
            <span class="pn-name">{x.name}</span>
            {x.role === "host" ? <span class="badge badge-ice pn-role">Host</span> : null}
            {!x.maxesShared ? <span class="pn-noshare" title="Maxes not shared">🔒</span> : null}
            <span class={"pn-ready " + (x.ready ? "pn-is-ready" : "pn-not-ready")}>{x.ready ? "✓ Ready" : "Not ready"}</span>
          </div>
        ))}
      </div>

      <div class="pn-lobby-actions">
        <button type="button" class={"btn btn-block " + (me && me.ready ? "btn-secondary-solid" : "btn-cta") + " pn-toggle-ready"} onClick={() => a.toggleReady(!(me && me.ready))}>
          {me && me.ready ? "Not ready" : "I'm ready"}
        </button>
        <button type="button" class="btn btn-ghost btn-sm pn-invite" onClick={() => a.invite()}>Invite a gym-buddy</button>
        {p.isHost ? (
          <button type="button" class="btn btn-mint btn-block pn-start-session" disabled={!canStart} onClick={() => a.start()}>
            {canStart ? "Continue → pick shared lifts" : p.participants.length < 2 ? "Waiting for a partner…" : "Waiting for everyone to ready up…"}
          </button>
        ) : (
          <p class="pn-hint">Your host starts the session once everyone's ready.</p>
        )}
        <button type="button" class="btn btn-ghost btn-sm pn-leave" onClick={() => a.leave()}>Leave</button>
      </div>
    </div>
  );
}

export { PartnerLobby };
export function mountPartnerLobby(container: Element, props: PartnerLobbyProps): void {
  render(<PartnerLobby {...props} />, container as unknown as import("preact").ContainerNode);
}
