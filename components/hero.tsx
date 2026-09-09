"use client";

import { useEffect, useState } from "react";
import { PhoneGlyph, useLoopVideo } from "@/components/site-chrome";

/* ============================================================
   AGENT WINDOW
   The second "frame" in the hero: while the tradie is on the roof,
   this is the agent working the call and putting the job in the diary.
   Six beats on a loop — ring, answer, caller, triage, booking, sent.
   ============================================================ */

type Beat = {
  ms: number;
  /** how many transcript turns are visible at this beat */
  turns: number;
  chips: string[];
  booked: boolean;
  status: string;
  timer: string;
};

const BEATS: Beat[] = [
  { ms: 1100, turns: 0, chips: [], booked: false, status: "Incoming call", timer: "00:00" },
  { ms: 2600, turns: 1, chips: [], booked: false, status: "Answering", timer: "00:02" },
  { ms: 2800, turns: 2, chips: ["urgency: emergency"], booked: false, status: "Listening", timer: "00:09" },
  { ms: 2800, turns: 3, chips: ["urgency: emergency", "water isolated ✓"], booked: false, status: "Triaging", timer: "00:17" },
  { ms: 2600, turns: 4, chips: ["urgency: emergency", "water isolated ✓", "Stafford · in area"], booked: false, status: "Checking diary", timer: "00:24" },
  { ms: 4200, turns: 4, chips: ["urgency: emergency", "water isolated ✓", "Stafford · in area"], booked: true, status: "Booked", timer: "00:31" },
];

/** how many turns stay on screen — older ones scroll away like a real transcript */
const VISIBLE_TURNS = 3;

const TURNS: { who: "agent" | "caller"; text: string }[] = [
  { who: "agent", text: "G'day, you've reached Kedron Plumbing — this is Emma. How can I help?" },
  { who: "caller", text: "My hot water system's just let go, there's water everywhere." },
  { who: "agent", text: "No worries. Is it still leaking, or have you got the water off at the mains?" },
  { who: "caller", text: "Off at the mains." },
];

function AgentWindow() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setI(BEATS.length - 1);
      return;
    }
    const t = window.setTimeout(
      () => setI((v) => (v + 1) % BEATS.length),
      BEATS[i].ms,
    );
    return () => window.clearTimeout(t);
  }, [i, paused]);

  const beat = BEATS[i];

  return (
    <div
      className="agentwin"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="aw-bar">
        <span className="aw-live" data-ringing={!beat.turns || undefined} />
        <span className="aw-who">Kedron Plumbing · booking line</span>
        <span className="aw-state">{beat.status}</span>
        <span className="aw-timer">{beat.timer}</span>
      </div>

      <div className="aw-body">
        <div className="aw-turns">
          {TURNS.map((t, k) => (
            <div
              key={k}
              className={`aw-turn ${t.who}`}
              data-on={
                (k < beat.turns && k >= beat.turns - VISIBLE_TURNS) || undefined
              }
            >
              <span className="aw-turn-who">{t.who === "agent" ? "Emma" : "Caller"}</span>
              <span className="aw-said">{t.text}</span>
            </div>
          ))}
        </div>

        <div className="aw-chips">
          {["urgency: emergency", "water isolated ✓", "Stafford · in area"].map((c) => (
            <span
              key={c}
              className={`aw-chip${c.startsWith("urgency") ? " amber" : ""}`}
              data-on={beat.chips.includes(c) || undefined}
            >
              {c}
            </span>
          ))}
        </div>

        <div className="aw-booked" data-on={beat.booked || undefined}>
          <div className="aw-booked-date">
            <b>10</b>
            <span>Thu</span>
          </div>
          <div className="aw-booked-meta">
            <b>HWS replacement — booked 2:15pm</b>
            <span>Held in your calendar · pushed to ServiceM8 · SMS sent</span>
          </div>
        </div>
      </div>

      <div className="aw-foot">
        <a className="btn btn-fill" href="tel:+61340135000">
          <span>Ring it and listen</span>
          <span className="tic">✆</span>
        </a>

      </div>
    </div>
  );
}

/* ============================================================
   HERO
   ============================================================ */

export function Hero() {
  const roofRef = useLoopVideo();
  const workRef = useLoopVideo();

  return (
    <header className="hero" id="top">
      <div className="hero-ghosts" aria-hidden>
        <i />
        <i />
        <i />
      </div>

      <div className="wrap hero-inner">
        {/* ---- the statement ---- */}
        <div className="hero-say">
          <h1>
            <span className="wordpill">Every call</span>
            <span className="wordorb" aria-hidden>
              <PhoneGlyph />
            </span>
            <span className="plain">answered.</span>
          </h1>
          <p className="lede">
            The AI receptionist for Australian trades. It picks up in two seconds,
            books the job into your calendar, and{" "}
            <b>follows up so the quote doesn&rsquo;t go cold.</b>
          </p>
        </div>

        {/* ---- the scatter ---- */}
        <div className="hero-grid">
          <div className="hg hg-stat">
            <div className="statpill">
              <b>2s</b>
              <span>to pick up.</span>
            </div>
          </div>

          <div className="hg hg-claim">
            <div className="claimpill">
              Answers in your business name — day, night, Sunday arvo.
            </div>
          </div>

          {/* frame one: heading out to the next job (portrait clip, tall frame) */}
          <figure className="hg hg-tall tile">
            <video
              ref={workRef}
              src="https://pub.hyperagent.com/api/published/pbf01M238486G_R8J1KBD99D62XM25/to-work.mp4"
              poster="https://pub.hyperagent.com/api/published/pbf01M23849EC_E7JYDK3G7XT5MEYQ/to-work.jpg"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              aria-label="A tradesperson walking to their work ute at sunrise"
            />
            <figcaption>
              <span className="tick" />
              You&rsquo;re on the way
            </figcaption>
          </figure>

          {/* frame two: hands full on the roof (landscape clip, wide frame) */}
          <figure className="hg hg-wide tile">
            <video
              ref={roofRef}
              src="https://pub.hyperagent.com/api/published/pbf01M23848X8_ZSSGC2DCJJ5YCNZW/on-the-roof.mp4"
              poster="https://pub.hyperagent.com/api/published/pbf01M23849PZ_8016520H92F13249/on-the-roof.jpg"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              aria-label="A tradesperson working on a roof with a cordless drill"
            />
            <figcaption>
              <span className="tick" />
              You&rsquo;re on the roof
            </figcaption>
          </figure>

          {/* frame three: the agent is booking the job */}
          <div className="hg hg-agent">
            <AgentWindow />
          </div>
        </div>
      </div>
    </header>
  );
}
