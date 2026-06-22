// Partner Sessions — M4 orchestrator. Owns the whole flow (entry → lobby →
// proposal → live → split → done) over an INJECTED SessionBackend, so the entire
// integration is unit-testable with the in-memory fake; ui.js passes the concrete
// FirestoreBackend + the user context + a callback to log sets into own history.
import { render } from "preact";
import { useState, useEffect, useMemo, useRef } from "preact/hooks";
import { PartnerEntry } from "./partner-entry";
import { PartnerLobby, type LobbyParticipant } from "./partner-lobby";
import { SharedBlockProposal, type ProposalLift } from "./shared-block-proposal";
import { MatchBoard, type MatchParticipant } from "./match-board";
import { CalibrationSheet } from "./calibration-sheet";
import { qrSvg } from "../core/qr";
import {
  suggestSharedLifts, buildSharedLiftPlan, VIBE_SCHEMES, PARTNER_COMPOUNDS,
  type PartnerUser, type Vibe, type Suggestion, type Scheme,
} from "../core/partner";
import {
  buildJointPlan, jointLiftsFromMap, liftKeyForName,
  type DayPlanItem, type JointLift, type JointRx, type LifterProfile,
} from "../core/partner-match";
import type { PartnerSession, Participant } from "../core/partner-pairing";
import { isOnline } from "../core/partner-pairing";
import {
  type SessionBackend, type FeedEvent,
  hostCreateSession, joinByCode, setReadyRemote, heartbeat, setSharedBlock, transition, logSharedSet, advanceTurn,
  toggleJointLift, publishJointRx,
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
  // program-based matchmaking (redesign):
  dayPlan?: DayPlanItem[];                 // my programmed working sets today
  scheme?: Scheme;                         // resolved from my current program phase
  strengthByKey?: Record<string, number>;  // liftKey -> 1RM, for borrowed-lift estimation
  bodyweightKeys?: string[];               // lift keys that need no load (pull-up…)
}
export interface PartnerAppProps {
  backend: SessionBackend;
  ctx: PartnerCtx;
  initialJoinCode?: string;
  heartbeatMs?: number; // presence cadence; 0 disables (tests)
  onLogSet?: (ev: { eid: string; name: string; weight: number; reps: number }) => void;
  onGoToSplit?: () => void;
  onStartJoint?: (rx: JointRx[]) => void; // reprogram today's Train session as [joint → accessories]
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
  const me = { uid: ctx.uid, handle: ctx.handle, name: ctx.name, maxes: ctx.maxes, focus: ctx.focus, equipment: ctx.equipment, dayPlan: ctx.dayPlan || [] };

