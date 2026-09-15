"use client";

import { useEffect, useMemo, useState } from "react";
import { PhoneGlyph } from "@/components/site-chrome";

/* ============================================================
   CLIP LIBRARY

   Two frames, two independent queues that crossfade every ~7s
   through cinematic vignettes of different AU trades. Same
   golden-hour outdoor register across every clip so the two
   frames always feel like the same film.
   ============================================================ */

const ROOF_MP4 =
  "https://pub.hyperagent.com/api/published/pbf01M23848X8_ZSSGC2DCJJ5YCNZW/on-the-roof.mp4";
const ROOF_POSTER =
  "https://pub.hyperagent.com/api/published/pbf01M23849PZ_8016520H92F13249/on-the-roof.jpg";
const WORK_MP4 =
  "https://pub.hyperagent.com/api/published/pbf01M238486G_R8J1KBD99D62XM25/to-work.mp4";
const WORK_POSTER =
  "https://pub.hyperagent.com/api/published/pbf01M23849EC_E7JYDK3G7XT5MEYQ/to-work.jpg";
const LANDSCAPER_MP4 =
  "https://pub.hyperagent.com/api/published/pbf01M2HZ52QN_JT75G2M6ZF6KM9RW/cc9356da-d793-4827-8b58-1bd77c5a4c7d.mp4";
const CARPENTER_MP4 =
  "https://pub.hyperagent.com/api/published/pbf01M2HZ54EH_XQ3WJQ9XCAEKA8WD/890c716d-cf87-4ac4-ba8f-cafefd9ea427.mp4";

type Clip = {
  mp4: string;
  poster?: string;
  label: string;                            // reason the phone isn't answerable
  aria: string;                             // accessible description
  chips?: readonly string[];                // for the small frame's chip overlay
  captions?: readonly ({ tone: "light" | "dark"; text: string } | null)[]; // for the tall frame
};

/** small frame — intimate / close, "hands-on-a-tool" shots */
const SMALL_QUEUE: Clip[] = [
  {
    mp4: ROOF_MP4,
    poster: ROOF_POSTER,
    label: "Up the ladder",
    aria: "A tradesperson working on a corrugated roof with a cordless drill",
    chips: [
      "Ringing · you’re up a ladder",
      "Answered in 1.8s",
      "Emergency triaged",
      "Availability checked",
      "Booked · Thu 2:15pm",
      "SMS confirmation sent",
    ],
  },
  {
    mp4: CARPENTER_MP4,
    label: "Nail gun’s going",
    aria: "A carpenter using a pneumatic nailer on a timber deck at dawn",
    chips: [
      "Ringing · nail gun’s going",
      "Answered in 1.8s",
      "Quote request logged",
      "Site address captured",
      "Booked · Wed 7am",
      "SMS confirmation sent",
    ],
  },
];

/** tall frame — wider / atmospheric, "in-motion" shots */
const TALL_QUEUE: Clip[] = [
  {
    mp4: WORK_MP4,
    poster: WORK_POSTER,
    label: "You’re on the way",
    aria: "A tradesperson walking to their work ute at sunrise",
    captions: [
      null,
      { tone: "light", text: "“G’day, you’ve reached Kedron Plumbing — this is Emma.”" },
      { tone: "dark", text: "“My hot water system’s just let go, there’s water everywhere.”" },
      { tone: "light", text: "“Is it still leaking, or have you got the water off at the mains?”" },
      { tone: "light", text: "“Dan can be there Thursday between 2 and 4 — I’ve held it for you.”" },
      null,
    ],
  },
  {
    mp4: LANDSCAPER_MP4,
    label: "Headphones on",
    aria: "A landscaper riding a commercial mower across a suburban lawn at golden hour",
    captions: [
      null,
      { tone: "light", text: "“G’day, you’ve reached Kedron Plumbing — this is Emma.”" },
      { tone: "dark", text: "“Yeah, the front lawn’s ruined and I need a quote.”" },
      { tone: "light", text: "“No worries — what suburb are you in?”" },
      { tone: "light", text: "“Dan’s free Friday morning — I’ve locked in 8:30 for a look.”" },
      null,
    ],
  },
];

/* ============================================================
   HOOKS
   ============================================================ */

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

/** slower cycler that rotates a frame through its clip queue */
function useCycler(len: number, intervalMs: number, initialDelayMs = 0) {
  const [i, setI] = useState(0);
  const [started, setStarted] = useState(initialDelayMs === 0);

  // stagger the first tick so the two frames don't swap in sync
  useEffect(() => {
    if (started) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setStarted(true), initialDelayMs);
    return () => window.clearTimeout(t);
  }, [started, initialDelayMs]);

  useEffect(() => {
    if (!started) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setI((v) => (v + 1) % len), intervalMs);
    return () => window.clearTimeout(t);
  }, [i, started, len, intervalMs]);

  return i;
}

