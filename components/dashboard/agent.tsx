"use client";

import { useState } from "react";
import { Arrow } from "@/components/site-chrome";
import { Kicker, RangeSlider, ChipEditor, SiriOrb, ORB_PALETTES, OrbPalette } from "./primitives";

/* ============================================================
   MY AGENT — the Voice Studio + Behaviour + Knowledge

   Hero: giant Siri orb representing Emma. Below the orb, a strip
   of voice-chips (small orbs) to switch between the four AU
   voices. Everything else — greeting, disclosure, sliders, chip
   editors — lives in stark white cards under the hero.
   ============================================================ */

type Voice = {
  id: string;
  name: string;
  who: string;
  accent: string;
  sample: string; // small sample greeting the picker plays
  palette: OrbPalette;
};

const VOICES: Voice[] = [
  {
    id: "emma",
    name: "Emma",
    who: "Warm, Brisbane",
    accent: "AU · Coastal",
    sample: "G'day, you've called Kedron Plumbing — this is Emma. How can I help?",
    palette: ORB_PALETTES.emma,
  },
  {
    id: "hannah",
    name: "Hannah",
    who: "Bright, Adelaide",
    accent: "AU · Central",
    sample: "Hi there, Kedron Plumbing — Hannah speaking. What can I do for you?",
    palette: ORB_PALETTES.hannah,
  },
  {
    id: "jack",
    name: "Jack",
    who: "Calm, Melbourne",
    accent: "AU · Southern",
    sample: "Kedron Plumbing, Jack here — how's it going?",
    palette: ORB_PALETTES.jack,
  },
  {
    id: "liam",
    name: "Liam",
    who: "Sharp, Sydney",
    accent: "AU · Metro",
    sample: "You've reached Kedron Plumbing, Liam speaking. Go ahead.",
    palette: ORB_PALETTES.liam,
  },
];

/* ---------- Voice picker with the little sibling orbs ---------- */

