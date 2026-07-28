# Next on My Dev-Life

A Netflix-style board for a 59-app build challenge. Dark, responsive, and driven
by a single flat array.

```bash
npm run dev     # http://localhost:3000
npm run build
```

## Adding or moving a project

Everything lives in [`src/data/projects.ts`](src/data/projects.ts). Change
`status` and the card moves section — no other file needs editing.

```
"confirmed"  →  Backlog rail       (number, placeholder art, concept note)
"coming-soon" → Coming Soon + hero (teaser banner, D-Day countdown, features)
"released"   →  Released grid      (thumbnail, tech tags, live link, date)
```

Promoting a project is additive: a `confirmed` row becomes `coming-soon` by
adding `targetDate` / `progress` / `highlights`, then `released` by adding
`releasedAt` / `liveUrl`. Unused fields are simply ignored by the other cards.

Exactly one `coming-soon` project should carry `featured: true` — that one
becomes the hero banner. Without it, the nearest `targetDate` is used.

## Artwork

`image` is optional. With no image, the card renders a gradient built from
`accent: [from, to]` plus a large challenge number — every card looks finished
before any asset exists. To use real artwork, drop files in `public/` and set
`image: "/posters/my-app.jpg"`. Remote hosts need an explicit entry in
`images.remotePatterns` in [`next.config.ts`](next.config.ts).

## Layout rules

| Breakpoint | Sections | Hero |
| --- | --- | --- |
| `< md` | horizontal snap rails, one card ≈ 76vw with the next peeking | `86svh`, stacked full-width CTAs |
| `md` | 2-column grid | `80vh`, left-weighted scrim |
| `lg` | 3 columns | |
| `xl` | 4 columns (Coming Soon caps at 3) | |

Both layouts come from one class string in
[`src/components/Section.tsx`](src/components/Section.tsx) — `flex overflow-x-auto`
below `md`, `grid` above it. No JS, no resize listeners.

Tap targets are 44px or taller; released cards are a single large link.

## Countdown

[`src/components/Countdown.tsx`](src/components/Countdown.tsx) renders the
server-computed `D-n` badge on first paint and starts the ticking `HH:MM:SS`
after mount, so the server and the phone never disagree during hydration. Dates
are compared at UTC midnight so the day count doesn't drift across timezones.
