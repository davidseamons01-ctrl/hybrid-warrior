# Partner Sessions — Design Spec ("Lift Together")

> Status: **Decisions resolved — ready to build.** Direction (decided 2026-06):
> **live co-op from the start** · **smart-suggested shared lifts (confirmable)** ·
> **both pairing methods** (code/QR + gym-buddies) · **full spec before build**.
>
> Resolved open questions (§14): shared lift uses the **vibe preset with a
> per-lift "match their program" override**; max-sharing requires an **explicit
> opt-in toggle for everyone** (not implicit via community); **groups of 3+ are
> first-class in v1** (lobby + live UI built for N, not pairs-first); **remote
> partners are deferred** to a later phase (v1 is co-located).

## 1. Summary

Let two (or more) users who are physically at the same gym run a **shared training
session**: a handful of **major lifts done together** — each loaded to *their own*
strength — followed by a **split** into each person's program-specific accessories.
It's real-time (you see each other lift), and every logged set still belongs to each
person's own history, stats, PRs, and dashboards.

The defining example: a husband mid-**hypertrophy** (bench 4×8 @ %1RM) and a wife
focused on **glutes** tap "Bring a friend," link up, and the app proposes shared
compounds that serve *both* goals (e.g. **Back Squat + Hip Thrust**). Each does the
same set/rep/intensity scheme but at a load scaled to **their own max** (he squats
285, she squats 135), then they split — he to bench + triceps, she to abductions +
kickbacks.

## 2. Goals / Non-goals

**Goals**
- Make training with a friend frictionless and motivating, in person.
- Keep each person's **programming and progression intact** — a partner session is
  additive coordination, not a detour from their plan.
- **Load every shared lift correctly for each individual** (the core challenge).
- Real-time "togetherness": presence, live sets, synced rest, turn-taking on a bar.
- Each user's data stays **theirs** (logs, PRs, streaks, dashboards all update).

**Non-goals (v1)**
- Remote/distributed partners in different gyms (possible later; v1 assumes co-located).
- Coaching/spotting cues beyond existing exercise guidance.
- Public matchmaking with strangers (privacy: invited/known partners only).

## 3. Glossary
- **Host** — the user who creates the session.
- **Guest(s)** — user(s) who join.
- **Shared block** — the agreed lifts done together (1–3 compounds).
- **Split** — the per-user accessory phase after the shared block.
- **Vibe** — the shared-block intensity preset: Strength (5×3 @ 85%) · Hypertrophy
  (4×8 @ 70%) · Pump (3×12 @ 60%). Drives the scheme; load = `max × intensity%`.
- **Gym-buddy** — a saved, persistent partner (friends list).
- **Calibration set** — a one-set estimate used to derive a provisional 1RM when a
  user lacks a max for a shared lift.

## 4. User stories
1. As a lifter at the gym with my partner, I can link our phones in seconds (code/QR)
   and start a session together.
2. As a couple with different programs, the app suggests lifts that work for *both* of
   us, and loads them to each of our strengths automatically.
3. As someone who's never done a barbell squat, the app helps me find a safe starting
   load (calibration or substitution) instead of guessing.
4. As a partner, I can see my buddy's sets land live, share a rest timer, and know
   whose turn it is to load the bar.
5. After we split to accessories, I still finish *my* program, and my logs count
   toward *my* PRs and streaks.
6. As a regular gym-goer, I can save someone as a gym-buddy and re-invite them.
7. As a privacy-conscious user, I control what I share and with whom.

## 5. End-to-end flow (happy path, 2 people)

1. **Entry.** He opens **Train → "Bring a friend."** Two options: *Invite a gym-buddy*
   (from friends) or *Start an open session* (shows a 6-char **code + QR**).
2. **Join.** She taps **"Join a session,"** scans the QR / enters the code, or accepts
   his invite. Each phone reads the other's **public maxes** (`community/{uid}`), or
   prompts consent to share maxes if not in the community.
3. **Lobby.** Both see each other "ready." Host taps **Continue.**
4. **Propose shared block.** App suggests **Back Squat 4×8, Hip Thrust 3×10** (goal-aware
   pick) and a **vibe** toggle (default Hypertrophy). A live per-person load preview
   shows: *Squat — he 285, she 135 · Hip Thrust — he 225, she 155.* They can
   add/remove a lift or change the vibe. Missing max → **calibration** mini-flow.
5. **Live shared block.** A shared screen runs the compounds with **turn-taking + plate
   prompts** ("Wife up — bar at 135 = 45/side") and a **synced rest timer**. Each set
   logs to the lifter's own history. They see each other's sets land live.
