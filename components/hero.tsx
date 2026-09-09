"use client";

import { useEffect, useMemo, useState } from "react";
import { PhoneGlyph, useLoopVideo } from "@/components/site-chrome";

const ROOF_MP4 =
  "https://pub.hyperagent.com/api/published/pbf01M23848X8_ZSSGC2DCJJ5YCNZW/on-the-roof.mp4";
const ROOF_POSTER =
  "https://pub.hyperagent.com/api/published/pbf01M23849PZ_8016520H92F13249/on-the-roof.jpg";
const WORK_MP4 =
  "https://pub.hyperagent.com/api/published/pbf01M238486G_R8J1KBD99D62XM25/to-work.mp4";
const WORK_POSTER =
  "https://pub.hyperagent.com/api/published/pbf01M23849EC_E7JYDK3G7XT5MEYQ/to-work.jpg";

/** one shared clock so the card, the captions and the chips stay in step */
function useBeat(count: number, ms: number) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setI((v) => (v + 1) % count), ms);
    return () => window.clearTimeout(t);
  }, [i, paused, count, ms]);

  return { i, setPaused };
}

/* ============================================================
   VOICE CARD
   Deliberately not a chat window. A waveform, one subtitle line,
   and the call to action — the rest is whitespace.
   ============================================================ */

type Cap = { text: string; live: boolean; done?: boolean };

const CAPTIONS: Cap[] = [
  { text: "Ringing…", live: false },
  { text: "“G’day, you’ve reached Kedron Plumbing.”", live: true },
  { text: "“My hot water system’s just let go.”", live: true },
  { text: "Emergency · water off at the mains", live: true },
  { text: "All booked — Thursday, 2:15pm", live: false, done: true },
  { text: "Details texted to Dave", live: false, done: true },
];

/** deterministic bar heights — a random() here would differ server vs client */
function useBars(n: number) {
  return useMemo(
    () =>
      Array.from({ length: n }, (_, k) => {
        const a = Math.sin(k * 0.7) * 0.5 + 0.5;
        const b = Math.sin(k * 1.9 + 1.1) * 0.5 + 0.5;
        return {
          scale: 0.22 + a * 0.55 + b * 0.23,
          delay: (k % 11) * 0.055,
          dur: 0.85 + ((k * 7) % 5) * 0.11,
        };
      }),
    [n],
  );
}

function VoiceCard({ beat, onHover }: { beat: number; onHover: (v: boolean) => void }) {
  const bars = useBars(44);
  const cap = CAPTIONS[beat];

  return (
    <div
      className="voicecard"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="vc-top">
        <span className="vc-dot" data-ringing={beat === 0 || undefined} />
        <span>Kedron Plumbing</span>
        <span className="vc-num">(07) 3000 4182</span>
      </div>

      <div className="vc-stage">
        <div className="vc-wave" data-quiet={!cap.live || undefined} aria-hidden>
          {bars.map((b, k) => (
            <i
              key={k}
              style={{
                ["--s" as string]: b.scale,
                animationDelay: `${b.delay}s`,
                animationDuration: `${b.dur}s`,
              }}
            />
          ))}
        </div>

        <p className="vc-sub" data-done={cap.done || undefined} aria-live="polite">
          {cap.done && (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="m8 12.5 2.5 2.5L16 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {cap.text}
        </p>
      </div>

      <a className="btn btn-fill" href="tel:+61340135000">
        <span>Ring it and listen</span>
        <span className="tic">✆</span>
      </a>
    </div>
  );
}

/* ============================================================
   HERO
   ============================================================ */

/** the conversation now lives over the footage, one line at a time */
const OVER_VIDEO = [
  null,
  { tone: "light", text: "“G’day, you’ve reached Kedron Plumbing — this is Emma.”" },
  { tone: "dark", text: "“My hot water system’s just let go, there’s water everywhere.”" },
  { tone: "light", text: "“Is it still leaking, or have you got the water off at the mains?”" },
  { tone: "light", text: "“Dan can be there Thursday between 2 and 4 — I’ve held it for you.”" },
  null,
] as const;

const ROOF_CHIPS = [
  "Ringing · you’re up a ladder",
  "Answered in 1.8s",
  "Emergency triaged",
  "Availability checked",
  "Booked · Thu 2:15pm",
  "SMS confirmation sent",
];

export function Hero() {
  const roofRef = useLoopVideo();
  const workRef = useLoopVideo();
  const { i, setPaused } = useBeat(CAPTIONS.length, 2900);
  const over = OVER_VIDEO[i];

  return (
    <header className="hero" id="top">
      <div className="hero-ghosts" aria-hidden>
        <i />
        <i />
        <i />
      </div>

      <div className="wrap hero-inner">
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

          {/* the big frame: you're driving to the next job, it's handling the call */}
          <figure className="hg hg-tall tile">
            <video
              ref={workRef}
              src={WORK_MP4}
              poster={WORK_POSTER}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              aria-label="A tradesperson walking to their work ute at sunrise"
            />
            <div className="vidcaps" aria-hidden>
              {OVER_VIDEO.map((o, k) =>
                o ? (
                  <p
                    key={k}
                    className={`vidcap ${o.tone}`}
                    data-on={k === i || undefined}
                  >
                    {o.text}
                  </p>
                ) : null,
              )}
            </div>
            <figcaption>
              <span className="tick" />
              You&rsquo;re on the way
            </figcaption>
          </figure>

          {/* the small frame: hands full on the roof */}
          <figure className="hg hg-wide tile">
            <video
              ref={roofRef}
              src={ROOF_MP4}
              poster={ROOF_POSTER}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              aria-label="A tradesperson working on a roof with a cordless drill"
            />
            <div className="vidchips" aria-hidden>
              {ROOF_CHIPS.map((c, k) => (
                <span className="vidchip" key={c} data-on={k === i || undefined}>
                  {c}
                </span>
              ))}
            </div>
          </figure>

          <div className="hg hg-voice">
            <VoiceCard beat={i} onHover={setPaused} />
          </div>
        </div>
      </div>
    </header>
  );
}
