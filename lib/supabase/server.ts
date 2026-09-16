import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { DB_ADMIN, DB_LIVE, SUPABASE_ANON, SUPABASE_SERVICE, SUPABASE_URL } from "@/lib/env";

/**
 * Request-scoped client that carries the signed-in owner's session, so every
 * query runs under row level security as that tenant. Returns null when the
 * install has no database yet (see lib/env.ts).
 */
export async function supabaseServer() {
  if (!DB_LIVE) return null;
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          list.forEach(({ name, value, options }) => {
            // next/headers' set() is overloaded; a narrow local signature keeps
            // the supabase cookie shape assignable without reaching for any.
            const set = store.set as unknown as (
              n: string,
              v: string,
              o?: Record<string, unknown>,
            ) => void;
            set(name, value, options);
          });
        } catch {
          // called from a Server Component render, where cookies are read-only.
          // The middleware refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Service-role client for trusted server work only: telephony webhooks,
 * Stripe webhooks, tenant provisioning. Never import this into a Client
 * Component and never expose its results unfiltered.
 */
export function supabaseAdmin() {
  if (!DB_ADMIN) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** the signed-in owner, or null in demo mode / when signed out */
export async function currentOwner() {
  const sb = await supabaseServer();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}
