"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShaderBackground } from "@/components/shader-background";
import { GREEN_MESH } from "@/lib/shaders";
import { PhoneGlyph, Spark, useLoopVideo } from "@/components/site-chrome";

/* ============================================================
   The below-the-hero rail: one full-height section that stays put
   while the five stages of a single call advance under the cursor.
   ============================================================ */

type Media =
  | { kind: "video"; src: string; poster: string; alt: string }
  | { kind: "mesh" };

type Bubble = { tone: "light" | "dark"; det: string; say: string; at: "b1" | "b2" };
type Card = { at: "m1" | "m2"; label: string; value: string; sub: string };

type Stage = {
  label: string;
  head: string;
  headGreen: string;
  body: string;
  caps: string[];
  media: Media;
  bubbles?: Bubble[];
  chips?: { text: string; amber?: boolean }[];
  cards?: Card[];
};

const STAGES: Stage[] = [
  {
    label: "Answer",
    head: "Answered",
    headGreen: "in two seconds.",
    body: "First ring, every ring. Day, night, weekend, public holiday. It answers in your business name and talks like a person — not a phone tree with nine options.",
    caps: ["First-ring pickup", "Natural speech", "Your business name", "Spam screening"],
    media: {
      kind: "video",
      src: "https://pub.hyperagent.com/api/published/pbf01M23848X8_ZSSGC2DCJJ5YCNZW/on-the-roof.mp4",
      poster: "https://pub.hyperagent.com/api/published/pbf01M23849PZ_8016520H92F13249/on-the-roof.jpg",
      alt: "A tradesperson on a roof, hands full, unable to answer the phone",
    },
    bubbles: [
      {
        tone: "light",
        at: "b1",
        det: "Picked up in 1.8 seconds",
        say: "“G'day, you've reached Kedron Plumbing — this is Emma. How can I help?”",
      },
      {
        tone: "dark",
        at: "b2",
        det: "Caller · 0412 884 317",
        say: "“Yeah hi — my hot water system's just let go, there's water everywhere.”",
      },
    ],
  },
  {
    label: "Qualify",
    head: "Qualified",
    headGreen: "before you call back.",
    body: "It asks what you'd ask — what's happened, is it still leaking, which suburb, is this a repeat customer — and works out whether it's an emergency or a booking.",
    caps: ["Urgency triage", "Service-area check", "Job-type detection", "Repeat-caller memory"],
    media: { kind: "mesh" },
    bubbles: [
      {
        tone: "light",
        at: "b1",
        det: "Checking whether it's containable",
        say: "“Is it still leaking right now, or have you got the water off at the mains?”",
      },
      {
        tone: "dark",
        at: "b2",
        det: "Repeat customer · 3rd job",
        say: "“I've turned it off at the mains. Same unit you looked at last winter.”",
      },
    ],
    chips: [
      { text: "urgency: emergency", amber: true },
      { text: "water isolated ✓" },
      { text: "Stafford · in area" },
    ],
  },
  {
    label: "Book",
    head: "Booked",
    headGreen: "into your real calendar.",
    body: "Not a message asking you to ring back. It reads your actual availability, offers a window that works, holds the slot, and pushes the job into your software.",
    caps: ["Live availability", "Calendar hold", "ServiceM8 push", "SMS confirmation"],
    media: {
      kind: "video",
      src: "https://pub.hyperagent.com/api/published/pbf01M238486G_R8J1KBD99D62XM25/to-work.mp4",
      poster: "https://pub.hyperagent.com/api/published/pbf01M23849EC_E7JYDK3G7XT5MEYQ/to-work.jpg",
      alt: "A tradesperson heading out to the next job at sunrise",
    },
    cards: [
      {
        at: "m1",
        label: "Held in calendar",
        value: "Thu 2:15pm",
        sub: "2-hour window · Stafford",
      },
      {
        at: "m2",
        label: "Pushed to ServiceM8",
        value: "Job #4182",
        sub: "HWS replacement · emergency",
      },
    ],
  },
  {
    label: "Notify",
    head: "On your phone",
    headGreen: "before you're off the ladder.",
    body: "Every call arrives as a transcript and a two-line summary. Anything genuinely urgent rings your mobile with the context already captured, so nobody repeats themselves.",
    caps: ["Two-line summary", "Warm live transfer", "Full transcript", "Emergency escalation"],
    media: { kind: "mesh" },
    bubbles: [
      {
        tone: "light",
        at: "b1",
        det: "Sent to you · 4:41pm",
        say: "Sue Murphy, Stafford. HWS failed, water isolated. Booked Thu 2:15pm. Repeat customer — same unit as last winter.",
      },
    ],
    chips: [
      { text: "3 calls handled" },
      { text: "1 transferred to you" },
      { text: "1 robocall blocked" },
    ],
  },
  {
    label: "Follow up",
    head: "Followed up",
    headGreen: "so quotes don't go cold.",
    body: "Most jobs aren't lost on the call — they're lost in the fortnight after it. RingBack chases the quote you sent, the customer who never rebooked, and the review you never got round to asking for.",
    caps: ["Quote chase", "No-show rescue", "Win-back", "Review request"],
    media: { kind: "mesh" },
    bubbles: [
      {
        tone: "light",
        at: "b1",
        det: "Day 3 after the quote",
        say: "“Hi Jim — Emma from Kedron Plumbing. Just checking you got the quote for the bathroom rough-in. Want me to pencil in a start date?”",
      },
      {
        tone: "dark",
        at: "b2",
        det: "Jim replied in 4 minutes",
        say: "“Yeah go on then — can you do the week after next?”",
      },
    ],
  },
];

