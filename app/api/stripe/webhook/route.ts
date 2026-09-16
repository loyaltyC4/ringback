import { NextResponse } from "next/server";
import { BILLING_LIVE } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Stripe subscription lifecycle. Writes the plan back onto the tenant so the
 * trial ribbon and billing page reflect what the owner is actually paying.
 */
export async function POST(req: Request) {
  if (!BILLING_LIVE) {
    return NextResponse.json({ ok: false, reason: "billing_not_configured" }, { status: 503 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  let event: import("stripe").Stripe.Event;
  try {
    event = secret && sig ? stripe.webhooks.constructEvent(raw, sig, secret) : JSON.parse(raw);
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: `signature: ${(e as Error).message}` },
      { status: 400 },
    );
  }

  const db = supabaseAdmin();
  if (db) {
    await db.from("rb_webhook_events").insert({
      source: "stripe",
      event_type: event.type,
      payload: event as unknown as Record<string, unknown>,
    });

    if (
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const obj = event.data.object as unknown as Record<string, unknown>;
      const email =
        (obj.customer_email as string) ||
        ((obj.customer_details as Record<string, string> | undefined)?.email ?? "");
      const plan = event.type === "customer.subscription.deleted" ? "cancelled" : "founding";
      if (email) {
        await db.from("rb_tenants").update({ plan }).eq("owner_email", email);
      }
    }
  }

  return NextResponse.json({ received: true });
}
