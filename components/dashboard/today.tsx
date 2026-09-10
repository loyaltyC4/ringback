"use client";

import { useEffect, useState } from "react";
import { ShaderBackground } from "@/components/shader-background";
import { GREEN_MESH_DEEP } from "@/lib/shaders";
import { NumberTicker } from "@/components/number-ticker";
import { Arrow } from "@/components/site-chrome";

/* ============================================================
   TODAY

   The one screen someone sees 90% of the time. Answers three
   questions in the order they're asked when a tradie logs in:

     1. What did she do while I was on the tools?
     2. Is anything on fire (do I need to act)?
     3. How much did she actually earn me?

   Everything else is one click away in the sidebar. Nothing on
   this screen requires scrolling below the fold to answer those
   three questions — the density is honest, not tight.
   ============================================================ */

/* ---------- 1. HOT LEAD BANNER
   Only renders when there are calls needing you. Amber, dismissible
   per session. Deliberately loud — this is the one thing the design
   agrees can shout. */

type Hot = { name: string; kind: string; when: string; job: string };
const HOT: Hot[] = [
  { name: "Rachel Byrne", kind: "Gas smell · Chermside", when: "7:31am", job: "warm-transfer didn't land — Emma booked her a callback slot" },
  { name: "Jim Taylor", kind: "Reno rough-in quote · Wavell", when: "9:04am", job: "measured last week · Emma promised the quote by end of day" },
];

function HotLeadBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || HOT.length === 0) return null;
  return (
    <div className="hot" role="alert">
      <div className="hot-mark" aria-hidden>
        <span className="hot-pulse" />
        !
      </div>
      <div className="hot-body">
        <b>
          {HOT.length} call{HOT.length === 1 ? "" : "s"} need you today
        </b>
        <div className="hot-rows">
          {HOT.map((h) => (
            <a className="hot-row" key={h.name} href={`/dashboard/calls`}>
              <span className="hot-name">{h.name}</span>
              <span className="hot-kind">{h.kind}</span>
              <span className="hot-job">{h.job}</span>
              <span className="hot-when">{h.when}</span>
              <Arrow className="hot-go" />
            </a>
          ))}
        </div>
      </div>
      <button className="hot-close" onClick={() => setDismissed(true)} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}

/* ---------- 2. MONEY BAR
   The argument for staying subscribed. Ticker at the top of the
   fold. Range toggle changes the number and the sparkline.
   Reads a fake-but-plausible series so demo doesn't lie. */

type Range = "today" | "week" | "month";
const MONEY: Record<Range, { total: number; jobs: number; series: number[] }> = {
  today: { total: 1480, jobs: 3, series: [80, 210, 340, 340, 520, 800, 1080, 1280, 1480] },
  week: { total: 12420, jobs: 21, series: [900, 2100, 3400, 5600, 7800, 10200, 12420] },
  month: { total: 48320, jobs: 78, series: [3200, 8100, 14400, 21200, 27400, 33600, 38900, 44100, 48320] },
};

function Spark({ series, width = 200, height = 44 }: { series: number[]; width?: number; height?: number }) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const dx = width / (series.length - 1);
  const dy = (v: number) => height - 2 - ((v - min) / (max - min || 1)) * (height - 4);
  const d = series.map((v, i) => `${i === 0 ? "M" : "L"}${(i * dx).toFixed(1)},${dy(v).toFixed(1)}`).join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={((series.length - 1) * dx).toFixed(1)} cy={dy(series[series.length - 1]).toFixed(1)} r="3" fill="currentColor" />
    </svg>
  );
}

function MoneyBar() {
  const [range, setRange] = useState<Range>("today");
  const m = MONEY[range];
  return (
    <section className="money" aria-label="Recovered revenue">
      <div className="money-l">
        <span className="k-kick">Recovered revenue</span>
        <div className="money-big">
          <span className="money-cur">$</span>
          <NumberTicker value={m.total} />
        </div>
        <p className="money-sub">
          <b>{m.jobs}</b> {m.jobs === 1 ? "job" : "jobs"} booked by Emma{" "}
          {range === "today" ? "today" : range === "week" ? "this week" : "this month"} · calls that would&rsquo;ve
          gone to voicemail without her.
        </p>
      </div>
      <div className="money-r">
        <div className="range" role="tablist" aria-label="Range">
          {(["today", "week", "month"] as Range[]).map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={r === range}
              data-on={r === range || undefined}
              onClick={() => setRange(r)}
            >
              {r === "today" ? "Today" : r === "week" ? "This week" : "This month"}
            </button>
          ))}
        </div>
        <Spark series={m.series} />
      </div>
    </section>
  );
}

/* ---------- 3. TODAY'S BOOKINGS
   Compact strip. Sorted by time. Every card is a real bookable
   slot — Emma pushed it into your calendar and told the caller.
   Tap a card → drawer with the full call (built in Calls). */

type Booking = { time: string; caller: string; job: string; where: string; tag: "emergency" | "standard" | "quote" };
const BOOKINGS: Booking[] = [
  { time: "9:30a", caller: "Priya Patel", job: "Leaking mixer", where: "Wavell Heights", tag: "standard" },
  { time: "12:15p", caller: "Marco G", job: "Blocked stormwater", where: "Chermside West", tag: "standard" },
  { time: "2:15p", caller: "Sue Murphy", job: "HWS replacement", where: "Stafford", tag: "emergency" },
  { time: "4:00p", caller: "Jim Taylor", job: "Reno rough-in — quote", where: "Wavell Heights", tag: "quote" },
];