/* ============================================================
   VOICE BAR — compact horizontal pill: caller id, waveform,
   one caption line. CTA lives outside so the bar stays small.
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

/**
 * Deterministic bar heights — a random() here would differ between the server
 * and client render. Three sines at incommensurate frequencies under a slow
 * envelope, so the line has loud and quiet passages instead of the even comb
 * a single sine produces.
 */
function useBars(n: number) {
  return useMemo(
    () =>
      Array.from({ length: n }, (_, k) => {
        const t = k / (n - 1);
        const envelope = 0.5 + 0.5 * Math.sin(t * Math.PI * 2.4 + 0.5);
        const coarse = 0.5 + 0.5 * Math.sin(k * 0.61);
        const mid = 0.5 + 0.5 * Math.sin(k * 2.399 + 1.7);
        const fine = 0.5 + 0.5 * Math.sin(k * 5.113 + 3.2);
        const raw =
          0.16 + (0.35 + 0.65 * envelope) * (0.5 * coarse + 0.32 * mid + 0.18 * fine);
        return {
          scale: Math.min(1, Math.max(0.13, raw * 1.28)),
          delay: ((k * 3) % 13) * 0.05,
          dur: 0.8 + ((k * 7) % 6) * 0.1,
        };
      }),
    [n],
  );
}

function VoiceBar({ beat, onHover }: { beat: number; onHover: (v: boolean) => void }) {
  const bars = useBars(40);
  const cap = CAPTIONS[beat];

  return (
    <div
      className="voicebar"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="vb-id">
        <span className="vb-dot" data-ringing={beat === 0 || undefined} />
        <span className="vb-name">Kedron Plumbing</span>
      </div>

      <div className="vb-wave" data-quiet={!cap.live || undefined} aria-hidden>
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

      <p className="vb-sub" data-done={cap.done || undefined} aria-live="polite">
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
  );
}

/* ============================================================
   CLIP STACK — every clip in a queue is mounted and looping;
   only the current one is visible via a CSS opacity crossfade.
   That way the transition is instant and buttery instead of a
   flash of white while the next file loads.
   ============================================================ */

function ClipStack({ queue, current }: { queue: Clip[]; current: number }) {
  return (
    <>
      {queue.map((clip, k) => (
        <video
          key={k}
          className="clip"
          data-on={k === current || undefined}
          src={clip.mp4}
          poster={clip.poster}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-label={clip.aria}
        />
      ))}
    </>
  );
}

/* ============================================================
   HERO
   ============================================================ */

export function Hero() {
  const { i, setPaused } = useBeat(CAPTIONS.length, 2900);

  // each frame runs on its own 7s rotation, offset so they never swap in sync
  const smallIdx = useCycler(SMALL_QUEUE.length, 7000, 3500);
  const tallIdx = useCycler(TALL_QUEUE.length, 7000, 0);

  const smallClip = SMALL_QUEUE[smallIdx];
  const tallClip = TALL_QUEUE[tallIdx];

  return (
    <header className="hero" id="top">
      <div className="hero-ghosts" aria-hidden>
        <i />
        <i />
        <i />
      </div>

      <div className="wrap hero-inner">
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

          {/* small frame — cycles through intimate close-up trade shots */}
          <figure className="hg hg-wide tile clip-stack">
            <ClipStack queue={SMALL_QUEUE} current={smallIdx} />
            <div className="vidchips" aria-hidden>
              {(smallClip.chips ?? []).map((c, k) => (
                <span className="vidchip" key={`${smallIdx}-${c}`} data-on={k === i || undefined}>
                  {c}
                </span>
              ))}
            </div>
            <figcaption className="clip-label">
              <span className="tick" />
              {smallClip.label}
            </figcaption>
          </figure>

          {/* centered stage — headline, compact voice bar, lede */}
          <div className="hg hg-say">
            <h1>
              <span className="wordpill">Every call</span>
              <span className="wordorb" aria-hidden>
                <PhoneGlyph />
              </span>
              <span className="plain">answered.</span>
            </h1>
            <div className="hero-voice-slot">
              <VoiceBar beat={i} onHover={setPaused} />
              <a className="btn btn-fill hero-cta" href="tel:+61340135000">
                <span>Ring it and listen</span>
                <span className="tic">✆</span>
              </a>
            </div>
            <p className="lede">
              The AI receptionist for Australian trades. It picks up in two seconds,
              books the job into your calendar, and{" "}
              <b>follows up so the quote doesn&rsquo;t go cold.</b>
            </p>
          </div>

          {/* tall frame — cycles through wider atmospheric trade shots */}
          <figure className="hg hg-tall tile clip-stack">
            <ClipStack queue={TALL_QUEUE} current={tallIdx} />
            <div className="vidcaps" aria-hidden>
              {(tallClip.captions ?? []).map((o, k) =>
                o ? (
                  <p
                    key={`${tallIdx}-${k}`}
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
              {tallClip.label}
            </figcaption>
          </figure>
        </div>
      </div>
    </header>
  );
}
