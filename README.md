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

## Wiring the plumbing (environment variables)

Everything below is optional. With none of it set the app runs as a complete
demo: fixtures on every screen, the guided tour, the open demo dashboard. Each
variable switches one real system on.

| Variable | Switches on |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Database reads + magic-link auth. `/dashboard` starts requiring a session (add `?demo=1` to view fixtures). |
| `SUPABASE_SERVICE_ROLE_KEY` | Trusted server writes: telephony + Stripe webhooks, tenant provisioning. |
| `STRIPE_SECRET_KEY` / `STRIPE_PRICE_FOUNDING` | Real Stripe Checkout behind the pay sheet. |
| `STRIPE_WEBHOOK_SECRET` | Signature verification on `/api/stripe/webhook`. |
| `CALL_WEBHOOK_SECRET` | Accepts inbound calls on `/api/calls/inbound` (header `x-ringback-secret`). |
| `RETELL_API_KEY` | Real voice: dials/configures Retell and verifies the signature on `/api/webhooks/retell` and `/api/tools/book-appointment`. |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` | Sends the SMS confirmation after a call ends or a job books. |
| `NEXT_PUBLIC_SITE_URL` | Absolute URLs in auth + checkout redirects. |

Database: run `db/schema.sql` then `db/002_product.sql` on the project. Both are
idempotent and both enable row level security scoped to the owner's email.

Telephony is deliberately provider-agnostic: `/api/calls/inbound` takes a
normalised payload (tenant, caller, call, optional booking) so a vendor adapter
is a thin translation layer instead of the vendor's shape reaching the database.


### Voice pipeline (Retell + Telnyx)

Telnyx is the carrier (buys the AU number, terminates SIP at Retell). Retell
runs the actual conversation and calls back into this app twice:

- `POST /api/webhooks/retell` — one endpoint for `call_started` / `call_ended`
  / `call_analyzed`. Writes `rb_calls`, texts the owner once a call ends.
- `POST /api/tools/book-appointment` — a Retell function tool called *during*
  the call once the caller agrees to a time. Writes `rb_bookings`, texts both
  the caller and the owner, and returns the sentence Retell speaks back.

Both verify Retell's HMAC-SHA256 signature (`x-retell-signature`, keyed by
`RETELL_API_KEY`) against the raw request body — see `lib/retell.ts`.

Every call must be dialled into Retell with `metadata: { tenant, caller_name,
suburb }`, where `tenant` is the `rb_tenants.id` (or `owner_email`) — that's
how a shared agent config maps back to the right dashboard. The demo line
uses `demo@ringback.com.au`.
