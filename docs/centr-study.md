# Centr study → AURA re-theme (2026-07-06)

David wants the app adapted toward Centr's UI feel without losing what we
built. This is the analysis of *why* Centr feels premium, the adaptation
decisions, and novel ideas that go beyond copying.

## What actually makes Centr feel premium

1. **Light, warm canvas.** Soft greige (#EFEDEA-ish), white cards, charcoal
   text. Premium-through-air, not premium-through-black. Nothing glows;
   everything breathes.
2. **Editorial typography.** Small ALL-CAPS page labels ("HOME", "EXPLORE"),
   then a huge friendly greeting ("Hi David"). Headlines are content, not
   chrome.
3. **One pill language.** Chips, date selector, CTAs ("EXPLORE CENTR
   UNLEASHED" — caps inside a white pill), and the floating nav are all the
   same rounded-full form.
4. **The floating dock.** Bottom nav is a detached pill bar with a soft
   shadow; the active tab sits in its own highlight pill. Reads as an
   object, not an edge.
5. **Category color coding.** MOVE=teal, MEALS=olive, MIND=purple,
   MOTIVATION=charcoal. Every section head is [icon tile + CAPS label], and
   list rows carry the category color as a spine between image and text.
   You always know *what kind* of content you're looking at.
6. **Media-led cards** with gradient overlays and tag pills on the image.
7. **A horizontal date strip** (Mon–Sun, today pill-highlighted) instead of
   abstract week language.

## Adaptation decisions (keep our function, adopt their air)

- **Light-first.** New default appearance = warm light (existing users keep
  their saved preference; dark stays one tap away and keeps the blackout
  look we built).
- **Floating pill dock** replaces the edge-to-edge tab bar.
- **Page voice:** every tab opens with CAPS kicker + editorial title —
  Today gets "TODAY / Hi {name}", others get their name. The greeting the
  Coach card had moves up to page level where Centr puts it.
- **Date strip** replaces the "Next sessions · M T W" dot row: real days,
  today pilled, training days dotted, logged days filled.
- **Category system** (novel mapping for a training app):
  TRAIN = accent · FUEL = olive · RECOVER = purple · PROGRESS = gold.
  Section heads get the [icon tile + CAPS] pattern; rows carry spines.
- **CTAs go caps-in-pill** ("START SESSION") — one CTA voice.

## Novel ideas (not in Centr, enabled by our engine)

1. **Generated cover art instead of photography.** We have no photo
   library — so every session gets *procedural* cover art: category-color
   gradient + a faint muscle-map watermark of what that session trains.
   Unique per workout, on-brand, zero assets. (Backlog: today hero +
   wk7 rows + player done screen.)
2. **The date strip is alive:** dots = scheduled, filled = logged, ring =
   today's progress ring in miniature. Centr's strip is navigation; ours is
   a habit heatmap.
3. **Category colors are functional, not decorative:** FUEL rows open the
   fueling fold, RECOVER rows deep-link mobility/pause, PROGRESS gold
   always means "goal progress" (journey card, PRs, ETA text).
4. **Editorial numbers:** Centr leads with photos of people; we lead with
   *your* numbers in display type (the ring, the road, the volume) — the
   user is the hero, not a celebrity trainer.

## Shipped in P12 (AURA pass 1)
Light-first tokens, floating dock, page kickers+greeting, live date strip,
caps pill CTAs, category heads on Fuel/Recover sections, spine rows on
This-week. Dark mode preserved. Backlog: procedural cover art, category
deep-links everywhere, Explore-style program browser using plan previews.
