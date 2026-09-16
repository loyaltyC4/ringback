import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DB_LIVE, SUPABASE_ANON, SUPABASE_URL } from "@/lib/env";

/**
 * Two jobs:
 *  1. refresh the Supabase session cookie on every dashboard request
 *  2. bounce signed-out owners to /signin once the install is really wired
 *
 * In demo mode (no Supabase env) the dashboard stays open on purpose, so the
 * public demo dashboard and the guided tour keep working.
 */
export async function middleware(req: NextRequest) {
  if (!DB_LIVE) return NextResponse.next();

  const res = NextResponse.next({ request: req });
  const sb = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(list: { name: string; value: string; options?: Record<string, unknown> }[]) {
        list.forEach(({ name, value, options }) => {
          res.cookies.set({ name, value, ...(options ?? {}) } as Parameters<
            typeof res.cookies.set
          >[0]);
        });
      },
    },
  });

  const {
    data: { user },
  } = await sb.auth.getUser();

  // ?demo=1 is an explicit, shareable way to view the fixture dashboard
  const demo = req.nextUrl.searchParams.get("demo") === "1";
  if (!user && !demo && req.nextUrl.pathname.startsWith("/dashboard")) {
    const to = req.nextUrl.clone();
    to.pathname = "/signin";
    to.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(to);
  }
  return res;
}

export const config = { matcher: ["/dashboard/:path*"] };
