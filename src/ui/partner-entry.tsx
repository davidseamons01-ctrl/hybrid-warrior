// Partner Sessions — entry screen (M4 scaffold). Start a session (shows the
// join code + QR slot) or join with a code. Stateless: ui.js owns the mode +
// networking via the partner-session backend. Blackout-Pro styled.
import { render } from "preact";

export interface PartnerEntryActions {
  startSession: () => void;
  openJoin: () => void;
  submitJoin: (code: string) => void;
  cancel: () => void;
}
export interface PartnerEntryProps {
  mode: "idle" | "hosting" | "joining";
  code?: string;
  joinError?: string;
  busy?: boolean;
  actions: PartnerEntryActions;
}

function PartnerEntry(p: PartnerEntryProps) {
  const a = p.actions;
  return (
    <div class="pn-entry card">
      <div class="card-h"><h2>Lift Together</h2></div>

      {p.mode === "idle" ? (
        <div class="pn-idle">
          <p class="pn-sub">Train with a friend in person — share a few big lifts at each of your own loads, then split to your own accessories.</p>
          <button type="button" class="btn btn-cta btn-block pn-start" onClick={() => a.startSession()}>Start a session</button>
          <button type="button" class="btn btn-secondary-solid btn-block pn-open-join" onClick={() => a.openJoin()}>Join with a code</button>
        </div>
      ) : null}

      {p.mode === "hosting" ? (
        <div class="pn-hosting">
          <div class="pn-code" aria-label={`Join code ${p.code || ""}`}>
            {[...(p.code || "")].map((c, i) => <span class="pn-code-char" key={i}>{c}</span>)}
          </div>
          <p class="pn-sub">Have your partner tap <b>Join with a code</b> and enter this — or scan the QR.</p>
          <div class="pn-qr" data-code={p.code}></div>
          <p class="pn-waiting">Waiting for partners to join…</p>
          <button type="button" class="btn btn-ghost btn-block pn-cancel" onClick={() => a.cancel()}>Cancel</button>
        </div>
      ) : null}

      {p.mode === "joining" ? (
        <form
          class="pn-joining"
          onSubmit={(e) => { e.preventDefault(); const inp = (e.currentTarget as HTMLFormElement).querySelector(".pn-code-input") as HTMLInputElement; a.submitJoin(inp ? inp.value : ""); }}
        >
          <label>Session code</label>
          <input class="pn-code-input" type="text" inputmode="text" autocomplete="off" spellcheck={false} placeholder="ABC23X" maxlength={8} aria-label="Session code" />
          {p.joinError ? <div class="pn-error">{p.joinError}</div> : null}
          <button type="submit" class="btn btn-cta btn-block pn-submit" disabled={!!p.busy}>Join</button>
          <button type="button" class="btn btn-ghost btn-block pn-cancel" onClick={() => a.cancel()}>Back</button>
        </form>
      ) : null}
    </div>
  );
}

export { PartnerEntry };
export function mountPartnerEntry(container: Element, props: PartnerEntryProps): void {
  render(<PartnerEntry {...props} />, container as unknown as import("preact").ContainerNode);
}
