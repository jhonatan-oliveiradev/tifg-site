# The Internet Field Guide

An interactive field guide to strange creatures found on the internet.

The site is a product experiment built with **Next.js + TypeScript + AniDoodle**. The interface behaves like an illustrated natural-history journal: specimens react to the visitor, discoveries are recorded locally, and hidden creatures appear when the visitor behaves like the thing being observed.

## First field study

The initial build contains four specimens:

- **The Infinite Scroller** — feeds indefinitely.
- **The Notification Goblin** — feeds on unread badges.
- **The Algorithm** — nobody has seen the whole creature.
- **The Lurker** — hidden specimen unlocked by staying still.

AniDoodle owns the code-drawn creature canvases and input log. Next.js owns layout, discovery state, accessibility, and the field-journal UI.

## Run locally

```bash
npm install
npm run dev
```

The `predev` and `prebuild` scripts install a sparse, pinned checkout of AniDoodle into `.anidoodle/repo`. That directory is intentionally ignored by Git.

The project currently pins AniDoodle to:

```text
94c171c973caf4ee3b81eb5618c9e5e827db7209
```

Override it temporarily with `ANIDOODLE_REF=<sha>` if you want to test a newer revision.

## Architecture

```text
app/                    Next.js App Router
components/             field guide UI + AniDoodle mount adapter
art/pieces/             our AniDoodle Piece definitions
scripts/setup-anidoodle.mjs
.anidoodle/repo/        generated sparse checkout, never committed
```

## Next field notes

The next iteration should move the hero from an interactive creature to a true AniDoodle scroll-drawing sequence, add the remaining specimens, and run AniDoodle's replay/determinism gate against each production piece.
