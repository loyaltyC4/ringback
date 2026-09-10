"use client";

import { useMemo, useState } from "react";
import { NumberTicker } from "@/components/number-ticker";
import { Arrow } from "@/components/site-chrome";
import { Kicker, TabPill, AreaChart } from "./primitives";

/* ============================================================
   ANALYTICS — the "how is Emma actually performing" screen

   1. Action-required strip (only the things that need a human)
   2. Money + performance KPIs with period deltas
   3. Busiest-hours heat map (day × hour, intensity = call volume)
   4. Caller insights: new vs returning, disposition mix, top job
      types, top suburbs, and what she couldn't answer
   ============================================================ */

/* ---------- 1. action required ---------- */

type Alert = { kind: "escalation" | "gap" | "spike"; text: string; when: string };
const ALERTS: Alert[] = [
  { kind: "escalation", text: "Rachel Byrne's gas-smell warm transfer never connected — still needs a callback", when: "7:31am" },
  { kind: "gap", text: "3 callers this week asked about heat pumps — Emma has no answer on file", when: "this week" },
  { kind: "spike", text: "Tuesday 8am is your busiest hour and your highest miss rate before Emma", when: "trend" },
];

/* ---------- 2. KPI metrics ---------- */

type Range = "7d" | "30d" | "90d";
type Kpi = { label: string; value: number; prefix?: string; suffix?: string; delta: number; hint: string };

const KPIS: Record<Range, Kpi[]> = {
  "7d": [
    { label: "Calls answered", value: 47, delta: 12, hint: "vs prior 7d" },
    { label: "Answer rate", value: 100, suffix: "%", delta: 0, hint: "Emma never misses" },
    { label: "Booked", value: 29, delta: 18, hint: "62% of calls" },
    { label: "Recovered revenue", value: 18420, prefix: "$", delta: 22, hint: "would've gone to voicemail" },
    { label: "Avg handle time", value: 2.1, suffix: "m", delta: -8, hint: "shorter is better" },
    { label: "Spam filtered", value: 14, delta: 5, hint: "never reached you" },
  ],
  "30d": [
    { label: "Calls answered", value: 208, delta: 9, hint: "vs prior 30d" },
    { label: "Answer rate", value: 100, suffix: "%", delta: 0, hint: "Emma never misses" },
    { label: "Booked", value: 128, delta: 14, hint: "62% of calls" },
    { label: "Recovered revenue", value: 79240, prefix: "$", delta: 17, hint: "would've gone to voicemail" },
    { label: "Avg handle time", value: 2.3, suffix: "m", delta: -4, hint: "shorter is better" },
    { label: "Spam filtered", value: 61, delta: 11, hint: "never reached you" },
  ],
  "90d": [
    { label: "Calls answered", value: 612, delta: 31, hint: "vs prior 90d" },
    { label: "Answer rate", value: 100, suffix: "%", delta: 0, hint: "Emma never misses" },
    { label: "Booked", value: 379, delta: 26, hint: "62% of calls" },
    { label: "Recovered revenue", value: 231800, prefix: "$", delta: 29, hint: "would've gone to voicemail" },
    { label: "Avg handle time", value: 2.2, suffix: "m", delta: -6, hint: "shorter is better" },
    { label: "Spam filtered", value: 184, delta: 19, hint: "never reached you" },
  ],
};

function Delta({ v, invert }: { v: number; invert?: boolean }) {
  if (v === 0) return <span className="kpi-delta kpi-flat">—</span>;
  const good = invert ? v < 0 : v > 0;
  return (
    <span className="kpi-delta" data-good={good || undefined} data-bad={!good || undefined}>
      {v > 0 ? "▲" : "▼"} {Math.abs(v)}%
    </span>
  );
}

/* ---------- 3. busiest-hours heat map ---------- */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 12 }, (_, i) => 7 + i); // 7am–6pm

/** deterministic call-volume surface: weekday mornings hot, weekends light */
function heatValue(day: number, hour: number) {
  const weekend = day >= 5;
  const morningPeak = Math.exp(-((hour - 8) ** 2) / 6); // peak ~8am
  const afternoonBump = 0.55 * Math.exp(-((hour - 15) ** 2) / 8);
  let base = (morningPeak + afternoonBump) * (weekend ? 0.4 : 1);
  if (day === 1 && hour === 8) base *= 1.25; // Tuesday 8am spike
  if (day === 6) base *= 0.5; // Sunday quiet
  // stable jitter
  const j = (Math.sin(day * 12.9898 + hour * 78.233) * 43758.5453) % 1;
  base += Math.abs(j) * 0.08;
  return Math.max(0, Math.min(1, base));
}

