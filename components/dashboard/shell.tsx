"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Mark, Wave } from "@/components/start/primitives";

/* ============================================================
   THE SHELL

   Sidebar left, top bar with the living-agent status in the
   middle, notification tray + demo-user pill on the right.
   Sidebar collapses to a bottom bar on phones. This is the
   frame every /dashboard/* screen inherits.
   ============================================================ */

type NavItem = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => React.ReactElement;
  badge?: number;
};

/* ---------- glyphs (thin line, 1.6px stroke — dashboard style) ---------- */

function IcToday({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IcCalls({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.3c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.1 2.1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IcBookings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 10.5h17M8 3.5v4M16 3.5v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IcFollowups({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 12a8 8 0 1 1 3.5 6.6L4 20l1-3.4A8 8 0 0 1 4 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8.5 12h7M8.5 9.5h4M8.5 14.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IcAgent({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="9" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4.5 20a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IcValue({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 18l5-6 4 3 7-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcSettings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 13.7a1.6 1.6 0 0 0 .4 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.4 1.6 1.6 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .4-1.7 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.4-1.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.7.4 1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.4 1.7v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IcAnalytics({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 20V4M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="7.5" y="12" width="2.8" height="5" rx="0.8" fill="currentColor" />
      <rect x="12.6" y="8.5" width="2.8" height="8.5" rx="0.8" fill="currentColor" />
      <rect x="17.7" y="6" width="2.8" height="11" rx="0.8" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function IcBilling({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3.5" y="6.5" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IcBell({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 16v-4a6 6 0 1 1 12 0v4l1.5 2h-15L6 16Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: IcToday },
  { href: "/dashboard/calls", label: "Calls", icon: IcCalls, badge: 3 },
  { href: "/dashboard/bookings", label: "Bookings", icon: IcBookings },
  { href: "/dashboard/followups", label: "Follow-ups", icon: IcFollowups },
  { href: "/dashboard/agent", label: "My Agent", icon: IcAgent },
  { href: "/dashboard/value", label: "Value", icon: IcValue },
  { href: "/dashboard/analytics", label: "Analytics", icon: IcAnalytics },
  { href: "/dashboard/billing", label: "Billing", icon: IcBilling },
  { href: "/dashboard/settings", label: "Settings", icon: IcSettings },
];

/* ============================================================
   LIVING AGENT — the thin sentence that says what Emma is doing
   right now. Cycles through a handful of honest states rather
   than being a live socket. Green pulse when she's on a call,
   amber if there's an escalation waiting.
   ============================================================ */

type Live = { text: string; tone: "on-call" | "idle" | "escalation"; caller?: string };

const LIVE: Live[] = [
  { text: "On a call with a caller from Stafford", tone: "on-call", caller: "0412 884 317" },
  { text: "Waiting for the next call", tone: "idle" },
  { text: "Booking Sue Murphy into your calendar", tone: "on-call" },
  { text: "Warm-transferring a burst pipe to your mobile", tone: "escalation" },
  { text: "Waiting for the next call", tone: "idle" },
  { text: "Answered a caller in 1.6 seconds", tone: "on-call" },
];

function LivingAgent() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setI((v) => (v + 1) % LIVE.length), 4200);
    return () => window.clearTimeout(t);
  }, [i]);
  const l = LIVE[i];
  return (
    <div className="la" data-tone={l.tone} aria-live="polite">
      <span className="la-orb">
        <Wave bars={12} quiet={l.tone === "idle"} />
      </span>
      <span className="la-name">Emma</span>
      <span className="la-sep" aria-hidden />
      <span className="la-text">{l.text}</span>
      {l.tone === "on-call" && (
        <button className="la-listen" title="Listen in on the call">
          <span className="la-live-dot" />
          Listen live
        </button>
      )}
    </div>
  );
}

/* ============================================================
   NOTIFICATION TRAY
   Not a modal, not a page — a dropdown from the bell. Actions
   that need the owner's yes/no; nothing you can dismiss without
   deciding.
   ============================================================ */

type Notice = {
  kind: "escalation" | "gap" | "proposal";
  title: string;
  meta: string;
  cta: string;
};

const NOTICES: Notice[] = [
  {
    kind: "escalation",
    title: "Rachel Byrne — warm transfer didn't connect",
    meta: "7:31am · Emma left the caller with a callback slot",
    cta: "Listen back",
  },
  {
    kind: "gap",
    title: "Emma didn't know what a Rinnai continuous is",
    meta: "3 callers this week · propose a KB entry",
    cta: "Add to knowledge",
  },
  {
    kind: "proposal",
    title: "Add “blocked stormwater” to your emergency list?",
    meta: "Emma has flagged 2 borderline calls · your call",
    cta: "Review the rule",
  },
];

function NotificationTray({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  return (
    <div className="tray" data-open={open || undefined} ref={ref} role="dialog" aria-label="Notifications">
      <header className="tray-top">
        <h2>Waiting on you</h2>
        <span>{NOTICES.length}</span>
      </header>
      <div className="tray-list">
        {NOTICES.map((n) => (
          <div className="tray-row" key={n.title} data-kind={n.kind}>
            <span className="tray-tag">{
              n.kind === "escalation" ? "Escalation" :
              n.kind === "gap" ? "Knowledge gap" :
              "Rule proposal"
            }</span>
            <b>{n.title}</b>
            <span>{n.meta}</span>
            <button className="tray-cta">{n.cta} →</button>
          </div>
        ))}
      </div>
      <footer className="tray-foot">
        Emma never changes emergency rules, pricing, or blocked phrases without asking.
      </footer>
    </div>
  );
}

/* ============================================================
   SHELL
   ============================================================ */

export function DashShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname || "/dashboard";
  const [bell, setBell] = useState(false);

  return (
    <div className="dash">
      {/* ---------------- sidebar ---------------- */}
      <aside className="side" aria-label="Primary">
        <a className="side-brand" href="/">
          <Mark />
          RingBack
        </a>

        <nav className="side-nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            const on = item.href === active;
            return (
              <a key={item.href} href={item.href} className="side-item" data-on={on || undefined}>
                <Icon className="side-ic" />
                <span>{item.label}</span>
                {item.badge && <span className="side-badge">{item.badge}</span>}
              </a>
            );
          })}
        </nav>

        <a className="side-user" href="/dashboard/settings">
          <span className="side-av">DK</span>
          <div>
            <b>Dave Kelleher</b>
            <span>Kedron Plumbing</span>
          </div>
        </a>
      </aside>

      {/* ---------------- main column ---------------- */}
      <div className="main">
        <header className="top">
          <LivingAgent />
          <div className="top-right">
            <button
              className="bell"
              aria-label="Notifications"
              data-has={NOTICES.length > 0 || undefined}
              onClick={() => setBell((v) => !v)}
            >
              <IcBell />
              {NOTICES.length > 0 && <span className="bell-dot" />}
            </button>
            <NotificationTray open={bell} onClose={() => setBell(false)} />
          </div>
        </header>

        <main className="stage" id="dash-stage">{children}</main>
      </div>
    </div>
  );
}