  const [view, setView] = useState<"entry" | "joining">("entry");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<PartnerSession | null>(null);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [code, setCode] = useState<string>("");
  const [joinError, setJoinError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [vibe, setVibe] = useState<Vibe>("hypertrophy");
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [calib, setCalib] = useState<{ eid: string; key: string; liftName: string } | null>(null);
  const [calibratedMaxes, setCalibratedMaxes] = useState<Record<string, number>>({});
  const [setupNeeded, setSetupNeeded] = useState(false);
  const triedInitial = useRef(false);

  // I calibrate my own missing strength for a borrowed lift → recomputes my joint load locally.
  const onCalibSubmit = (max: number) => {
    if (calib) setCalibratedMaxes((m) => ({ ...m, [calib.key]: max }));
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
    if (e?.code === "permission-denied" || /insufficient permissions|PERMISSION_DENIED/i.test(e?.message || "")) {
      setSetupNeeded(true);
      return "Partner Sessions need a one-time server setup.";
    }
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

  // ── program-based matchmaking ──
  const myLifter: LifterProfile = useMemo(() => ({
    dayPlan: ctx.dayPlan || [],
    scheme: ctx.scheme || VIBE_SCHEMES.hypertrophy,
    strengthByKey: { ...(ctx.strengthByKey || {}), ...calibratedMaxes },
    bodyweightKeys: ctx.bodyweightKeys || [],
    unit: ctx.unit,
  }), [ctx, calibratedMaxes]);
  const joints = useMemo<JointLift[]>(() => jointLiftsFromMap(session?.jointLifts), [session && JSON.stringify(session.jointLifts)]);
  const myRx = useMemo<JointRx[]>(() => buildJointPlan(myLifter, joints), [myLifter, joints]);

  // Publish my resolved prescriptions so my partner sees my loads. Only when they change.
  useEffect(() => {
    if (!sessionId || !session || session.status !== "proposing") return;
    const mine = session.participants[ctx.uid]?.jointRx || [];
    if (JSON.stringify(mine) !== JSON.stringify(myRx)) publishJointRx(backend, sessionId, ctx.uid, myRx).catch(() => {});
  }, [sessionId, session?.status, JSON.stringify(myRx)]);

  // ── render by phase ──
  if (!session) {
    if (setupNeeded) {
      return (
        <div class="pn-entry card pn-setup">
          <div class="card-h"><h2>Almost there</h2></div>
          <p class="pn-sub">Lift Together needs a quick one-time server permission update before the first session can be created. This is an owner-level setup step — once it's done, partner sessions work for everyone.</p>
          <ol class="pn-setup-steps">
            <li>Open the <b>Firebase console</b> → Firestore Database → <b>Rules</b>.</li>
            <li>Add the <code>partner_sessions</code>, <code>session_codes</code> &amp; <code>partner_invites</code> rules, then <b>Publish</b>.</li>
            <li>Come back and tap <b>Try again</b>.</li>
          </ol>
          <button type="button" class="btn btn-cta btn-block pn-setup-retry" onClick={() => { setSetupNeeded(false); setJoinError(""); }}>Try again</button>
          <button type="button" class="btn btn-ghost btn-block" onClick={() => p.onExit()}>Close</button>
        </div>
      );
    }
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
    // Each lifter sees their own resolved loads (mine computed locally for instant feedback).
    const participants: MatchParticipant[] = Object.values(session.participants).map((x) => ({
      uid: x.uid, name: x.name, dayPlan: x.dayPlan || [],
      rx: x.uid === ctx.uid ? myRx : (x.jointRx || []),
    }));
    return withCalib(
      <MatchBoard
        meUid={ctx.uid} participants={participants} joints={joints} unit={ctx.unit} busy={busy}
        actions={{
          toggle: (item: DayPlanItem) => {
            const isIn = joints.some((j) => j.eid === item.eid);
            const jl: JointLift | null = isIn ? null : { eid: item.eid, key: liftKeyForName(item.name), name: item.name, addedBy: ctx.uid, addedAt: backend.now() };
            toggleJointLift(backend, session.id, jl, item.eid).catch(() => {});
          },
          remove: (eid: string) => { toggleJointLift(backend, session.id, null, eid).catch(() => {}); },
          calibrate: (rx: JointRx) => setCalib({ eid: rx.eid, key: rx.key, liftName: rx.name }),
          start: async () => {
            await publishJointRx(backend, session.id, ctx.uid, myRx).catch(() => {});
            p.onStartJoint?.(myRx);
          },
          back: () => transition(backend, session.id, "lobby"),
        }}
      />
    );
  }

  if (session.status === "active" || session.status === "split") {
    // The shared lifts run in the real Train session (full card UI); this is just a fallback view.
    return (
      <div class="pn-split card">
        <div class="card-h"><h2>Training together</h2></div>
        <p class="pn-sub">Your shared lifts are loaded on your Train tab — do them together at each of your own loads, then finish your own accessories. Your partner does theirs.</p>
        <button type="button" class="btn btn-cta btn-block" onClick={() => p.onGoToSplit?.()}>Go to my workout</button>
        <button type="button" class="btn btn-ghost btn-block" onClick={() => p.onExit()}>Leave session</button>
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
