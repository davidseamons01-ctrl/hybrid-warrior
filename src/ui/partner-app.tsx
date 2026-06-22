// Partner Sessions — M4 orchestrator. Owns the whole flow (entry → lobby →
// proposal → live → split → done) over an INJECTED SessionBackend, so the entire
// integration is unit-testable with the in-memory fake; ui.js passes the concrete
// FirestoreBackend + the user context + a callback to log sets into own history.
import { render } from "preact";
import { useState, useEffect, useMemo, useRef } from "preact/hooks";
import { PartnerEntry } from "./partner-entry";
import { PartnerLobby, type LobbyParticipant } from "./partner-lobby";
import { SharedBlockProposal, type ProposalLift } from "./shared-block-proposal";
import { CalibrationSheet } from "./calibration-sheet";
import { qrSvg } from "../core/qr";
import {
  suggestSharedLifts, buildSharedLiftPlan, VIBE_SCHEMES, PARTNER_COMPOUNDS,
  type PartnerUser, type Vibe, type Suggestion,
} from "../core/partner";
import type { PartnerSession, Participant } from "../core/partner-pairing";
import { isOnline } from "../core/partner-pairing";
import {
  type SessionBackend, type FeedEvent,
  hostCreateSession, joinByCode, setReadyRemote, heartbeat, setSharedBlock, transition, logSharedSet, advanceTurn,
} from "../core/partner-session";

export interface PartnerCtx {
  uid: string; handle: string; name: string;
  maxes: Record<string, number>;
  focus: string[]; equipment: string[];
  unit: string;
  bodyweightLb?: number; experience?: string;
  planEids: string[];
  shareMaxes: boolean;
  catalog?: typeof PARTNER_COMPOUNDS;
}
export interface PartnerAppProps {
  backend: SessionBackend;
  ctx: PartnerCtx;
  initialJoinCode?: string;
  heartbeatMs?: number; // presence cadence; 0 disables (tests)
  onLogSet?: (ev: { eid: string; name: string; weight: number; reps: number }) => void;
  onGoToSplit?: () => void;
  onToast?: (msg: string) => void;
  onExit: () => void;
}

const VIBES = [{ id: "strength", label: "Strength" }, { id: "hypertrophy", label: "Hypertrophy" }, { id: "pump", label: "Pump" }];
const ERR: Record<string, string> = { "not-found": "No session with that code.", expired: "That code has expired.", gone: "That session is no longer available.", closed: "That session has already ended." };

function toUsers(session: PartnerSession, ctx: PartnerCtx): PartnerUser[] {
  return Object.values(session.participants).map((p: Participant) => ({
    uid: p.uid, name: p.name, maxes: p.maxes, focus: p.focus || [], equipment: p.equipment || [],
    bodyweightLb: p.uid === ctx.uid ? ctx.bodyweightLb : undefined,
    experience: p.uid === ctx.uid ? (ctx.experience as PartnerUser["experience"]) : undefined,
  }));
}
function incrFor(eid: string, catalog = PARTNER_COMPOUNDS): number {
  return (catalog.find((c) => c.eid === eid)?.increment) ?? 5;
}

