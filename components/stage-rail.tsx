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
  | { kind: "video"; src: string; poster?: string; alt: string }
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
    body: "First ring, every ring. Day, night, weekend, public holiday. It answers in your business name and talks like a person - not a phone tree with nine options.",
    caps: ["First-ring pickup", "Natural speech", "Your business name", "Spam screening"],
    media: {
      kind: "video",
      src: "https://hyperagent.com/api/files/usergenerated/threads/cmufjzk280fbs06ad76ocdjtu/images/7ffba585-b6eb-4cf0-baab-17bfcdcc504e.png",
      alt: "A lodge reception phone ringing unanswered at night",
    },
    bubbles: [
      {
        tone: "light",
        at: "b1",
        det: "Picked up in 1.8 seconds",
        say: "“Good evening, you've reached Riverstone Lodge - this is Emma. How can I help?”",
      },
      {
        tone: "dark",
        at: "b2",
        det: "Caller · 0412 884 317",
        say: "“Hi - do you have anything for two nights this weekend? Two adults.”",
      },
    ],
  },
  {
    label: "Qualify",
    head: "Qualified",
    headGreen: "before you call back.",
    body: "It asks what you'd ask - which dates, how many guests, any kids, dietary needs, is this a returning guest - and works out whether it's a booking or an enquiry.",
    caps: ["Dates & party size", "Room-type check", "Dietary needs", "Returning-guest memory"],
    media: { kind: "mesh" },
    bubbles: [
      {
        tone: "light",
        at: "b1",
        det: "Checking live availability",
        say: "“Checking the calendar for you now - the Courtyard Room is free Friday and Saturday.”",
      },
      {
        tone: "dark",
        at: "b2",
        det: "Returning guest · 2nd stay",
        say: "“That sounds lovely. We stayed in the Garden Room last September.”",
      },
    ],
    chips: [
      { text: "2 nights · weekend", amber: true },
      { text: "availability ✓" },
      { text: "Courtyard Room free" },
    ],
  },
  {
    label: "Book",
    head: "Booked",
    headGreen: "into your real calendar.",
    body: "Not a message asking you to ring back. It reads your live availability, holds the room, and pushes the booking into your PMS with the deposit link sent.",
    caps: ["Live availability", "Room held", "Nightsbridge push", "WhatsApp confirmation"],
    media: {
      kind: "video",
      src: "https://hyperagent.com/api/files/usergenerated/threads/cmufjzk280fbs06ad76ocdjtu/images/64698c35-7cea-4fd1-8c0c-fd1b0621d6fc.png",
      alt: "A guest house owner carrying luggage up whitewashed steps in Franschhoek",
    },
    cards: [
      {
        at: "m1",
        label: "Room held",
        value: "Fri to Sun",
        sub: "2 nights · Courtyard Room",
      },
      {
        at: "m2",
        label: "Pushed to Nightsbridge",
        value: "Booking #4182",
        sub: "R3,400 · deposit paid",
      },
    ],
  },
  {
    label: "Notify",
    head: "On your phone",
    headGreen: "before the game drive ends.",
    body: "Every call arrives as a transcript and a two-line WhatsApp summary. Anything genuinely urgent rings your phone with the context already captured, so nobody repeats themselves.",
    caps: ["Two-line summary", "Warm live transfer", "Full transcript", "Emergency escalation"],
    media: {
      kind: "video",
      src: "https://hyperagent.com/api/files/usergenerated/threads/cmufjzk280fbs06ad76ocdjtu/images/d318eb03-8848-4e52-8937-a56c7c8801bc.png",
      alt: "A safari guide driving guests at sunrise, phone face-down on the dashboard",
    },
    bubbles: [
      {
        tone: "light",
        at: "b1",
        det: "Sent to you · 4:41pm",
        say: "Sarah Kemp, Joburg. Two nights this weekend, Courtyard Room, R3,400. Booked and deposit paid. Returning guest - stayed last September.",
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
    headGreen: "so enquiries don't go cold.",
    body: "Most bookings aren't lost on the call - they're lost in the days after it. StaysAfrica chases the enquiry that went quiet, the guest who never rebooked, and the review you never got round to asking for.",
    caps: ["Enquiry chase", "Cancellation fill", "Win-back", "Review request"],
    media: { kind: "mesh" },
    bubbles: [
      {
        tone: "light",
        at: "b1",
        det: "Day 2 after the enquiry",
        say: "“Hi Sarah - Emma from Riverstone Lodge. Just checking on the Family Suite for the long weekend. Want me to hold it for 24 hours?”",
      },
      {
        tone: "dark",
        at: "b2",
        det: "Sarah replied in 4 minutes",
        say: "“Yes please - can you WhatsApp me the deposit link?”",
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
