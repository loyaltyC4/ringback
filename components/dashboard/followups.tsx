"use client";

import { useState } from "react";
import { Arrow } from "@/components/site-chrome";
import { Kicker, TabPill } from "./primitives";

/* ============================================================
   FOLLOW-UPS — the playbook editor

   Left: list of playbooks with live/paused pill and outbound
   count. Right: the selected playbook's detail — timeline of
   steps (day 0, day 3, day 7), template preview, channel chip,
   and guardrails card (DNC hours, opt-outs, per-recipient
   throttle). The visual grammar is timeline-on-a-rail, so it
   reads as a promise the agent is going to keep.
   ============================================================ */

type Channel = "sms" | "call" | "email";

type Step = {
  when: string;        // human label ("Same day, 12 min after") — the trigger
  delayHours: number;  // for the rail rendering
  channel: Channel;
  subject?: string;
  body: string;
};

type Playbook = {
  id: string;
  name: string;
  trigger: string;
  description: string;
  status: "live" | "paused" | "draft";
  sentLastWeek: number;
  successPct: number;  // % of recipients that took the intended action
  steps: Step[];
  guardrails: string[];
};

const PLAYS: Playbook[] = [
  {
    id: "missed-call",
    name: "Missed-call rescue",
    trigger: "Emma didn't answer in time",
    description: "The classic. Fires the second a call rings out — before the caller shops around.",
    status: "live",
    sentLastWeek: 32,
    successPct: 48,
    steps: [
      {
        when: "Within 60 seconds",
        delayHours: 0,
        channel: "sms",
        body: "G'day, this is {business}. Sorry we missed your call — Dave's on the tools. Reply here with what you need and we'll ring back within the hour.",
      },
      {
        when: "If no reply in 4 hours",
        delayHours: 4,
        channel: "call",
        body: "Callback attempt — Emma tries the number once, in a business-hours window only.",
      },
    ],
    guardrails: [
      "Never sends between 8pm and 7am — quiet hours locked",
      "One touch per number per week, ever",
      "Stops on any 'STOP', 'unsub', or complaint word",
    ],
  },
  {
    id: "quote-chase",
    name: "Quote chase",
    trigger: "Quote sent · no reply after 48h",
    description: "The three-touch cadence Dave used to do manually. Now Emma runs it, and stops the second they book.",
    status: "live",
    sentLastWeek: 18,
    successPct: 33,
    steps: [
      {
        when: "Day 2, 10am",
        delayHours: 48,
        channel: "sms",
        body: "Hi {first_name}, Dave from {business} — did the quote for {job} land okay? Happy to walk you through any of it.",
      },
      {
        when: "Day 5, 10am",
        delayHours: 120,
        channel: "sms",
        body: "Hey {first_name}, just checking in on the {job} quote — availability's tightening for {month}, keen to lock a date if you're ready.",
      },
      {
        when: "Day 9, 10am",
        delayHours: 216,
        channel: "email",
        subject: "Closing your {business} quote #{quote_no}",
        body: "Hi {first_name}, no worries either way — we'll close this quote out on our end tomorrow unless you'd like it kept open. Reply and we'll hold it.",
      },
    ],
    guardrails: [
      "Stops the moment the quote is accepted or declined in ServiceM8",
      "Never chases a customer who's ever replied 'STOP'",
      "Skips public holidays automatically",
    ],
  },
  {
    id: "no-show",
    name: "No-show rescue",
    trigger: "Booking marked 'missed' in the calendar",
    description: "Turns a no-show into a rebook instead of an angry review.",
    status: "live",
    sentLastWeek: 4,
    successPct: 75,
    steps: [
      {
        when: "10 minutes after the slot started",
        delayHours: 0,
        channel: "sms",
        body: "Hi {first_name}, Dave from {business} — I'm at your place but no answer. Give me a bell on 07 3013 5000 or reply here and we'll sort a new time.",
      },
      {
        when: "Next morning if still no reply",
        delayHours: 20,
        channel: "call",
        body: "Emma rings once, offers 3 slots in the next 5 days, books whichever the caller picks.",
      },
    ],
    guardrails: [
      "Escalates to Dave's mobile if the missed booking was flagged emergency",
      "Two touches maximum",
    ],
  },
  {
    id: "review-request",
    name: "Review request",
    trigger: "Job marked done in ServiceM8",
    description: "Only asks people who paid on time and didn't complain. Google reviews only, one link.",
    status: "live",
    sentLastWeek: 21,
    successPct: 42,
    steps: [
      {
        when: "2 hours after mark-done",
        delayHours: 2,
        channel: "sms",
        body: "Hi {first_name} — Dave here. Really appreciated the work today. If you've got 30 seconds, a Google review would mean a lot: {review_link}",
      },
    ],
    guardrails: [
      "Skips any customer who had an escalation on the call",
      "Skips any customer whose invoice is overdue",
      "One request per job, per customer, ever",
    ],
  },
  {
    id: "reminder",
    name: "Booking reminder",
    trigger: "24 hours before a booked slot",
    description: "Cuts your no-shows. Includes a one-tap reschedule link.",
    status: "live",
    sentLastWeek: 47,
    successPct: 96,
    steps: [
      {
        when: "24 hours before",
        delayHours: 24,
        channel: "sms",
        body: "Reminder: {business} is booked for {job} at {time} tomorrow. Reply YES to confirm, or tap {reschedule_link} to move it.",
      },
      {
        when: "2 hours before",
        delayHours: 2,
        channel: "sms",
        body: "Heads up {first_name}, Dave's about {eta} away.",
      },
    ],
    guardrails: [
      "Never sends the same reminder twice",
      "Skips if the caller opted out at booking time",
    ],
  },
  {
    id: "winback",
    name: "Winback (annual)",
    trigger: "12 months since last job",
    description: "Draft — waiting on Dave's approval of the tone.",
    status: "draft",
    sentLastWeek: 0,
    successPct: 0,
    steps: [
      {
        when: "12 months on-the-dot",
        delayHours: 8760,
        channel: "sms",
        body: "Hi {first_name}, Dave from {business} — noticed it's been a year. Hot water systems love an annual check. Reply Y and I'll book one in for you.",
      },
    ],
    guardrails: [
      "Requires Dave's sign-off before this goes live",
      "Once per customer per year, ever",
    ],
  },
];