function HeatMap() {
  const [hover, setHover] = useState<{ d: number; h: number } | null>(null);
  const grid = useMemo(
    () => DAYS.map((_, d) => HOURS.map((h) => heatValue(d, h))),
    [],
  );
  const peak = hover ? grid[hover.d][hover.h] : null;
  const fmtHour = (h: number) => {
    const ap = h >= 12 ? "p" : "a";
    return `${((h + 11) % 12) + 1}${ap}`;
  };

  return (
    <div className="heat">
      <div className="heat-grid">
        {/* corner + hour labels */}
        <span className="heat-corner" />
        {HOURS.map((h) => (
          <span className="heat-hlabel" key={h}>{fmtHour(h)}</span>
        ))}
        {/* rows */}
        {DAYS.map((day, d) => (
          <div className="heat-rowline" key={day} style={{ display: "contents" }}>
            <span className="heat-dlabel">{day}</span>
            {HOURS.map((h, hi) => {
              const v = grid[d][hi];
              const on = hover?.d === d && hover?.h === hi;
              return (
                <button
                  key={h}
                  className="heat-cell"
                  data-on={on || undefined}
                  style={{ ["--v" as string]: v.toFixed(3) }}
                  onMouseEnter={() => setHover({ d, h: hi })}
                  onMouseLeave={() => setHover(null)}
                  aria-label={`${day} ${fmtHour(h)}: ${Math.round(v * 12)} calls`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="heat-foot">
        <div className="heat-tip">
          {hover ? (
            <>
              <b>{DAYS[hover.d]} · {fmtHour(HOURS[hover.h])}</b>
              <span>≈ {Math.round((peak ?? 0) * 12)} calls / hour on average</span>
            </>
          ) : (
            <>
              <b>Your week at a glance</b>
              <span>Hover any block. Darkest = busiest. Staff your day around Emma&rsquo;s peaks.</span>
            </>
          )}
        </div>
        <div className="heat-scale">
          <span>Quiet</span>
          <i className="heat-ramp" />
          <span>Slammed</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- 4. caller insights ---------- */

const DISPOSITION = [
  { label: "Booked", pct: 62, tone: "booked" },
  { label: "Message taken", pct: 21, tone: "message" },
  { label: "Warm transfer", pct: 9, tone: "warm" },
  { label: "Out of area", pct: 5, tone: "muted" },
  { label: "Spam blocked", pct: 3, tone: "spam" },
];

const JOBS = [
  { label: "Blocked drains", n: 58, pct: 100 },
  { label: "Hot water", n: 44, pct: 76 },
  { label: "Burst / leak", n: 39, pct: 67 },
  { label: "Taps & mixers", n: 31, pct: 53 },
  { label: "Reno / rough-in", n: 22, pct: 38 },
  { label: "Gas fitting", n: 14, pct: 24 },
];

const SUBURBS = [
  { label: "Chermside", n: 41 },
  { label: "Stafford", n: 36 },
  { label: "Wavell Heights", n: 33 },
  { label: "Kedron", n: 28 },
  { label: "Nundah", n: 19 },
];

const REVENUE_TREND = [
  { label: "W1", value: 12800 }, { label: "W2", value: 13200 }, { label: "W3", value: 14100 },
  { label: "W4", value: 15600 }, { label: "W5", value: 14900 }, { label: "W6", value: 16400 },
  { label: "W7", value: 17800 }, { label: "W8", value: 18420 },
];

/* ---------- the page ---------- */

const RANGES = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
] as const;

export function Analytics() {
  const [range, setRange] = useState<Range>("30d");
  const kpis = KPIS[range];
  const newVsReturning = 68; // % new callers

  return (
    <>
      <header className="page-h">
        <div>
          <Kicker>How Emma is actually performing</Kicker>
          <h1 className="page-title">Analytics</h1>
        </div>
        <div className="page-h-right">
          <TabPill items={RANGES.map((r) => ({ ...r }))} value={range} onChange={(id) => setRange(id as Range)} />
        </div>
      </header>

      {/* action required */}
      <section className="an-alerts">
        {ALERTS.map((a) => (
          <div className="an-alert" key={a.text} data-kind={a.kind}>
            <span className="an-alert-tag">
              {a.kind === "escalation" ? "Needs a callback" : a.kind === "gap" ? "Knowledge gap" : "Trend"}
            </span>
            <p>{a.text}</p>
            <span className="an-alert-when">{a.when}</span>
          </div>
        ))}
      </section>

      {/* KPI grid */}
      <section className="kpi-grid">
        {kpis.map((k) => (
          <div className="kpi" key={k.label}>
            <span className="kpi-label">{k.label}</span>
            <div className="kpi-value">
              {k.prefix && <span className="kpi-affix">{k.prefix}</span>}
              <NumberTicker value={k.value} />
              {k.suffix && <span className="kpi-affix">{k.suffix}</span>}
            </div>
            <div className="kpi-foot">
              <Delta v={k.delta} invert={k.label === "Avg handle time"} />
              <span className="kpi-hint">{k.hint}</span>
            </div>
          </div>
        ))}
      </section>

      {/* heat map */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Busiest hours</Kicker>
            <h2>When your phone actually rings</h2>
          </div>
          <span className="an-peak-pill">Peak · Tue 8am</span>
        </header>
        <HeatMap />
      </section>

      {/* revenue trend + disposition */}
      <div className="two">
        <section className="card">
          <header className="sec-h">
            <div>
              <Kicker>Recovered revenue · weekly</Kicker>
              <h2>The trend line that matters</h2>
            </div>
          </header>
          <div className="area-wrap">
            <AreaChart data={REVENUE_TREND} width={520} height={220} />
          </div>
        </section>

        <section className="card">
          <header className="sec-h">
            <div>
              <Kicker>What happens on a call</Kicker>
              <h2>Disposition mix</h2>
            </div>
          </header>
          <div className="disp-bar" aria-hidden>
            {DISPOSITION.map((d) => (
              <span key={d.label} className="disp-seg" data-tone={d.tone} style={{ width: `${d.pct}%` }} title={`${d.label} ${d.pct}%`} />
            ))}
          </div>
          <ul className="disp-legend">
            {DISPOSITION.map((d) => (
              <li key={d.label}>
                <span className="disp-dot" data-tone={d.tone} />
                {d.label}
                <b>{d.pct}%</b>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* caller insights */}
      <div className="two">
        <section className="card">
          <header className="sec-h">
            <div>
              <Kicker>Top job types</Kicker>
              <h2>What people ring about</h2>
            </div>
          </header>
          <div className="rank">
            {JOBS.map((j) => (
              <div className="rank-row" key={j.label}>
                <span className="rank-label">{j.label}</span>
                <div className="rank-track">
                  <div className="rank-fill" style={{ width: `${j.pct}%` }} />
                </div>
                <b className="rank-n">{j.n}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <header className="sec-h">
            <div>
              <Kicker>Caller mix</Kicker>
              <h2>Who&rsquo;s calling</h2>
            </div>
          </header>
          <div className="donut-row">
            <div
              className="donut"
              style={{ ["--p" as string]: `${newVsReturning}` }}
              role="img"
              aria-label={`${newVsReturning}% new callers`}
            >
              <div className="donut-hole">
                <b>{newVsReturning}%</b>
                <span>new</span>
              </div>
            </div>
            <ul className="donut-legend">
              <li><span className="disp-dot" data-tone="booked" /> New callers <b>{newVsReturning}%</b></li>
              <li><span className="disp-dot" data-tone="muted" /> Returning <b>{100 - newVsReturning}%</b></li>
              <li className="donut-note">Returning callers are recognised by number and never re-interrogated.</li>
            </ul>
          </div>
          <div className="suburb-list">
            <span className="k-kick">Top suburbs</span>
            {SUBURBS.map((s) => (
              <div className="suburb-row" key={s.label}>
                <span>{s.label}</span>
                <b>{s.n}</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* knowledge gaps */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>What Emma couldn&rsquo;t answer</Kicker>
            <h2>Turn gaps into knowledge</h2>
          </div>
          <a className="sec-more" href="/dashboard/agent">Fix in My Agent <Arrow /></a>
        </header>
        <div className="gap-list">
          <div className="gap-row">
            <span className="gap-q">&ldquo;Do you install heat pumps?&rdquo;</span>
            <span className="gap-n">asked 3×</span>
            <button className="cd-btn">Add an answer</button>
          </div>
          <div className="gap-row">
            <span className="gap-q">&ldquo;What&rsquo;s your callout fee after hours?&rdquo;</span>
            <span className="gap-n">asked 2×</span>
            <button className="cd-btn">Add an answer</button>
          </div>
          <div className="gap-row">
            <span className="gap-q">&ldquo;Do you do commercial strata work?&rdquo;</span>
            <span className="gap-n">asked 2×</span>
            <button className="cd-btn">Add an answer</button>
          </div>
        </div>
      </section>
    </>
  );
}
