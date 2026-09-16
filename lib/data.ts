import { supabaseServer } from "@/lib/supabase/server";

/**
 * Server-side reads for the dashboard.
 *
 * Every function returns null when the install has no database or nobody is
 * signed in. Screens treat null as "use the demo fixtures", which is what
 * keeps the public demo dashboard and the guided tour alive.
 */

export type TenantRow = {
  id: string;
  business_name: string;
  owner_name: string | null;
  trade: string | null;
  service_area: string | null;
  demo_number: string | null;
  real_number: string | null;
  number_status: string | null;
  plan: string | null;
  trial_ends_at: string | null;
  avg_job_value: number | null;
};

export type CallRow = {
  id: string;
  caller_name: string | null;
  caller_phone: string;
  suburb: string | null;
  job_type: string | null;
  urgency: string | null;
  outcome: string | null;
  status: string | null;
  summary: string | null;
  duration_sec: number | null;
  needs_action: boolean | null;
  booked_value: number | null;
  started_at: string;
};

export type BookingRow = {
  id: string;
  customer_name: string | null;
  suburb: string | null;
  job_type: string | null;
  window_start: string | null;
  window_end: string | null;
  status: string | null;
  est_value: number | null;
};

export type TodaySnapshot = {
  tenant: TenantRow;
  calls: CallRow[];
  bookings: BookingRow[];
  hot: CallRow[];
  recoveredToday: number;
  jobsBookedToday: number;
};

/** the tenant owned by the signed-in email, or null */
export async function getTenant(): Promise<TenantRow | null> {
  const sb = await supabaseServer();
  if (!sb) return null;
  const { data: auth } = await sb.auth.getUser();
  const email = auth.user?.email;
  if (!email) return null;
  const { data } = await sb
    .from("rb_tenants")
    .select(
      "id,business_name,owner_name,trade,service_area,demo_number,real_number,number_status,plan,trial_ends_at,avg_job_value",
    )
    .eq("owner_email", email)
    .maybeSingle();
  return (data as TenantRow) ?? null;
}

export async function getTodaySnapshot(): Promise<TodaySnapshot | null> {
  const sb = await supabaseServer();
  const tenant = await getTenant();
  if (!sb || !tenant) return null;

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const [{ data: calls }, { data: bookings }] = await Promise.all([
    sb
      .from("rb_calls")
      .select(
        "id,caller_name,caller_phone,suburb,job_type,urgency,outcome,status,summary,duration_sec,needs_action,booked_value,started_at",
      )
      .eq("tenant_id", tenant.id)
      .gte("started_at", dayStart.toISOString())
      .order("started_at", { ascending: false })
      .limit(40),
    sb
      .from("rb_bookings")
      .select("id,customer_name,suburb,job_type,window_start,window_end,status,est_value")
      .eq("tenant_id", tenant.id)
      .gte("window_start", dayStart.toISOString())
      .order("window_start", { ascending: true })
      .limit(20),
  ]);

  const callRows = (calls ?? []) as CallRow[];
  const bookingRows = (bookings ?? []) as BookingRow[];

  return {
    tenant,
    calls: callRows,
    bookings: bookingRows,
    hot: callRows.filter((c) => c.needs_action),
    recoveredToday: bookingRows.reduce(
      (sum, b) => sum + (b.est_value ?? tenant.avg_job_value ?? 0),
      0,
    ),
    jobsBookedToday: bookingRows.length,
  };
}

export async function getCalls(limit = 60): Promise<CallRow[] | null> {
  const sb = await supabaseServer();
  const tenant = await getTenant();
  if (!sb || !tenant) return null;
  const { data } = await sb
    .from("rb_calls")
    .select(
      "id,caller_name,caller_phone,suburb,job_type,urgency,outcome,status,summary,duration_sec,needs_action,booked_value,started_at",
    )
    .eq("tenant_id", tenant.id)
    .order("started_at", { ascending: false })
    .limit(limit);
  return (data as CallRow[]) ?? [];
}

export async function getBookings(fromISO: string, toISO: string): Promise<BookingRow[] | null> {
  const sb = await supabaseServer();
  const tenant = await getTenant();
  if (!sb || !tenant) return null;
  const { data } = await sb
    .from("rb_bookings")
    .select("id,customer_name,suburb,job_type,window_start,window_end,status,est_value")
    .eq("tenant_id", tenant.id)
    .gte("window_start", fromISO)
    .lte("window_start", toISO)
    .order("window_start", { ascending: true });
  return (data as BookingRow[]) ?? [];
}