function VoicePicker({ picked, onPick }: { picked: string; onPick: (id: string) => void }) {
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <div className="vp" role="radiogroup" aria-label="Voice">
      {VOICES.map((v) => {
        const on = v.id === picked;
        return (
          <button
            key={v.id}
            className="vp-chip"
            data-on={on || undefined}
            onClick={() => onPick(v.id)}
            role="radio"
            aria-checked={on}
          >
            <SiriOrb palette={v.palette} size="chip" active speaking={playing === v.id} />
            <div className="vp-body">
              <b>{v.name}</b>
              <span>{v.who}</span>
            </div>
            <span className="vp-accent">{v.accent}</span>
            <span
              className="vp-play"
              role="button"
              tabIndex={0}
              aria-label={`Preview ${v.name}`}
              onClick={(e) => {
                e.stopPropagation();
                setPlaying(playing === v.id ? null : v.id);
                window.setTimeout(() => setPlaying(null), 3800);
              }}
            >
              {playing === v.id ? (
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden><path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor" /></svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Sandbox tile: "Ring Emma yourself" ---------- */

function Sandbox() {
  const [ringing, setRinging] = useState(false);
  return (
    <div className="sandbox">
      <div>
        <Kicker>Test sandbox</Kicker>
        <h3>Ring her yourself before your customers do.</h3>
        <p>Drop your number below and Emma calls you inside 10 seconds, playing whatever configuration you have live right now.</p>
      </div>
      <div className="sandbox-form">
        <input placeholder="+61 4__ ___ ___" inputMode="tel" />
        <button className="cd-btn cd-primary" onClick={() => { setRinging(true); window.setTimeout(() => setRinging(false), 3000); }}>
          {ringing ? "Ringing…" : "Ring me"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   THE PAGE
   ============================================================ */

export function AgentStudio() {
  const [voiceId, setVoiceId] = useState<string>("emma");
  const voice = VOICES.find((v) => v.id === voiceId)!;

  const [greeting, setGreeting] = useState<string>(
    "G'day, you've called Kedron Plumbing — this is {voice}, {owner}'s AI receptionist. How can I help?",
  );
  const [disclosure, setDisclosure] = useState(true);
  const [cautious, setCautious] = useState(72);
  const [warmth, setWarmth] = useState(64);
  const [pace, setPace] = useState(50);

  const [neverQuote, setNeverQuote] = useState<string[]>([
    "Hot water systems",
    "Bathroom renos",
    "Gas fitting jobs",
    "Anything over $500",
  ]);
  const [emergency, setEmergency] = useState<string[]>([
    "Gas smell",
    "Active flooding",
    "Sewage backup indoors",
    "No water at all",
    "Burst mains",
  ]);
  const [area, setArea] = useState<string[]>([
    "Kedron", "Stafford", "Wavell Heights", "Chermside", "Nundah", "Wooloowin", "Windsor", "Gordon Park",
  ]);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="agent-hero">
        <div className="agent-hero-bg" aria-hidden />
        <div className="agent-hero-in">
          <SiriOrb palette={voice.palette} size="hero" active speaking={false} />
          <div className="agent-hero-copy">
            <Kicker>Your receptionist</Kicker>
            <h1>
              This is <span className="th-em">{voice.name}</span>.
            </h1>
            <p className="agent-hero-line">
              {voice.who} · {voice.accent}. Answering every call for Kedron Plumbing since 4 March.
            </p>
            <div className="agent-hero-stats">
              <div><b>1,284</b><span>calls handled</span></div>
              <div><b>96%</b><span>booked on the first try</span></div>
              <div><b>1.6s</b><span>average answer time</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- VOICE PICKER ---------------- */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Voice</Kicker>
            <h2>Pick who answers your line</h2>
          </div>
          <a className="sec-more" href="#">Hear the full library <Arrow /></a>
        </header>
        <VoicePicker picked={voiceId} onPick={setVoiceId} />
        <p className="sub muted">
          Four voices, pre-screened for a natural Australian accent — the number-one complaint about US receptionists.
          Every one records the caller&rsquo;s <b>consent to be recorded</b> as part of the greeting.
        </p>
      </section>

      {/* ---------------- GREETING + DISCLOSURE ---------------- */}
      <div className="two">
        <section className="card">
          <header className="sec-h">
            <div>
              <Kicker>Greeting</Kicker>
              <h2>The first thing a caller hears</h2>
            </div>
          </header>
          <textarea className="greet" value={greeting} onChange={(e) => setGreeting(e.target.value)} rows={3} />
          <div className="greet-preview">
            <SiriOrb palette={voice.palette} size="card" speaking />
            <p>
              &ldquo;{greeting.replaceAll("{voice}", voice.name).replaceAll("{owner}", "Dave")}&rdquo;
            </p>
          </div>
          <p className="sub muted">Placeholders: <code>{'{voice}'}</code>, <code>{'{owner}'}</code>, <code>{'{business}'}</code>.</p>
        </section>

        <section className="card">
          <header className="sec-h">
            <div>
              <Kicker>Disclosure</Kicker>
              <h2>Be honest that Emma is AI</h2>
            </div>
          </header>
          <label className="switch">
            <input type="checkbox" checked={disclosure} onChange={(e) => setDisclosure(e.target.checked)} />
            <span className="switch-track" />
            <span className="switch-body">
              <b>Say &ldquo;AI receptionist&rdquo; up front</b>
              <span>Turned on by default. The vast majority of Australians say they want to know they&rsquo;re talking to AI. Off means Emma will not deny it if asked, but won&rsquo;t volunteer.</span>
            </span>
          </label>
        </section>
      </div>

      {/* ---------------- BEHAVIOUR SLIDERS ---------------- */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Behaviour</Kicker>
            <h2>How she leans when the call is uncertain</h2>
          </div>
        </header>
        <div className="beh-grid">
          <RangeSlider label="Cautiousness" value={cautious} onChange={setCautious} ticks={["Cavalier", "Balanced", "Won't guess"]} />
          <RangeSlider label="Warmth" value={warmth} onChange={setWarmth} ticks={["Efficient", "Friendly", "Chatty"]} />
          <RangeSlider label="Pace" value={pace} onChange={setPace} ticks={["Deliberate", "Steady", "Snappy"]} />
        </div>
        <p className="sub muted">
          These sit inside guardrails. Even on max &ldquo;Cavalier&rdquo;, Emma will still never quote a job she isn&rsquo;t allowed to.
        </p>
      </section>

      {/* ---------------- HARD LIMITS ---------------- */}
      <div className="two">
        <section className="card">
          <header className="sec-h">
            <div>
              <Kicker>Never quote</Kicker>
              <h2>The hallucination firewall</h2>
            </div>
          </header>
          <ChipEditor values={neverQuote} onChange={setNeverQuote} tone="warn" placeholder="Add a job type she must never price" />
          <p className="sub muted">
            Add the jobs Dave always measures himself. When one comes up, Emma captures the details and books a quote visit — she never invents a number.
          </p>
        </section>

        <section className="card">
          <header className="sec-h">
            <div>
              <Kicker>Emergencies</Kicker>
              <h2>What rings your mobile straight away</h2>
            </div>
          </header>
          <ChipEditor values={emergency} onChange={setEmergency} tone="danger" placeholder="Add an emergency trigger" />
          <p className="sub muted">
            When a caller uses one of these terms — or Emma&rsquo;s triage detects the situation — she walks them through safety, then rings your mobile live.
          </p>
        </section>
      </div>

      {/* ---------------- SERVICE AREA ---------------- */}
      <section className="card">
        <header className="sec-h">
          <div>
            <Kicker>Service area</Kicker>
            <h2>Suburbs you actually take work in</h2>
          </div>
        </header>
        <ChipEditor values={area} onChange={setArea} placeholder="Add a suburb" />
        <p className="sub muted">Anywhere outside this list gets a polite decline and a suggestion to try {"{referral_partner}"}.</p>
      </section>

      {/* ---------------- TEST SANDBOX ---------------- */}
      <Sandbox />
    </>
  );
}
