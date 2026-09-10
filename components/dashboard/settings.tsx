"use client";

import { useState } from "react";
import { Kicker, ChipEditor } from "./primitives";

/* ============================================================
   SETTINGS

   Not one page pretending to be five — a real settings surface
   with these panels:
     · Business identity
     · Business hours (with the after-hours behaviour)
     · Emergency escalation (who rings, in what order)
     · Notification matrix (event × channel)
     · Team access
     · Trust & legal
   ============================================================ */

const CHANNELS = ["Push", "SMS", "Email", "Voice"] as const;
type Chan = (typeof CHANNELS)[number];

type Event = {
  key: string;
  label: string;
  hint: string;
  defaults: Record<Chan, boolean>;
};

const EVENTS: Event[] = [
  {
    key: "escalation",
    label: "Warm-transfer escalation",
    hint: "Emma tried to reach you live for an emergency.",
    defaults: { Push: true, SMS: true, Email: false, Voice: true },
  },
  {
    key: "booked",
    label: "New booking",
    hint: "Every job Emma puts in your calendar.",
    defaults: { Push: true, SMS: false, Email: false, Voice: false },
  },
  {
    key: "hot-lead",
    label: "Hot lead flagged",
    hint: "A high-intent caller Emma thinks you should ring back yourself.",
    defaults: { Push: true, SMS: true, Email: false, Voice: false },
  },
  {
    key: "quote",
    label: "Quote requested",
    hint: "A quote-visit call Emma captured details for.",
    defaults: { Push: true, SMS: false, Email: true, Voice: false },
  },
  {
    key: "digest",
    label: "Weekly digest",
    hint: "The Monday 7am recap.",
    defaults: { Push: false, SMS: true, Email: true, Voice: false },
  },
  {
    key: "gap",
    label: "Knowledge gap detected",
    hint: "Emma didn't know the answer to something a customer asked.",
    defaults: { Push: true, SMS: false, Email: false, Voice: false },
  },
  {
    key: "billing",
    label: "Billing",
    hint: "Payment attempts, invoices, plan changes.",
    defaults: { Push: false, SMS: false, Email: true, Voice: false },
  },
];

/* ============================================================
   HOURS EDITOR — 7-day grid with sliders per day
   ============================================================ */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type Day = { on: boolean; open: string; close: string };

