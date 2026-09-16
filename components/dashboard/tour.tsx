"use client";

import { useCallback, useEffect, useState } from "react";

/* ============================================================
   GUIDED TOUR

   A first-run walkthrough for someone who has never seen the
   product. One spotlight ring on the thing being talked about,
   one black dock at the bottom carrying the copy — the same
   hardware register as the marketing hero's voice bar.

   Steps span pages: advancing to a step on another route does a
   real navigation carrying ?tour=<n>, so the tour survives the
   page change instead of living inside one screen.
   ============================================================ */

type Step = {
  path: string;
  sel: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    path: "/dashboard",
    sel: ".hot",
    title: "The money, first",
    body:
      "Anything that is worth real revenue surfaces at the top of Today. Hot leads sit here until you have actually rung them back.",
  },
  {
    path: "/dashboard",
    sel: ".feed",
    title: "Every call, as it lands",
    body:
      "Emma answers, triages and books while you are on the tools. The feed is the receipt: who rang, what they wanted, what she did about it.",
  },
  {
    path: "/dashboard",
    sel: ".side-nav",
    title: "Eleven screens, one job",
    body:
      "Calls and bookings are the record. My Agent, Simulation and Settings are the controls. Value and Analytics are the proof.",
  },
  {
    path: "/dashboard/calls",
    sel: ".calls-list",
    title: "Listen to any call",
    body:
      "Open a call for the recording, the full transcript and the fields she pulled out of it. Nothing is summarised away from you.",
  },
  {
    path: "/dashboard/agent",
    sel: ".agent-hero",
    title: "She is yours to tune",
    body:
      "Pick her voice, edit her greeting, set what she will never quote. Change it here and the next caller hears it.",
  },
  {
    path: "/dashboard/simulation",
    sel: ".gate",
    title: "Prove it before you launch",
    body:
      "Twelve caller personas run against your rules, including the hard ones. Go-live stays locked until you have rung her yourself.",
  },
  {
    path: "/dashboard/value",
    sel: ".loss",
    title: "What the silence was costing",
    body:
      "Put your own numbers in. This is the page to open on the day you wonder whether she is worth keeping.",
  },
  {
    path: "/dashboard/billing",
    sel: ".bill-hero",
    title: "Seven days, no card",
    body:
      "Founding rate holds for three months. Cancel inside thirty days and you get your money back, no conversation required.",
  },
];

const KEY = "rb-tour-done";

function readParam(): number | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("tour");
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n < STEPS.length ? n : null;
}

export function Tour() {
  const [idx, setIdx] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [offer, setOffer] = useState(false);

  // pick the step up out of the URL on mount, or offer the tour to a first-timer
  useEffect(() => {
    const n = readParam();
    if (n !== null) {
      setIdx(n);
      return;
    }
    try {
      if (!window.localStorage.getItem(KEY)) setOffer(true);
    } catch {
      /* private mode — just don't offer */
    }
  }, []);

  const step = idx === null ? null : STEPS[idx];

  // measure the target, and keep the ring on it through resize
  useEffect(() => {
    if (!step) {
      setRect(null);
      return;
    }
    let raf = 0;
    const measure = () => {
      const el = document.querySelector(step.sel);
      if (!el) {
        setRect(null);
        return;
      }
      setRect(el.getBoundingClientRect());
    };
    const el = document.querySelector(step.sel);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    // let the smooth scroll settle before measuring
    const t = window.setTimeout(measure, 420);
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [step]);

  const close = useCallback(() => {
    setIdx(null);
    setOffer(false);
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    const u = new URL(window.location.href);
    u.searchParams.delete("tour");
    window.history.replaceState({}, "", u.toString());
  }, []);

  const goto = useCallback(
    (n: number) => {
      if (n < 0) return;
      if (n >= STEPS.length) {
        close();
        return;
      }
      const target = STEPS[n];
      if (target.path !== window.location.pathname) {
        window.location.assign(`${target.path}?tour=${n}`);
        return;
      }
      setIdx(n);
      const u = new URL(window.location.href);
      u.searchParams.set("tour", String(n));
      window.history.replaceState({}, "", u.toString());
    },
    [close],
  );

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") goto(idx + 1);
      if (e.key === "ArrowLeft") goto(idx - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, goto, close]);

  /* ---------------- the offer (first visit only) ---------------- */
  if (idx === null) {
    if (!offer) return null;
    return (
      <div className="tour-offer" role="dialog" aria-label="Guided tour">
        <div className="tour-offer-in">
          <span className="tour-kick">First time here</span>
          <p>
            Want the ninety-second version? Eight stops, the money screens first.
          </p>
          <div className="tour-offer-act">
            <button className="tour-btn tour-btn-fill" onClick={() => goto(0)}>
              Show me around
              <i aria-hidden>
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14m-6-6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </i>
            </button>
            <button className="tour-btn tour-btn-ghost" onClick={close}>
              I&rsquo;ll poke around myself
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- the running tour ---------------- */
  const s = STEPS[idx];
  return (
    <>
      {rect && (
        <div
          className="tour-ring"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          }}
          aria-hidden
        />
      )}

      <div className="tour-dock" role="dialog" aria-label={s.title}>
        <span className="tour-count">
          {String(idx + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
        </span>
        <div className="tour-copy">
          <b>{s.title}</b>
          <p>{s.body}</p>
        </div>
        <div className="tour-act">
          <button
            className="tour-nav"
            onClick={() => goto(idx - 1)}
            disabled={idx === 0}
            aria-label="Previous step"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M19 12H5m6 6-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className="tour-btn tour-btn-fill" onClick={() => goto(idx + 1)}>
            {idx === STEPS.length - 1 ? "Done" : "Next"}
            <i aria-hidden>
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </i>
          </button>
          <button className="tour-skip" onClick={close}>
            Skip
          </button>
        </div>
      </div>
    </>
  );
}

/** small top-bar affordance so the tour can be replayed any time */
export function TourButton() {
  return (
    <a className="tour-replay" href="/dashboard?tour=0">
      Take the tour
    </a>
  );
}
