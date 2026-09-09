"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   STREAMING TEXT
   The agent's lines arrive word by word rather than pasting in
   whole. Words, not characters — character-by-character reads as
   a gimmick at this length and reflows the line constantly.
   ============================================================ */

export function Streaming({
  text,
  speed = 34,
  onDone,
  className,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
  className?: string;
}) {
  const words = text.split(" ");
  const [n, setN] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    setN(0);
    done.current = false;
  }, [text]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(words.length);
      if (!done.current) {
        done.current = true;
        onDone?.();
      }
      return;
    }
    if (n >= words.length) {
      if (!done.current) {
        done.current = true;
        onDone?.();
      }
      return;
    }
    const t = window.setTimeout(() => setN((v) => v + 1), speed);
    return () => window.clearTimeout(t);
  }, [n, words.length, speed, onDone]);

  return (
    <p className={className}>
      {words.slice(0, n).join(" ")}
      {n < words.length && <i className="caret" aria-hidden />}
    </p>
  );
}

/* ============================================================
   SHIMMER — for "the machine is working" status lines
   ============================================================ */

export function Shimmer({ children }: { children: React.ReactNode }) {
  return <span className="shimmer">{children}</span>;
}

/* ============================================================
   SHARED CHROME
   ============================================================ */

export const STAGES = [
  { id: "business", label: "Business" },
  { id: "learn", label: "Learn" },
  { id: "interview", label: "Interview" },
  { id: "hear", label: "Hear it" },
  { id: "rehearsal", label: "Rehearsal" },
  { id: "live", label: "Go live" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

export function StepNav({
  active,
  furthest,
  onJump,
}: {
  active: StageId;
  furthest: number;
  onJump: (i: number) => void;
}) {
  const activeIndex = STAGES.findIndex((s) => s.id === active);
  return (
    <nav className="stepnav" aria-label="Setup progress">
      {STAGES.map((s, i) => {
        const state = i < activeIndex ? "done" : i === activeIndex ? "on" : "todo";
        return (
          <button
            key={s.id}
            className="stepnav-item"
            data-state={state}
            disabled={i > furthest}
            onClick={() => onJump(i)}
            aria-current={state === "on" ? "step" : undefined}
          >
            <span className="sn-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="sn-label">{s.label}</span>
            {state === "done" && (
              <svg className="sn-tick" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="m5 13 4.5 4.5L19 7"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {state === "on" && <span className="sn-dot" aria-hidden />}
          </button>
        );
      })}
    </nav>
  );
}

/* the mark, reused from the marketing site */
export function Mark() {
  return (
    <span className="mk" aria-hidden>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.3c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.1 2.1z" />
      </svg>
    </span>
  );
}

export function Tick({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m5 13 4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Mic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================
   LIVE WAVEFORM — smaller sibling of the marketing-site one
   ============================================================ */

export function Wave({ bars = 28, quiet }: { bars?: number; quiet?: boolean }) {
  const set = Array.from({ length: bars }, (_, k) => {
    const t = k / (bars - 1);
    const env = 0.5 + 0.5 * Math.sin(t * Math.PI * 2.2 + 0.4);
    const a = 0.5 + 0.5 * Math.sin(k * 0.63);
    const b = 0.5 + 0.5 * Math.sin(k * 2.41 + 1.3);
    return {
      s: Math.min(1, Math.max(0.16, (0.2 + (0.4 + 0.6 * env) * (0.6 * a + 0.4 * b)) * 1.3)),
      d: ((k * 3) % 11) * 0.05,
      u: 0.75 + ((k * 5) % 5) * 0.1,
    };
  });
  return (
    <span className="miniwave" data-quiet={quiet || undefined} aria-hidden>
      {set.map((b, k) => (
        <i
          key={k}
          style={{
            ["--s" as string]: b.s,
            animationDelay: `${b.d}s`,
            animationDuration: `${b.u}s`,
          }}
        />
      ))}
    </span>
  );
}
