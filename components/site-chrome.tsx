"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   shared bits
   ============================================================ */

export function PhoneGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.3c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.1 2.1z" />
    </svg>
  );
}

export function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2l1.9 5.6L19.5 9l-4.4 3.6 1.5 5.7L12 15.2 7.4 18.3l1.5-5.7L4.5 9l5.6-1.4z" />
    </svg>
  );
}

export function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m8 12.5 2.5 2.5L16 9"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** scroll-reveal — one observer for every .rv on the page */
export function useReveals() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".rv"));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -5% 0px" },
    );
    els.forEach((el) => io.observe(el));

    // never leave content hidden if something goes wrong
    const safety = window.setTimeout(() => {
      els.forEach((el) => el.classList.add("in"));
    }, 6000);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);
}

/* ============================================================
   NAV — fluid island
   ============================================================ */

const LINKS = [
  { href: "#stages", label: "How it works" },
  { href: "#followups", label: "Follow-ups" },
  { href: "#security", label: "Security" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav className="nav" data-scrolled={scrolled || undefined}>
        {/* two islands rather than one bar: navigation on the left, account
            and the call to action on the right */}
        <div className="nav-in nav-left">
          <a href="#top" className="brand" aria-label="RingBack home">
            <span className="mk">
              <PhoneGlyph />
            </span>
            RingBack
          </a>
          <span className="nav-rule" aria-hidden />
          <div className="nlinks">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="nav-in nav-right">
          <a className="nav-signin" href="/dashboard">
            Sign in
          </a>
          {/* primary CTA is signup, not the demo call — the demo lives in the hero */}
          <a className="btn btn-fill btn-sm" href="/start">
            <span>Start free</span>
            <span className="tic">↗</span>
          </a>
        </div>

        <button
          className="burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          data-open={open || undefined}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </nav>

      <div className="sheet" data-open={open || undefined}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a href="/start" onClick={() => setOpen(false)}>
          Start free ↗
        </a>
        <a href="/dashboard" onClick={() => setOpen(false)}>
          Sign in
        </a>
        <a href="tel:+61340135000" onClick={() => setOpen(false)}>
          Ring the demo line ✆
        </a>
      </div>
    </>
  );
}

/* ============================================================
   INTEGRATION MARQUEE
   ============================================================ */

/** logo art is inlined in app/logos.css as `.logo-<slug>` custom properties */
const TOOLS = [
  { slug: "servicem8", name: "ServiceM8", w: 104 },
  { slug: "simpro", name: "Simpro", w: 92 },
  { slug: "tradify", name: "Tradify", w: 86 },
  { slug: "aroflo", name: "AroFlo", w: 82 },
  { slug: "xero", name: "Xero", w: 66 },
  { slug: "myob", name: "MYOB", w: 74 },
  { slug: "google-calendar", name: "Google Calendar", w: 84 },
  { slug: "outlook", name: "Outlook", w: 88 },
];

export function IntegrationStrip() {
  return (
    <section className="strip">
      {/* label left, moving marks right — single row keeps the whole strip
          shallow enough to sit inside the first viewport */}
      <div className="strip-row wrap">
        <span className="kick">
          <span className="bar" />
          Plugs into what you already run
        </span>
        <div className="marquee" aria-hidden>
          <div className="marquee-track">
            {[0, 1].map((copy) => (
              <div className="marquee-group" key={copy}>
                {TOOLS.map((t) => (
                  <span
                    className={`brandmark logo-${t.slug}`}
                    key={`${copy}-${t.slug}`}
                    style={{ width: t.w }}
                    title={t.name}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">
        Integrates with {TOOLS.map((t) => t.name).join(", ")}.
      </span>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="f-top">
          <div className="f-brand">
            <a href="#top" className="brand">
              <span className="mk">
                <PhoneGlyph />
              </span>
              RingBack
            </a>
            <p>
              The AI receptionist for Australian trades. Every call answered, every job
              booked, every quote followed up.
            </p>
          </div>
          <div className="f-cols">
            <div className="f-col">
              <h5>Product</h5>
              <a href="#stages">How it works</a>
              <a href="#followups">Follow-ups</a>
              <a href="#security">Security &amp; privacy</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="f-col">
              <h5>Try it</h5>
              <a href="/start">Start free trial</a>
              <a href="tel:+61340135000">Ring the demo line</a>
              <a href="/dashboard">Demo dashboard</a>
            </div>
            <div className="f-col">
              <h5>Integrations</h5>
              <a href="#stages">ServiceM8</a>
              <a href="#stages">simPRO</a>
              <a href="#stages">Xero</a>
            </div>
          </div>
        </div>
        <div className="f-bot">
          <span>© {new Date().getFullYear()} RingBack</span>
          <span>Brisbane, Australia</span>
        </div>
      </div>
    </footer>
  );
}

/** tiny helper for the video tiles: pause offscreen, respect reduced motion */
export function useLoopVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.removeAttribute("autoplay");
      v.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return ref;
}