/* ---------- little icons for the channel chip ---------- */

function ChanIcon({ c }: { c: Channel }) {
  if (c === "sms")
    return (
      <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
        <path d="M4 6h16v10H8l-4 4V6Z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      </svg>
    );
  if (c === "call")
    return (
      <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
        <path d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.3c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.1 2.1z" fill="currentColor" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path d="m3.5 6 8.5 7 8.5-7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

function ChannelChip({ c }: { c: Channel }) {
  const label = c === "sms" ? "SMS" : c === "call" ? "Call" : "Email";
  return (
    <span className="chan-chip" data-c={c}>
      <ChanIcon c={c} /> {label}
    </span>
  );
}

/* ---------- Playbook detail (right pane) ---------- */

function PlaybookDetail({ p, onToggleStatus }: { p: Playbook; onToggleStatus: () => void }) {
  return (
    <section className="pb">
      <header className="pb-head">
        <div className="pb-id">
          <div className="pb-title-row">
            <h2>{p.name}</h2>
            <span className={`pb-status pb-status-${p.status}`}>
              {p.status === "live" && <span className="pb-live-dot" />}
              {p.status === "live" ? "Live" : p.status === "paused" ? "Paused" : "Draft"}
            </span>
          </div>
          <span className="pb-trigger">
            <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden>
              <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" fill="currentColor" />
            </svg>
            Trigger · {p.trigger}
          </span>
          <p className="pb-desc">{p.description}</p>
        </div>
        <div className="pb-actions">
          <div className="pb-stat">
            <b>{p.sentLastWeek}</b>
            <span>sent last week</span>
          </div>
          <div className="pb-stat">
            <b>{p.successPct}%</b>
            <span>booked / replied</span>
          </div>
          <button className="cd-btn" onClick={onToggleStatus}>
            {p.status === "live" ? "Pause" : p.status === "paused" ? "Resume" : "Publish"}
          </button>
        </div>
      </header>

      <div className="pb-rail">
        {p.steps.map((s, i) => (
          <div className="pb-step" key={i}>
            <div className="pb-step-mark">
              <span className="pb-step-n">{i + 1}</span>
            </div>
            <div className="pb-step-body">
              <div className="pb-step-when">
                <span>{s.when}</span>
                <ChannelChip c={s.channel} />
              </div>
              {s.subject && <b className="pb-step-subj">Subject: {s.subject}</b>}
              <div className="pb-step-msg">
                <p>{s.body}</p>
              </div>
            </div>
          </div>
        ))}
        <button className="pb-add">
          <span>+</span> Add another touch
        </button>
      </div>

      <section className="pb-guards">
        <Kicker>Guardrails</Kicker>
        <ul>
          {p.guardrails.map((g) => (
            <li key={g}>
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                <path d="M4 12l6 6L20 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {g}
            </li>
          ))}
        </ul>
      </section>

      <p className="cd-legal">
        Every follow-up is stamped &ldquo;from {"{business}"} via RingBack&rdquo; and honours the Australian
        Do-Not-Call and SPAM Acts — the second a recipient replies STOP, this playbook stops for that number forever.
      </p>
    </section>
  );
}

/* ---------- The page ---------- */

const FILTERS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "paused", label: "Paused" },
  { id: "draft", label: "Drafts" },
] as const;

