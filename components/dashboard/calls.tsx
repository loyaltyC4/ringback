"use client";

import { useEffect, useState } from "react";
import { Arrow } from "@/components/site-chrome";
import { Kicker, TabPill, WaveformPlayer } from "./primitives";

/* ============================================================
   CALLS — inbox + slide-over Detail
   Left: filterable list. Right (or slide-over on mobile): the
   Detail with waveform, transcript, extracted fields, actions.
   ============================================================ */

type Disp = "booked" | "message" | "warm" | "spam";

type Call = {
  id: string;
  name: string;
  number: string;
  location: string;
  job: string;
  note: string;
  disp: Disp;
  time: string;
  duration: number; // seconds
  transcript: { who: "emma" | "caller"; t: number; text: string }[];
  extracted: { field: string; value: string }[];
  escalation?: string;
};

const CALLS: Call[] = [
  {
    id: "c-sue",
    name: "Sue Murphy",
    number: "+61 402 118 902",
    location: "Stafford, QLD",
    job: "Hot water gone — booked",
    note: "Emergency · booked 2:15p",
    disp: "booked",
    time: "9:42a",
    duration: 128,
    extracted: [
      { field: "Job", value: "HWS replacement" },
      { field: "Address", value: "14 Wilston Rd, Stafford 4053" },
      { field: "When", value: "Today 2:15pm" },
      { field: "Value", value: "$1,850 (median, not quoted)" },
      { field: "Access", value: "Side gate, dog is friendly" },
    ],
    transcript: [
      { who: "emma", t: 0, text: "G'day, you've called Kedron Plumbing — this is Emma, Dave's AI receptionist. How can I help?" },
      { who: "caller", t: 6, text: "Hi Emma, my hot water's died. Just totally gone." },
      { who: "emma", t: 12, text: "Sorry to hear that. Is water leaking from the unit anywhere right now?" },
      { who: "caller", t: 19, text: "No, no leak. It's just cold." },
      { who: "emma", t: 23, text: "Right — that's not an emergency then, but we can get someone out today. Can I grab your address?" },
      { who: "caller", t: 30, text: "14 Wilston Road, Stafford — 4053." },
      { who: "emma", t: 37, text: "Perfect. Let me read that back — 14 Wilston Road, Stafford, four-oh-five-three. Yeah?" },
      { who: "caller", t: 45, text: "That's right." },
      { who: "emma", t: 48, text: "Great. I've got Dave free at 2:15 this arvo. Shall I lock that in?" },
      { who: "caller", t: 55, text: "Yes please." },
      { who: "emma", t: 58, text: "Done — you'll get a text confirmation. Anything about access we should know?" },
      { who: "caller", t: 66, text: "Just come through the side gate. The dog's friendly." },
      { who: "emma", t: 72, text: "Noted. Talk soon." },
    ],
  },
  {
    id: "c-jim",
    name: "Jim Taylor",
    number: "+61 419 774 205",
    location: "Wavell Heights, QLD",
    job: "Reno rough-in quote",
    note: "Details captured · quote callback Fri",
    disp: "message",
    time: "9:04a",
    duration: 176,
    extracted: [
      { field: "Job", value: "Bathroom rough-in — full reno" },
      { field: "Site", value: "27 Rode Rd, Wavell Heights" },
      { field: "Timeline", value: "Wants to start mid-October" },
      { field: "Docs", value: "Sent plans via email" },
    ],
    transcript: [
      { who: "emma", t: 0, text: "G'day, Kedron Plumbing — Emma speaking. What can I do for you?" },
      { who: "caller", t: 5, text: "Yeah I'm looking for a quote on a bathroom reno rough-in." },
      { who: "emma", t: 12, text: "Sure. I can't give you a number over the phone — Dave prefers to measure — but I can grab the details and get him out for a quote visit." },
    ],
  },
  {
    id: "c-rachel",
    name: "Rachel Byrne",
    number: "+61 401 553 200",
    location: "Chermside, QLD",
    job: "Gas smell",
    note: "Warm transfer didn't land — needs you",
    disp: "warm",
    time: "7:31a",
    duration: 92,
    escalation: "Rachel could smell gas at her back BBQ line. Emma triaged — turned the isolation valve off, left the house — then tried to warm-transfer to your mobile. You were on another job. She held Rachel on the line for 90s, then booked her a callback and told her to keep the area clear. Ring her back first thing.",
    extracted: [
      { field: "Trigger", value: "Gas smell at BBQ line" },
      { field: "Safety", value: "Isolation valve OFF · left house" },
      { field: "Callback promised", value: "Between 8:00 and 8:30 am" },
    ],
    transcript: [
      { who: "emma", t: 0, text: "Kedron Plumbing — Emma. Everything okay?" },
      { who: "caller", t: 3, text: "I can smell gas at my back BBQ." },
      { who: "emma", t: 7, text: "Okay — this is an emergency. First, is there anyone in the house right now near the BBQ?" },
    ],
  },
  {
    id: "c-marco",
    name: "Marco G",
    number: "+61 404 812 118",
    location: "Chermside West, QLD",
    job: "Blocked stormwater",
    note: "Booked Wed 7am",
    disp: "booked",
    time: "6:55a",
    duration: 84,
    extracted: [
      { field: "Job", value: "Blocked stormwater drain" },
      { field: "Address", value: "8 Wardell St, Chermside West" },
      { field: "When", value: "Wed 7:00am" },
    ],
    transcript: [
      { who: "emma", t: 0, text: "Kedron Plumbing — Emma, how can I help?" },
      { who: "caller", t: 4, text: "Stormwater drain out the front — completely blocked, water pooling." },
    ],
  },
  {
    id: "c-priya",
    name: "Priya Patel",
    number: "+61 411 209 776",
    location: "Wavell Heights, QLD",
    job: "Leaking mixer",
    note: "Booked Fri 10:30 · first-time caller",
    disp: "booked",
    time: "Yest",
    duration: 106,
    extracted: [
      { field: "Job", value: "Leaking kitchen mixer" },
      { field: "Address", value: "3 Barton St, Wavell Heights" },
      { field: "When", value: "Fri 10:30am" },
      { field: "Notes", value: "New customer — no prior jobs" },
    ],
    transcript: [
      { who: "emma", t: 0, text: "Kedron Plumbing — Emma speaking." },
      { who: "caller", t: 3, text: "Hi, my kitchen mixer's leaking from the base." },
    ],
  },
  {
    id: "c-spam",
    name: "+61 Unknown",
    number: "+61 000 000 000",
    location: "Unknown",
    job: "\"Extended warranty\"",
    note: "Robocall — blocked before it rang you",
    disp: "spam",
    time: "7:02a",
    duration: 12,
    extracted: [
      { field: "Reason", value: "Matched robocall fingerprint" },
      { field: "Action", value: "Silenced · not on your dashboard alerts" },
    ],
    transcript: [{ who: "caller", t: 0, text: "This call is regarding your car's extended warranty." }],
  },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "booked", label: "Booked" },
  { id: "message", label: "Messages" },
  { id: "warm", label: "Warm transfers" },
  { id: "spam", label: "Filtered" },
] as const;

