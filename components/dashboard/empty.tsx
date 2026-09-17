"use client";

import { useSearchParams } from "next/navigation";
import { Kicker } from "./primitives";
import { SiriOrb, ORB_PALETTES } from "./primitives";

/* ============================================================
   DAY ONE - the empty states

   The research is unambiguous: ~80% of new users abandon in the
   first week when the zero state is a blank screen, and the
   empty state is the most under-engineered conversion surface in
   SaaS. So none of these say "no data yet".

   Every one of them does three things instead:
     1. ANTICIPATE - shows the shape of the value that's coming,
        as ghosted projection rows in the real layout.
     2. BENCHMARK - an honest category number, so the blank page
        still carries an argument ("trades near you miss ~4 calls
        a day - your first one lands here").
     3. OFFER ONE ACTION - ring your own line. That's the aha, and
        top-quartile SaaS gets users to it inside 24 hours.

   Preview any of them live with ?state=empty on the URL.
   ============================================================ */

export function useDayOne() {
  const params = useSearchParams();
  return params.get("state") === "empty";
}

/* ---------- the shell every empty state sits in ----------
   Double-bezel: outer tray (bone, hairline ring, padding) holding
   an inner paper core with its own inset highlight and a
   concentric radius. Reads like machined hardware, not a div. */

export function EmptyShell({
  eyebrow,
  title,
  body,
  benchmark,
  action,
  children,
  orb,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: React.ReactNode;
  benchmark?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  orb?: boolean;
}) {
  return (
    <section className="ez-tray">
      <div className="ez-core">
        <div className="ez-head">
          {orb && (
            <div className="ez-orb" style={{ animationDelay: "40ms" }}>
              <SiriOrb palette={ORB_PALETTES.emma} size="card" active speaking />
              <span className="ez-listening">
                <span className="ez-listening-dot" />
                Listening
              </span>
            </div>
          )}
          <span className="ez-eyebrow" style={{ animationDelay: "90ms" }}>
            {eyebrow}
          </span>
          <h2 className="ez-title" style={{ animationDelay: "150ms" }}>
            {title}
          </h2>
          <p className="ez-body" style={{ animationDelay: "210ms" }}>
            {body}
          </p>
          {action && (
            <div className="ez-action" style={{ animationDelay: "270ms" }}>
              {action}
            </div>
          )}
        </div>

        {children && (
          <div className="ez-preview" style={{ animationDelay: "330ms" }}>
            {children}
          </div>
        )}

        {benchmark && (
          <p className="ez-bench" style={{ animationDelay: "390ms" }}>
            {benchmark}
          </p>
        )}
      </div>
    </section>
  );
}

/* ---------- the one action, everywhere: ring your own line ----------
   Button-in-button: the glyph lives in its own nested circle flush
   with the pill's inner padding, and drifts diagonally on hover. */

export function RingYourLine({ label = "Ring your own line" }: { label?: string }) {
  return (
    <a className="ez-cta" href="tel:+61730004182">
      <span>{label}</span>
      <span className="ez-cta-orb">
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden>
          <path
            d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.3c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.1 2.1z"
            fill="currentColor"
          />
        </svg>
      </span>
    </a>
  );
}

export function GhostButton({ children, href = "#" }: { children: React.ReactNode; href?: string }) {
  return (
    <a className="ez-ghost" href={href}>
      {children}
    </a>
  );
}

/* ---------- ghost primitives: the shape of value, greyed ----------
   Deliberately NOT shimmer skeletons. Shimmer says "loading, wait".
   These say "this is what lands here" - real labels, ghosted ink. */

