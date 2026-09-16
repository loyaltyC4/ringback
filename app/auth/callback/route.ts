import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Exchanges the emailed code for a session, then lands the owner on Today. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";
  const sb = await supabaseServer();

  if (sb && code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/signin?error=link", url.origin));
}
