import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/env";

/** Sends the passwordless sign-in link. 503 while the install has no auth. */
export async function POST(req: Request) {
  const sb = await supabaseServer();
  if (!sb) {
    return NextResponse.json(
      { ok: false, reason: "auth_not_configured" },
      { status: 503 },
    );
  }

  let email = "";
  try {
    ({ email } = (await req.json()) as { email?: string });
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, reason: "bad_email" }, { status: 400 });
  }

  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
  });
  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
