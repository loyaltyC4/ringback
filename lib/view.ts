import { supabaseServer } from "@/lib/supabase/server";
import { getTenant, type BookingRow, type CallRow } from "@/lib/data";

/* ============================================================
   VIEW MAPPING

   Database rows in, the exact shapes the Today screen already
   renders out. The mapping lives here so the screen stays
   presentational and keeps working on its fixtures when this
   returns null (no database, or nobody signed in).
   ============================================================ */

export type Range = "today" | "week" | "month";

export type HotView = { name: string; kind: string; when: string; job: string };
export type BookingView = {
  time: string;
  caller: string;
  job: string;
  where: string;
  tag: "emergency" | "standard" | "quote";
};
export type Disp = "booked" | "message" | "warm" | "spam";
export type CallView = { name: string; job: string; note: string; disp: Disp; time: string };
export type SchedView = { play: string; who: string; note: string; at: string };

export type TodayView = {
  name: string;
  area: string;
  hot: HotView[];
  bookings: BookingView[];
  calls: CallView[];
  sched: SchedView[];
  money: Record<Range, { total: number; jobs: number; series: number[] }>;
};

const AU_TIME: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

function shortTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso)
    .toLocaleTimeString("en-AU", AU_TIME)
    .replace(" ", "")
    .replace("am", "a")
    .replace("pm", "p");
}

function relTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today ? "Yest" : shortTime(iso);
}

function bookingTag(b: BookingRow): BookingView["tag"] {
  const job = (b.job_type ?? "").toLowerCase();
  if (job.includes("quote")) return "quote";
  if (job.includes("emergency") || job.includes("burst") || job.includes("gas")) return "emergency";
  return "standard";
}

function disposition(c: CallRow): Disp {
  if (c.outcome === "booked") return "booked";
  if (c.outcome === "spam" || c.urgency === "spam") return "spam";
  if (c.outcome === "transferred") return "warm";
  return "message";
}

/** cumulative series so the sparkline climbs the way the money did */
function cumulative(values: number[]): number[] {
  let run = 0;
  const out = values.map((v) => (run += v));
  return out.length > 1 ? out : [0, ...out];
}

export async function getTodayView(): Promise<TodayView | null> {
  const sb = await supabaseServer();
  const tenant = await getTenant();
  if (!sb || !tenant) return null;

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(dayStart);
  monthStart.setDate(monthStart.getDate() - 30);
  const weekStart = new Date(dayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const [{ data: callRows }, { data: bookingRows }, { data: followRows }] = await Promise.all([
    sb
      .from("rb_calls")
      .select(
        "id,caller_name,caller_phone,suburb,job_type,urgency,outcome,status,summary,duration_sec,needs_action,booked_value,started_at",
      )
      .eq("tenant_id", tenant.id)
      .gte("started_at", weekStart.toISOString())
      .order("started_at", { ascending: false })
      .limit(40),
    sb
      .from("rb_bookings")
      .select("id,customer_name,suburb,job_type,window_start,window_end,status,est_value")
      .eq("tenant_id", tenant.id)
      .gte("window_start", monthStart.toISOString())
      .order("window_start", { ascending: true })
      .limit(200),
    sb
      .from("rb_followups")
      .select("id,channel,body,due_at,status,playbook_id")
      .eq("tenant_id", tenant.id)
      .gte("due_at", dayStart.toISOString())
      .order("due_at", { ascending: true })
      .limit(10),
  ]);

  const calls = (callRows ?? []) as CallRow[];
  const bookings = (bookingRows ?? []) as BookingRow[];
  const avg = tenant.avg_job_value ?? 650;
  const value = (b: BookingRow) => b.est_value ?? avg;

  const inRange = (b: BookingRow, from: Date) =>
    b.window_start ? new Date(b.window_start) >= from : false;
  const todayBookings = bookings.filter((b) => inRange(b, dayStart));
  const weekBookings = bookings.filter((b) => inRange(b, weekStart));

  const sum = (rows: BookingRow[]) => rows.reduce((t, b) => t + value(b), 0);

  return {
    name: (tenant.owner_name ?? "there").split(" ")[0],
    area: tenant.service_area ?? "",
    hot: calls
      .filter((c) => c.needs_action)
      .slice(0, 3)
      .map((c) => ({
        name: c.caller_name ?? c.caller_phone,
        kind: [c.job_type, c.suburb].filter(Boolean).join(" · "),
        when: shortTime(c.started_at),
        job: c.summary ?? "Needs your call back",
      })),
    bookings: todayBookings.slice(0, 6).map((b) => ({
      time: shortTime(b.window_start),
      caller: b.customer_name ?? "Caller",
      job: b.job_type ?? "Job",
      where: b.suburb ?? "",
      tag: bookingTag(b),
    })),
    calls: calls.slice(0, 6).map((c) => ({
      name: c.caller_name ?? c.caller_phone,
      job: c.job_type ?? "Enquiry",
      note: c.summary ?? "",
      disp: disposition(c),
      time: relTime(c.started_at),
    })),
    sched: (followRows ?? []).map((f) => {
      const row = f as { body: string | null; due_at: string | null; status: string | null };
      return {
        play: "Follow-up",
        who: row.body?.slice(0, 28) ?? "Scheduled",
        note: row.status ?? "scheduled",
        at: shortTime(row.due_at),
      };
    }),
    money: {
      today: {
        total: sum(todayBookings),
        jobs: todayBookings.length,
        series: cumulative(todayBookings.map(value)),
      },
      week: {
        total: sum(weekBookings),
        jobs: weekBookings.length,
        series: cumulative(weekBookings.map(value)),
      },
      month: {
        total: sum(bookings),
        jobs: bookings.length,
        series: cumulative(bookings.map(value)),
      },
    },
  };
}
