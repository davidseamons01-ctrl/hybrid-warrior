# David's hands-on UX critique — July 2026 (revamp backlog)

Source: David using the live app on mobile, batch 1 of screenshots.
Status: LOGGING ONLY — no changes until David gives the go-ahead.

## 1. You → Settings — "way too much information, I get lost"
- Doubts he would ever use most of what's in Settings.
- Hard to navigate; lots of low-yield information.
- Unclear what each fold is for or whether it applies to him at all
  ("not sure how they are applicable, if at all").
- Implication: Settings needs ruthless triage — hide/remove low-value
  folds, plain-language purpose lines per section, maybe a "common
  settings" short list with everything else demoted.

## 2. Progress — Overview vs Classic duplication
- "What is the point of having both Overview and Classic — mostly the
  same information."
- Wants ONE consolidated Progress view: less overwhelming, easy to
  navigate, easy to understand, still informative.
- Implication: Classic must die sooner than planned — fold its few
  unique, high-value pieces into Overview and delete the rest.

## 3. Progress → Classic → "more stats" fold — hidden junk drawer
- The expandable "goal gauges, body-fat calc, pain map & charts" area is:
  hidden, overwhelming, redundant, hard to use and navigate.
- Implication: kill the hidden fold pattern. Any stat worth keeping
  earns a clear place in the single Progress view; the rest goes.

## 4. Today tab — redundancy between Start session and the card stack
- "Too many things going on."
- Core confusion: why tap Start session when you can just do the workout
  from the exercise cards listed below it? Two competing ways to do the
  same thing on one screen.
- Implication: pick ONE primary path (the session player) and demote or
  remove the inline exercise-card stack (or show it only as a read-only
  preview / move full logging into the player exclusively).
- David: "a lot of things to change on the Today tab" — more critique
  coming in the next batch.

## 5. Today — Ghost mode + warm-up placement
- Ghost mode: no idea what it is or why it's useful — "seems dumb and
  not needed." (It compares against 4 weeks ago; the label communicates
  nothing.) Candidate for removal or absorption into the player.
- Warm-up checklist renders on the Today page OUTSIDE the session — feels
  weird; warm-up belongs INSIDE the session flow.

## 6. Today — Toolbox/Workout tools redundant with the player
- "Why do I have this if I have a dedicated Start session module?"
- Tools that are genuinely useful mid-workout should live inside the
  focused session (player), not in a separate fold on the page.