export function Followups() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [selectedId, setSelectedId] = useState<string>(PLAYS[0].id);
  const [statusOverride, setStatusOverride] = useState<Record<string, Playbook["status"]>>({});

  const withStatus = PLAYS.map((p) => ({ ...p, status: statusOverride[p.id] ?? p.status }));
  const filtered = withStatus.filter((p) => (filter === "all" ? true : p.status === filter));

  const selected = withStatus.find((p) => p.id === selectedId) ?? withStatus[0];

  const counts = {
    all: withStatus.length,
    live: withStatus.filter((p) => p.status === "live").length,
    paused: withStatus.filter((p) => p.status === "paused").length,
    draft: withStatus.filter((p) => p.status === "draft").length,
  };
  const totalSent = withStatus.reduce((n, p) => n + (p.status === "live" ? p.sentLastWeek : 0), 0);

  const toggle = (id: string) => {
    const p = withStatus.find((x) => x.id === id)!;
    const next = p.status === "live" ? "paused" : p.status === "paused" ? "live" : "live";
    setStatusOverride({ ...statusOverride, [id]: next });
  };

  return (
    <>
      <header className="page-h">
        <div>
          <Kicker>Emma runs these automatically</Kicker>
          <h1 className="page-title">Follow-ups</h1>
        </div>
        <div className="page-h-right">
          <div className="pb-summary">
            <b>{totalSent}</b> <span>touches last week · {counts.live} playbooks live</span>
          </div>
          <button className="cd-btn cd-primary">
            <span>+</span> New playbook
          </button>
        </div>
      </header>

      <TabPill
        items={FILTERS.map((f) => ({ ...f, count: counts[f.id] }))}
        value={filter}
        onChange={(id) => setFilter(id as typeof filter)}
      />

      <div className="pb-page">
        <aside className="pb-list" aria-label="Playbooks">
          {filtered.map((p) => (
            <button
              key={p.id}
              className="pbi"
              data-on={selectedId === p.id || undefined}
              onClick={() => setSelectedId(p.id)}
            >
              <div className="pbi-top">
                <b>{p.name}</b>
                <span className={`pb-status pb-status-${p.status}`}>
                  {p.status === "live" && <span className="pb-live-dot" />}
                  {p.status === "live" ? "Live" : p.status === "paused" ? "Paused" : "Draft"}
                </span>
              </div>
              <span className="pbi-trigger">{p.trigger}</span>
              <div className="pbi-meta">
                <span>
                  {p.steps.length} touch{p.steps.length === 1 ? "" : "es"}
                </span>
                <span>·</span>
                <span>{p.sentLastWeek}/wk</span>
                {p.successPct > 0 && (
                  <>
                    <span>·</span>
                    <b>{p.successPct}%</b>
                  </>
                )}
              </div>
            </button>
          ))}
          {!filtered.length && <p className="calls-empty">No playbooks match that filter.</p>}
        </aside>

        <div className="pb-pane">
          <PlaybookDetail p={selected} onToggleStatus={() => toggle(selected.id)} />
        </div>
      </div>
    </>
  );
}
