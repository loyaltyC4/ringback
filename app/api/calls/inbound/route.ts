import { NextResponse } from "next/server";
import { CALL_WEBHOOK_SECRET } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Provider-agnostic inbound-call webhook.
 *
 * RingBack has no telephony vendor picked yet, so this endpoint takes a plain
 * normalised payload and each provider gets a thin adapter in front of it
 * rather than the vendor's shape leaking into the database. Auth is a shared
 * secret in x-ringback-secret.
 *
 * Expected body:
 * {
 *   tenant: "<uuid | owner_email>",
 *   caller: { phone, name?, suburb? },
 *   call:   { job_type?, urgency?, outcome?, summary?, transcript?, recording_url?,
 *             duration_sec?, after_hours?, needs_action?, is_spam?, booked_value? },
 *   booking?: { customer_name?, address?, suburb?, job_type?, window_start, window_end, est_value? }
 * }
 */
type Body = {
  tenant?: string;
  caller?: { phone?: string; name?: string; suburb?: string };
  call?: Record<string, unknown>;
  booking?: Record<string, unknown>;
};

export async function POST(req: Request) {
  if (!CALL_WEBHOOK_SECRET || req.headers.get("x-ringback-secret") !== CALL_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, reason: "unauthorised" }, { status: 401 });
  }
  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json({ ok: false, reason: "db_not_configured" }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const phone = body.caller?.phone;
  if (!body.tenant || !phone) {
    return NextResponse.json({ ok: false, reason: "tenant_and_caller_required" }, { status: 400 });
  }

  // tenant can arrive as a uuid or as the owner's email
  const isUuid = /^[0-9a-f-]{36}$/i.test(body.tenant);
  const { data: tenant } = await db
    .from("rb_tenants")
    .select("id")
    .eq(isUuid ? "id" : "owner_email", body.tenant)
    .maybeSingle();
  if (!tenant) {
    return NextResponse.json({ ok: false, reason: "unknown_tenant" }, { status: 404 });
  }

  // caller memory: upsert the contact so repeat callers are recognised
  const { data: contact } = await db
    .from("rb_contacts")
    .upsert(
      {
        tenant_id: tenant.id,
        phone,
        name: body.caller?.name ?? null,
        suburb: body.caller?.suburb ?? null,
      },
      { onConflict: "tenant_id,phone" },
    )
    .select("id")
    .maybeSingle();

  const { data: call, error: callErr } = await db
    .from("rb_calls")
    .insert({
      tenant_id: tenant.id,
      contact_id: contact?.id ?? null,
      caller_phone: phone,
      caller_name: body.caller?.name ?? null,
      suburb: body.caller?.suburb ?? null,
      ...body.call,
    })
    .select("id")
    .maybeSingle();
  if (callErr) {
    return NextResponse.json({ ok: false, reason: callErr.message }, { status: 400 });
  }

  let bookingId: string | null = null;
  if (body.booking) {
    const { data: booking } = await db
      .from("rb_bookings")
      .insert({
        tenant_id: tenant.id,
        contact_id: contact?.id ?? null,
        call_id: call?.id ?? null,
        customer_phone: phone,
        source: "ai_call",
        ...body.booking,
      })
      .select("id")
      .maybeSingle();
    bookingId = booking?.id ?? null;
  }

  await db.from("rb_activity").insert({
    tenant_id: tenant.id,
    kind: bookingId ? "booking" : "transcript",
    label: bookingId
      ? `Booked ${body.booking?.job_type ?? "a job"} for ${body.caller?.name ?? phone}`
      : `Answered ${body.caller?.name ?? phone}`,
  });

  return NextResponse.json({ ok: true, call_id: call?.id ?? null, booking_id: bookingId });
}
