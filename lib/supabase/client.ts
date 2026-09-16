"use client";

import { createBrowserClient } from "@supabase/ssr";
import { DB_LIVE, SUPABASE_ANON, SUPABASE_URL } from "@/lib/env";

/** browser client, or null in demo mode */
export function supabaseBrowser() {
  if (!DB_LIVE) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
}
