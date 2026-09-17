"use client";

import { PhoneGlyph } from "@/components/site-chrome";

/* ============================================================
   LEGAL - designed, not templated.

   These are conversion surfaces, not disclaimers. A tradie
   handing over his business phone line reads these. So: short
   sentences, plain English, and a visible line between what we
   have actually done and what we have merely promised.

   The honesty is the strategy. Every competitor in this
   category claims enterprise-grade everything; the #1 complaint
   in their reviews is being misled. Saying "we don't have SOC 2
   yet" out loud is worth more than a badge nobody checks.
   ============================================================ */

function LegalChrome({
  eyebrow,
  title,
  lede,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: React.ReactNode;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="lg">
      <header className="lg-top">
        <a className="lg-brand" href="/">
          <span className="mk">
            <PhoneGlyph />
          </span>
          RingBack
        </a>
        <nav className="lg-nav">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/trust">Trust</a>
        </nav>
      </header>

      <div className="lg-hero">
        <span className="ez-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="lg-lede">{lede}</p>
        <span className="lg-updated">Last updated {updated}</span>
      </div>

      <article className="lg-body">{children}</article>

      <footer className="lg-foot">
        <p>
          Questions about any of this? <a href="mailto:hello@ringback.au">hello@ringback.au</a> - a person
          reads it.
        </p>
        <span>© {new Date().getFullYear()} RingBack · Brisbane, Australia</span>
      </footer>
    </main>
  );
}