6. **Split.** App announces "Solo accessories." His phone continues *his* remaining
   session (bench, triceps); her phone continues *hers* (abduction, kickbacks). A
   persistent **partner status bar** shows the other's progress/online state.
7. **Finish.** A **joint Session Summary**: combined volume, who PR'd, "Trained with
   Sarah," plus each person's own recap. Optional **"Save as gym-buddy."**

Variations: 3+ people (group), one partner finishes early, connection drop, one user
not in the community, metric/imperial mismatch — see §11.

## 6. Feature detail

### 6.1 Pairing (both methods)
- **Ephemeral code/QR (primary, co-located).** Host creates session → `session_codes/{code}`
  doc maps a short code (6 chars, ~10-min TTL) → `sessionId`. Guest enters code / scans
  QR (QR encodes a deep link `#join=<code>`). No friendship required. Code is deleted on
  start or expiry.
- **Gym-buddies (persistent).** A friends list: request by handle → accept → stored in
  each user's prefs (`gymBuddies:[{uid,handle}]`) and/or a `friendships` collection.
  Invite a buddy → push an invite into their `partner_invites/{uid}` so they get a prompt.
- **Consent (explicit opt-in for everyone).** Sharing maxes with a partner requires a
  dedicated **"Share my maxes with partners"** setting — *on* for nobody by default,
  independent of community membership. If a joining user hasn't enabled it, the join
  screen prompts a one-tap enable (or "share for this session only"). Handle + display
  name are shared to participate; maxes are gated by the toggle. This keeps strength
  numbers private even from community-visible profiles unless the user chooses to share
  them in a session context.

### 6.2 The merge engine (smart-suggest, confirmable) — *pure, testable*
Input: both users' `rollingPlanForDate(today)`, goals/focus areas, safety mode
(postpartum etc.), equipment, and their maxes.

**Shared-lift suggestion**
- Maintain a curated **partner-friendly compound catalog**, each tagged with primary
  muscles/goals and equipment: Back/Front Squat, Bench/Incline, Deadlift/RDL, **Hip
  Thrust**, OHP, Barbell Row, Pull-up, Lunge, Leg Press.
- **Score each candidate by joint fit:** how well its target muscles overlap *each*
  user's current focus/phase emphasis (sum or min of the two — `min` rewards lifts good
  for *both*). Bonus if the lift is already in either user's program today (continuity).
  Exclude lifts blocked by a user's safety mode or unavailable equipment.
- Output: top **1–3** by joint score + a default **scheme** from the chosen vibe.
- Fully **editable** — add/remove from the catalog, reorder, change vibe.

**Scheme source.** The shared lift's `{sets,reps,intensityPct}` comes from the chosen
**vibe preset** (Strength/Hypertrophy/Pump) — predictable and valid even when the lift
is in neither program. Per shared lift, a one-tap **"match <name>'s program"** override
swaps in that user's actual programmed scheme for the day (e.g. his bench 4×8 @ 75%);
the partner then mirrors that scheme at their scaled load.

**Load scaling**
- For each shared lift with `scheme.intensityPct`: `load(user) = round(user.max1RM × pct)`
  to the user's bar increment. One shared rep/set scheme, per-user load. (Exactly the
  "each does 50% of *their own* max" requirement.)
- Rounding respects units (lb/kg) and plate math.

**Missing-max ladder** (when a user has no max for a shared lift)
1. Use their **logged e1RM** (`bestEpleyForExercise` / all-time bests).
2. **Calibration set:** "Do one set, enter weight × reps" → Epley e1RM → provisional
   1RM (persisted so it carries forward).
3. **Estimate:** bodyweight × experience coefficient per lift, clearly labeled
   "starting estimate — adjust as you go."
4. **Substitute:** offer a safer variant the user owns (machine/DB) and scale that.
After the session, the existing **adaptation engine** refines the load each time.

**Accessory split**
- Each user's split = their normal session **minus** the shared lifts already done
  (filter `rollingPlanForDate` by the shared eids), preserving their periodization. If
  the shared lift wasn't in their plan, nothing is removed; their full session follows.

### 6.3 Live co-op runtime (real-time)
- **Session doc** `partner_sessions/{id}` (see §7) is the single source of coordination,
  watched by all clients via `onSnapshot` (same pattern as existing sync).
- **Presence:** heartbeat — each client updates `participants[uid].lastSeen` every ~10s;
  a partner is "offline" if stale > ~30s. (Firestore has no native presence.)
- **Live set feed:** each completed set appends to `partner_sessions/{id}/feed` *and* to
  the lifter's own `hw/{uid}` event stream. Feed entries are id-keyed → **CRDT union**,
  so concurrent writes never conflict (reuses `mergeEvents`).
