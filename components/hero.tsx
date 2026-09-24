"use client";

import { useEffect, useMemo, useState } from "react";
import { PhoneGlyph } from "@/components/site-chrome";

/* ============================================================
   CLIP LIBRARY

   Two frames, two independent queues that crossfade every ~7s
   through cinematic vignettes of South African hospitality.
   Same golden-hour register across every frame so the two
   always feel like the same film. Stills for launch; video
   swaps in later via the same mp4 field.
   ============================================================ */

const SAFARI_IMG =
  "https://hyperagent.com/api/files/usergenerated/threads/cmufjzk280fbs06ad76ocdjtu/images/d318eb03-8848-4e52-8937-a56c7c8801bc.png";
const BREAKFAST_IMG =
  "https://hyperagent.com/api/files/usergenerated/threads/cmufjzk280fbs06ad76ocdjtu/images/4b888970-7912-486c-a313-023fa5702d91.png";
const LUGGAGE_IMG =
  "https://hyperagent.com/api/files/usergenerated/threads/cmufjzk280fbs06ad76ocdjtu/images/64698c35-7cea-4fd1-8c0c-fd1b0621d6fc.png";
const TURNDOWN_IMG =
  "https://hyperagent.com/api/files/usergenerated/threads/cmufjzk280fbs06ad76ocdjtu/images/8c388d8b-c1b0-4948-b268-c8c8937f2215.png";

type Clip = {
  mp4: string;
  poster?: string;
  label: string;                            // reason the phone isn't answerable
  aria: string;                             // accessible description
  chips?: readonly string[];                // for the small frame's chip overlay
  captions?: readonly ({ tone: "light" | "dark"; text: string } | null)[]; // for the tall frame
};

/** small frame - intimate / close, "hands-full" shots */
const SMALL_QUEUE: Clip[] = [
  {
    mp4: SAFARI_IMG,
    poster: SAFARI_IMG,
    label: "You’re mid-safari",
    aria: "A safari guide driving guests at sunrise, his phone face-down on the dashboard",
    chips: [
      "Ringing · you’re on a game drive",
      "Answered in 1.8s",
      "Dates checked",
      "Courtyard Room held",
      "Booked · Fri to Sun",
      "WhatsApp confirmation sent",
    ],
  },
  {
    mp4: BREAKFAST_IMG,
    poster: BREAKFAST_IMG,
    label: "Breakfast service",
    aria: "A lodge hostess plating breakfast while the office phone rings in the background",
    chips: [
      "Ringing · breakfast is out",
      "Answered in 1.8s",
      "Enquiry logged",
      "Rates quoted",
      "Booked · 2 nights",
      "Deposit link sent",
    ],
  },
];

/** tall frame - wider / atmospheric, "in-motion" shots */
const TALL_QUEUE: Clip[] = [
  {
    mp4: LUGGAGE_IMG,
    poster: LUGGAGE_IMG,
    label: "You’re carrying bags",
    aria: "A guest house owner carrying luggage up whitewashed steps in Franschhoek at golden hour",
    captions: [
      null,
      { tone: "light", text: "“Good evening, you’ve reached Riverstone Lodge - this is Emma.”" },
      { tone: "dark", text: "“Hi - do you have anything for two nights, this weekend?”" },
      { tone: "light", text: "“Checking the calendar… yes, the Courtyard Room is free.”" },
      { tone: "light", text: "“Booked - Friday to Sunday, R3,400. Deposit link sent.”" },
      null,
    ],
  },
  {
    mp4: TURNDOWN_IMG,
    poster: TURNDOWN_IMG,
    label: "Checkout’s at 10, check-in’s at 2",
    aria: "A housekeeper turning down a boutique hotel room between guests",
    captions: [
      null,
      { tone: "light", text: "“Good evening, you’ve reached Riverstone Lodge - this is Emma.”" },
      { tone: "dark", text: "“We’re driving through tomorrow - any chance of a room?”" },
      { tone: "light", text: "“Of course - one night, king bed, R1,650.”" },
      { tone: "light", text: "“All booked. I’ve WhatsApped the directions and gate code.”" },
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
   VOICE BAR - compact horizontal pill: caller id, waveform,
   one caption line. CTA lives outside so the bar stays small.
   ============================================================ */

type Cap = { text: string; live: boolean; done?: boolean };

const CAPTIONS: Cap[] = [
  { text: "Ringing…", live: false },
  { text: "“Good evening, you’ve reached Riverstone Lodge.”", live: true },
  { text: "“Do you have a room for this weekend?”", live: true },
  { text: "Courtyard Room · Fri to Sun · R3,400", live: true },
  { text: "All booked - deposit link sent", live: false, done: true },
  { text: "Details WhatsApped to Thandi", live: false, done: true },
];

/**
 * Deterministic bar heights - a random() here would differ between the server
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
  const bars = useBars(34);
  const cap = CAPTIONS[beat];

  return (
    <div
      className="voicebar"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
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

      <div className="vb-stage">
        <span className="vb-id">
          <span className="vb-dot" data-ringing={beat === 0 || undefined} />
          Riverstone Lodge
        </span>
        <p className="vb-sub" data-done={cap.done || undefined} aria-live="polite">
          {cap.text}
        </p>
      </div>

      <a className="vb-cta" href="tel:+61242636501">
        <span>Ring the live demo</span>
        <i aria-hidden>
          <PhoneGlyph />
        </i>
      </a>
    </div>
  );
}

/* ============================================================
   CLIP STACK - every clip in a queue is mounted and looping;
   only the current one is visible via a CSS opacity crossfade.
   That way the transition is instant and buttery instead of a
   flash of white while the next file loads.
   ============================================================ */

function ClipStack({ queue, current }: { queue: Clip[]; current: number }) {
  return (
    <>
      {queue.map((clip, k) =>
        // Stills phase: mp4 holds an image URL until the video clips are cut.
        clip.mp4.match(/\.(png|jpe?g|webp)(\?|$)/) ? (
          <img
            key={k}
            className="clip"
            data-on={k === current || undefined}
            src={clip.mp4}
            alt={clip.aria}
          />
        ) : (
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
        ),
      )}
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
      {/* decorative hairline shapes filling the four corners, so the scatter
          breathes into the whole viewport without feeling empty */}
      <div className="hero-ghosts" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="wrap hero-inner">
        <div className="hero-scatter">
          {/* headline pill + phone orb, centred at the top of the field */}
          <h1 className="hg-head">
            <span className="wordpill">Every call</span>
            <span className="wordorb" aria-hidden>
              <PhoneGlyph />
            </span>
            <span className="plain">answered.</span>
          </h1>

          {/* wide stat pill, left */}
          <div className="hg-stat">
            <div className="statpill">
              <b>2s</b>
              <span>to pick up, every time.</span>
            </div>
          </div>

          {/* outlined claim pill, centre */}
          <div className="hg-claim">
            <p className="claimpill">
              Answers in your business name, day or night, weekends too.
            </p>
          </div>

          {/* tall clip, right edge */}
          <figure className="hg-tall tile clip-stack">
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

          {/* small clip, lower left */}
          <figure className="hg-small tile clip-stack">
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

          {/* the interactive centrepiece: lede + sleek black voice bar with CTA */}
          <div className="hg-card">
            <p className="lede">
              The AI receptionist for South African guest houses, lodges and B&amp;Bs. Picks up in two seconds, books
              the room, and <b>follows up so the enquiry doesn&rsquo;t go cold.</b>
            </p>
            <VoiceBar beat={i} onHover={setPaused} />
          </div>
        </div>
      </div>
    </header>
  );
}