function DispBadge({ d }: { d: Disp }) {
  const label = d === "booked" ? "Booked" : d === "message" ? "Message" : d === "warm" ? "Warm transfer" : "Spam";
  return <span className="cf-badge" data-d={d}>{label}</span>;
}

function Avatar({ name }: { name: string }) {
  const init = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2);
  return <span className="feed-av" aria-hidden>{init}</span>;
}

/* ---------- Detail (right pane) ---------- */

function CallDetail({ call, onClose }: { call: Call; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const mm = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;

  return (
    <section className="cd">
      <header className="cd-head">
        <button className="cd-back" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="cd-id">
          <b>{call.name}</b>
          <span>{call.number} · {call.location}</span>
        </div>
        <DispBadge d={call.disp} />
      </header>

      {call.escalation && (
        <div className="cd-esc">
          <span className="cd-esc-tag">Escalation</span>
          <p>{call.escalation}</p>
        </div>
      )}

      <div className="cd-actions">
        <button className="cd-btn cd-primary">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden><path d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.3c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.1 2.1z" fill="currentColor"/></svg>
          Call back
        </button>
        <button className="cd-btn">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden><path d="M4 6h16v10H8l-4 4V6Z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round"/></svg>
          Send SMS
        </button>
        <button className="cd-btn">Add to job list</button>
        <button className="cd-btn cd-ghost">Mark as spam</button>
      </div>

      <div className="cd-audio">
        <WaveformPlayer seed={call.id} duration={call.duration} />
      </div>

      <div className="cd-grid">
        <div className="cd-tx">
          <Kicker>Full transcript · {mm(call.duration)}</Kicker>
          <div className="cd-tx-list">
            {call.transcript.map((row, i) => (
              <div className={`tx-row tx-${row.who}`} key={i}>
                <span className="tx-t">{mm(row.t)}</span>
                <span className="tx-who">{row.who === "emma" ? "Emma" : call.name.split(" ")[0]}</span>
                <p>{row.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="cd-ex">
          <Kicker>Extracted from the call</Kicker>
          <div className="cd-ex-list">
            {call.extracted.map((f) => (
              <div className="ex-row" key={f.field}>
                <span>{f.field}</span>
                <b>{f.value}</b>
              </div>
            ))}
          </div>
          <p className="cd-legal">Structured fields Emma pulled while talking. Anything ambiguous is left blank rather than guessed.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- The Calls page ---------- */

export function Calls() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Call | null>(CALLS[0]);

  const filtered = CALLS.filter((c) => (filter === "all" ? true : c.disp === filter)).filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.job.toLowerCase().includes(q.toLowerCase()) ||
      c.location.toLowerCase().includes(q.toLowerCase()),
  );

  const counts = {
    all: CALLS.length,
    booked: CALLS.filter((c) => c.disp === "booked").length,
    message: CALLS.filter((c) => c.disp === "message").length,
    warm: CALLS.filter((c) => c.disp === "warm").length,
    spam: CALLS.filter((c) => c.disp === "spam").length,
  };

  const tabs = FILTERS.map((f) => ({ ...f, count: counts[f.id] }));

  return (
    <>
      <header className="page-h">
        <div>
          <Kicker>Every call, ever</Kicker>
          <h1 className="page-title">Calls</h1>
        </div>
        <div className="search">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
            <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="m15 15 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search caller, job, suburb…" />
        </div>
      </header>

      <TabPill items={tabs} value={filter} onChange={(id) => setFilter(id as typeof filter)} />

      <div className="calls">
        <aside className="calls-list" aria-label="Call inbox">
          {filtered.map((c) => (
            <button
              key={c.id}
              className="cli"
              data-on={selected?.id === c.id || undefined}
              onClick={() => setSelected(c)}
            >
              <Avatar name={c.name} />
              <div className="cli-body">
                <div className="cli-top">
                  <b>{c.name}</b>
                  <span className="cli-t">{c.time}</span>
                </div>
                <span className="cli-job">{c.job}</span>
                <span className="cli-note">{c.note}</span>
              </div>
              <DispBadge d={c.disp} />
            </button>
          ))}
          {!filtered.length && <p className="calls-empty">Nothing here yet — try a different filter.</p>}
        </aside>

        <div className="calls-pane">
          {selected ? <CallDetail call={selected} onClose={() => setSelected(null)} /> : (
            <div className="calls-empty-pane">
              <span>Pick a call to see the transcript and audio.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
