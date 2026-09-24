"use client";

import { useEffect, useRef, useState } from "react";
import { ShaderBackground } from "@/components/shader-background";
import { GREEN_MESH, GREEN_MESH_DEEP, GREY_GRAIN } from "@/lib/shaders";
import { NumberTicker } from "@/components/number-ticker";
import { Arrow, Check, useLoopVideo } from "@/components/site-chrome";

/* ============================================================
   GRAINY BENTO PAIR
   ============================================================ */

const THREAD = [
  { who: "them", text: "“Hi - we enquired about a family room for the long weekend.”" },
  {
    who: "us",
    text: "“Hi Sarah - yes, the Family Suite is free. Two adults and two kids, R2,900 a night incl. breakfast?”",
  },
  { who: "them", text: "“Perfect - can you hold it while I check flights?”" },
  {
    who: "us",
    text: "“Done. I've held it for 24 hours and WhatsApped you the deposit link.”",
  },
] as const;

export function Bento() {
  return (
    <section className="sec tight">
      <div className="wrap">
        <div className="shead rv">
          <span className="kick">
            <span className="bar" />
            The part nobody else does
          </span>
          <h2>
            The call was the easy bit.{" "}
            <span className="g">The days after it are where the booking is won.</span>
          </h2>
          <p>
            Answering is table stakes. StaysAfrica keeps working after the phone goes down
            - chasing enquiries, filling cancellations, and asking for the review you&rsquo;d
            never get round to.
          </p>
        </div>

        <div className="bento">
          <div className="bpanel green rv">
            <ShaderBackground className="surface" uniforms={GREEN_MESH} />
            <div className="thread">
              {THREAD.map((t, i) => (
                <div className={`tbub ${t.who}`} key={i}>
                  {t.text}
                </div>
              ))}
              <div className="tavatar">EM</div>
            </div>
            <div className="foot">
              <span className="l">Follow-ups</span>
              <p>
                Enquiries get chased on day one, day two and day four - in your
                voice, until they book or say stop.
              </p>
            </div>
          </div>

          <div className="bpanel grey rv">
            <ShaderBackground className="surface" uniforms={GREY_GRAIN} />
            <div className="metric">
              <span className="l">Bookings won from follow-up</span>
              <span className="v">
                1 in <NumberTicker value={4} />
              </span>
              <span className="d">
                of chased enquiries convert that would otherwise have booked elsewhere
              </span>
              <svg
                className="spark"
                viewBox="0 0 300 56"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M0,46 C40,42 62,38 92,34 C124,30 148,26 182,19 C214,13 246,10 300,5"
                  fill="none"
                  stroke="#14532d"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M0,50 C46,49 74,50 108,48 C146,46 176,47 210,45 C248,43 272,44 300,42"
                  fill="none"
                  stroke="#8d877b"
                  strokeWidth="1.6"
                  strokeDasharray="3 4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="foot">
              <span className="l">Recovered revenue</span>
              <p>
                Every chase, booking and win-back is tracked against real rand in
                your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   THE 62% SPLIT
   ============================================================ */

const CHECKS = [
  "Trained on your rooms, rates and house rules from your website",
  "Recognises returning guests and pulls up their history",
  "Locked to your rules - it never discounts, never over-promises",
  "Every call transcribed and summarised to your WhatsApp",
];

export function StatSplit() {
  const vid = useLoopVideo();

  return (
    <section className="sec">
      <div className="wrap">
        <div className="split rv">
          <div className="vis">
            <div className="bigfig">
              <NumberTicker value={62} />%
              <span className="sub">
                of callers won't leave a voicemail - and 85% of missed callers
                never ring back. They just book the next lodge on Booking.com.
              </span>
            </div>
            <div className="splitmedia">
              <img
                src="https://hyperagent.com/api/files/usergenerated/threads/cmufjzk280fbs06ad76ocdjtu/images/7ffba585-b6eb-4cf0-baab-17bfcdcc504e.png"
                alt="An empty lodge reception desk at night, the phone glowing as it rings unanswered"
              />
            </div>
          </div>
          <div className="body">
            <span className="kick">
              <span className="bar" />
              Why calls get missed
            </span>
            <h3>
              You can&rsquo;t answer the phone{" "}
              <span className="g">when you&rsquo;re looking after guests.</span>
            </h3>
            <p>
              Nobody loses a booking because they&rsquo;re bad at hospitality. They were
              mid-check-in, on a game drive, or elbow-deep in breakfast service. StaysAfrica
              picks it up so the bookings keep coming.
            </p>
            <ul className="checklist">
              {CHECKS.map((c) => (
                <li key={c}>
                  <Check />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FOLLOW-UP PLAYBOOK TABS
   ============================================================ */

type Play = {
  tab: string;
  head: string;
  body: string;
  cards: { label: string; value: string; sub: string }[];
};

const PLAYS: Play[] = [
  {
    tab: "After-hours call",
    head: "Answers the 9pm booking call.",
    body: "The call that comes in when you're finally sitting down. StaysAfrica picks up in two seconds, checks live availability, takes the booking and sends the deposit link - before they scroll to the next lodge.",
    cards: [
      { label: "Answered", value: "in 1.8s", sub: "While they're still deciding" },
      { label: "Of callers", value: "62%", sub: "Won't leave a voicemail" },
      { label: "Outcome", value: "Booked or waitlisted", sub: "No enquiry left in limbo" },
    ],
  },
  {
    tab: "Enquiry chase",
    head: "Chases the enquiry three times, politely.",
    body: "Day one, day two, day four - then it stops. Each message references the actual room and dates, not a generic nudge, and offers to hold the room.",
    cards: [
      { label: "Cadence", value: "1 · 2 · 4 days", sub: "Then it leaves them alone" },
      { label: "Converted", value: "1 in 4", sub: "Enquiries that had gone quiet" },
      { label: "Average booking", value: "R3,400", sub: "Typical two-night stay, SA" },
    ],
  },
  {
    tab: "Cancellation",
    head: "Fills the cancellation the same day.",
    body: "When a guest cancels on Thursday, the room doesn't just sit empty for the weekend. It works the waitlist, offers the gap, and rebooks it before Friday.",
    cards: [
      { label: "Offered out", value: "Same day", sub: "Before the weekend is lost" },
      { label: "Rebooked", value: "2 in 3", sub: "Cancellations put back on the books" },
      { label: "Source", value: "Your waitlist", sub: "Guests who already wanted to stay" },
    ],
  },
  {
    tab: "Review",
    head: "Asks for the review at checkout.",
    body: "Two hours after checkout - the window where guests actually leave five stars. It only asks guests whose stay went cleanly.",
    cards: [
      { label: "Timing", value: "+2 hours", sub: "After checkout" },
      { label: "Filtered", value: "Happy guests only", sub: "Complaints route to you instead" },
      { label: "Lands on", value: "Google", sub: "Straight to your business profile" },
    ],
  },
  {
    tab: "Win-back",
    head: "Brings back last year's guests.",
    body: "The whales are back in Hermanus, the proteas are out, their anniversary is in October. StaysAfrica works your existing guest list instead of paying Booking.com 18% to reach them again.",
    cards: [
      { label: "Triggers on", value: "Season & dates", sub: "From the last stay's notes" },
      { label: "Source", value: "Your own list", sub: "Guests who already love you" },
      { label: "Cadence", value: "Once, then out", sub: "Never pesters your guests" },
    ],
  },
];

export function FollowUpTabs() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setI((v) => (v + 1) % PLAYS.length), 6200);
    return () => window.clearTimeout(t);
  }, [i, paused, inView]);

  return (
    <section className="sec tight" id="followups">
      <div className="wrap">
        <div className="shead rv">
          <span className="kick">
            <span className="bar" />
            Follow-up playbooks
          </span>
          <h2>Five follow-ups that pay for themselves.</h2>
          <p>
            Switch on the ones that fit how you run your place. Each runs on its own timing, in
            your voice, and stops the moment the guest replies or you tell it to.
          </p>
        </div>

        <div
          className="tabs rv"
          ref={rootRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
        >
          <div className="tabnav" role="tablist">
            {PLAYS.map((p, k) => (
              <button
                className="tab"
                key={p.tab}
                role="tab"
                aria-selected={k === i}
                data-on={k === i || undefined}
                onClick={() => {
                  setI(k);
                  setPaused(true);
                }}
              >
                <span className="d" />
                {p.tab}
              </button>
            ))}
          </div>

          <div className="tabbody">
            {PLAYS.map((p, k) => (
              <div className="tpane" key={p.tab} data-on={k === i || undefined}>
                <div className="tp-copy">
                  <h3>{p.head}</h3>
                  <p>{p.body}</p>
                  <a className="btn btn-line" href="tel:+61242636501">
                    <span>Hear it on the demo line</span>
                    <span className="tic">✆</span>
                  </a>
                </div>
                <div className="tp-media">
                  <div className="tp-canvas">
                    {/* only the visible pane gets a WebGL context - five live
                        canvases here pushed the page to 11 contexts, close to
                        the per-page ceiling browsers enforce */}
                    {k === i && (
                      <ShaderBackground className="surface" uniforms={GREY_GRAIN} />
                    )}
                    <div className="tp-cards">
                      {p.cards.map((c) => (
                        <div className="mcard" key={c.label}>
                          <span className="l">
                            <i className="tick" />
                            {c.label}
                          </span>
                          <span className="v">{c.value}</span>
                          <span className="s">{c.sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   HONEST PROOF
   ============================================================ */

export function Proof() {
  return (
    <section className="sec tight">
      <div className="wrap">
        <div className="shead rv">
          <span className="kick">
            <span className="bar" />
            Don&rsquo;t take our word for it
          </span>
          <h2>
            We&rsquo;re new. <span className="g">So judge it, don&rsquo;t trust it.</span>
          </h2>
          <p>
            StaysAfrica is taking its first five founding properties. There&rsquo;s no wall
            of five-star quotes here yet, because inventing them would be the fastest
            way to lose you. Test it yourself instead.
          </p>
        </div>
        <div className="proof">
          <div className="pcard rv">
            <div className="in">
              <span className="num">01</span>
              <h3>Ring the demo line right now.</h3>
              <p>
                It&rsquo;s a live agent for a fictional Franschhoek guest house, answering
                24/7. Try to trip it up - ask about rates, push for a discount, describe a
                tricky dietary requirement, talk over the top of it. That&rsquo;s the fastest honest test there is.
              </p>
              <a className="go" href="tel:+61242636501">
                +61 2 4263 6501 <Arrow />
              </a>
            </div>
          </div>
          <div className="pcard rv">
            <div className="in">
              <span className="num">02</span>
              <h3>Look through the dashboard.</h3>
              <p>
                The full operator view - calls, transcripts, bookings, recovered
                revenue, follow-up performance. Populated with demo data so you can see
                exactly what you&rsquo;d be looking at on a Tuesday morning.
              </p>
              <a className="go" href="/dashboard">
                Open the demo dashboard <Arrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECURITY & PRIVACY

   Every claim here is either an architectural fact or an explicit
   commitment. No certification language - StaysAfrica holds none, and the
   closing note says so rather than implying otherwise.
   ============================================================ */

function IcPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IcLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="10.5" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IcSpeak() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 12a8 8 0 1 1 16 0v5a3 3 0 0 1-3 3h-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="3" y="11" width="3.4" height="6" rx="1.7" stroke="currentColor" strokeWidth="1.6" />
      <rect x="17.6" y="11" width="3.4" height="6" rx="1.7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IcDot() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
    </svg>
  );
}
function IcNoTrain() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 17.5 17.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IcExport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 15.5V4m0 0L8 8m4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IcScale() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4v16M6 8h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 8 3.5 14h5L6 8Zm12 0-2.5 6h5L18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const SECURITY = [
  {
    icon: <IcPin />,
    title: "Your calls stay in South Africa",
    text: "Call audio, transcripts and guest details are stored on South African infrastructure, POPIA-compliant. Nothing is shipped offshore to sit at rest.",
  },
  {
    icon: <IcLock />,
    title: "Encrypted in transit and at rest",
    text: "Every call leg and every request runs over TLS. Stored audio and transcripts are encrypted on disk.",
  },
  {
    icon: <IcSpeak />,
    title: "It never pretends to be a person",
    text: "It answers as your business, not as a named human. Ask it directly whether it's a machine and it says so, then offers to put you through.",
  },
  {
    icon: <IcDot />,
    title: "A recording notice on every call",
    text: "On by default, as POPIA and SA recording law require. You can switch recording off entirely and keep transcripts only.",
  },
  {
    icon: <IcNoTrain />,
    title: "Your calls are not training data",
    text: "Nothing said on your line is used to train or fine-tune a model - not ours, not a vendor's.",
  },
  {
    icon: <IcExport />,
    title: "Yours to export or erase",
    text: "Pull every transcript out whenever you want. Cancel and the lot is deleted within 30 days, number released the same day.",
  },
];

export function Security() {
  return (
    <section className="sec tight" id="security">
      <div className="wrap">
        <div className="shead rv" style={{ maxWidth: "none" }}>
          <span className="kick">
            <span className="bar" />
            Security &amp; privacy
          </span>
        </div>
        <div className="secgrid rv">
          <div className="sg-copy">
            <h2>
              It answers your phone.{" "}
              <span className="g">That earns you straight answers.</span>
            </h2>
            <p>
              You&rsquo;re handing us the first conversation every new customer has
              with your business. Here&rsquo;s exactly what happens to it.
            </p>
            <a className="btn btn-line" href="tel:+61242636501">
              <span>Ask me anything on the setup call</span>
              <span className="tic">✆</span>
            </a>
          </div>

          <div className="sg-list">
            {SECURITY.map((r) => (
              <div className="sgrow" key={r.title}>
                <span className="sg-ic">{r.icon}</span>
                <div>
                  <b>{r.title}</b>
                  <span className="t">{r.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sg-note rv">
          <span className="sg-ic">
            <IcScale />
          </span>
          <div>
            <b>What we don&rsquo;t have, so you don&rsquo;t have to ask</b>
            <p>
              StaysAfrica is a small South African operation, not an enterprise vendor with
              a compliance department. We hold no SOC 2 report and no ISO 27001
              certificate, and we&rsquo;re not going to pretend otherwise with a badge
              on a landing page. If your insurer or a hotel group needs that on
              paper, raise it on the setup call and I&rsquo;ll tell you honestly
              whether we&rsquo;re the right fit yet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PRICING
   ============================================================ */

const PLAN_FEATURES = [
  "Built and launched for you inside 48 hours",
  "Your own SA number, or forward your existing one",
  "Caller memory, live availability, WhatsApp confirmations",
  "All five follow-up playbooks included",
  "Nightsbridge / RoomRaccoon / Semper hand-off",
  "Call minutes included up to 300/month",
  "I tune the script with you in week one",
];

const COMPARE = [
  { label: "Full-time front desk, loaded", value: "R25,000/mo" },
  { label: "Part-time night & weekend cover", value: "R8,000/mo" },
  { label: "Booking.com commission on R30k of bookings", value: "R5,400/mo" },
  { label: "StaysAfrica, founding rate", value: "R299/mo", win: true },
];

export function Pricing() {
  return (
    <section className="sec tight" id="pricing">
      <div className="wrap">
        <div className="shead rv">
          <span className="kick">
            <span className="bar" />
            Pricing
          </span>
          <h2>
            Simple pricing. <span className="g">No lock-in.</span>
          </h2>
          <p>
            Start with a 7-day free trial. Card on file, first charge on day 8 - cancel
            any time before that and pay nothing. Prices in rand, VAT included.
          </p>
        </div>
        <div className="price">
          <div className="plan rv">
            <div className="in">
              <span className="tag">Founding · 5 spots</span>
              <h3>Founding property</h3>
              <div className="amt">
                <b>R299</b>
                <em>/month for the first 3 months</em>
              </div>
              <div className="setupline">
                <span>Setup &amp; build</span>
                <s>R4,500</s>
                <b>R0 today</b>
              </div>
              <p className="sub">Then R1,500/month. 30-day money-back guarantee.</p>
              <ul>
                {PLAN_FEATURES.map((f) => (
                  <li key={f}>
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              <a className="btn btn-fill" href="/start">
                <span>Start free trial</span>
                <span className="tic">↗</span>
              </a>
            </div>
          </div>
          <div className="cmp rv">
            <span className="kick">
              <span className="bar" />
              What answering costs you now
            </span>
            <div style={{ marginTop: 22 }}>
              {COMPARE.map((c) => (
                <div className={`crow${c.win ? " win" : ""}`} key={c.label}>
                  <span>{c.label}</span>
                  <b>{c.value}</b>
                </div>
              ))}
            </div>
            <div className="saveline">
              One recovered weekend booking covers it <b>ten times over</b>. The average
              two-night guest house stay in the Winelands is worth about R3,400.
            </div>
            <p className="fineprint">
              Front-desk figure based on typical SA hospitality wages plus UIF, leave and
              provident contributions. Commission figure based on Booking.com&rsquo;s
              standard 18% partner rate. Minutes beyond the included 300 are billed at cost.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FAQ
   ============================================================ */

const FAQS = [
  {
    q: "Will guests know it's AI?",
    a: "Most don't ask. It answers with your property's name, speaks in plain South African English (and Afrikaans), and doesn't pretend to be a specific person. If someone asks directly, it tells them it's the automated booking line and offers to put them through to you.",
  },
  {
    q: "What happens when it can't help?",
    a: "It stops trying. Anything outside its rules - a wedding block booking, a complaint, a strange request - gets a warm hand-off to your phone with the caller's name, number and what they need already captured. Or a callback booked in if you're unreachable.",
  },
  {
    q: "Can it promise a rate or a discount?",
    a: "No - and that's deliberate. It's locked out of discounting, upgrading and committing to anything outside your rate card and house rules. It quotes your published rates and books the room. You keep every negotiation.",
  },
  {
    q: "Won't the follow-ups annoy my guests?",
    a: "They're capped and they stop on reply. An enquiry gets three messages across four days and then nothing. Win-backs go once. Review requests only go to guests whose stay went cleanly - anyone unhappy routes to you instead. You can switch any playbook off, and every message is in your voice, referencing the actual room and dates.",
  },
  {
    q: "Does it work with my booking system?",
    a: "Bookings push into Nightsbridge, RoomRaccoon and Semper, and it reads live availability from them. Run something else - even a paper book? Mention it on the setup call and I'll confirm before you pay anything.",
  },
  {
    q: "How quickly can we launch?",
    a: "Inside 48 hours. Setup call, I build the flow for your property and your town, you call it and pick it apart, then we point your number at it.",
  },
  {
    q: "What if I hate it?",
    a: "Cancel and we unpoint the number the same day. No lock-in, no exit fee. You were a founding property, not a hostage.",
  },
];

export function Faq() {
  return (
    <section className="sec tight" id="faq">
      <div className="wrap">
        <div className="shead rv">
          <span className="kick">
            <span className="bar" />
            FAQ
          </span>
          <h2>Straight answers before you switch it on.</h2>
        </div>
        <div className="faq rv">
          {FAQS.map((f) => (
            <details className="q" key={f.q}>
              <summary>
                {f.q}
                <span className="pm" aria-hidden />
              </summary>
              <div className="a">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FINAL CTA
   ============================================================ */

export function FinalCta() {
  return (
    <section className="sec tight">
      <div className="wrap">
        <div className="final rv">
          <ShaderBackground className="surface" uniforms={GREEN_MESH_DEEP} />
          <div className="fc">
            <h2>Let the next call become the next booking.</h2>
            <p>
              Ring the demo line and hear exactly what your guests would hear. No
              form, no sales call - just pick up your phone.
            </p>
            <div className="row">
              <a className="btn btn-fill" href="/start">
                <span>Start free trial</span>
                <span className="tic">↗</span>
              </a>
              <a className="btn btn-onnight" href="tel:+61242636501">
                <span>Or ring it first</span>
                <span className="tic">✆</span>
              </a>
            </div>
            <p className="fine">Demo line · answers 24/7 · no credit card</p>
          </div>
        </div>
      </div>
    </section>
  );
}
