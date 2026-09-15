"use client";

import { useEffect, useState } from "react";
import { NumberTicker } from "@/components/number-ticker";
import { SiriOrb, ORB_PALETTES } from "./primitives";

/* ============================================================
   THE CONVERSION SURFACES

   Two moments decide whether this business exists:

   1. TRIAL → PAID. Every competitor runs a red countdown that
      nags ("3 days left! Upgrade!"). That's a fear frame, and it
      reliably underperforms. We invert it: the ribbon is a value
      counter that climbs, and the due date is the small print.
      The upgrade button lives INSIDE the value, so the ask is
      always attached to the proof.

   2. PAID → STILL PAID. The dominant churn mode in this category
      isn't the product failing, it's the owner never noticing it
      worked ("wasn't sure it was doing anything"). So the money
      is loud, permanently, everywhere.
   ============================================================ */

const TRIAL = {
  recovered: 1842,
  daysUsed: 4,
  daysTotal: 7,
  jobs: 3,
  price: 150,
  regular: 299,
  endsOn: "Thursday",
};

/* ============================================================
   TRIAL RIBBON — sits above the top bar for the whole trial
   ============================================================ */

export function TrialRibbon() {
  const [sheet, setSheet] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const multiple = Math.max(1, Math.round(TRIAL.recovered / TRIAL.price));

  if (dismissed) return null;

  return (
    <>
      <aside className="tr" role="status">
        <div className="tr-in">
          <div className="tr-value">
            <span className="tr-orb">
              <SiriOrb palette={ORB_PALETTES.emma} size="chip" active speaking />
            </span>
            <div className="tr-money">
              <b>
                <span className="tr-cur">$</span>
                <NumberTicker value={TRIAL.recovered} />
              </b>
              <span>
                recovered in {TRIAL.daysUsed} days · Emma has paid for herself{" "}
                <em>{multiple}&times; over</em>
              </span>
            </div>
          </div>

          <div className="tr-act">
            <button className="tr-keep" onClick={() => setSheet(true)}>
              <span>Keep her on</span>
              <span className="tr-keep-orb" aria-hidden>
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
            {/* the deadline is deliberately quiet — it is not the argument */}
            <span className="tr-when">
              Trial runs to {TRIAL.endsOn}
              <button className="tr-x" onClick={() => setDismissed(true)} aria-label="Hide for now">
                ✕
              </button>
            </span>
          </div>
        </div>
        <span className="tr-progress" style={{ ["--p" as string]: `${(TRIAL.daysUsed / TRIAL.daysTotal) * 100}%` }} />
      </aside>

      <PaySheet open={sheet} onClose={() => setSheet(false)} />
    </>
  );
}

/* ============================================================
   PAY SHEET — never a separate page. Slides up over whatever
   the owner was already looking at, so the value context stays
   on screen behind it.
   ============================================================ */

