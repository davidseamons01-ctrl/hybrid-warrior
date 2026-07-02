# Hybrid Warrior — Ground-Up UX Overhaul Plan

Audit date: 2026-07-01. Baseline: `npm run verify` fully green (typecheck, unit,
build, artifact, integration).

## Vision

One app, every athlete. A first-time exerciser and a spreadsheet-brained
powerlifter open the same app and each feels it was built for them. The axis
that adapts is **information density and language**, chosen by the user —
never inferred from gender, age, or anything else.

## Audit — what we have

### Working in our favor
- **Solid intelligence foundations, scattered presentation.** Plan scoring +
  "why this fits" (`scorePlan`/`whyPlan`), plateau detection, e1RM tracking,
  readiness modifier, post-session day adaptation, ease wizard, missed-session
  catch-up queue, equipment substitution, deload/taper phasing, per-week
  schedule overrides. The brains exist; they're just invisible and disjointed.
- **Event-sourced logs** (append events, project to logs, undo via snapshots).
  Data survives anything we do to the UI.
- **Test safety net**: vitest + typecheck + integration + Firestore rules tests.
- **Migration already started**: typed `src/core` (TS) + `src/ui` (Preact
  islands) mounted inside the legacy shell.

### The wrecking-ball case
1. **Onboarding front-loads pain.** Step 1 asks ~11 numeric fields (waist,
   hips, shoulders, body-fat %, goal weight…) before showing any value. Step 2
   is a flat 18-checkbox list mixing identity ("Brand New"), lifts, aesthetics,
   and life stages.
2. **The Train screen stacks ~12 modules above the first exercise** (banners,
   dots, weather, run zones, bring-a-friend, reschedule, fueling, focus bar,
   ease panel…). Overwhelming for beginners, slow for experts.
3. **Simplicity is gendered.** `womenSimpleUi`, `theme-feminine`/`masculine`,
   women's "modes" conflate *who you are* with *how much detail you want*.
   Profile type is a binary Man/Woman select.
4. **Jargon has no on-ramp.** 1RM, RPE, e1RM, deload, taper, tempo appear
   everywhere with no progressive disclosure.
5. **6,300-line `js/ui.js` monolith**: string-concatenated HTML, inline styles,
   global mutable `S`, full-pane innerHTML re-renders. Every UI change is
   risky and slow to make.
6. **Design system drift**: 5 theme forks, emoji-as-icons next to SVG icons,
   inconsistent type/spacing decided inline per string.

## Decisions (locked unless overruled)

- **D1 — Experience modes, not gender modes.** Two user-switchable densities:
  **Coached** (plain language, one clear next action, details on demand) and
  **Pro** (percentages, e1RM, RPE, volume, all knobs). Chosen in onboarding
  from experience level, switchable any time in one tap. `womenSimpleUi` and
  gendered themes are retired; sex/life-stage remain *programming inputs only*
  (with "prefer not to say"), and all visual themes become identity-neutral
  palettes anyone can pick.
- **D2 — Three-question onboarding.** Goal → experience → schedule/equipment.
  On the home screen in under a minute. Everything else is progressive
  profiling: maxes are asked when first needed, or estimated from a
  calibration session ("lift this, tell us how many reps").
- **D3 — Navigation: Today / Plan / Progress / You.** Train becomes a
  focused **session player** (the existing focus mode becomes the spine, not
  an option). All pre-session context collapses into one summary card + an
  expandable drawer.
- **D4 — One design system.** Tokens (type scale, spacing, color, radius,
  light+dark) in CSS custom properties; components in `src/ui` (Preact).
  New code is written against the design system only — no inline styles.
- **D5 — Strangler migration, not big-bang rewrite.** The wrecking ball swings
  one wall at a time: each phase replaces a legacy surface entirely and ships
  behind the green verify suite. Users' data is untouched (event log stays).
- **D6 — Visible coach.** Unify readiness + plateau + ease + catch-up +
  adaptation into one "Coach" layer with a consistent voice that always shows
  its reasoning ("Why this weight?"). Coached mode gets feelings-language
  (easy / right / too much); Pro mode gets RPE and multipliers.

## Phases

1. **Design system + app shell.** ✅ SHIPPED 2026-07-01. Tokens, accent
   themes (ember/ocean/forest/violet), bottom tab bar + slim header,
   Today/Plan/Progress/You routing, Coached/Pro mode plumbing, gendered
   forks retired.
2. **Onboarding rebuild.** ✅ SHIPPED 2026-07-01. Goals → experience+mode →
   schedule (→ optional Pro numbers step) → plan match. Everything else is
   estimated and self-corrects from logs. Sex is optional ("prefer not to
   say"); plan library renamed Men's/Women's → Classic/Sculpt with a
   `variant` flag; sculpt emphasis now follows chosen goals (scorer's sex
   check is only a back-compat tiebreak). Today screen got its hero card +
   quick-action chips + extras drawer (pulled forward from phase 3).
3. **Today + session player.** ✅ SHIPPED 2026-07-02. Hero card (phase 2) +
   full-screen Session Player (`src/ui/session-player.tsx`): one exercise at
   a time in display type, ± steppers, feel chips (coached wording vs pro),
   one-tap "Log set" through the event-sourced `playerLogSet` core, animated
   rest countdown ring with +30s/skip, auto-advance, finish screen →
   `finalizeSession` (extracted) → day adaptation + session summary. Old
   focus-mode carousel kept as fallback behind the Focus chip.
4. **Coach layer.** Unified adaptation engine surface: pre-session readiness,
   post-session review, weekly recap, goal forecasting, "why" everywhere.
5. **Progress + Plan.** Progress tab (streak/level for motivation; e1RM,
   volume, pace, heatmap for data lovers). Plan tab absorbs the schedule
   planner with the same block/override logic.
6. **Cleanup + hardening.** Delete dead legacy paths from `js/ui.js`,
   accessibility pass, performance pass, PWA polish.

Each phase ends with: `npm run verify` green, manual preview check, deploy.