function StageMedia({ stage }: { stage: Stage }) {
  const videoRef = useLoopVideo();

  return (
    <figure className="rs-media">
      <span className="shim" aria-hidden />
      <div className={`frame${stage.media.kind === "video" ? " photo" : ""}`}>
        {stage.media.kind === "video" ? (
          <video
            ref={videoRef}
            src={stage.media.src}
            poster={stage.media.poster}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            aria-label={stage.media.alt}
          />
        ) : (
          <ShaderBackground className="absolute inset-0" uniforms={GREEN_MESH} />
        )}
      </div>

      {stage.bubbles && (
        <div className="bubs">
          {stage.bubbles.map((b) => (
            <div className={`bub ${b.tone} ${b.at}`} key={b.det}>
              <span className="det">
                <Spark />
                {b.det}
              </span>
              <p className="say">{b.say}</p>
            </div>
          ))}
        </div>
      )}

      {stage.cards && (
        <div className="mcards">
          {stage.cards.map((c) => (
            <div className={`mcard ${c.at}`} key={c.label}>
              <span className="l">
                <i className="tick" />
                {c.label}
              </span>
              <span className="v">{c.value}</span>
              <span className="s">{c.sub}</span>
            </div>
          ))}
        </div>
      )}

      {stage.chips && (
        <div className="bubchips">
          {stage.chips.map((c) => (
            <span className={`bchip${c.amber ? " amber" : ""}`} key={c.text}>
              {c.text}
            </span>
          ))}
        </div>
      )}
    </figure>
  );
}

export function StageRail() {
  const railRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [stacked, setStacked] = useState(false);

  // below 900px the section unpins and every stage is simply laid out in order
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setStacked(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (stacked) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = railRef.current;
        if (!el) return;
        const range = el.offsetHeight - window.innerHeight;
        if (range <= 0) return;
        const p = (window.scrollY - el.offsetTop) / range;
        const clamped = Math.min(Math.max(p, 0), 0.9999);
        setActive(Math.floor(clamped * STAGES.length));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stacked]);

  const jumpTo = useCallback(
    (i: number) => {
      const el = railRef.current;
      if (!el) return;
      if (stacked) {
        el.querySelectorAll(".rstage")[i]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }
      const range = el.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: el.offsetTop + range * ((i + 0.35) / STAGES.length),
        behavior: "smooth",
      });
    },
    [stacked],
  );

  return (
    <section className="rail" id="stages" ref={railRef}>
      <div className="rail-sticky">
        <div className="rail-head wrap">
          <span className="kick on-night">
            <span className="bar" />
            One call, end to end
          </span>
        </div>

        <div className="rail-stages wrap">
          {STAGES.map((s, i) => (
            <article
              className="rstage"
              key={s.label}
              data-on={stacked || i === active || undefined}
            >
              <div className="rs-copy">
                <h2>
                  {s.head}
                  <span className="g">{s.headGreen}</span>
                </h2>
                <p>{s.body}</p>
                <div className="caps">
                  <span className="kick on-night">Capabilities</span>
                  <div className="caprow">
                    {s.caps.map((c) => (
                      <span className="cap" key={c}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <StageMedia stage={s} />
            </article>
          ))}
        </div>

        <div className="rail-track">
          <div className="inner">
            <div className="rail-nodes">
              {STAGES.map((s, i) => (
                <button
                  className="rnode"
                  key={s.label}
                  data-on={i === active || undefined}
                  onClick={() => jumpTo(i)}
                  aria-label={`Go to the ${s.label} stage`}
                >
                  <span className="lbl">{s.label}</span>
                  <span className="dia">
                    <PhoneGlyph />
                  </span>
                  <span className="stem" />
                </button>
              ))}
            </div>
            <div className="rail-line">
              <i
                className="rail-fill"
                style={{ width: `${((active + 0.5) / STAGES.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