## 7. Today — impact map placement
- The muscle impact map is GOOD content, but it belongs before/at the
  start of the session (as a preview of what you're about to work),
  not buried far down the page.

## 8. Today — finisher placement
- The "Finisher" box is random and never reached during a real session.
- "Add 5-min core finisher" button equally randomly placed at the bottom.
- Both should be part of the focused session flow (e.g., the player
  offers the finisher after the last exercise).

## 9. Today — core-finisher cards + the two FABs
- Tapping "Add core finisher" dumps oddly placed exercise cards
  (Cable Crunch / DB Leg Raise with a "Transition" card) into the page —
  these should populate inside the workout session (player), not as more
  page cards.
- The microphone FAB and the + FAB: "I never use those ever." Candidates
  for removal or demotion off the floating layer.

## Emerging theme (my synthesis, for the revamp)
The session player should be THE single container for everything
workout-related: warm-up ramp, impact-map preview at start, mid-workout
tools, finisher offered at the end. Today becomes a clean pre-session
screen (hero + start + week context) with no parallel workout surfaces.
Kill or bury: Ghost, FABs, standalone finisher/tools/warm-up cards.

## 10. Focus mode is dead weight
- "Focus mode is useless, I have Start session that works better."
- The legacy focus carousel (kept as a fallback) has failed its audition —
  remove it and the Exit Focus/Focus chip entirely.

## 11. Player — education sacrificed
- LIKES the Start session setup overall.
- But: no way to read how to do the exercise or watch the YouTube video
  from inside the player when confused. The old cards had how-to + video;
  the player dropped them. Add an on-demand details/video view per
  exercise inside the player (without cluttering the default screen).

## 12. Player — rest timer only adds time
- +30s exists, Skip exists, but no way to SUBTRACT time. Add −30s (or
  similar) control.

## 13. Player — no way to finish early
- The "Finish session" screen only appears after ALL sets are logged.
- If you stop partway (real life), there's no "I'm done for today" button
  that logs what you did and finalizes. Needs an always-reachable
  end-workout affordance in the player (e.g., via the X/exit flow:
  "Finish & save" vs "Keep for later").

## 14. Session summary — muscle map shows the PLAN, not what happened
- The muscles-worked map on the completion card lights up everything the
  program PLANNED, even when only part of the session was done.
- Should reflect only exercises actually logged that day.

## 15. Rescheduling glitches
- "The app glitches out when you reschedule a workout day." Harden the
  schedule-planner flow (reproduce, fix errors, make close/refresh clean).

## 16. Vacation pause (new feature)
- Allow pausing the program for a week or so (vacation) without wrecking
  the block, triggering missed-session prompts, or losing progress.
  Resume shifts the program start so you pick up where you left off.

## STATUS: GO-AHEAD GIVEN 2026-07-02 — PHASE 7 SHIPPED.
Resolution of every logged item:
1. Settings bloat → triaged to 3 top folds (Profile, Account & plan,
   Advanced & integrations); 6 niche folds nested; "How to" banner removed. ✅
2. Progress Overview/Classic dup → Classic subtab DELETED; single Progress
   view (Coach + metrics + Goals&forecast + strength + heatmap + PR +
   achievements + body + log-measurements + PDF export). ✅
3. Classic "more stats" junk drawer → gone with Classic. ✅
4. Today two competing paths → card stack removed; player is the only way
   to train; Today is a clean pre-session screen. ✅
5. Ghost mode removed; warm-up now a phase INSIDE the player. ✅
6. Toolbox removed; tools live in the player (plate math under load). ✅
7. Impact map → promoted to a "What today works" fold under the hero +
   "Muscles worked" chip that jumps to it. ✅
8. Finisher → offered on the player's done screen, not stranded. ✅
9. Core-finisher → adds exercises INSIDE the player; mic + "+" FABs hidden. ✅
10. Focus mode removed. ✅
11. Player how-to + video sheet added (per-exercise). ✅
12. Rest timer −30s added (alongside +30s). ✅
13. Early finish: X → exit sheet with "Finish & save". ✅
14. Summary muscle map → derives from LOGGED exercises only. ✅
15. Reschedule hardened: apply/save wrapped in try/catch (clean fail +
    toast); rollingPlanForDate override guarded so a bad override can never
    blank the screen. ✅
16. Vacation pause: Settings → Account & plan (1/2/3 wk); shifts start
    forward, suppresses miss prompts, Today shows a break screen, resume
    reclaims unused days. ✅

---

# Walkthrough findings — Fable's hands-on audit (2026-07-05)

Interactive pass through every tab/subtab/player/modal in Pro mode.
Tactical issues + quick wins (distinct from the strategic report in
docs/premium-launch-overhaul.md).

## Bugs
- **Modals persist across navigation.** The calibration sheet stayed
  overlaid after switching to the You tab; the session summary lingered
  too. Body-appended modal hosts (`.sp-host`, `.cal-overlay`, summary
  host) are not torn down on tab/hash change. FIX: close any open modal
  host in the render()/hashchange path. [P0]

## First-run confusion
- **"0 LOAD / @ BW" on barbell lifts** for an uncalibrated profile reads
  like a bug (Back Squat shows "0 LOAD"). Show "bodyweight" gracefully or
  route the user through calibration before the first barbell session. [P1]
- **Readiness picker gives no feedback.** Selecting "Fatigued" silently
  trims loads ~5% with no confirmation. Add a one-line "we'll ease today's
  loads ~5%." [P1]

## Weak surfaces
- **Community signed-out state** is a dead end: one line of text over a
  huge empty screen, no actual sign-in button or value preview. [P1]
- **Empty vertical space** on the Log tab and Community reads as
  unfinished (acceptable on the player where it reads as focus). [P2]

## Polish nits
- **Plan "This week" title wraps** ("Week 1 of 13 ·" / "Hypertrophy")
  because the "Adjust week" button crowds it. [P2]
- **13-week block "Expected Changes Heatmap"** (Glutes 67%, Core 100%…)
  is cryptic — no explanation of what the percentages mean. [P2]
- **Session summary "Done"** needed a second interaction to dismiss in
  testing (likely related to the modal-teardown bug). [P2]
- Wrapped card: run-only weeks show '0 lb moved' — add a cardio (miles/minutes) line so cardio weeks feel celebrated too. [P2]
