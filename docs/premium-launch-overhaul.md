# Hybrid Warrior — Premium Launch Overhaul Report

**Author:** Fable (acting as senior product engineer)
**Date:** 2026-07-05
**Brief:** Take the app from "very good rebuild" to a premium, global-launch
product — one that *works* (users hit their goals), *delights* (working out
with it is genuinely fun), and *retains* (people come back because both are
true). Users should feel free to shape their program around what they care
about. The bar: a masterpiece.

This is a vision + prioritized plan, not a changelog. Nothing here is built
yet. Tactical bugs/quick-wins live in `docs/user-feedback-2026-07.md`.

---

## 1. Where we stand (honest assessment)

**The foundation is strong.** The session player is genuinely excellent —
warm-up → one-move focus → rest ring → finisher → honest summary is a loop
that feels modern and gym-ready. The Coach is smart and responsive. The
adaptation engine, event-sourced logs, 128-plan library, and equipment-aware
substitution are real, differentiated intelligence most fitness apps lack.

**What's missing for "premium/global/masterpiece":** the app is *functional
and clean* but not yet *emotional and sticky*. It tells you what to do; it
doesn't yet make you *feel* something when you do it. It's rigid where users
want freedom (you follow the program; you can't shape it). And it has the
rough edges of a solo build — inconsistent empty states, no notifications,
no sound/haptic language, no shareable moments, a 6,300-line UI monolith
that will slow every future change.

The three gaps to close, in the user's own words:
1. **"Feel premium"** → craft, motion, sound, consistency, celebration.
2. **"Brings people back / fun / incentivizes"** → motivation systems,
   habit loops, social, rewards, a coach with a soul.
3. **"Freedom to customize"** → shape your program, pick your exercises,
   own your training.

---

## 2. Pillar I — Premium craft (make every interaction feel expensive)

Premium is the sum of a hundred small things done right. The current app
gets ~60% there; the last 40% is what separates "clean" from "wow."

### 2.1 Motion & micro-interactions
- **A motion language, applied consistently.** Spring physics on the
  steppers, weight/reps rolling like a counter, cards that lift on press,
  the rest ring pulsing gently in its last 3 seconds, tab transitions that
  feel connected (shared-element where possible).
- **The "log set" moment should feel physical** — a satisfying tick, a
  subtle scale-punch, the progress bar filling with momentum. This is the
  single most-repeated action in the app; it should feel *good* 40× a
  session.
- **Number transitions everywhere** — volume totals, e1RM, streak counts
  should count up, not snap.

### 2.2 Haptics & sound design (currently near-absent)
- A deliberate **haptic vocabulary**: light tick on log, success pattern on
  set-complete, a distinct "PR" buzz, a gentle triple-pulse when rest ends.
- **Optional sound** — a clean "rep banked" tone, a rest-over chime, a
  finish fanfare. Off by default, tasteful when on. This is a huge part of
  why Apple Fitness / Whoop / Strava feel premium.
- Rest-timer should **announce** ("10 seconds", "next: bench, 135") via
  speech for hands-free gym use (the plumbing partly exists — make it first
  class).

### 2.3 Visual consistency & empty states
- **Kill the dead space.** The Log tab, Community, and warm-up screens have
  large empty regions that read as unfinished. Every screen needs a
  designed empty state — an illustration, a value prop, a CTA.
- **A real illustration set** (custom, on-brand, animated where it counts) —
  recovery days, empty history, community sign-in, achievement unlocks,
  session complete. Stock emoji (🌴, 🚶, 🧱) should be replaced with a
  cohesive icon/illustration system.
- **Skeleton loaders** on every async surface (Coach, charts, community) so
  the app never flashes empty then fills.

### 2.4 The "0 LOAD" problem (a premium app never looks broken)
- An uncalibrated barbell lift showing "0 LOAD" is a first-impression
  killer. Before a user's first barbell session, route them through a
  30-second calibration or show "bodyweight — tap to set your working
  weight." A premium app never shows a broken-looking zero.

### 2.5 Design system maturity
- Formalize tokens into a documented system (spacing scale, type ramp,
  elevation, motion curves) so every new screen is consistent by
  construction. Today the tokens exist but usage drifts (inline styles
  still sprinkled through `js/ui.js`).

---

## 3. Pillar II — Motivation, fun & retention (the reason they come back)

This is the biggest gap and the biggest opportunity. The app currently has
the *ingredients* of motivation (streaks, levels, XP, PRs, achievements,
warrior score) but they're scattered and quiet. Great retention products
turn these into a **loop the user wants to close every day.**

### 3.1 The daily loop (Apple-Fitness-rings thinking)
- **A single, glanceable daily goal** on the home screen — a ring or bar
  that fills as you train, walk, and recover. Closing it should feel like
  an achievement. Rings beat abstract "XP" because they're *visceral and
  daily.*
- **Rest days count too** — active recovery, mobility, a walk should fill a
  (smaller) ring so the streak/loop survives rest days. Right now rest days
  feel like dead air.

### 3.2 Streaks that respect real life
- **Streak freezes / rest-day protection** (Duolingo's key insight): a
  missed day shouldn't nuke a 40-day streak and make the user quit. Earn
  freezes, or let planned rest/vacation-pause protect the streak. This is
  the difference between a streak that motivates and one that punishes.
- **Milestone celebrations** — 7, 30, 100, 365 days get a real moment (full
  screen, animation, shareable card), not a silent counter tick.

### 3.3 Celebration & reward moments (dopamine, done tastefully)
- **PRs deserve a moment** — a full-screen celebration with the lift, the
  number, the delta, and a share button. Right now a PR is a small toast.
- **Level-ups, badge unlocks, block completion** — each should be a
  designed, animated, *earned-feeling* event. Confetti exists; make it
  intentional and rare enough to stay special.
- **The weekly recap → "Your Week" / "Your Block" Wrapped.** Spotify
  Wrapped is the gold standard of shareable retention. A beautiful,
  swipeable, shareable weekly (and 13-week block) recap — volume, PRs,
  consistency, muscles worked, a highlight — is both a retention hook and a
  free-marketing engine.

### 3.4 A Coach with a soul
- The Coach is smart but clinical. Give it **personality and continuity** —
  it remembers, encourages, celebrates, checks in after a missed day
  without guilt, and adapts its tone to the user's mode (Coached = warm
  mentor; Pro = terse data-driven). Optionally, **selectable coach
  personas / voices.**
- **Proactive, timely check-ins** ("You crushed squats — deadlifts are
  trending up too," "3 sessions this week, your best yet"). The Coach
  should feel like a person who's paying attention, not a rules engine.

### 3.5 Notifications (currently none — a retention non-starter)
- Smart, sparse, *earned* push: session reminders at the user's usual
  time, streak-at-risk saves, "your recap is ready," a friend's challenge.
- Never spammy. Frequency and tone tuned per user. This is table stakes for
  any app that wants day-2 retention.

### 3.6 Social & accountability (the strongest retention lever there is)
- **Friends & feed** — see friends' sessions, PRs, streaks; react/cheer.
  "Train with a friend" exists (partner sessions) — extend it to an
  asynchronous social graph.
- **Challenges** — weekly volume, streak, a shared program, "who can hit
  their goal first." Time-boxed, opt-in, fun.
- **Leaderboards** scoped to friends (global is demotivating for beginners;
  friend-scoped is motivating).
- **Clubs / cohorts** — join a "13-week block cohort" and finish together.
  Shared journeys crush solo retention.
- **Share cards** for PRs, recaps, milestones — the app's growth loop.

### 3.7 Make working out *fun* (the intangible)
- **Music that's part of the workout**, not a stranded embed — surface the
  player inside the session, sync intensity to phase, or integrate
  Spotify/Apple properly.
- **Guided/coached audio sessions** for certain workouts (a voice walking
  you through), especially runs and conditioning.
- **Streaks of *quality*, not just attendance** — reward hitting targets,
  beating ghosts, RPE honesty, not just showing up.

---

## 4. Pillar III — Freedom & customization (make it *their* program)

The user explicitly asked for this: the freedom to shape their program with
exercises that match what they're focused on. Today the app is
**prescriptive** — you get a generated plan and follow it. Premium training
apps let you *own* your training. This is a trust and stickiness multiplier:
a program you've shaped is a program you're invested in.

### 4.1 Exercise-level freedom (inside the generated program)
- **Swap any exercise** for an alternative that hits the same muscles —
  this partly exists (`similarExerciseAlternatives`); surface it as a
  first-class, delightful picker with muscle-match %, equipment fit, and a
  "why this swap" line. Make swaps *sticky* (remember my preference).
- **Add exercises** to a session — "I want more arms today" → the app
  suggests accessory moves that fit the session's intent and your recovery.
- **Reorder / superset** — drag to reorder, group into supersets.
- **Ban / prefer exercises** globally — "never program barbell overhead
  press" (shoulder issue), "always include face pulls." The engine already
  substitutes; expose the controls.

### 4.2 Program-level freedom
- **Edit the generated program** — change frequency, session length, split,
  emphasis mid-block without starting over.
- **Build-your-own** — a guided custom-program builder for advanced users
  who want full control (pick the split, the lifts, the progression model).
- **Focus dials** — "more glutes," "more conditioning," "prioritize bench"
  as live sliders that re-weight the program, not a one-time onboarding
  choice. The `sculptGoals`/`primaryGoal` plumbing is a start; make it
  adjustable and visible.
- **Goal-driven accessory selection** — if a user's goal is "posture," let
  them see and choose the accessories that serve it. Tie exercise choice
  back to *why* it's in the program (the Coach's "why" extended to every
  movement).

### 4.3 The exercise library as a destination
- A **browsable, searchable exercise library** — filter by muscle,
  equipment, difficulty; each with the how-to, video, muscle map, and "add
  to today / add to program." Turn the existing per-exercise media into a
  real library users explore, not just see mid-workout.
- **Custom exercises** — let users add their own movements (name, muscles,
  video link) for anything the catalog lacks.

### 4.4 Custom warm-ups, finishers, and templates
- Let users edit/save their warm-up routine and finisher preferences.
- **Save a session as a template** to reuse or share.

---

## 5. Pillar IV — Effectiveness & intelligence (they actually reach goals)

Retention without results is a treadmill. The app must *demonstrably* get
people to their goals — and make that progress felt.

### 5.1 Smarter autoregulation
- **RPE / feel-driven load adjustment in real time** — the feel chips
  already feed adaptation; make it visibly responsive ("you called the last
  two 'easy' — bumping next set +5 lb").
- **Auto-deload detection** from fatigue signals (missed reps, rising RPE,
  poor readiness), not just fixed weeks 4/8.
- **Wearable-driven readiness** — pull HRV/sleep/steps (Apple Health/Google
  Fit hooks partly exist) to set daily readiness automatically instead of
  a manual chip.

### 5.2 Goal tracking that motivates
- **Every goal gets a live forecast + milestones** — "225 bench in ~6
  weeks, next milestone 205 (this week)." The `projectWeeksToGoal` engine
  exists; make goals a first-class, celebrated, visual journey (a path with
  milestones, not a stat row).
- **Adaptive goals** — the Coach proposes new goals as old ones are hit, so
  there's always a next mountain.

### 5.3 Recovery, nutrition, the whole athlete
- **Recovery content on rest days** — mobility flows, guided stretching,
  sleep/nutrition tips — so rest days deliver value and keep the loop alive.
- **Lightweight nutrition awareness** — protein/calorie targets tied to
  goals (the daily health log exists; make it purposeful and coached, not a
  buried form).
- **Injury/limitation mode** — "my knee hurts" → the engine swaps to
  knee-friendly movements and flags it. Substitution logic exists; make it
  a compassionate, first-class flow.

### 5.4 Form & technique
- **On-demand technique** is solid (how-to sheet). Next level: form-check
  video upload with feedback, or curated cue libraries per lift. Longer-term
  differentiator.

---

## 6. Pillar V — Onboarding & first-run magic

You get one first impression at global scale.
- **The first workout should feel magical** — a guided, hand-held first
  session with extra coaching, celebration on the first logged set, and a
  clear "look what you just did."
- **Calibration as a welcoming ritual**, not a chore — the sheet is good;
  make the first-run version feel like the app getting to know you.
- **Show the payoff early** — after onboarding, a "here's your 13-week
  journey and where it takes you" moment that sells the commitment.

---

## 7. Pillar VI — Platform & scale (global-launch readiness)

Behind the UX, the plumbing to survive a global audience.
- **Localization & i18n** — languages, units (kg/lb done; extend), date
  formats, region. Non-negotiable for "global."
- **Accessibility pass** — full screen-reader support, contrast, focus
  order, motion-reduction, dynamic type. Partly there; needs an audit.
- **Performance** — the app is a PWA; audit load, TTI, animation jank on
  low-end devices. Global means slow phones and slow networks.
- **Native app wrappers** (iOS/Android) for push, HealthKit, App Store
  presence, home-screen credibility. A PWA alone caps the premium ceiling.
- **Kill the monolith** — `js/ui.js` is 6,300+ lines of string-built HTML
  with inline styles. Continue the migration to the typed `src/` component
  model. This is a *velocity* investment: every feature above ships faster
  and safer once the UI is componentized.
- **Modal/overlay management** — the persist-across-navigation bug (see
  improvement log) is a symptom of ad-hoc body-appended modals; introduce a
  single modal manager.
- **Analytics & experimentation** — you can't improve retention you can't
  measure. Event analytics + A/B infrastructure before launch.

---

## 8. Prioritization (what I'd actually do, in order)

### P0 — Launch blockers (broken/embarrassing at scale)
1. Modal teardown on navigation (bug).
2. "0 LOAD" / uncalibrated barbell first-run fix.
3. Readiness selection feedback.
4. Notifications infrastructure (no retention without it).
5. Accessibility + performance audit.
6. Designed empty states (Log, Community, warm-up).

### P1 — Premium differentiators (why they choose *us*)
7. Motion + haptic + sound language (the "feels expensive" layer).
8. Daily-goal ring / habit loop + streak freezes.
9. PR / milestone / level-up celebration moments.
10. Exercise swap + add + ban/prefer (customization freedom).
11. "Your Week / Your Block" shareable recap (Wrapped).
12. Coach personality + proactive check-ins.

### P2 — Delight & depth (why they stay for years)
13. Social graph: friends, challenges, cohorts, share cards.
14. Program editing + focus dials + build-your-own.
15. Exercise library as a destination + custom exercises.
16. Wearable-driven readiness + auto-deload.
17. Recovery/nutrition content; injury mode.
18. Guided audio sessions; music integration.

### Continuous
- Monolith → component migration (unblocks everything above).
- Analytics + experimentation.
- Design-system formalization.

---

## 9. The north star

When this is done, a user opens the app and: sees a single ring begging to
be closed; starts a session that feels like a game they want to win; logs
sets that feel *good* in the hand; gets a PR that the whole app celebrates
with them; shapes tomorrow's workout to hit the muscle they care about;
shares a gorgeous recap with a friend who's in their challenge cohort; and
comes back tomorrow because both the results and the ritual are addictive in
the healthiest possible way.

That's the masterpiece. Everything above is in service of it.