function HoursEditor() {
  const [hours, setHours] = useState<Record<string, Day>>({
    Mon: { on: true, open: "07:00", close: "17:00" },
    Tue: { on: true, open: "07:00", close: "17:00" },
    Wed: { on: true, open: "07:00", close: "17:00" },
    Thu: { on: true, open: "07:00", close: "17:00" },
    Fri: { on: true, open: "07:00", close: "16:00" },
    Sat: { on: true, open: "08:00", close: "12:00" },
    Sun: { on: false, open: "08:00", close: "12:00" },
  });

  return (
    <div className="hours">
      {DAYS.map((d) => {
        const day = hours[d];
        return (
          <div className="hours-row" key={d} data-off={!day.on || undefined}>
            <label className="hours-day">
              <input
                type="checkbox"
                checked={day.on}
                onChange={(e) => setHours({ ...hours, [d]: { ...day, on: e.target.checked } })}
              />
              <span className="hours-switch" />
              <b>{d}</b>
            </label>
            <div className="hours-time">
              <input
                type="time"
                value={day.open}
                onChange={(e) => setHours({ ...hours, [d]: { ...day, open: e.target.value } })}
                disabled={!day.on}
              />
              <span>—</span>
              <input
                type="time"
                value={day.close}
                onChange={(e) => setHours({ ...hours, [d]: { ...day, close: e.target.value } })}
                disabled={!day.on}
              />
            </div>
            <span className="hours-note">
              {day.on ? `${Math.round(diff(day.open, day.close))}h answered live` : "After-hours mode only"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
function diff(a: string, b: string) {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return bh + bm / 60 - (ah + am / 60);
}

/* ============================================================
   ESCALATION EDITOR — ordered list of numbers to try
   ============================================================ */

type Escalation = { name: string; number: string; wait: number };

function EscalationEditor() {
  const [rows, setRows] = useState<Escalation[]>([
    { name: "Dave (owner)", number: "+61 402 118 900", wait: 20 },
    { name: "Mick (2IC)", number: "+61 403 442 118", wait: 20 },
    { name: "After-hours voicemail", number: "—", wait: 0 },
  ]);

  return (
    <div className="esc-list">
      {rows.map((r, i) => (
        <div className="esc-row" key={i}>
          <span className="esc-n">{i + 1}</span>
          <input
            className="esc-name"
            value={r.name}
            onChange={(e) => setRows(rows.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))}
          />
          <input
            className="esc-num"
            value={r.number}
            onChange={(e) => setRows(rows.map((x, k) => (k === i ? { ...x, number: e.target.value } : x)))}
          />
          {r.wait > 0 ? (
            <span className="esc-wait">
              Ring <b>{r.wait}s</b>, then next
            </span>
          ) : (
            <span className="esc-wait esc-wait-end">Final fallback</span>
          )}
          <button
            className="esc-x"
            aria-label={`Remove ${r.name}`}
            onClick={() => setRows(rows.filter((_, k) => k !== i))}
          >
            ×
          </button>
        </div>
      ))}
      <button className="esc-add" onClick={() => setRows([...rows, { name: "New contact", number: "+61 4__ ___ ___", wait: 20 }])}>
        + Add another number to the chain
      </button>
    </div>
  );
}

/* ============================================================
   NOTIFICATION MATRIX — event × channel grid
   ============================================================ */

function NotificationMatrix() {
  const [matrix, setMatrix] = useState<Record<string, Record<Chan, boolean>>>(
    EVENTS.reduce((acc, e) => ({ ...acc, [e.key]: { ...e.defaults } }), {}),
  );

  const toggle = (event: string, c: Chan) => {
    setMatrix({ ...matrix, [event]: { ...matrix[event], [c]: !matrix[event][c] } });
  };

  return (
    <div className="mtx-wrap">
      <div className="mtx">
        <div className="mtx-head">
          <span />
          {CHANNELS.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        {EVENTS.map((e) => (
          <div className="mtx-row" key={e.key}>
            <div className="mtx-lbl">
              <b>{e.label}</b>
              <span>{e.hint}</span>
            </div>
            {CHANNELS.map((c) => (
              <button
                key={c}
                className="mtx-cell"
                data-on={matrix[e.key][c] || undefined}
                onClick={() => toggle(e.key, c)}
                aria-label={`${e.label} via ${c}: ${matrix[e.key][c] ? "on" : "off"}`}
              >
                {matrix[e.key][c] ? (
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                    <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   THE PAGE
   ============================================================ */

export function Settings() {
  const [afterHours] = useState<"take message" | "voicemail" | "book only" | "silent">("take message");
  const [holidays, setHolidays] = useState<string[]>(["Anzac Day", "Christmas Day", "Boxing Day", "New Year's Day"]);
  const [team] = useState([
    { name: "Dave Kelleher", role: "Owner", email: "dave@kedronplumbing.com.au" },
    { name: "Mick Ryan", role: "2IC", email: "mick@kedronplumbing.com.au" },
  ]);

  return (
    <>
      <header className="page-h">
        <div>
          <Kicker>Every knob that changes Emma's behaviour</Kicker>
          <h1 className="page-title">Settings</h1>
        </div>
      </header>

      {/* ---------- Business identity ---------- */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Business identity</Kicker>
            <h2>How Emma introduces you</h2>
          </div>
        </header>
        <div className="settings-grid-2">
          <label className="field">
            <span>Business name</span>
            <input defaultValue="Kedron Plumbing" />
          </label>
          <label className="field">
            <span>Owner</span>
            <input defaultValue="Dave Kelleher" />
          </label>
          <label className="field">
            <span>Business phone</span>
            <input defaultValue="+61 7 3013 5000" />
          </label>
          <label className="field">
            <span>Owner's mobile (for escalations)</span>
            <input defaultValue="+61 402 118 900" />
          </label>
          <label className="field">
            <span>ABN</span>
            <input defaultValue="12 345 678 901" />
          </label>
          <label className="field">
            <span>Licence</span>
            <input defaultValue="QLD Plumbing L1234" />
          </label>
        </div>
      </section>

      {/* ---------- Hours ---------- */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Business hours</Kicker>
            <h2>When you actually pick up the phone</h2>
          </div>
        </header>
        <HoursEditor />
        <div className="settings-inline">
          <div className="pill-row">
            <b>After hours, Emma will</b>
            <div className="pill-choice">
              {["take message", "voicemail", "book only", "silent"].map((opt) => (
                <span key={opt} data-on={opt === afterHours || undefined}>
                  {opt}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="sub muted">
          &ldquo;Take message&rdquo; means Emma still answers, greets, captures the reason for the call, and tells them Dave will
          ring back in the morning. She never invents an ETA.
        </p>
      </section>

      {/* ---------- Emergency escalation ---------- */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Emergency escalation</Kicker>
            <h2>Who Emma rings when it's live</h2>
          </div>
        </header>
        <EscalationEditor />
        <p className="sub muted">
          When an emergency trigger fires, Emma keeps the caller on the line and rings each number in order.
          Whoever picks up gets warm-transferred with the situation, the address, and the caller&rsquo;s name already stated.
        </p>
      </section>

      {/* ---------- Notification matrix ---------- */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Notifications</Kicker>
            <h2>What buzzes your phone, and how</h2>
          </div>
        </header>
        <NotificationMatrix />
        <p className="sub muted">
          These fire immediately unless it&rsquo;s after quiet hours (10pm–6am), when everything except Warm-transfer holds until morning.
        </p>
      </section>

      {/* ---------- Team ---------- */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Team access</Kicker>
            <h2>Who can log in and see calls</h2>
          </div>
          <button className="cd-btn cd-primary">+ Invite</button>
        </header>
        <div className="team-list">
          {team.map((m) => (
            <div className="team-row" key={m.email}>
              <span className="feed-av" aria-hidden>
                {m.name
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <div className="team-body">
                <b>{m.name}</b>
                <span>{m.email}</span>
              </div>
              <span className="cf-badge" data-d={m.role === "Owner" ? "booked" : "message"}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Public holidays ---------- */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Public holidays</Kicker>
            <h2>Days Emma treats as after-hours automatically</h2>
          </div>
        </header>
        <ChipEditor values={holidays} onChange={setHolidays} placeholder="Add a holiday" />
      </section>

      {/* ---------- Trust & legal ---------- */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Trust &amp; legal</Kicker>
            <h2>The things Emma never does without asking</h2>
          </div>
        </header>
        <ul className="rules-list">
          <li><b>Never quotes.</b> Not even under pressure. Every job is captured for you to price.</li>
          <li><b>Discloses she&rsquo;s AI.</b> On by default, per the Australian Consumer Law.</li>
          <li><b>Records with consent.</b> Every call opens with a recording notice that satisfies all states.</li>
          <li><b>Never changes pricing, emergency rules, or blocked phrases.</b> Owner approval, always.</li>
          <li><b>Data lives in Sydney.</b> Australian residency by default; SOC 2 pending.</li>
        </ul>
        <div className="settings-danger">
          <div>
            <b>Delete your workspace</b>
            <span>Permanently removes all calls, transcripts, recordings and settings. This cannot be undone.</span>
          </div>
          <button className="cd-btn cd-ghost">Delete workspace</button>
        </div>
      </section>
    </>
  );
}