- **Turn-taking:** `liveState.turn = {uid,setNo}` for the current shared lift; completing
  a set advances the turn. Advisory, not a hard lock (two bars → ignore).
- **Synced rest:** completing a shared set sets `liveState.restEndsAt`; clients render a
  shared countdown.
- **Write hygiene:** optimistic local first; throttle Firestore writes (reuse existing
  push throttling); all set-events are commutative/idempotent.

### 6.4 Barbell turn-taking & plate prompts
For a shared barbell lift, show **whose set is up** and that person's exact plate setup
(reusing the plate calculator): "He 285 = 45+45+25/side → loaded. Next: She 135 =
45/side → swap." A one-tap "swap confirmed" advances. Standout, friction-killing UX;
works locally even if the live layer is degraded.

### 6.5 Attribution & history
Every set logged in a partner session is a **normal WorkoutEvent** in the lifter's own
stream, tagged `partnerSessionId` (+ partner handle). So: stats/PRs/streaks/dashboards
update normally, *and* we can show "trained with X" history and partner achievements.

### 6.6 Joint summary
Reuse the new **Session Summary** with a combined header (both lifters, combined volume,
who PR'd, "Trained with Sarah") plus each person's own recap. Unlocks a **partner
achievement** ("Trained together ×N").

## 7. Data model (Firestore)

```
partner_sessions/{sessionId}
  hostUid: string
  status: "lobby" | "proposing" | "active" | "split" | "complete" | "abandoned"
  createdAt, updatedAt: ts
  vibe: "strength" | "hypertrophy" | "pump"
  sharedLifts: [{ eid, name, order, scheme:{sets,reps,intensityPct} }]
  participants: {                       // keyed by uid (supports N>2 from day one)
    <uid>: { uid, handle, displayName, role:"host"|"guest",
             maxes:{<eid>:1rm,...}, calibrated:{<eid>:bool},
             ready:bool, lastSeen:ts, progress:{sharedDone:int, splitDone:int} }
  }
  liveState: { currentLiftIndex:int, turn:{uid,setNo}, restEndsAt:ts|null }

partner_sessions/{sessionId}/feed/{eventId}     // live set feed, CRDT id-union
  { uid, handle, eid, name, weight, reps, ts, isPR:bool }

session_codes/{code}                            // ephemeral pairing, ~10-min TTL
  { sessionId, hostUid, expiresAt }

partner_invites/{uid}/items/{inviteId}          // gym-buddy invites inbox
  { fromUid, fromHandle, sessionId, createdAt }

friendships/{pairId}  (or prefs.gymBuddies[])   // persistent buddies
  { a:uid, b:uid, since }
```

**Lifecycle state machine:** `lobby → proposing → active(shared block) → split → complete`
(any state → `abandoned` on host leave/timeout). Guests may continue **solo** from
`split`/`abandoned` using their own local data.

## 8. Security & privacy (Firestore rules)
- `partner_sessions/{id}` read/write only if `request.auth.uid in resource.participants`
  (or the user presents a valid unexpired `session_codes` entry during `lobby`).
- `session_codes/{code}`: readable by anyone who knows the code (it *is* the secret);
  writable/deletable only by host; TTL-expired.
- **Maxes are shared only when a user has the "Share my maxes with partners" opt-in
  enabled** (or grants per-session sharing on join) — independent of community
  visibility. A participant doc only ever contains another user's maxes if that user
  consented; rules reject writing someone else's maxes.
- `partner_invites/{uid}/...` writable by senders, readable/deletable by the owner.
- Each user's own `hw/{uid}` stream remains private to them (unchanged).

> **Implemented (M2):** version-controlled rules live in [`firestore.rules`](../firestore.rules)
> — reconcile with the live console rules and test in the emulator before
> `firebase deploy --only firestore:rules`. The pure session/pairing data model is in
> `src/core/partner-pairing.ts` (unit-tested); the fbDb create/join/onSnapshot wrappers
> land in M3 alongside the live runtime.

## 9. Architecture & fit with the existing app
- **Engine (pure, tested like the rest):** new `src/core` modules —
  `partner/suggest.ts` (joint-fit scoring), `partner/scale.ts` (load scaling + rounding),
  `partner/calibrate.ts` (Epley/estimate ladder), `partner/merge.ts` (shared block +
  accessory split). Reuse `epley`, equipment subs, periodization.
- **Realtime layer:** a thin `partner/session.ts` wrapper over the existing Firestore
  handle (`fbDb`) — create/join/watch/update + presence heartbeat + CRDT feed merge
  (reuse `mergeEvents`). Offline → queue (reuse the IndexedDB queue).
- **UI:** new Preact components (strangler pattern, like the recent ports) —
  `PartnerEntry`, `PartnerLobby`, `SharedBlockProposal`, `CalibrationSheet`,
  `LiveSessionBar`, `TurnTakingCard`, `JointSummary`. Mounted from `ui.js` slots.
- **Logging:** extend `recordLoggedSet` to accept an optional `partnerSessionId` tag;
  everything else (projection, PRs, dashboards) is unchanged.

## 10. UI / screens
1. **Partner entry** (Train) — Invite buddy · Start open session (code/QR) · Join.
2. **Lobby** — participants, ready states, presence.
3. **Shared-block proposal** — suggested lifts, vibe toggle, per-person load preview,
   editable; triggers calibration where needed.
4. **Calibration sheet** — one-set estimate or substitution.
5. **Live session** — shared block with turn-taking + plate prompts + synced rest +
   live partner feed.
6. **Split view** — your own accessories + persistent partner status bar.
7. **Joint summary** — combined + per-person recap; save-as-buddy.
8. **Settings** — gym-buddies management + sharing/privacy controls.

## 11. Edge cases & safety
- **Strength disparity:** handled by per-max scaling (the point of the feature).
- **No max / new lift:** calibration ladder; never auto-prescribe heavy barbell work
  without a basis; "start light."
- **Safety modes** (postpartum, injury, women's modes): exclude blocked lifts from
  suggestions; respect each user's constraints.
- **Equipment conflict:** if a user lacks the equipment, substitute and scale.
- **Units mismatch** (one metric, one imperial): scale/round per user's unit.
- **Partner leaves / disconnects:** mark offline; remaining user(s) continue solo with
  their own data; session → `abandoned` if host gone.
- **Offline / spotty gym wifi:** live features degrade to **linked-async** automatically;
  local logging never blocks.
- **Group (3+):** first-class in v1 — schema, engine, lobby and live UI all handle N
  participants. Each lifter's loads scale to their own maxes; turn-taking rotates the
  shared bar through everyone using it; the split runs each person's own accessories;
  the joint summary spans the whole group.
- **Non-community user:** ad-hoc max sharing for the session, with consent.
- **Abuse/privacy:** invited/known partners only; codes expire; no public matchmaking.

## 12. Milestones (build order, even for the full spec)
- **M1 — Engine (offline, pure):** suggest + scale + calibrate + split, fully unit-tested.
  *No networking — validates the core math/UX first.*
- **M2 — Pairing:** session codes/QR + gym-buddies + invites + Firestore rules.
- **M3 — Live runtime:** session doc, `onSnapshot`, presence heartbeat, CRDT set feed,
  turn-taking, synced rest.
- **M4 — UI (N-person):** entry → lobby → proposal → calibration → live → split →
  joint summary, all built for **groups of 3+**, not just pairs.
- **M5 — Polish & beyond:** encouragement, partner achievements/streaks, scheduling
  invites, and the deferred **remote-partner** (different-gym, same-workout) mode.

## 13. Testing strategy
- **Engine:** vitest unit tests (load scaling across units/maxes, suggestion scoring,
  calibration ladder, accessory split) — pure functions, deterministic.
- **Components:** happy-dom component tests for each new Preact screen (like the
  existing port tests).
- **Realtime:** Firestore emulator (or mocked `onSnapshot`) for create/join/merge/
  presence; simulate disconnect, concurrent writes, host-abandon.
- **Integration:** seed two users, run a full partner flow headlessly; assert each
  user's own log/PRs updated and the joint summary is correct.

## 14. Resolved decisions
1. **Shared-lift scheme:** **vibe preset** (Strength/Hypertrophy/Pump), with a per-lift
   **"match <name>'s program"** override. ✓
2. **Max-sharing:** **explicit opt-in toggle for everyone** ("Share my maxes with
   partners"), plus a per-session grant on join — independent of community visibility. ✓
3. **Groups (3+):** **first-class in v1** — schema, engine, and UI all built for N. ✓
4. **Remote partners:** **deferred** — v1 is co-located; remote is an M5 mode. ✓
5. **Gym-buddy storage:** start with `prefs.gymBuddies[]` per user (no fan-out);
   migrate to a `friendships` collection only if/when we need server-side queries. ✓
6. **Mid-session shared-block edits:** **host-controlled**, synced to all participants. ✓

## 15. Next step
Build **M1 — the pure merge engine** (`suggest` / `scale` / `calibrate` / `merge`) with
full unit tests and zero networking, to validate the load-math and split UX first.
