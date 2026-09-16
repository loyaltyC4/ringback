import { NextResponse } from "next/server";
import { BILLING_LIVE, SITE_URL } from "@/lib/env";
import { currentOwner } from "@/lib/supabase/server";

/**
 * Opens a Stripe Checkout session for the founding rate. The pay sheet calls
 * this and follows the returned url; while Stripe is unconfigured it answers
 * 503 and the sheet stays in its demo state instead of half-failing.
 */
export async function POST() {
  if (!BILLING_LIVE) {
    return NextResponse.json({ ok: false, reason: "billing_not_configured" }, { status: 503 });
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const owner = await currentOwner();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_FOUNDING as string, quantity: 1 }],
    customer_email: owner?.email ?? undefined,
    client_reference_id: owner?.id ?? undefined,
    allow_promotion_codes: true,
    subscription_data: { trial_period_days: 7 },
    success_url: `${SITE_URL}/dashboard?paid=1`,
    cancel_url: `${SITE_URL}/dashboard/billing?cancelled=1`,
  });

  return NextResponse.json({ ok: true, url: session.url });
}
