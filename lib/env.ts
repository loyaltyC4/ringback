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
/** shared secret a generic telephony provider signs inbound call webhooks with */
export const CALL_WEBHOOK_SECRET = process.env.CALL_WEBHOOK_SECRET ?? "";

/** Retell — the voice agent that actually answers calls. Retell signs its own
 * webhooks with an HMAC over the raw body keyed by this same API key, so one
 * var covers both outbound calls to Retell and verifying inbound webhooks. */
export const RETELL_API_KEY = process.env.RETELL_API_KEY ?? "";
export const VOICE_LIVE = Boolean(RETELL_API_KEY);

/** Twilio — SMS confirmations after a call/booking */
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? "";
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";
export const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER ?? "";
export const SMS_LIVE = Boolean(
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER,
);

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ringback-chi.vercel.app";
