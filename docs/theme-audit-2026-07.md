# Theme & Consistency Audit — 2026-07-06

Interactive developer pass (every tab, buttons pressed, styles measured
programmatically) + verdict on a fundamental thematic makeover, judged
against the masterpiece criteria (effective→retention, fun→incentive,
freedom→customization, all-the-tools).

## A. Measured inconsistencies

1. **Button system chaos (worst offender).** 10 distinct font-size ×
   border-radius combinations on the Today screen alone (9 on Plan):
   radii of 11px, 12px, 50%, 99px, 999px; font sizes 10–13.3px plus
   browser-default 13.33px leaking through (unstyled buttons). A premium
   app has ~3 button sizes × 3 variants, period.
2. **Two icon languages.** Line-SVG icons in the nav/tab bar vs emoji
   glyphs as icons everywhere else (💪👍😴📅👥🎯📈⏸✨🌴🧱). Feels
   homemade; premium apps pick one language (emoji reserved for
   celebration moments only).
3. **Copy case & vocabulary drift.** Old era: Title Case ("Switch Plan",
   "Re-run Onboarding Wizard", "Personal Records", "Training
   Consistency") and abbreviation soup ("Goal Wt (lb)", "4mi pace").
   New era: sentence case ("Strength trend", "Enable reminders",
   "Adjust week"). Both live on the same screens.
4. **Double heading layers on Progress.** Section label "STRENGTH TREND"
   sits directly above a card titled "Strength Progress" — every mounted
   component carries its own legacy title under the new section label.
5. **Generational split inside Plan.** "This week" (new) vs the 13-week
   block subtab (old chrome: "Simpler view" toggle, dense timeline grid,
   different paddings/typography). Same tab, two eras.
6. **Two readiness/feel designs.** Today's "How are you feeling?"
   (emoji chips) vs the player's Easy/Solid/Grind (text pills) — same
   concept, different components.
7. **Settings folds lose open-state on re-render** (toggle anything →
   your fold snaps shut). Feels glitchy.
8. **Coach fallback greeting** "Good morning, athlete" when no name —
   flat exactly where warmth matters most.
9. **Legacy rest-bar element** still ships alongside the player's rest
   ring — two rest-timer designs in the codebase (one mostly dormant).
10. **Settings visual sparseness in light mode** — three folds floating
    in a large empty field; fine in dark, barren in light.

## B. Thematic verdict: yes — one identity layer short of premium

The bones are right (token system, dark-first, accent themes, Space
Grotesk display, the hero/player/Wrapped gradient DNA). What's missing is
a **unifying identity layer** — the app currently reads "clean developer
dark theme," not "athletic brand you'd pay for." The gradient-hero DNA
that already exists on the Today hero, Coach card, and Wrapped card is
the seed of the theme; it just stops there.

### Makeover concept: "FORGE" — one visual system, everywhere
- **Surfaces:** layered near-black with a subtle accent-tinted radial
  per-tab signature (Today = accent, Progress = accent→gold, Plan =
  accent→ice). Every tab opens with a gradient signature card (the
  hero DNA) — Today hero, Coach card, This-week header, You profile
  card — same silhouette, same radii, same kicker style.
- **One button system:** 3 sizes (lg 56px CTA / md 44 / sm 34), 3
  variants (filled-accent, outline, ghost), one radius scale (16/12/999
  for pills only). Kill every one-off.
- **One icon language:** single-weight line icons (swap all chrome emoji);
  emoji survive only inside celebration moments (PR burst, Wrapped).
- **One type system:** Space Grotesk for display/stat numerals everywhere
  (incl. inner components), Manrope for UI; sentence case app-wide; kill
  abbreviations ("Goal weight", "4-mile pace").
- **De-duplicate headings:** section labels OR card titles, never both —
  strip legacy titles from mounted components.
- **Unify the block subtab** into the new visual language (or fold its
  content into This week as an expandable horizon view).
- **Signature motion:** one ease curve + one duration scale; number
  count-ups on stats; the ring/progress animations everywhere progress
  appears.

## C. Masterpiece criteria scorecard (today)

| Criterion | Score | Gap |
|---|---|---|
| Effective → brings you back | 7/10 | Goal *journey* not visualized (forecast exists, path doesn't); no true push. |
| Fun → incentivizes | 6.5/10 | Player+PR+ring+sounds+Wrapped land; celebration variety thin; no quality-streaks/cohorts. |
| Freedom → customization | 6/10 | Swap/dials/plan-browser shipped; missing add-exercise, ban/prefer, custom builder, library-as-destination. |
| All the tools | 8/10 | Deep engine; nutrition/recovery content thin. |

**The verdict:** the app is functionally strong and getting emotionally
warmer, but visual cohesion is the cheapest remaining lever to "premium."
One FORGE pass (buttons, icons, casing, heading dedupe, block-subtab
unification, signature cards per tab) would move perceived quality more
than any single feature.

## D. Suggested execution order
1. Button system consolidation (one CSS pass + class sweep).
2. Icon language swap (line icons for all chrome emoji).
3. Copy pass: sentence case + de-abbreviation everywhere.
4. Progress heading dedupe (strip legacy component titles).
5. Signature gradient cards on Plan/You heads (extend hero DNA).
6. Block-subtab restyle into the new language.
7. Fold open-state persistence; readiness card unified with player pills;
   retire legacy rest-bar; Coach greeting uses name or drops the comma.