export function PaySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [method, setMethod] = useState<"card" | "wallet">("card");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const submit = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setDone(true);
    }, 1400);
  };

  return (
    <div className="ps-wrap" data-open={open || undefined} aria-hidden={!open}>
      <div className="ps-scrim" onClick={onClose} />
      <section className="ps" role="dialog" aria-label="Keep Emma on" aria-modal="true">
        <button className="ps-grip" onClick={onClose} aria-label="Close" />

        {done ? (
          <div className="ps-done">
            <span className="ps-done-tick">
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden>
                <path
                  d="M5 12l5 5L20 7"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h2>She&rsquo;s yours.</h2>
            <p>
              Locked at <b>${TRIAL.price}/mo</b> for three months. Nothing changes on your line — Emma
              just keeps answering.
            </p>
            <button className="ez-cta" onClick={onClose}>
              <span>Back to work</span>
              <span className="ez-cta-orb" aria-hidden>
                <svg viewBox="0 0 24 24" width="13" height="13">
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
          </div>
        ) : (
          <>
            {/* the proof sits at the top of the ask, not after it */}
            <header className="ps-head">
              <span className="ez-eyebrow">Founding rate</span>
              <h2>
                <span className="ps-cur">$</span>
                {TRIAL.price}
                <span className="ps-per">/mo</span>
              </h2>
              <p className="ps-terms">
                Three months at this rate, then ${TRIAL.regular}. Flat — no per-minute billing, no add-ons,
                no surprises on the invoice.
              </p>
              <div className="ps-proof">
                <b>${TRIAL.recovered.toLocaleString()}</b> recovered on trial across <b>{TRIAL.jobs} jobs</b>.
                You&rsquo;re paying <b>${TRIAL.price}</b> for it.
              </div>
            </header>

            <div className="ps-methods">
              <button data-on={method === "wallet" || undefined} onClick={() => setMethod("wallet")}>
                Apple / Google Pay
              </button>
              <button data-on={method === "card" || undefined} onClick={() => setMethod("card")}>
                Card
              </button>
            </div>

            {method === "card" ? (
              <div className="ps-form">
                <label className="ps-field ps-field-wide">
                  <span>Card number</span>
                  <input inputMode="numeric" placeholder="1234 1234 1234 1234" autoComplete="cc-number" />
                </label>
                <label className="ps-field">
                  <span>Expiry</span>
                  <input inputMode="numeric" placeholder="MM / YY" autoComplete="cc-exp" />
                </label>
                <label className="ps-field">
                  <span>CVC</span>
                  <input inputMode="numeric" placeholder="123" autoComplete="cc-csc" />
                </label>
                <label className="ps-field ps-field-wide">
                  <span>Name on card</span>
                  <input placeholder="Dave Kelleher" autoComplete="cc-name" />
                </label>
              </div>
            ) : (
              <div className="ps-wallet">
                <button className="ps-wallet-btn">
                  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden>
                    <path
                      d="M16.4 12.9c0-2.2 1.8-3.3 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8s-1.8-.8-2.9-.8c-1.5 0-2.9.9-3.6 2.2-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.2 2.8 2.2 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1.1 2.7-2.2.5-.8.8-1.6 1-2.4-.1 0-2.3-.9-2.3-3.7ZM14.3 5.8c.6-.7 1-1.7.9-2.8-.9.1-2 .6-2.6 1.3-.6.7-1 1.7-.9 2.7 1 .1 2-.5 2.6-1.2Z"
                      fill="currentColor"
                    />
                  </svg>
                  Pay
                </button>
                <p>One tap. We never see your card details.</p>
              </div>
            )}

            <button className="ps-submit" onClick={submit} disabled={busy}>
              {busy ? "Locking it in…" : `Keep Emma on · $${TRIAL.price}/mo`}
            </button>

            <div className="ps-guard">
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
                <path
                  d="M12 2 4 5v6c0 5 3.5 8 8 9.5 4.5-1.5 8-4.5 8-9.5V5l-8-3Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinejoin="round"
                />
                <path
                  d="m9 12 2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                30-day money back, no questions. Cancel from this screen any time — no phone call, no
                retention offer.
              </span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* ============================================================
   WELCOME — the first-visit band on Today. Not a modal: a modal
   gets dismissed reflexively. This sits in the page and turns
   into a celebration once the owner rings the line.
   ============================================================ */

export function WelcomeBand() {
  const [rung, setRung] = useState(false);
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <section className="wb" data-rung={rung || undefined}>
      <div className="wb-orb">
        <SiriOrb palette={ORB_PALETTES.emma} size="card" active speaking={!rung} />
      </div>
      <div className="wb-body">
        {rung ? (
          <>
            <b>That&rsquo;s exactly what every caller gets.</b>
            <span>
              She&rsquo;ll do that on every real call from now on — and everything she captures lands on
              this page.
            </span>
          </>
        ) : (
          <>
            <b>Emma is live on (07) 3000 4182.</b>
            <span>
              Ring it. She&rsquo;ll answer as Kedron Plumbing, and you&rsquo;ll hear precisely what your
              customers hear before they ever do.
            </span>
          </>
        )}
      </div>
      {!rung ? (
        <a className="wb-ring" href="tel:+61730004182" onClick={() => setRung(true)}>
          <span>Ring her now</span>
          <span className="wb-ring-orb" aria-hidden>
            <svg viewBox="0 0 24 24" width="13" height="13">
              <path
                d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.3c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.1 2.1z"
                fill="currentColor"
              />
            </svg>
          </span>
        </a>
      ) : (
        <button className="wb-close" onClick={() => setClosed(true)}>
          Got it
        </button>
      )}
    </section>
  );
}

/* ============================================================
   TEAM INVITE — small modal. Shows the invitee's-eye view,
   because the hesitation is "will this be weird for my 2IC".
   ============================================================ */

export function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [role, setRole] = useState<"admin" | "viewer">("admin");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const add = () => {
    const v = draft.trim();
    if (v && !emails.includes(v)) setEmails([...emails, v]);
    setDraft("");
  };

  return (
    <div className="ps-wrap im-wrap" data-open={open || undefined} aria-hidden={!open}>
      <div className="ps-scrim" onClick={onClose} />
      <section className="im" role="dialog" aria-label="Invite your team" aria-modal="true">
        {sent ? (
          <div className="ps-done">
            <span className="ps-done-tick">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
                <path
                  d="M5 12l5 5L20 7"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h2>Invites away.</h2>
            <p>
              {emails.length} {emails.length === 1 ? "person" : "people"} will get a link that signs them
              straight in — no password to set up.
            </p>
            <button className="ez-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <header className="im-head">
              <span className="ez-eyebrow">Team access</span>
              <h2>Who else should see the calls?</h2>
              <p>
                Handy for a 2IC or an office manager. They get the same call feed and bookings — billing
                and Emma&rsquo;s rules stay yours alone.
              </p>
            </header>

            <div className="chips">
              {emails.map((e) => (
                <span className="chip" key={e}>
                  {e}
                  <button onClick={() => setEmails(emails.filter((x) => x !== e))} aria-label={`Remove ${e}`}>
                    ×
                  </button>
                </span>
              ))}
              <input
                value={draft}
                onChange={(ev) => setDraft(ev.target.value)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === ",") {
                    ev.preventDefault();
                    add();
                  }
                }}
                onBlur={add}
                placeholder="mick@kedronplumbing.com.au"
                inputMode="email"
              />
            </div>

            <div className="im-roles">
              {(["admin", "viewer"] as const).map((r) => (
                <button key={r} data-on={role === r || undefined} onClick={() => setRole(r)}>
                  <b>{r === "admin" ? "Admin" : "View only"}</b>
                  <span>
                    {r === "admin"
                      ? "Can reschedule jobs and reply to callers"
                      : "Can read calls and bookings, change nothing"}
                  </span>
                </button>
              ))}
            </div>

            {/* the reassurance: show them what the invitee actually receives */}
            <div className="im-preview">
              <span className="k-kick">What they&rsquo;ll get</span>
              <div className="im-preview-card">
                <b>Dave added you to Kedron Plumbing on RingBack.</b>
                <span>One tap signs you in. No password to create.</span>
              </div>
            </div>

            <button className="ps-submit" disabled={!emails.length} onClick={() => setSent(true)}>
              {emails.length
                ? `Send ${emails.length} invite${emails.length === 1 ? "" : "s"}`
                : "Add an email address"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
