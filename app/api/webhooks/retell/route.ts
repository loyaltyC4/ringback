import { NextResponse } from "next/server";
import { VOICE_LIVE } from "@/lib/env";
import { verifyRetellSignature, type RetellCallPayload } from "@/lib/retell";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms";

export const runtime = "nodejs";

/**
 * One endpoint for all three Retell call events (Retell posts every event to
 * the single webhook URL configured on the agent, distinguished by `event`).
 *
 *  - call_started  → open a row in rb_calls so it shows up as "in progress"
 *  - call_ended    → fill in duration/recording/transcript, resolve outcome
 *  - call_analyzed → attach Retell's own summary + sentiment once it lands
 *
 * `metadata.tenant` is the uuid or owner_email we set when we dial the agent
 * up for a customer (or the demo tenant for the public demo line). Retell
 * echoes whatever metadata we gave the call back on every event.
 */
export async function POST(req: Request) {
  if (!VOICE_LIVE) {
    return NextResponse.json({ ok: false, reason: "voice_not_configured" }, { status: 503 });
  }

  const raw = await req.text();
  if (!verifyRetellSignature(raw, req.headers.get("x-retell-signature"))) {
    return NextResponse.json({ ok: false, reason: "bad_signature" }, { status: 401 });
  }

  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json({ ok: false, reason: "db_not_configured" }, { status: 503 });
  }

  let body: RetellCallPayload;
  try {
    body = JSON.parse(raw) as RetellCallPayload;
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const { event, call } = body;
  const tenantRef = call.metadata?.tenant;
  if (!tenantRef) {
    // Not one of ours (or the agent wasn't dialled with metadata) — ack so
    // Retell stops retrying, but do nothing.
    return NextResponse.json({ ok: true, ignored: "no_tenant_metadata" });
  }

  const isUuid = /^[0-9a-f-]{36}$/i.test(tenantRef);
  const { data: tenant } = await db
    .from("rb_tenants")
    .select("id, owner_mobile, avg_job_value")
    .eq(isUuid ? "id" : "owner_email", tenantRef)
    .maybeSingle();
  if (!tenant) {
    return NextResponse.json({ ok: false, reason: "unknown_tenant" }, { status: 404 });
  }

  const callerPhone = call.from_number ?? "unknown";
  const callerName = call.metadata?.caller_name ?? null;
  const suburb = call.metadata?.suburb ?? null;

  if (event === "call_started") {
    await db.from("rb_calls").insert({
      tenant_id: tenant.id,
      caller_phone: callerPhone,
      caller_name: callerName,
      suburb,
      status: "in_progress",
      started_at: call.start_timestamp
        ? new Date(call.start_timestamp).toISOString()
        : new Date().toISOString(),
    });
    await db.from("rb_activity").insert({
      tenant_id: tenant.id,
      kind: "call",
      label: `Answering ${callerName ?? callerPhone}`,
    });
    return NextResponse.json({ ok: true });
  }

  if (event === "call_ended") {
    const durationSec = call.duration_ms ? Math.round(call.duration_ms / 1000) : null;
    const { data: row } = await db
      .from("rb_calls")
      .update({
        status: "answered",
        duration_sec: durationSec,
        recording_url: call.recording_url ?? null,
        transcript: call.transcript_object ?? call.transcript ?? null,
      })
      .eq("tenant_id", tenant.id)
      .eq("caller_phone", callerPhone)
      .eq("status", "in_progress")
      .select("id")
      .maybeSingle();

    // an SMS confirming the call happened, even before analysis fills the summary in
    if (tenant.owner_mobile) {
      await sendSms(
        tenant.owner_mobile,
        `RingBack: call from ${callerName ?? callerPhone} just ended (${durationSec ?? "?"}s). Check the dashboard for the transcript.`,
      );
    }
    return NextResponse.json({ ok: true, call_id: row?.id ?? null });
  }

  if (event === "call_analyzed") {
    const analysis = call.call_analysis;
    // supabase-js update() doesn't support order()/limit() — find the most
    // recent matching call first, then update it by id.
    const { data: latest } = await db
      .from("rb_calls")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("caller_phone", callerPhone)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest) {
      await db
        .from("rb_calls")
        .update({
          summary: analysis?.call_summary ?? null,
          sentiment: analysis?.user_sentiment ?? null,
          outcome: analysis?.call_successful ? "booked" : "message",
          needs_action: analysis?.call_successful === false,
        })
        .eq("id", latest.id);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: event });
}