export function GhostRows({ rows }: { rows: { a: string; b: string; c?: string }[] }) {
  return (
    <div className="ez-rows">
      {rows.map((r, k) => (
        <div className="ez-row" key={k} style={{ animationDelay: `${420 + k * 70}ms` }}>
          <span className="ez-avatar" />
          <div className="ez-row-body">
            <b>{r.a}</b>
            <span>{r.b}</span>
          </div>
          {r.c && <span className="ez-row-tag">{r.c}</span>}
        </div>
      ))}
      <div className="ez-row ez-row-live" style={{ animationDelay: `${420 + rows.length * 70}ms` }}>
        <span className="ez-avatar ez-avatar-live">
          <span className="ez-pulse" />
        </span>
        <div className="ez-row-body">
          <b>Your first real call</b>
          <span>Lands here the moment it comes in</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PER-PAGE EMPTY STATES
   ============================================================ */

export function EmptyToday() {
  return (
    <EmptyShell
      orb
      eyebrow="Day one"
      title={
        <>
          Emma is on your line.
          <br />
          <span className="ez-em">Nothing has rung through yet.</span>
        </>
      }
      body={
        <>
          She&rsquo;s answering as <b>Kedron Plumbing</b> on <b>(07) 3000 4182</b> right now. The moment
          someone calls, the transcript, the booking and what it&rsquo;s worth all land on this page.
        </>
      }
      action={
        <>
          <RingYourLine label="Ring her yourself" />
          <GhostButton href="/dashboard/agent">Check what she&rsquo;ll say</GhostButton>
        </>
      }
      benchmark={
        <>
          Trades on Brisbane&rsquo;s northside miss about <b>4 calls a day</b>. Most of them never ring back.
          That&rsquo;s the number Emma is here to take off you.
        </>
      }
    >
      <GhostRows
        rows={[
          { a: "A caller with a burst pipe", b: "Triaged, your mobile rings", c: "Emergency" },
          { a: "Someone chasing a quote", b: "Details captured, quote visit booked", c: "Quote" },
          { a: "A blocked drain in Stafford", b: "Booked straight into your calendar", c: "Booked" },
        ]}
      />
    </EmptyShell>
  );
}

export function EmptyCalls() {
  return (
    <EmptyShell
      orb
      eyebrow="Your inbox"
      title={
        <>
          No calls yet - <span className="ez-em">but she&rsquo;s listening.</span>
        </>
      }
      body={
        <>
          Every call gets a full recording, a timestamped transcript, and the details Emma pulled out of it.
          Nothing gets paraphrased and nothing gets guessed.
        </>
      }
      action={<RingYourLine label="Make the first one yourself" />}
      benchmark={
        <>
          The fastest way to trust this page is to ring the line and then read your own call back.
        </>
      }
    >
      <GhostRows
        rows={[
          { a: "Caller name", b: "What they rang about · what Emma did", c: "Booked" },
          { a: "Caller name", b: "Warm transfer that needed you", c: "Transfer" },
        ]}
      />
    </EmptyShell>
  );
}

export function EmptyBookings() {
  return (
    <EmptyShell
      eyebrow="Your calendar"
      title={
        <>
          An empty week. <span className="ez-em">For now.</span>
        </>
      }
      body={
        <>
          When Emma books a job she drops it straight onto this calendar and texts the caller a
          confirmation. Drag anything to reschedule - the customer gets told automatically.
        </>
      }
      action={<RingYourLine label="Book a test job" />}
      benchmark={
        <>
          Connect <b>ServiceM8</b> or <b>Google Calendar</b> and she&rsquo;ll never offer a slot you&rsquo;re
          already on a job for.
        </>
      }
    >
      <div className="ez-cal">
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, k) => (
          <div className="ez-cal-col" key={d} style={{ animationDelay: `${420 + k * 60}ms` }}>
            <span className="ez-cal-day">{d}</span>
            <div className="ez-cal-slot" />
            {k === 2 && (
              <div className="ez-cal-ghost">
                <span>Your first job</span>
                <small>from your first missed call</small>
              </div>
            )}
            <div className="ez-cal-slot" />
          </div>
        ))}
      </div>
    </EmptyShell>
  );
}

export function EmptyFollowups() {
  return (
    <EmptyShell
      eyebrow="Playbooks"
      title={
        <>
          Five playbooks armed.
          <br />
          <span className="ez-em">Nothing to chase yet.</span>
        </>
      }
      body={
        <>
          Missed-call rescue, quote chase, no-show rescue, review requests and booking reminders are all
          loaded and waiting. They fire the moment there&rsquo;s a real customer to fire at.
        </>
      }
      action={<GhostButton href="/dashboard/followups">Read what each one sends</GhostButton>}
      benchmark={
        <>
          About <b>1 in 4</b> quotes converts when somebody actually chases it. Nobody chases it, because
          you&rsquo;re on the tools. That&rsquo;s the whole point of this page.
        </>
      }
    >
      <GhostRows
        rows={[
          { a: "Missed-call rescue", b: "Fires within 60 seconds of a rung-out call", c: "Armed" },
          { a: "Quote chase", b: "Day 2, day 5, day 9 - then stops", c: "Armed" },
          { a: "Review request", b: "2 hours after you mark a job done", c: "Armed" },
        ]}
      />
    </EmptyShell>
  );
}