function S({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="lg-s">
      <span className="lg-s-n">{n}</span>
      <div className="lg-s-body">
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
}

/* the plain-English summary card that opens each doc */
function Plain({ items }: { items: string[] }) {
  return (
    <div className="lg-plain">
      <span className="k-kick">The short version</span>
      <ul>
        {items.map((i) => (
          <li key={i}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
              <path
                d="M5 12l5 5L20 7"
                stroke="currentColor"
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   PRIVACY
   ============================================================ */

export function Privacy() {
  return (
    <LegalChrome
      eyebrow="Privacy"
      title="What we know about you, and your callers"
      updated="15 September 2026"
      lede={
        <>
          RingBack answers your business phone. That means we necessarily handle recordings and transcripts
          of real conversations with real customers. Here is exactly what happens to them.
        </>
      }
    >
      <Plain
        items={[
          "We record and transcribe calls to your business line - that's the product.",
          "Callers are told at the start of every call, before they say anything.",
          "We don't sell anything to anyone, ever.",
          "We don't train AI models on your calls.",
          "You can export or delete everything, whenever you want.",
        ]}
      />

      <S n="01" title="What we collect">
        <p>Three kinds of thing:</p>
        <p>
          <b>Your business details.</b> Name, ABN, phone number, address, service area, hours, pricing rules,
          and the rulebook you build during onboarding. You gave us these deliberately.
        </p>
        <p>
          <b>Your callers&rsquo; calls.</b> Audio recording, transcript, phone number, and whatever details
          they give Emma - name, address, what&rsquo;s wrong, when they&rsquo;re free. This is the substance
          of the service.
        </p>
        <p>
          <b>Ordinary product usage.</b> Which pages you open, when you log in, which features you use.
          Standard analytics, used to work out what to build next.
        </p>
      </S>

      <S n="02" title="Recording, and telling people about it">
        <p>
          Every call opens with a disclosure that the caller is speaking to an AI receptionist and that the
          call is recorded. This is on by default and we&rsquo;d strongly counsel against changing it.
        </p>
        <p>
          Australian recording law varies by state, and consent requirements differ depending on where the
          caller is. The default greeting is written to satisfy the strictest of them. You are the one who
          controls that greeting, so if you edit it, the obligation travels with you.
        </p>
      </S>

      <S n="03" title="What we do not do">
        <p>
          <b>We don&rsquo;t sell data.</b> Not to marketers, not to lead brokers, not to anyone.
        </p>
        <p>
          <b>We don&rsquo;t train models on your calls.</b> Your conversations are not used to improve a
          general-purpose AI. They&rsquo;re used to serve you, and to build the regression tests that stop
          Emma repeating a mistake on your own account.
        </p>
        <p>
          <b>We don&rsquo;t read your calls for fun.</b> Engineers access recordings only when you ask us to
          investigate something, or when a system fault demands it. Those accesses are logged.
        </p>
      </S>

      <S n="04" title="Who else touches it">
        <p>
          Running a voice agent means using specialists. Telephony carriage, speech-to-text, the language
          model, text-to-speech, payments, and error monitoring are all provided by third parties under
          contract. Each one gets the minimum it needs to do its job and is barred from using it for
          anything else.
        </p>
        <p className="lg-note">
          We maintain a current list of these sub-processors. Email us and we&rsquo;ll send it - we&rsquo;d
          rather answer honestly than publish a page that goes stale.
        </p>
      </S>

      <S n="05" title="Where it lives, and for how long">
        <p>
          We are an Australian company building for Australian trades, and our intent is that your call data
          is stored in Australia.
        </p>
        <div className="lg-honest">
          <span>Being straight with you</span>
          <p>
            Some of the AI services in the pipeline process audio in other regions. We will publish the exact
            regional breakdown per sub-processor rather than let you assume something that isn&rsquo;t true
            yet. If strict onshore-only processing is a requirement for you, ask us before you sign up.
          </p>
        </div>
        <p>
          Recordings and transcripts are kept while your account is open. Close your account and we delete
          them, along with the rest of your data.
        </p>
      </S>

      <S n="06" title="Your rights">
        <p>
          Under the Privacy Act you may ask what we hold about you, ask us to correct it, and ask us to
          delete it. You can export your calls and bookings from the dashboard yourself at any time, without
          asking.
        </p>
        <p>
          If you think we&rsquo;ve mishandled your information, tell us first - we&rsquo;d like the chance to
          fix it. If we don&rsquo;t resolve it, you can escalate to the Office of the Australian Information
          Commissioner.
        </p>
      </S>
    </LegalChrome>
  );
}

/* ============================================================
   TERMS
   ============================================================ */

export function Terms() {
  return (
    <LegalChrome
      eyebrow="Terms of service"
      title="The deal, in language you can actually read"
      updated="15 September 2026"
      lede={
        <>
          No clause in here is designed to catch you out. If something reads as though it might, tell us and
          we&rsquo;ll rewrite it.
        </>
      }
    >
      <Plain
        items={[
          "Seven days free. Card on file - $150/month starts automatically after, then $299.",
          "Flat pricing. No per-minute charges, no add-ons, no setup fee.",
          "Cancel yourself, from the dashboard, in one click. No phone call.",
          "30-day money back if it isn't working for you.",
          "Emma is software. She will occasionally get something wrong.",
        ]}
      />

      <S n="01" title="What you're buying">
        <p>
          An AI receptionist that answers your business phone, qualifies callers, books jobs into your
          calendar, and follows up on quotes. Plus the dashboard you&rsquo;re reading this from.
        </p>
      </S>

      <S n="02" title="Money">
        <p>
          The trial is seven days. We take your card up front, but you are not charged until day eight - and
          only if you have not cancelled. After the trial, the founding rate is $150 per month for three
          months, then $299 per month. Flat - we do not bill per minute or per call, and there are no
          add-on tiers.
        </p>
        <p>
          You can cancel from the Billing page at any time, effective at the end of your current period.
          There is no cancellation flow designed to talk you out of it. Within your first thirty days of
          paying, ask and we&rsquo;ll refund you in full.
        </p>
      </S>

      <S n="03" title="Your side of it">
        <p>
          You need the authority to redirect the phone number you connect, and to authorise call recording on
          it. The rules you give Emma - pricing, emergencies, service area - are yours, and you&rsquo;re
          responsible for them being lawful and accurate.
        </p>
        <p>
          Don&rsquo;t use RingBack for unsolicited marketing calls. The follow-up playbooks are built with
          Do-Not-Call and SPAM Act guardrails and we will not remove them.
        </p>
      </S>

      <S n="04" title="What Emma will and won't do">
        <p>
          Emma is constrained on purpose. She will not quote a price outside the list you&rsquo;ve approved.
          She discloses that she&rsquo;s AI. She escalates when she&rsquo;s uncertain instead of guessing.
        </p>
        <div className="lg-honest">
          <span>The honest limitation</span>
          <p>
            She is still software talking to strangers, and she will sometimes mishear a suburb, misjudge an
            unusual call, or hand over when she could have handled it. Every failure is recorded and becomes
            a test. But if your business cannot tolerate any error on any call, an AI receptionist -
            ours or anyone&rsquo;s - is the wrong purchase today.
          </p>
        </div>
      </S>

      <S n="05" title="Uptime, and when things break">
        <p>
          We aim for the phone always being answered, and we monitor the voice pipeline continuously. We
          don&rsquo;t offer a contractual uptime guarantee yet, because doing so before we&rsquo;ve earned
          the operating history would be a number we made up.
        </p>
        <p>
          If Emma goes down, calls fail over according to the escalation chain you set in Settings - so the
          worst case is your line behaves the way it did before you met us.
        </p>
      </S>

      <S n="06" title="Liability">
        <p>
          Nothing here excludes the guarantees you have under Australian Consumer Law; they apply regardless
          of what any contract says. Beyond those, our liability is limited to what you&rsquo;ve paid us in
          the previous twelve months.
        </p>
        <p>
          We&rsquo;re not liable for a job you didn&rsquo;t win, a customer who took offence, or a booking
          that went sideways. Emma is a receptionist, not an insurer.
        </p>
      </S>

      <S n="07" title="Ending it">
        <p>
          You can leave whenever you like and take your data with you. We can close an account for non-payment
          or for using the product to break the law, and we&rsquo;ll tell you why. Your call recordings and
          transcripts are exportable right up to the moment of deletion.
        </p>
      </S>
    </LegalChrome>
  );
}

/* ============================================================
   TRUST - the real hero of the three
   ============================================================ */

const HAVE = [
  { t: "AI disclosure on every call", d: "The caller is told before they speak. On by default." },
  { t: "Recording notice in the greeting", d: "Written to satisfy the strictest Australian state." },
  { t: "Hard-coded never-quote", d: "Emma cannot price a job outside your approved list. Not a prompt - a constraint." },
  { t: "Owner approval on rule changes", d: "Pricing, emergency triggers and blocked phrases never change without you ticking." },
  { t: "Encryption in transit and at rest", d: "Standard TLS and encrypted storage across the stack." },
  { t: "Logged internal access", d: "When a human at RingBack opens a recording, it's recorded." },
  { t: "Self-serve export and deletion", d: "From the dashboard, without asking us." },
  { t: "No data sold, no model training", d: "Your conversations don't leave the job of serving you." },
];

const DONT = [
  { t: "SOC 2 Type II", d: "Not started. It takes an audit window we haven't had yet." },
  { t: "ISO 27001", d: "No." },
  { t: "Contractual uptime SLA", d: "Not until we have the operating history to back a number." },
  { t: "Fully onshore AI processing", d: "Some model inference happens offshore today. We'll publish the per-vendor detail rather than imply otherwise." },
  { t: "Penetration test report", d: "Scheduled, not done." },
];

export function Trust() {
  return (
    <LegalChrome
      eyebrow="Trust"
      title="What we've actually done, and what we haven't"
      updated="15 September 2026"
      lede={
        <>
          You&rsquo;re considering handing your business phone line to a company you&rsquo;d never heard of
          last week. The least we can do is not oversell. Two lists: what is genuinely in place, and what
          isn&rsquo;t yet.
        </>
      }
    >
      <div className="lg-cols">
        <section className="lg-col lg-col-have">
          <header>
            <span className="lg-col-tag">In place today</span>
            <h2>What protects you right now</h2>
          </header>
          <ul>
            {HAVE.map((h) => (
              <li key={h.t}>
                <span className="lg-tick">
                  <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
                    <path
                      d="M5 12l5 5L20 7"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <b>{h.t}</b>
                  <span>{h.d}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg-col lg-col-dont">
          <header>
            <span className="lg-col-tag">Not yet</span>
            <h2>What we don&rsquo;t have</h2>
          </header>
          <ul>
            {DONT.map((d) => (
              <li key={d.t}>
                <span className="lg-dash" aria-hidden />
                <div>
                  <b>{d.t}</b>
                  <span>{d.d}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="lg-col-foot">
            If any of these is a hard requirement for your business, we are not the right choice today -
            and we&rsquo;d rather you knew that before you ported a number than after.
          </p>
        </section>
      </div>

      <S n="01" title="The three things that actually go wrong">
        <p>
          Every complaint in this category reduces to one of three failures. Here&rsquo;s what we&rsquo;ve
          built against each.
        </p>
        <div className="lg-fails">
          <div>
            <span className="k-kick">Failure one</span>
            <b>It quoted a price it shouldn&rsquo;t have</b>
            <p>
              You can be held to what your AI tells a customer. So never-quote isn&rsquo;t advice we give the
              model - it&rsquo;s a hard gate. Jobs on your never-quote list get details captured and a quote
              visit booked, full stop.
            </p>
          </div>
          <div>
            <span className="k-kick">Failure two</span>
            <b>It misheard an address or a suburb</b>
            <p>
              Emma reads names and addresses back to the caller before she books anything. When speech
              confidence drops she slows down, then falls back to SMS rather than guessing.
            </p>
          </div>
          <div>
            <span className="k-kick">Failure three</span>
            <b>It missed a real emergency</b>
            <p>
              You define the triggers. When one fires, she runs safety steps, keeps the caller on the line and
              rings your mobile - and she can&rsquo;t book that call as routine instead.
            </p>
          </div>
        </div>
      </S>

      <S n="02" title="Why go-live is gated">
        <p>
          Before Emma answers a single real customer she&rsquo;s run against twelve caller personas, three
          times each - and you have to ring her yourself. We won&rsquo;t skip that last step for you, because
          the whole point is that you&rsquo;ve heard her work before a stranger does.
        </p>
      </S>

      <S n="03" title="Tell us when she gets it wrong">
        <p>
          Every failed call is saved with audio and transcript and becomes a permanent regression test, so the
          same mistake can&rsquo;t quietly come back. If something goes wrong on your line,{" "}
          <a href="mailto:hello@ringback.au">email us</a> - it becomes a test the same day.
        </p>
      </S>
    </LegalChrome>
  );
}
