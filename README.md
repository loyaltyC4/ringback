# RingBack

Marketing site and operator prototypes for RingBack — the AI receptionist for
Australian trades.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** (CSS-first config; design tokens live in `app/globals.css`)
- **motion** for the number tickers
- No CMS, no database on the marketing side — copy lives beside the components
  as typed records so it stays reviewable in diffs.

## Layout

```
app/
  layout.tsx        fonts + metadata
  page.tsx          composes the homepage sections
  globals.css       design tokens, base type, buttons
  site.css          component styles (nav, hero, rail, sections)
components/
  hero.tsx          hero: two video frames + the animated agent window
  stage-rail.tsx    the pinned Answer -> Follow up rail
  sections.tsx      bento, 62% split, follow-up tabs, proof, pricing, FAQ, CTA
  site-chrome.tsx   nav, integration marquee, footer, shared icons and hooks
  shader-background.tsx  21st.dev "Grain Gradient" WebGL shader (see below)
  number-ticker.tsx      21st.dev number ticker
lib/
  shaders.ts        the green-mesh and grey-grain uniform presets
public/legacy/      the dashboard and journey HTML prototypes
db/                 schema and seed SQL for the operator app
```

`/dashboard` and `/journey` are the original static prototypes, served from
`public/legacy` via rewrites in `next.config.mjs`.

## Design system

"Warm workshop precision" — a bone canvas (`#F2EFE7`), near-black ink, one
signal green, and a hi-vis amber reserved strictly for urgency states. Display
type is Bricolage Grotesque, body is Instrument Sans, labels are JetBrains Mono.
All motion uses `cubic-bezier(.32,.72,0,1)` and animates only `transform` and
`opacity`.

## Third-party components

Two components come from [21st.dev](https://21st.dev) and have been modified:

- `components/shader-background.tsx` — paper-design's "Grain Gradient",
  adapted from [Paper Shaders](https://shaders.paper.design/grain-gradient)
  (Apache-2.0). Refactored to accept a `uniforms` prop so one component can
  drive several palettes, and to freeze on the first frame under
  `prefers-reduced-motion`.
- `components/number-ticker.tsx` — adapted to import from `motion/react` and to
  use the local `cn` helper.

Tuning for both shader presets lives in `lib/shaders.ts`.

## Media

The hero videos and posters are currently served from external public URLs
rather than `public/`, because the deploy path in use cannot commit binary
files. To bring them in-repo, drop the files into `public/video` and
`public/img` and swap the absolute URLs in `components/hero.tsx`,
`components/stage-rail.tsx` and `components/sections.tsx` back to root-relative
paths (`/video/on-the-roof.mp4`, `/img/on-the-roof.jpg`, and so on).

## Local development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build + type check
```

Deploys are automatic from `main` via Vercel. The project framework preset must
stay set to **Next.js**.
