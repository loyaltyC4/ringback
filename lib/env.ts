/**
 * One place that answers "is this install wired to real infrastructure yet?"
 *
 * Every screen in the product renders from demo fixtures until the matching
 * env vars exist. That is deliberate: the marketing demo dashboard, the
 * screenshots and the guided tour all have to keep working on an install with
 * no database, and a half-wired page that throws is worse than an honest
 * fixture.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** true once the database + auth are configured */
export const DB_LIVE = Boolean(SUPABASE_URL && SUPABASE_ANON);
/** true once server-side writes (webhooks, provisioning) are possible */
export const DB_ADMIN = Boolean(SUPABASE_URL && SUPABASE_SERVICE);
/** true once Stripe keys exist */
export const BILLING_LIVE = Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_FOUNDING,
);
/** shared secret the telephony provider signs inbound call webhooks with */
export const CALL_WEBHOOK_SECRET = process.env.CALL_WEBHOOK_SECRET ?? "";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ringback-chi.vercel.app";
