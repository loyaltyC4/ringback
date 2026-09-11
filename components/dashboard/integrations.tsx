"use client";

import { useState } from "react";
import { Kicker } from "./primitives";

/* ============================================================
   INTEGRATIONS

   RingBack is only as useful as the tools it writes back into.
   Two groups: what's connected (with a live sync summary) and
   what's available. Logos are the same masked marks the
   marketing marquee uses, so no new assets. Connect / Disconnect
   flips state optimistically.
   ============================================================ */

type Integration = {
  slug: string;       // matches .logo-<slug> in logos.css
  name: string;
  category: string;
  blurb: string;
  /** what data moves, shown on connected cards */
  syncs: { dir: "in" | "out" | "both"; text: string }[];
  popular?: boolean;
};

const JOB_MGMT: Integration[] = [
  {
    slug: "servicem8",
    name: "ServiceM8",
    category: "Job management",
    blurb: "Emma writes every booking straight into ServiceM8 and reads your job history back to recognise repeat callers.",
    syncs: [
      { dir: "out", text: "New bookings → ServiceM8 jobs" },
      { dir: "in", text: "Job + client history → caller recognition" },
      { dir: "out", text: "Call summaries → job notes" },
    ],
    popular: true,
  },
  {
    slug: "simpro",
    name: "Simpro",
    category: "Job management",
    blurb: "Push captured leads and quote requests into Simpro as new enquiries, with the transcript attached.",
    syncs: [
      { dir: "out", text: "Leads → Simpro enquiries" },
      { dir: "out", text: "Transcript → enquiry attachment" },
    ],
  },
  {
    slug: "tradify",
    name: "Tradify",
    category: "Job management",
    blurb: "Create Tradify jobs from bookings and keep your schedule in sync both ways.",
    syncs: [
      { dir: "both", text: "Bookings ↔ Tradify schedule" },
      { dir: "out", text: "New enquiries → Tradify" },
    ],
  },
  {
    slug: "aroflo",
    name: "AroFlo",
    category: "Field service",
    blurb: "Send new work orders to AroFlo and pull technician availability for smarter booking.",
    syncs: [
      { dir: "out", text: "Bookings → AroFlo work orders" },
      { dir: "in", text: "Tech availability → booking slots" },
    ],
  },
];

const ACCOUNTING: Integration[] = [
  {
    slug: "xero",
    name: "Xero",
    category: "Accounting",
    blurb: "Match callers to Xero contacts and flag when a caller has an overdue invoice — so review requests skip them.",
    syncs: [
      { dir: "in", text: "Contacts → caller matching" },
      { dir: "in", text: "Invoice status → follow-up guardrails" },
    ],
    popular: true,
  },
  {
    slug: "myob",
    name: "MYOB",
    category: "Accounting",
    blurb: "Sync your MYOB contact list so Emma recognises existing customers by number.",
    syncs: [{ dir: "in", text: "Contacts → caller matching" }],
  },
];

const CALENDAR: Integration[] = [
  {
    slug: "google-calendar",
    name: "Google Calendar",
    category: "Calendar",
    blurb: "Emma books into your real calendar and never offers a slot you're already on a job for.",
    syncs: [
      { dir: "both", text: "Bookings ↔ your calendar" },
      { dir: "in", text: "Busy blocks → unavailable slots" },
    ],
    popular: true,
  },
  {
    slug: "outlook",
    name: "Outlook",
    category: "Calendar",
    blurb: "Two-way sync with your Outlook calendar and contacts.",
    syncs: [
      { dir: "both", text: "Bookings ↔ Outlook calendar" },
      { dir: "in", text: "Contacts → caller matching" },
    ],
  },
];

const ALL = [...JOB_MGMT, ...ACCOUNTING, ...CALENDAR];

/* which start connected (demo state) */
const INITIAL_CONNECTED = new Set(["servicem8", "google-calendar", "xero"]);

