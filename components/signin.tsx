"use client";

import { useState } from "react";
import { PhoneGlyph } from "@/components/site-chrome";
import { NumberTicker } from "@/components/number-ticker";
import { SiriOrb, ORB_PALETTES } from "@/components/dashboard/primitives";

/* ============================================================
   SIGN IN

   The retention insight, applied to the least-loved screen in
   any product: the dominant churn mode for AI receptionists is
   the owner forgetting it's working. A login form is a toll
   gate. So the right half of this page is a standing report of
   what Emma did while they were gone - every single time they
   come back, before they've even typed an email.

   Magic link only. Tradies are on a job site, gloved, one
   handed. Nobody remembers a password out there.
   ============================================================ */

const AWAY = {
  calls: 6,
  booked: 4,
  recovered: 2140,
  since: "Since you were last here · 2 days ago",
  feed: [
    { name: "Sue Murphy", what: "Hot water gone · booked 2:15p today", tag: "Booked" },
    { name: "Marco G", what: "Blocked stormwater · booked Wed 7am", tag: "Booked" },
    { name: "Rachel Byrne", what: "Gas smell · triaged, needs your call", tag: "Urgent" },
    { name: "+61 Unknown", what: "Robocall · filtered before it rang you", tag: "Spam" },
  ],
};

export function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    // Real auth when the install is wired; the demo build answers 503 and we
    // still show the sent state so the walkthrough reads the same either way.
    try {
      await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      /* offline or unconfigured - fall through to the demo state */
    }
    setBusy(false);
    setSent(true);
  };

  return (
    <main className="si">
      {/* ---------------- left: the form ---------------- */}
      <section className="si-form">
        <a className="si-brand" href="/">
          <span className="mk">
            <PhoneGlyph />
          </span>
          RingBack
        </a>

        <div className="si-mid">
          {sent ? (
            <div className="si-sent">
              <span className="si-sent-orb">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                  <path
                    d="M4 6h16v12H4z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m4.5 6.5 7.5 6 7.5-6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h1>Check your phone.</h1>
              <p>
                We&rsquo;ve texted a sign-in link to the mobile on <b>{email}</b>. It works for fifteen
                minutes, once.
              </p>
              <div className="si-sent-act">
                <button className="ez-ghost" onClick={() => setSent(false)}>
                  Use a different address
                </button>
                <a className="ez-ghost" href="/dashboard?tour=0">
                  Walk the demo dashboard
                </a>
              </div>
            </div>
          ) : (
            <>
              <span className="ez-eyebrow">Welcome back</span>
              <h1 className="si-h1">
                Let&rsquo;s see what
                <br />
                <span className="si-em">she got done.</span>
              </h1>
              <p className="si-lede">
                No password. Pop your email in and we&rsquo;ll text you a link that signs you straight in.
              </p>

              <form className="si-field" onSubmit={submit}>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="dave@kedronplumbing.com.au"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address"
                />
                <button type="submit" disabled={busy || !email.trim()}>
                  {busy ? "Sending…" : "Send my link"}
                  <span className="si-field-orb" aria-hidden>
                    <svg viewBox="0 0 24 24" width="12" height="12">
                      <path
                        d="M5 12h14m-6-6 6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </form>

              <p className="si-alt">
                Haven&rsquo;t set her up yet? <a href="/start">Start a free trial</a> - seven days free, card on file.
              </p>
            </>
          )}
        </div>

        <p className="si-legal">
          <a href="/privacy">Privacy</a>
          <span aria-hidden>·</span>
          <a href="/terms">Terms</a>
          <span aria-hidden>·</span>
          <a href="/trust">Trust</a>
        </p>
      </section>

      {/* ---------------- right: what she did while you were gone ---------------- */}
      <aside className="si-away" aria-label="Activity since your last visit">
        <div className="si-away-in">
          <header className="si-away-head">
            <span className="si-away-orb">
              <SiriOrb palette={ORB_PALETTES.emma} size="card" active speaking />
            </span>
            <div>
              <span className="k-kick">{AWAY.since}</span>
              <h2>
                Emma answered <b>{AWAY.calls} calls</b> and booked <b>{AWAY.booked}</b> of them.
              </h2>
            </div>
          </header>

          <div className="si-away-money">
            <span className="k-kick">Recovered while you were on the tools</span>
            <div className="si-away-big">
              <span className="si-away-cur">$</span>
              <NumberTicker value={AWAY.recovered} />
            </div>
          </div>

          <div className="si-away-feed">
            {AWAY.feed.map((f, k) => (
              <div className="si-away-row" key={f.name} style={{ animationDelay: `${180 + k * 90}ms` }}>
                <span className="si-away-av">
                  {f.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <b>{f.name}</b>
                  <span>{f.what}</span>
                </div>
                <span className="si-away-tag" data-t={f.tag.toLowerCase()}>
                  {f.tag}
                </span>
              </div>
            ))}
          </div>

          <p className="si-away-foot">
            All of it waiting inside, with the recordings and transcripts.
          </p>
        </div>
      </aside>
    </main>
  );
}
