"use client";

import { NumberTicker } from "@/components/number-ticker";
import { ShaderBackground } from "@/components/shader-background";
import { GREEN_MESH_DEEP } from "@/lib/shaders";
import { Arrow } from "@/components/site-chrome";
import { Kicker } from "./primitives";

/* ============================================================
   BILLING — plan · usage · invoices

   Deliberately boring in structure but honest about the math.
   Left column: plan card + payment method + upgrade prompt.
   Right column: this-cycle usage bar and invoice history.
   ============================================================ */

const PLAN = {
  name: "Founding rate",
  price: 150,
  regular: 299,
  cycle: "monthly",
  renews: "2 October 2026",
  monthsLeft: 2,
};

const USAGE = {
  minutes: { used: 348, cap: 500, label: "Answered minutes" },
  outbound: { used: 142, cap: 400, label: "Follow-up messages" },
  numbers: { used: 1, cap: 2, label: "Australian numbers" },
};

const INVOICES = [
  { id: "INV-2026-09", date: "2 Sept 2026", amount: 150, status: "Paid" },
  { id: "INV-2026-08", date: "2 Aug 2026", amount: 150, status: "Paid" },
  { id: "INV-2026-07", date: "2 Jul 2026", amount: 150, status: "Paid" },
];

function UsageBar({ used, cap, label }: { used: number; cap: number; label: string }) {
  const pct = Math.min(100, Math.round((used / cap) * 100));
  const near = pct >= 85;
  return (
    <div className="usage">
      <div className="usage-top">
        <span>{label}</span>
        <b>
          {used.toLocaleString()}
          <span className="usage-of"> / {cap.toLocaleString()}</span>
        </b>
      </div>
      <div className="usage-bar" data-near={near || undefined}>
        <div className="usage-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="usage-note">
        {near ? `Only ${(cap - used).toLocaleString()} left this cycle · consider a bump` : `${(cap - used).toLocaleString()} left this cycle`}
      </span>
    </div>
  );
}

export function Billing() {
  return (
    <>
      <header className="page-h">
        <div>
          <Kicker>Plan · usage · invoices</Kicker>
          <h1 className="page-title">Billing</h1>
        </div>
      </header>

      {/* ---------- Plan hero ---------- */}
      <section className="bill-hero">
        <ShaderBackground className="bill-hero-bg" uniforms={GREEN_MESH_DEEP} />
        <div className="bill-hero-in">
          <div>
            <span className="bill-badge">Founding rate · {PLAN.monthsLeft} months remaining</span>
            <h2>
              <span className="bill-cur">$</span>
              <NumberTicker value={PLAN.price} />
              <span className="bill-per">/mo</span>
            </h2>
            <p>
              You&rsquo;re on the founding rate — locked in until {PLAN.renews}. Your reversion price after that is
              ${PLAN.regular}/mo. No add-ons, no metering surprises, no per-minute charges.
            </p>
          </div>
          <div className="bill-actions">
            <button className="cd-btn cd-primary">Manage plan</button>
            <button className="cd-btn bill-cd-btn-ghost">Cancel subscription</button>
          </div>
        </div>
      </section>

      <div className="two">
        {/* ---------- Usage ---------- */}
        <section className="card">
          <header className="sec-h">
            <div>
              <Kicker>This cycle · renews {PLAN.renews}</Kicker>
              <h2>Usage, in plain numbers</h2>
            </div>
          </header>
          <div className="usage-list">
            <UsageBar {...USAGE.minutes} />
            <UsageBar {...USAGE.outbound} />
            <UsageBar {...USAGE.numbers} />
          </div>
          <p className="sub muted">
            You&rsquo;ll get a heads-up email at 80% of any cap. Overages don&rsquo;t bill silently — they pause the
            offending capability and ask you if you want to top up.
          </p>
        </section>

        {/* ---------- Payment method ---------- */}
        <section className="card">
          <header className="sec-h">
            <div>
              <Kicker>Payment method</Kicker>
              <h2>How we bill you</h2>
            </div>
            <button className="cd-btn">Update</button>
          </header>
          <div className="pm-row">
            <div className="pm-card">
              <span>VISA</span>
              <b>•••• 4419</b>
            </div>
            <div className="pm-body">
              <b>Kedron Plumbing Pty Ltd</b>
              <span>Expires 06 / 28 · $150 debited on the 2nd of every month</span>
            </div>
          </div>
          <div className="pm-guarantee">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <path d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
              <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>30-day money-back guarantee · we don&rsquo;t play games with cancellations</span>
          </div>
        </section>
      </div>

      {/* ---------- Invoices ---------- */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Invoices</Kicker>
            <h2>Everything you&rsquo;ve been billed</h2>
          </div>
          <a className="sec-more" href="#">Download all as CSV <Arrow /></a>
        </header>
        <div className="inv-list">
          <div className="inv-head">
            <span>Invoice</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
            <span />
          </div>
          {INVOICES.map((v) => (
            <div className="inv-row" key={v.id}>
              <b>{v.id}</b>
              <span>{v.date}</span>
              <b className="inv-amt">${v.amount.toFixed(2)}</b>
              <span className="cf-badge" data-d="booked">{v.status}</span>
              <a href="#" className="inv-dl">Download PDF ↓</a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