function TodayBookings() {
  return (
    <section className="bookings">
      <header className="sec-h">
        <div>
          <span className="k-kick">Today · bookings Emma held for you</span>
          <h2>{BOOKINGS.length} on your books</h2>
        </div>
        <a className="sec-more" href="/dashboard/bookings">
          See the week <Arrow />
        </a>
      </header>
      <div className="book-strip">
        {BOOKINGS.map((b) => (
          <a className="book" key={b.caller} href="/dashboard/calls" data-tag={b.tag}>
            <span className="book-time">{b.time}</span>
            <b className="book-caller">{b.caller}</b>
            <span className="book-job">{b.job}</span>
            <span className="book-where">{b.where}</span>
            <span className="book-tag">
              {b.tag === "emergency" ? "Emergency" : b.tag === "quote" ? "Quote visit" : "Standard"}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ---------- 4. CALL FEED
   The recent-calls list. Row is the whole story: caller, job in
   two words, disposition badge, timer. Tap → detail drawer (built
   in Calls) — from Today the whole row is a link. */

type Disp = "booked" | "message" | "warm" | "spam";
type Call = { name: string; job: string; note: string; disp: Disp; time: string };
const CALLS: Call[] = [
  { name: "Sue Murphy", job: "HWS gone", note: "Emergency · booked 2:15p", disp: "booked", time: "9:42a" },
  { name: "Jim Taylor", job: "Reno rough-in quote", note: "Details captured · quote callback Fri", disp: "message", time: "9:04a" },
  { name: "Rachel Byrne", job: "Gas smell", note: "Warm transfer didn't land — needs you", disp: "warm", time: "7:31a" },
  { name: "+61 Unknown", job: "\"Extended warranty\"", note: "Robocall — blocked before it rang you", disp: "spam", time: "7:02a" },
  { name: "Marco G", job: "Blocked stormwater", note: "Booked Wed 7am · Chermside West", disp: "booked", time: "6:55a" },
  { name: "Priya Patel", job: "Leaking tap", note: "Booked Fri 10:30 · first-time caller", disp: "booked", time: "Yest" },
];

function DispBadge({ d }: { d: Disp }) {
  const label = d === "booked" ? "Booked" : d === "message" ? "Message" : d === "warm" ? "Warm transfer" : "Spam";
  return (
    <span className="cf-badge" data-d={d}>
      {label}
    </span>
  );
}

function CallFeed() {
  return (
    <section className="feed">
      <header className="sec-h">
        <div>
          <span className="k-kick">Every call, summarised</span>
          <h2>Live call feed</h2>
        </div>
        <a className="sec-more" href="/dashboard/calls">
          Full inbox <Arrow />
        </a>
      </header>
      <div className="feed-list">
        {CALLS.map((c) => (
          <a className="feed-row" key={c.name + c.time} href="/dashboard/calls">
            <span className="feed-av" aria-hidden>
              {c.name
                .split(" ")
                .map((s) => s[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div className="feed-body">
              <div className="feed-top">
                <b>{c.name}</b>
                <span className="feed-job">— {c.job}</span>
              </div>
              <span className="feed-note">{c.note}</span>
            </div>
            <DispBadge d={c.disp} />
            <span className="feed-time">{c.time}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ---------- 5. FOLLOW-UPS SCHEDULED
   What will run automatically today, so nothing feels magical.
   Each row is a promise the agent is going to keep — the owner
   can pause any playbook. Empty state is opinionated. */

type Sched = { play: string; who: string; note: string; at: string };
const SCHED: Sched[] = [
  { play: "Quote chase", who: "Jim Taylor", note: "Day 3 · bathroom rough-in", at: "9:00a" },
  { play: "No-show rescue", who: "Ken Wright", note: "Missed yesterday's slot", at: "10:30a" },
  { play: "Review request", who: "Anna R", note: "2h after mark-done", at: "1:15p" },
  { play: "Missed-call text", who: "0402 111 902", note: "Sent · awaiting reply", at: "6:44a" },
];

function ScheduledFollowups() {
  return (
    <section className="sched">
      <header className="sec-h">
        <div>
          <span className="k-kick">Follow-ups Emma will run today</span>
          <h2>4 going out</h2>
        </div>
        <a className="sec-more" href="/dashboard/followups">
          Playbooks <Arrow />
        </a>
      </header>
      <div className="sched-list">
        {SCHED.map((s) => (
          <div className="sched-row" key={s.who + s.at}>
            <span className="sched-play">{s.play}</span>
            <div className="sched-body">
              <b>{s.who}</b>
              <span>{s.note}</span>
            </div>
            <span className="sched-at">{s.at}</span>
            <button className="sched-pause" title={`Pause ${s.play}`}>
              Pause
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 6. THE TOP OF TODAY — the shader header, only place
   the marketing-site grain is allowed on the dashboard. */

function TodayHero({ day, name }: { day: string; name: string }) {
  return (
    <section className="th">
      <ShaderBackground className="th-bg" uniforms={GREEN_MESH_DEEP} />
      <div className="th-in">
        <span className="th-kick">
          <span className="th-live" /> Emma is live · answering
        </span>
        <h1>
          G&rsquo;day {name}. Here&rsquo;s{" "}
          <span className="th-em">how she went while you were on the tools.</span>
        </h1>
        <p className="th-day">{day} · Brisbane Northside</p>
      </div>
    </section>
  );
}

/* ============================================================
   TODAY — composed
   ============================================================ */

export function Today() {
  const now = new Date();
  const day = now.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
  return (
    <>
      <TodayHero day={day} name="Dave" />
      <HotLeadBanner />
      <MoneyBar />

      <div className="two">
        <TodayBookings />
        <ScheduledFollowups />
      </div>

      <CallFeed />
    </>
  );
}