export function EmptyValue() {
  return (
    <EmptyShell
      eyebrow="Recovered revenue"
      title={
        <>
          <span className="ez-zero">$0</span>
          <br />
          <span className="ez-em">so far. Give her a day.</span>
        </>
      }
      body={
        <>
          This is the only number that decides whether Emma is worth keeping. It counts the jobs she booked
          from calls that would have gone to voicemail - nothing else.
        </>
      }
      action={<RingYourLine />}
      benchmark={
        <>
          By day seven, the average trade on RingBack has recovered around <b>$2,400</b>. Your subscription
          is <b>$150</b>. We&rsquo;d rather you watched this number than took our word for it.
        </>
      }
    >
      <div className="ez-spark">
        <svg viewBox="0 0 320 80" preserveAspectRatio="none" aria-hidden>
          <path
            d="M0,76 C60,74 90,60 140,44 C190,28 240,18 320,6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeDasharray="4 5"
            strokeLinecap="round"
          />
        </svg>
        <span className="ez-spark-label">The shape we expect · your line draws itself</span>
      </div>
    </EmptyShell>
  );
}

export function EmptyAnalytics() {
  return (
    <EmptyShell
      eyebrow="Analytics"
      title={
        <>
          Not enough calls to<br />
          <span className="ez-em">tell you anything honest yet.</span>
        </>
      }
      body={
        <>
          We could fill this page with charts of nothing. Instead: once about <b>20 calls</b> have come
          through, the heat map will show you exactly which hours your phone actually rings - and which
          ones you&rsquo;re losing.
        </>
      }
      action={<RingYourLine />}
      benchmark={<>Most trades are surprised by their own busiest hour. It&rsquo;s rarely when they think.</>}
    >
      <div className="ez-heat">
        {Array.from({ length: 5 }).map((_, r) => (
          <div className="ez-heat-row" key={r} style={{ animationDelay: `${420 + r * 60}ms` }}>
            {Array.from({ length: 12 }).map((__, c) => (
              <span key={c} className="ez-heat-cell" data-v={(r + c) % 4 === 0 ? "1" : undefined} />
            ))}
          </div>
        ))}
        <span className="ez-spark-label">Your week, once she&rsquo;s heard it</span>
      </div>
    </EmptyShell>
  );
}

export function EmptySimulation() {
  return (
    <EmptyShell
      orb
      eyebrow="Trust gate"
      title={
        <>
          She hasn&rsquo;t been<br />
          <span className="ez-em">put through the wringer yet.</span>
        </>
      }
      body={
        <>
          Before Emma answers a real customer, she gets run against twelve kinds of caller - the distressed
          emergency, the price shopper, the angry one, the prompt-injector, the pocket dial. Three runs each.
        </>
      }
      action={<GhostButton href="/dashboard/simulation">Run all twelve</GhostButton>}
      benchmark={
        <>
          Go-live stays locked until every persona passes <b>and</b> you&rsquo;ve rung her yourself. We
          won&rsquo;t skip that second one for you.
        </>
      }
    >
      <div className="ez-personas">
        {[
          "Happy homeowner",
          "Emergency",
          "Price shopper",
          "Angry customer",
          "Vague rambler",
          "Broad accent",
          "Repeat caller",
          "Out of area",
          "Interrupter",
          "Adversarial",
          "Spam",
          "Silence",
        ].map((p, k) => (
          <span className="ez-persona" key={p} style={{ animationDelay: `${420 + k * 35}ms` }}>
            <span className="ez-persona-dot" />
            {p}
          </span>
        ))}
      </div>
    </EmptyShell>
  );
}

export function EmptyIntegrations() {
  return (
    <EmptyShell
      eyebrow="Integrations"
      title={
        <>
          Emma works on her own.
          <br />
          <span className="ez-em">She works better plugged in.</span>
        </>
      }
      body={
        <>
          Right now she books into her own calendar. Connect the tools you already run and bookings write
          straight back, repeat callers get recognised by name, and she stops offering slots you&rsquo;re
          busy for.
        </>
      }
      action={<GhostButton href="/dashboard/integrations">See what connects</GhostButton>}
      benchmark={
        <>
          Most trades connect <b>one</b> job-management tool and <b>one</b> calendar. That&rsquo;s the whole
          setup.
        </>
      }
    />
  );
}

export function EmptyBilling() {
  return (
    <EmptyShell
      eyebrow="Billing"
      title={
        <>
          You&rsquo;re on the free trial.
          <br />
          <span className="ez-em">Card on file, nothing charged yet.</span>
        </>
      }
      body={
        <>
          Seven days, everything switched on. Your card is on file but the first charge doesn&rsquo;t land
          until day eight, and only if you haven&rsquo;t cancelled. The founding rate is <b>$150/mo</b> for
          three months and then <b>$299</b> - flat, no per-minute billing, no add-ons.
        </>
      }
      action={<GhostButton href="/dashboard/value">See what she&rsquo;s recovered</GhostButton>}
      benchmark={
        <>
          Thirty-day money-back guarantee. The <b>#1</b> complaint about every competitor in this category is
          billing surprises - so there aren&rsquo;t any here.
        </>
      }
    />
  );
}
