"use client";

import { useState } from "react";
import { NumberTicker } from "@/components/number-ticker";
import { ShaderBackground } from "@/components/shader-background";
import { GREEN_MESH_DEEP } from "@/lib/shaders";
import { Arrow } from "@/components/site-chrome";
import { Kicker, AreaChart, RangeSlider, TabPill } from "./primitives";

/* ============================================================
   VALUE — the "why you keep paying" screen

   1. Hero: recovered revenue this month + 49× ROI pill
   2. Area chart over the last 12 weeks
   3. Loss calculator — interactive sliders that make the
      subscription price look silly next to the missed-call cost
   4. Weekly digest preview — the SMS Emma sends every Monday
   ============================================================ */

const WEEKLY: Record<string, { label: string; value: number }[]> = {
  m12: [
    { label: "Wk 1", value: 8600 }, { label: "Wk 2", value: 9400 }, { label: "Wk 3", value: 11200 },
    { label: "Wk 4", value: 12800 }, { label: "Wk 5", value: 10400 }, { label: "Wk 6", value: 13200 },
    { label: "Wk 7", value: 14100 }, { label: "Wk 8", value: 15600 }, { label: "Wk 9", value: 12900 },
    { label: "Wk 10", value: 16400 }, { label: "Wk 11", value: 17800 }, { label: "Wk 12", value: 18400 },
  ],
  m6: [
    { label: "Wk 7", value: 14100 }, { label: "Wk 8", value: 15600 }, { label: "Wk 9", value: 12900 },
    { label: "Wk 10", value: 16400 }, { label: "Wk 11", value: 17800 }, { label: "Wk 12", value: 18400 },
  ],
  m3: [
    { label: "Wk 10", value: 16400 }, { label: "Wk 11", value: 17800 }, { label: "Wk 12", value: 18400 },
  ],
};

const TOTAL_MONTH = 48320;
const SUBS_MONTH = 299;

/* ---------- Loss calculator ---------- */

function LossCalculator() {
  const [callsPerWk, setCalls] = useState(38);
  const [missPct, setMiss] = useState(28); // % missed
  const [avgJob, setAvgJob] = useState(650);
  const missedPerWk = Math.round(callsPerWk * (missPct / 100));
  const capturedPerWk = Math.round(missedPerWk * 0.6); // Emma rescues ~60%
  const dollarsPerWk = capturedPerWk * avgJob;
  const perMonth = dollarsPerWk * 4.33;
  const roi = Math.round(perMonth / SUBS_MONTH);

  return (
    <section className="loss">
      <header className="sec-h">
        <div>
          <Kicker>Loss calculator</Kicker>
          <h2>What every missed call is actually costing you</h2>
        </div>
      </header>

      <div className="loss-grid">
        <div className="loss-inputs">
          <RangeSlider label={`Calls per week — ${callsPerWk}`} value={callsPerWk} min={5} max={120} step={1} onChange={setCalls} />
          <RangeSlider label={`Missed before Emma — ${missPct}%`} value={missPct} min={0} max={70} step={1} onChange={setMiss} />
          <RangeSlider label={`Average job value — $${avgJob}`} value={avgJob} min={150} max={4000} step={50} onChange={setAvgJob} />
        </div>

        <div className="loss-out">
          <div className="loss-row">
            <span>Calls Emma catches</span>
            <b>{capturedPerWk}/wk</b>
          </div>
          <div className="loss-row">
            <span>Recovered revenue</span>
            <b>${dollarsPerWk.toLocaleString()}/wk</b>
          </div>
          <div className="loss-hero">
            <span>Every month</span>
            <div className="loss-big">
              <span className="loss-cur">$</span>
              <NumberTicker value={Math.round(perMonth)} />
            </div>
            <span className="loss-pill">≈ {roi}× your subscription</span>
          </div>
        </div>
      </div>

      <p className="sub muted">
        Assumes Emma successfully books ~60% of missed calls she picks up, based on your cohort so far. Adjust the sliders to match your reality.
      </p>
    </section>
  );
}

/* ---------- Weekly digest preview (SMS-ish card) ---------- */

function DigestPreview() {
  return (
    <section className="card">
      <header className="sec-h">
        <div>
          <Kicker>Every Monday · 7am</Kicker>
          <h2>Your weekly recap, in one text</h2>
        </div>
        <a className="sec-more" href="#">Sample last month <Arrow /></a>
      </header>

      <div className="phone">
        <div className="phone-in">
          <span className="phone-from">RingBack</span>
          <div className="phone-bubble">
            <b>Kedron Plumbing — last week</b>
            <p>
              Emma answered <b>47 calls</b>. Booked <b>29 jobs</b> (worth ~$18,420) and caught <b>7</b>
              missed-call leads that would&rsquo;ve gone to voicemail. <b>1 warm-transfer</b> escalated to your mobile.
            </p>
            <p className="phone-line">Full breakdown → <span className="phone-link">ringback.au/w/2926</span></p>
          </div>
          <span className="phone-time">Mon 7:00am</span>
        </div>
      </div>

      <p className="sub muted">
        We send this because most owners don&rsquo;t log in during the week. The link opens straight to this dashboard&rsquo;s Value page with the week pre-selected.
      </p>
    </section>
  );
}

/* ============================================================
   THE PAGE
   ============================================================ */

const RANGES = [
  { id: "m3", label: "3 months" },
  { id: "m6", label: "6 months" },
  { id: "m12", label: "12 months" },
] as const;

export function Value() {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("m12");
  const roi = Math.round(TOTAL_MONTH / SUBS_MONTH);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="val-hero">
        <ShaderBackground className="val-hero-bg" uniforms={GREEN_MESH_DEEP} />
        <div className="val-hero-in">
          <Kicker>Recovered revenue · this month so far</Kicker>
          <div className="val-hero-big">
            <span className="val-cur">$</span>
            <NumberTicker value={TOTAL_MONTH} />
          </div>
          <div className="val-hero-side">
            <div>
              <b>{roi}×</b>
              <span>your subscription</span>
            </div>
            <div>
              <b>78</b>
              <span>jobs booked</span>
            </div>
            <div>
              <b>14</b>
              <span>rescued from voicemail</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CHART ---------------- */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Recovered revenue over time</Kicker>
            <h2>Emma&rsquo;s pull, week by week</h2>
          </div>
          <TabPill items={RANGES.map((r) => ({ ...r }))} value={range} onChange={(id) => setRange(id as typeof range)} />
        </header>
        <div className="area-wrap">
          <AreaChart data={WEEKLY[range]} width={860} height={280} />
        </div>
      </section>

      <div className="two">
        <LossCalculator />
        <DigestPreview />
      </div>
    </>
  );
}
