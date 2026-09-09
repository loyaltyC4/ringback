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
  { who: "them", text: "“Sent you the quote for the rough-in last Tuesday.”" },
  {
    who: "us",
    text: "“Hi Jim — just checking that quote landed. Happy to pencil in a start date if the numbers work?”",
  },
  { who: "them", text: "“Yeah go on then — week after next?”" },
  {
    who: "us",
    text: "“Done. I've held Mon the 22nd, 7am start. Dan will confirm the day before.”",
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
            <span className="g">The fortnight after it is where the money goes.</span>
          </h2>
          <p>
            Answering is table stakes. RingBack keeps working after the phone goes down
            — chasing quotes, rescuing no-shows, and asking for the review you&rsquo;d
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
                Quotes get chased on day three, day seven and day fourteen — in your
                voice, until you say stop.
              </p>
            </div>
          </div>

          <div className="bpanel grey rv">
            <ShaderBackground className="surface" uniforms={GREY_GRAIN} />
            <div className="metric">
              <span className="l">Jobs won from follow-up</span>
              <span className="v">
                1 in <NumberTicker value={4} />
              </span>
              <span className="d">
                of chased quotes convert that would otherwise have gone quiet
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
                Every chase, booking and win-back is tracked against real dollars in
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
  "Trained on your services, pricing and tone from your website",
  "Recognises repeat callers and pulls up their history",
  "Locked to your rules — it never quotes, never over-promises",
  "Every call transcribed and summarised to your phone",
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
                of calls to a trade business go unanswered — and 85% of those callers
                never ring back. They just book the next mob.
              </span>
            </div>
            <div className="splitmedia">
              <video
                ref={vid}
                src="https://pub.hyperagent.com/api/published/pbf01M23D64B3_CGF0FCR45VN0Q67M/under-sink.mp4"
                muted
                loop
                playsInline
                autoPlay
                preload="none"
                aria-label="A plumber working under a sink with both hands, phone ringing on the floor"
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
              <span className="g">with your hands full.</span>
            </h3>
            <p>
              Nobody&rsquo;s bad at their job because they missed a call. They were
              under a sink, on a roof, or elbow-deep in a switchboard. RingBack picks it
              up so the work keeps coming.
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
    tab: "Missed call",
    head: "Rings back the ones that hung up.",
    body: "If a caller drops before the conversation gets anywhere, RingBack texts them inside sixty seconds and offers to book — before they scroll to the next name.",
    cards: [
      { label: "Text sent", value: "within 60s", sub: "While they're still looking" },
      { label: "Reply rate", value: "38%", sub: "Of dropped callers respond" },
      { label: "Outcome", value: "Booked or binned", sub: "No lead left in limbo" },
    ],
  },
  {
    tab: "Quote sent",
    head: "Chases the quote three times, politely.",
    body: "Day three, day seven, day fourteen — then it stops. Each message references the actual job, not a generic nudge, and offers to hold a start date.",
    cards: [
      { label: "Cadence", value: "3 · 7 · 14 days", sub: "Then it leaves them alone" },
      { label: "Converted", value: "1 in 4", sub: "Quotes that had gone quiet" },
      { label: "Average job", value: "$780", sub: "Typical missed trade job, AU" },
    ],
  },
  {
    tab: "No-show",
    head: "Rescues the no-show same day.",
    body: "When nobody's home or the job falls through, it doesn't just sit in your calendar as a hole. It reaches the customer, finds out what happened, and rebooks.",
    cards: [
      { label: "Reached", value: "Same day", sub: "Before the slot is wasted" },
      { label: "Rebooked", value: "2 in 3", sub: "No-shows put back on the books" },
      { label: "Gap filled", value: "Offered out", sub: "To the next job on the waitlist" },
    ],
  },
  {
    tab: "Review",
    head: "Asks for the review while they're still happy.",
    body: "Two hours after you mark the job done — the window where people actually leave five stars. It only asks customers whose job went cleanly.",
    cards: [
      { label: "Timing", value: "+2 hours", sub: "After you close the job" },
      { label: "Filtered", value: "Clean jobs only", sub: "Complaints route to you instead" },
      { label: "Lands on", value: "Google", sub: "Straight to your business profile" },
    ],
  },
  {
    tab: "Win-back",
    head: "Wakes up the customers who went quiet.",
    body: "Annual service due, filter overdue, that repair you flagged as “keep an eye on it”. RingBack works your existing customer list instead of buying new leads.",
    cards: [
      { label: "Triggers on", value: "Service due", sub: "From the last job's notes" },
      { label: "Source", value: "Your own list", sub: "Cheaper than any lead you buy" },
      { label: "Cadence", value: "Once, then out", sub: "Never pesters your customers" },
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
            Switch on the ones that fit how you work. Each runs on its own timing, in
            your voice, and stops the moment the customer replies or you tell it to.
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
                  <a className="btn btn-line" href="tel:+61340135000">
                    <span>Hear it on the demo line</span>
                    <span className="tic">✆</span>
                  </a>
                </div>
                <div className="tp-media">
                  <div className="tp-canvas">
                    {/* only the visible pane gets a WebGL context — five live
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
            RingBack is taking its first five founding operators. There&rsquo;s no wall
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
                It&rsquo;s a live agent for a fictional Brisbane plumber, answering
                24/7. Try to trip it up — ask for a price, describe an emergency, talk
                over the top of it. That&rsquo;s the fastest honest test there is.
              </p>
              <a className="go" href="tel:+61340135000">
                +61 3 4013 5000 <Arrow />
              </a>
            </div>
          </div>
          <div className="pcard rv">
            <div className="in">
              <span className="num">02</span>
              <h3>Look through the dashboard.</h3>
              <p>
                The full operator view — calls, transcripts, bookings, recovered
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
   commitment. No certification language — RingBack holds none, and the
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
    title: "Your calls stay in Australia",
    text: "Call audio, transcripts and customer details are stored on Australian infrastructure. Nothing is shipped offshore to sit at rest.",
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
    text: "On by default, because recording law differs from state to state. You can switch recording off entirely and keep transcripts only.",
  },
  {
    icon: <IcNoTrain />,
    title: "Your calls are not training data",
    text: "Nothing said on your line is used to train or fine-tune a model — not ours, not a vendor's.",
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
            <a className="btn btn-line" href="tel:+61340135000">
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
              RingBack is a small Australian operation, not an enterprise vendor with
              a compliance department. We hold no SOC 2 report and no ISO 27001
              certificate, and we&rsquo;re not going to pretend otherwise with a badge
              on a landing page. If your insurer or a strata client needs that on
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
  "Your own AU number, or forward your existing one",
  "Caller memory, calendar booking, SMS confirmations",
  "All five follow-up playbooks included",
  "ServiceM8 / simPRO / Tradify hand-off",
  "Call minutes included up to 300/month",
  "I tune the script with you in week one",
];

const COMPARE = [
  { label: "Full-time receptionist, loaded", value: "$6,500/mo" },
  { label: "Part-time office admin", value: "$2,900/mo" },
  { label: "Traditional answering service", value: "$400–900/mo" },
  { label: "RingBack, founding rate", value: "$150/mo", win: true },
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
            Start with a 7-day free trial — no credit card. Cancel any time, keep your
            number.
          </p>
        </div>
        <div className="price">
          <div className="plan rv">
            <div className="in">
              <span className="tag">Founding · 5 spots</span>
              <h3>Founding operator</h3>
              <div className="amt">
                <b>$150</b>
                <em>/month for the first 3 months</em>
              </div>
              <div className="setupline">
                <span>Setup &amp; build</span>
                <s>$1,200</s>
                <b>$0 today</b>
              </div>
              <p className="sub">Then $299/month. 30-day money-back guarantee.</p>
              <ul>
                {PLAN_FEATURES.map((f) => (
                  <li key={f}>
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              <a className="btn btn-fill" href="tel:+61340135000">
                <span>Ring it, then decide</span>
                <span className="tic">✆</span>
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
              One recovered job a month covers it <b>five times over</b>. The average
              missed trade job in Australia is worth about $780.
            </div>
            <p className="fineprint">
              Receptionist figure based on Jobs and Skills Australia median full-time
              earnings (~$5,326/month gross) plus super, leave loading and workers&rsquo;
              comp. Minutes beyond the included 300 are billed at cost.
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
    q: "Will callers know it's AI?",
    a: "Most don't ask. It answers with your business name, speaks in plain Australian English and doesn't pretend to be a specific person. If someone asks directly, it tells them it's the automated booking line and offers to put them through to you.",
  },
  {
    q: "What happens when it can't help?",
    a: "It stops trying. Anything outside its rules gets a warm hand-off to your mobile with the caller's name, number and problem already captured — or a callback booked in if you're unreachable.",
  },
  {
    q: "Can it promise a price?",
    a: "No — and that's deliberate. It's locked out of quoting, discounting and committing to scope. It gathers the job details and books the visit. You keep every pricing conversation.",
  },
  {
    q: "Won't the follow-ups annoy my customers?",
    a: "They're capped and they stop on reply. A quote gets three messages across a fortnight and then nothing. Win-backs go once. Review requests only go to customers whose job went cleanly — anyone unhappy routes to you instead. You can switch any playbook off, and every message is in your voice, referencing the actual job.",
  },
  {
    q: "Does it work with my job software?",
    a: "Jobs push into ServiceM8, simPRO and Tradify. Run something else? Mention it on the setup call and I'll confirm before you pay anything.",
  },
  {
    q: "How quickly can we launch?",
    a: "Inside 48 hours. Setup call, I build the flow for your trade and suburb, you call it and pick it apart, then we point your number at it.",
  },
  {
    q: "What if I hate it?",
    a: "Cancel and we unpoint the number the same day. No lock-in, no exit fee. You were a founding customer, not a hostage.",
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
            <h2>Let the next call become the next job.</h2>
            <p>
              Ring the demo line and hear exactly what your customers would hear. No
              form, no sales call — just pick up your phone.
            </p>
            <div className="row">
              <a className="btn btn-fill" href="tel:+61340135000">
                <span>Ring it and listen</span>
                <span className="tic">✆</span>
              </a>
              <a className="btn btn-onnight" href="/dashboard">
                <span>See the dashboard</span>
                <span className="tic">↗</span>
              </a>
            </div>
            <p className="fine">+61 3 4013 5000 · answers 24/7 · no credit card</p>
          </div>
        </div>
      </div>
    </section>
  );
}