function PartnerApp(p: PartnerAppProps) {
  const { backend, ctx } = p;
  const me = { uid: ctx.uid, handle: ctx.handle, name: ctx.name, maxes: ctx.maxes, focus: ctx.focus, equipment: ctx.equipment };

  const [view, setView] = useState<"entry" | "joining">("entry");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<PartnerSession | null>(null);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [code, setCode] = useState<string>("");
  const [joinError, setJoinError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [vibe, setVibe] = useState<Vibe>("hypertrophy");
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [calib, setCalib] = useState<{ eid: string; liftName: string } | null>(null);
  const triedInitial = useRef(false);

  // I calibrate my own missing max → write it into my participant entry; everyone's view recomputes.
  const onCalibSubmit = (max: number) => {
    if (calib && session) backend.patchSession(session.id, { participants: { [ctx.uid]: { maxes: { [calib.eid]: max } } } }).catch(() => {});
    setCalib(null);
  };
  const withCalib = (content: any) => (
    <>{content}{calib ? <CalibrationSheet liftName={calib.liftName} unit={ctx.unit} onSubmit={onCalibSubmit} onCancel={() => setCalib(null)} /> : null}</>
  );

  // Live subscriptions + presence heartbeat, keyed on the session id.
  useEffect(() => {
    if (!sessionId) return;
    const u1 = backend.watchSession(sessionId, (s) => setSession(s));
    const u2 = backend.watchFeed(sessionId, (f) => setFeed(f));
    const ms = p.heartbeatMs ?? 10000;
    const hb = ms > 0 ? setInterval(() => { heartbeat(backend, sessionId, ctx.uid).catch(() => {}); }, ms) : null;
    return () => { u1(); u2(); if (hb) clearInterval(hb); };
  }, [sessionId]);

  // Auto-join from a #join deep link.
  useEffect(() => {
    if (p.initialJoinCode && !triedInitial.current) { triedInitial.current = true; doJoin(p.initialJoinCode); }
  }, []);

  function describeErr(e: any): string {
    if (e?.code === "permission-denied" || /insufficient permissions/i.test(e?.message || ""))
      return "Partner sessions need a server update (Firestore rules). Tap ⓘ for the fix.";
    return "Couldn't start: " + (e?.message || "network error — check your connection.");
  }
  async function startSession() {
    setBusy(true); setJoinError("");
    try {
      const r = await hostCreateSession(backend, me, { vibe, shareMaxes: ctx.shareMaxes });
      setCode(r.code); setSessionId(r.session.id);
    } catch (e) {
      if (typeof console !== "undefined") console.error("[partner] hostCreateSession failed", e);
      const msg = describeErr(e);
      setJoinError(msg); p.onToast?.(msg);
    } finally { setBusy(false); }
  }
  async function doJoin(raw: string) {
    setBusy(true); setJoinError("");
    try {
      const r = await joinByCode(backend, me, raw, { shareMaxes: ctx.shareMaxes });
      if (r.ok) { setSessionId(r.session.id); setCode(r.session.joinCode || ""); }
      else setJoinError(ERR[r.error] || "Could not join.");
    } catch (e) {
      if (typeof console !== "undefined") console.error("[partner] joinByCode failed", e);
      const msg = describeErr(e);
      setJoinError(msg); p.onToast?.(msg);
    } finally { setBusy(false); }
  }

  const meReady = !!(session && session.participants[ctx.uid]?.ready);
  const isHost = !!(session && session.hostUid === ctx.uid);
  const now = backend.now();

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!session) return [];
    return suggestSharedLifts(toUsers(session, ctx), ctx.catalog ?? PARTNER_COMPOUNDS).filter((s) => !removed.has(s.eid));
  }, [session && JSON.stringify(session.participants), vibe, removed]);

  const proposalLifts = useMemo<ProposalLift[]>(() => {
    if (!session) return [];
    const users = toUsers(session, ctx);
    const scheme = VIBE_SCHEMES[vibe];
    return suggestions.map((s) => {
      const plan = buildSharedLiftPlan(s, users, scheme, incrFor(s.eid, ctx.catalog ?? PARTNER_COMPOUNDS));
      return {
        eid: s.eid, name: s.name, reason: s.reason, scheme,
        loads: plan.loads.map((l) => ({ uid: l.uid, name: l.name, load: l.load, unit: ctx.unit, maxSource: l.maxSource, needsCalibration: l.needsCalibration })),
      };
    });
  }, [suggestions, vibe, session && JSON.stringify(session.participants)]);

  // Scannable QR of the deep-link join URL (host's lobby). Recomputed only when the code changes.
  const qrHtml = useMemo(() => {
    if (!code) return null;
    const base = typeof location !== "undefined" ? location.origin + location.pathname : "";
    return qrSvg(base + "#join=" + code);
  }, [code]);

  // ── render by phase ──
  if (!session) {
    return (
      <PartnerEntry
        mode={view === "joining" ? "joining" : "idle"}
        code={code} joinError={joinError} busy={busy}
        actions={{ startSession, openJoin: () => setView("joining"), submitJoin: (c) => doJoin(c), cancel: () => { setView("entry"); setJoinError(""); } }}
      />
    );
  }

  if (session.status === "lobby") {
    const roster: LobbyParticipant[] = Object.values(session.participants).map((x) => ({
      uid: x.uid, name: x.name, handle: x.handle, role: x.role, ready: x.ready,
      online: isOnline(x, now), maxesShared: x.maxesShared,
    }));
    return (
      <div class="pn-flow">
        {isHost && code ? <div class="pn-lobby-code">Join code: <b>{code}</b></div> : null}
        {isHost && qrHtml ? <div class="pn-qr" aria-label="Scan to join" dangerouslySetInnerHTML={{ __html: qrHtml }} /> : null}
        <PartnerLobby
          participants={roster} meUid={ctx.uid} isHost={isHost}
          actions={{
            toggleReady: (r) => setReadyRemote(backend, session.id, ctx.uid, r),
            start: () => transition(backend, session.id, "proposing"),
            invite: () => {
              try {
                const url = location.origin + location.pathname + "#join=" + code;
                const done = () => p.onToast?.("Invite link copied — text it to your partner.");
                if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done, done);
                else done();
              } catch { /* clipboard unavailable */ }
            },
            leave: () => p.onExit(),
          }}
        />
      </div>
    );
  }

  if (session.status === "proposing") {
    if (!isHost) return <div class="pn-flow card"><p class="pn-waiting">Your host is choosing the shared lifts…</p></div>;
    return withCalib(
      <SharedBlockProposal
        vibe={vibe} vibes={VIBES} lifts={proposalLifts} meUid={ctx.uid}
        actions={{
          setVibe: (v) => setVibe(v as Vibe),
          removeLift: (eid) => setRemoved((s) => new Set([...s, eid])),
          addLift: () => {},
          calibrate: (eid, uid) => { if (uid === ctx.uid) setCalib({ eid, liftName: proposalLifts.find((l) => l.eid === eid)?.name || eid }); },
          confirm: async () => {
            const lifts = proposalLifts.map((l, i) => ({ eid: l.eid, name: l.name, order: i, scheme: l.scheme }));
            await setSharedBlock(backend, session.id, lifts, vibe);
            await transition(backend, session.id, "active");
          },
          back: () => transition(backend, session.id, "lobby"),
        }}
      />
    );
  }

  if (session.status === "active") {
    const users = toUsers(session, ctx);
    return withCalib(
      <div class="pn-live card">
        <div class="card-h"><h2>Shared lifts</h2>{session.liveState.turn ? <span class="badge badge-fire">Up: {session.participants[session.liveState.turn.uid]?.name} · set {session.liveState.turn.setNo}</span> : null}</div>
        {session.sharedLifts.map((lift) => {
          const plan = buildSharedLiftPlan({ eid: lift.eid, name: lift.name, jointScore: 0, reason: "" }, users, lift.scheme, incrFor(lift.eid, ctx.catalog ?? PARTNER_COMPOUNDS));
          const mine = plan.loads.find((l) => l.uid === ctx.uid);
          return (
            <div class="pn-live-lift" key={lift.eid}>
              <div class="pn-live-head"><b>{lift.name}</b><span>{lift.scheme.sets}×{lift.scheme.reps} · {lift.scheme.intensityPct}%</span></div>
              <div class="pn-live-mine">Your load: <b>{mine && !mine.needsCalibration ? mine.load : "—"} {ctx.unit}</b></div>
              {mine && mine.needsCalibration ? (
                <button type="button" class="btn btn-secondary-solid btn-sm pn-live-cal" onClick={() => setCalib({ eid: lift.eid, liftName: lift.name })}>Set your max</button>
              ) : (
                <button type="button" class="btn btn-cta btn-sm pn-live-log" disabled={!mine || !mine.load} onClick={async () => {
                  const w = mine!.load, reps = lift.scheme.reps;
                  await logSharedSet(backend, session.id, { id: ctx.uid + "_" + lift.eid + "_" + backend.now(), uid: ctx.uid, handle: ctx.handle, eid: lift.eid, name: lift.name, weight: w, reps });
                  p.onLogSet?.({ eid: lift.eid, name: lift.name, weight: w, reps });
                  await advanceTurn(backend, session.id, Object.keys(session.participants));
                }}>Log {mine?.load} {ctx.unit} × {lift.scheme.reps}</button>
              )}
            </div>
          );
        })}
        <div class="pn-feed">
          {feed.slice(-8).map((e) => <div class="pn-feed-row" key={e.id}><b>{e.handle}</b> {e.name} · {e.weight} × {e.reps}{e.isPR ? " 🏆" : ""}</div>)}
        </div>
        {isHost ? <button type="button" class="btn btn-mint btn-block pn-live-split" onClick={() => transition(backend, session.id, "split")}>Done together → solo accessories</button> : <p class="pn-hint">Your host moves the group to accessories when ready.</p>}
      </div>
    );
  }

  if (session.status === "split") {
    const splitEids = ctx.planEids.filter((e) => !session.sharedLifts.some((l) => l.eid === e));
    return (
      <div class="pn-split card">
        <div class="card-h"><h2>Your accessories</h2></div>
        <p class="pn-sub">Shared lifts done. Finish your own {splitEids.length} accessory move{splitEids.length !== 1 ? "s" : ""} on your normal Train tab — your partner does theirs.</p>
        <button type="button" class="btn btn-cta btn-block" onClick={() => p.onGoToSplit?.()}>Go to my workout</button>
        {isHost ? <button type="button" class="btn btn-secondary-solid btn-block" onClick={async () => { await transition(backend, session.id, "complete"); p.onExit(); }}>End partner session</button>
          : <button type="button" class="btn btn-ghost btn-block" onClick={() => p.onExit()}>Leave</button>}
      </div>
    );
  }

  // complete / abandoned
  return (
    <div class="pn-done card">
      <div class="card-h"><h2>{session.status === "abandoned" ? "Session ended" : "Nice work together"}</h2></div>
      <button type="button" class="btn btn-cta btn-block" onClick={() => p.onExit()}>Done</button>
    </div>
  );
}

export { PartnerApp };
export function mountPartnerApp(container: Element, props: PartnerAppProps): void {
  render(<PartnerApp {...props} />, container as unknown as import("preact").ContainerNode);
}