function DirIcon({ dir }: { dir: "in" | "out" | "both" }) {
  const path =
    dir === "in" ? "M12 5v14m0 0-5-5m5 5 5-5" :        // arrow down (into RingBack)
    dir === "out" ? "M12 19V5m0 0-5 5m5-5 5 5" :        // arrow up (out of RingBack)
    "M7 8h10m0 0-3-3m3 3-3 3M17 16H7m0 0 3-3m-3 3 3 3"; // both
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
      <path d={path} stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Card({
  it,
  connected,
  busy,
  onToggle,
}: {
  it: Integration;
  connected: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="intg-card" data-connected={connected || undefined}>
      <header className="intg-top">
        <span className={`intg-logo logo-${it.slug}`} role="img" aria-label={it.name} />
        {connected ? (
          <span className="intg-status">
            <span className="intg-status-dot" /> Connected
          </span>
        ) : it.popular ? (
          <span className="intg-pop">Popular</span>
        ) : null}
      </header>

      <div className="intg-body">
        <div className="intg-title">
          <b>{it.name}</b>
          <span className="intg-cat">{it.category}</span>
        </div>
        <p className="intg-blurb">{it.blurb}</p>
      </div>

      {connected && (
        <ul className="intg-syncs">
          {it.syncs.map((s) => (
            <li key={s.text} data-dir={s.dir}>
              <span className="intg-dir"><DirIcon dir={s.dir} /></span>
              {s.text}
            </li>
          ))}
        </ul>
      )}

      <footer className="intg-foot">
        {connected ? (
          <>
            <span className="intg-sync-note">Synced just now</span>
            <button className="cd-btn cd-ghost intg-disc" onClick={onToggle} disabled={busy}>
              {busy ? "Disconnecting…" : "Disconnect"}
            </button>
          </>
        ) : (
          <button className="cd-btn cd-primary intg-conn" onClick={onToggle} disabled={busy}>
            {busy ? "Connecting…" : "Connect"}
          </button>
        )}
      </footer>
    </article>
  );
}

function Group({
  title,
  kicker,
  items,
  connected,
  busy,
  toggle,
}: {
  title: string;
  kicker: string;
  items: Integration[];
  connected: Set<string>;
  busy: string | null;
  toggle: (slug: string) => void;
}) {
  return (
    <section className="intg-group">
      <header className="sec-h">
        <div>
          <Kicker>{kicker}</Kicker>
          <h2>{title}</h2>
        </div>
      </header>
      <div className="intg-grid">
        {items.map((it) => (
          <Card
            key={it.slug}
            it={it}
            connected={connected.has(it.slug)}
            busy={busy === it.slug}
            onToggle={() => toggle(it.slug)}
          />
        ))}
      </div>
    </section>
  );
}

export function Integrations() {
  const [connected, setConnected] = useState<Set<string>>(new Set(INITIAL_CONNECTED));
  const [busy, setBusy] = useState<string | null>(null);

  const toggle = (slug: string) => {
    setBusy(slug);
    window.setTimeout(() => {
      setConnected((prev) => {
        const next = new Set(prev);
        if (next.has(slug)) next.delete(slug);
        else next.add(slug);
        return next;
      });
      setBusy(null);
    }, 1100);
  };

  const count = connected.size;

  return (
    <>
      <header className="page-h">
        <div>
          <Kicker>Plugs into what you already run</Kicker>
          <h1 className="page-title">Integrations</h1>
        </div>
        <div className="pb-summary">
          <b>{count}</b> <span>connected · {ALL.length - count} available</span>
        </div>
      </header>

      <div className="intg-note-card">
        <span className="intg-note-ic">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M12 2 4 5v6c0 5 3.5 8 8 9.5 4.5-1.5 8-4.5 8-9.5V5l-8-3Z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
            <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p>
          Emma reads and writes only what each job needs — never your bank feeds or payroll. You can disconnect
          any tool in one click and every sync stops immediately. Data stays in Australia.
        </p>
      </div>

      <Group kicker="Bookings write straight back" title="Job management" items={JOB_MGMT} connected={connected} busy={busy} toggle={toggle} />
      <Group kicker="Know who's calling" title="Accounting &amp; contacts" items={ACCOUNTING} connected={connected} busy={busy} toggle={toggle} />
      <Group kicker="Never double-book" title="Calendar" items={CALENDAR} connected={connected} busy={busy} toggle={toggle} />

      <section className="intg-request">
        <div>
          <b>Run something else?</b>
          <span>Fergus, ServiceTitan, Google Sheets, a custom CRM — tell us and we&rsquo;ll wire it up. Most take a week.</span>
        </div>
        <button className="cd-btn">Request an integration</button>
      </section>
    </>
  );
}
