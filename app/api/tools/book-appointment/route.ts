import { NextResponse } from "next/server";
import { VOICE_LIVE } from "@/lib/env";
import { verifyRetellSignature } from "@/lib/retell";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms";

export const runtime = "nodejs";

/**
 * Retell calls this mid-call as a function tool once the caller has agreed
 * to a time, waits for the response, then speaks whatever we return. Must
 * answer well inside Retell's function-tool timeout (a few seconds), so this
 * does exactly one write and one best-effort SMS, nothing else.
 *
 * Retell signs tool calls the same way it signs webhooks.
 */
type BookBody = {
  call_id?: string;
  tenant?: string;
  args?: {
    customer_name?: string;
    phone?: string;
    suburb?: string;
    address?: string;
    job_type?: string;
    window_start?: string; // ISO
    window_end?: string; // ISO
    est_value?: number;
  };
};

export async function POST(req: Request) {
  if (!VOICE_LIVE) {
    return NextResponse.json({ ok: false, message: "Booking isn't wired up yet." }, { status: 503 });
  }

  const raw = await req.text();
  if (!verifyRetellSignature(raw, req.headers.get("x-retell-signature"))) {
    return NextResponse.json({ ok: false, message: "Unauthorised." }, { status: 401 });
  }

  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json({ ok: false, message: "Database isn't configured yet." }, { status: 503 });
  }

  let body: BookBody;
  try {
    body = JSON.parse(raw) as BookBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Bad request." }, { status: 400 });
  }

  const a = body.args ?? {};
  if (!body.tenant || !a.window_start) {
    return NextResponse.json(
      { ok: false, message: "I need a tenant and a time to book that." },
      { status: 400 },
    );
  }

  const isUuid = /^[0-9a-f-]{36}$/i.test(body.tenant);
  const { data: tenant } = await db
    .from("rb_tenants")
    .select("id, owner_mobile, avg_job_value")
    .eq(isUuid ? "id" : "owner_email", body.tenant)
    .maybeSingle();
  if (!tenant) {
    return NextResponse.json({ ok: false, message: "I don't recognise that business." }, { status: 404 });
  }

  const { data: booking, error } = await db
    .from("rb_bookings")
    .insert({
      tenant_id: tenant.id,
      customer_name: a.customer_name ?? null,
      customer_phone: a.phone ?? null,
      address: a.address ?? null,
      suburb: a.suburb ?? null,
      job_type: a.job_type ?? null,
      window_start: a.window_start,
      window_end: a.window_end ?? a.window_start,
      source: "ai_call",
      est_value: a.est_value ?? tenant.avg_job_value ?? null,
    })
    .select("id, window_start")
    .maybeSingle();

  if (error || !booking) {
    return NextResponse.json({ ok: false, message: "Couldn't lock that slot in, try another time." });
  }

  await db.from("rb_activity").insert({
    tenant_id: tenant.id,
    kind: "booking",
    label: `Booked ${a.job_type ?? "a job"} for ${a.customer_name ?? a.phone ?? "a caller"}`,
  });

  const when = new Date(booking.window_start).toLocaleString("en-AU", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  if (a.phone) {
    await sendSms(
      a.phone,
      `Booked: ${a.job_type ?? "your job"} on ${when}. We'll text a reminder closer to the time.`,
    );
  }
  if (tenant.owner_mobile) {
    await sendSms(tenant.owner_mobile, `New booking: ${a.customer_name ?? a.phone} - ${when}.`);
  }

  // Retell speaks `message` back to the caller directly.
  return NextResponse.json({
    ok: true,
    booking_id: booking.id,
    message: `All booked for ${when}.`,
  });
}
