"use client";

import { useEffect, useState } from "react";
import { ShaderBackground } from "@/components/shader-background";
import { GREEN_MESH, GREEN_MESH_DEEP } from "@/lib/shaders";
import { Mark, Shimmer, Tick, Wave } from "./primitives";

/* ============================================================
   1 · BUSINESS — the entry
   One question, everything else deferred. The ambient tiles are
   the tools they already run rather than decorative shapes, so the
   first thing the page says is "we fit into your world".
   ============================================================ */

const TRADES = [
  "Plumber",
  "Electrician",
  "HVAC / aircon",
  "Carpenter",
  "Roofer",
  "Landscaper",
  "Locksmith",
  "Something else",
];

const AMBIENT = ["servicem8", "simpro", "tradify", "aroflo", "xero", "myob"];

export function StageBusiness({ onNext }: { onNext: () => void }) {
  const [url, setUrl] = useState("kedronplumbing.com.au");
  const [trade, setTrade] = useState("Plumber");

  return (
    <div className="st st-business">
      <div className="amb" aria-hidden>
        {AMBIENT.map((slug, i) => (
          <span className={`amb-tile amb-${i + 1}`} key={slug}>
            <i className={`brandmark logo-${slug}`} />
          </span>
        ))}
      </div>

      <div className="st-mid">
        <span className="kick">
          <span className="bar" />
          Welcome to RingBack
        </span>
        <h1>
          Let&rsquo;s start with <span className="g">your website.</span>
        </h1>
        <p className="st-lede">
          Paste it and I&rsquo;ll read your services, your suburbs and your hours, then
          come back with a receptionist already half built. You can correct anything I
          get wrong.
        </p>

        <label className="bigfield">
          <span className="bf-label">Your website</span>
          <div className="bf-row">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yourbusiness.com.au"
              aria-label="Your website"
            />
            <button className="btn btn-fill" onClick={onNext}>
              <span>Build my receptionist</span>
              <span className="tic">→</span>
            </button>
          </div>
        </label>

        <div className="st-trades">
          <span className="tr-label">What&rsquo;s your trade?</span>
          <div className="tr-row">
            {TRADES.map((t) => (
              <button
                key={t}
                className="tr-pill"
                data-on={trade === t || undefined}
                onClick={() => setTrade(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <p className="st-fine">
          No card, no ABN, nothing else yet.{" "}
          <button className="linkish" onClick={onNext}>
            No website? Tell me instead →
          </button>
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   2 · LEARN — show the work
   The wait is the product. Left: what the machine is doing.
   Right: their receptionist's card filling in with real values, so
   they watch something being built for them rather than a spinner.
   ============================================================ */

const CRAWL = [
  { label: "Reading kedronplumbing.com.au", detail: "14 pages" },
  { label: "Finding your services", detail: "9 found" },
  { label: "Mapping your suburbs", detail: "22 found" },
  { label: "Checking your Google listing", detail: "4.8 ★ · 61 reviews" },
  { label: "Setting your greeting", detail: "in your business name" },
  { label: "Loading trade defaults", detail: "plumbing" },
];

const LEARNED: { k: string; v: string; late?: boolean }[] = [
  { k: "Business", v: "Kedron Plumbing" },
  { k: "Greeting", v: "“You've reached Kedron Plumbing — this is Emma.”" },
  { k: "Services", v: "Blocked drains · Hot water · Burst pipes · Gas fitting · Roof leaks · Taps" },
  { k: "Service area", v: "Stafford, Chermside, Kedron, Wavell Heights + 18 more" },
  { k: "Hours", v: "Mon–Fri 7am–4pm · after-hours emergencies" },
  { k: "Callout", v: "Listed on site — never quoted aloud", late: true },
];

export function StageLearn({ onNext }: { onNext: () => void }) {
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState(0);

  useEffect(() => {
    if (step >= CRAWL.length) return;
    const t = window.setTimeout(() => setStep((v) => v + 1), 820);
    return () => window.clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step < 1 || fields >= LEARNED.length) return;
    const t = window.setTimeout(() => setFields((v) => v + 1), 620);
    return () => window.clearTimeout(t);
  }, [step, fields]);

  const done = step >= CRAWL.length;

  return (
    <div className="st st-learn">
      <section className="lr-left">
        <span className="lr-fav" aria-hidden>
          <Mark />
        </span>
        <h1>Reading kedronplumbing.com.au</h1>
        <p className="st-lede">
          Your receptionist builds herself from what I find. Correct anything after —
          nothing here is locked.
        </p>

        <ol className="lr-list">
          {CRAWL.map((c, i) => {
            const state = i < step ? "done" : i === step ? "doing" : "todo";
            return (
              <li key={c.label} data-state={state}>
                <span className="lr-dot" aria-hidden>
                  {state === "done" && <Tick />}
                </span>
                <span className="lr-label">
                  {state === "doing" ? <Shimmer>{c.label}</Shimmer> : c.label}
                </span>
                <span className="lr-detail">{i < step ? c.detail : ""}</span>
              </li>
            );
          })}
        </ol>

        {done && (
          <button className="btn btn-fill lr-cta" onClick={onNext}>
            <span>Looks right — keep going</span>
            <span className="tic">→</span>
          </button>
        )}
      </section>

      <aside className="lr-card">
        <div className="lrc-top">
          <span className="lrc-kick">Your receptionist, so far</span>
          {!done && <Shimmer>building…</Shimmer>}
        </div>
        <div className="lrc-rows">
          {LEARNED.map((f, i) => (
            <div className="lrc-row" key={f.k} data-on={i < fields || undefined}>
              <span className="lrc-k">{f.k}</span>
              <span className="lrc-v">
                {f.v}
                {f.late && <em className="lrc-note">locked by default</em>}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ============================================================
   4 · HEAR IT — the aha
   The one moment the whole flow exists to produce. Celebrated on
   the value captured, not on the task completed.
   ============================================================ */

const VOICES = [
  { id: "emma", name: "Emma", tag: "Warm · general AU", blurb: "The local receptionist everyone already knows." },
  { id: "jack", name: "Jack", tag: "Relaxed · blokey", blurb: "Easy-going. Sounds like one of the crew." },
  { id: "sophie", name: "Sophie", tag: "Polished", blurb: "Crisp. Good if you deal with property managers." },
  { id: "davo", name: "Davo", tag: "Broad", blurb: "Full Aussie character." },
];

export function StageHear({ onNext }: { onNext: () => void }) {
  const [voice, setVoice] = useState("emma");
  const [state, setState] = useState<"idle" | "calling" | "done">("idle");

  useEffect(() => {
    if (state !== "calling") return;
    const t = window.setTimeout(() => setState("done"), 3400);
    return () => window.clearTimeout(t);
  }, [state]);

  return (
    <div className="st st-hear">
      {state !== "done" ? (
        <div className="hr-pick">
          <span className="kick">
            <span className="bar" />
            The bit that matters
          </span>
          <h1>
            Pick a voice, then <span className="g">hear her answer as you.</span>
          </h1>
          <p className="st-lede">
            Four Australian voices, all pre-screened. This is exactly what your next
            caller will hear.
          </p>

          <div className="hr-voices">
            {VOICES.map((v) => (
              <button
                key={v.id}
                className="hr-voice"
                data-on={voice === v.id || undefined}
                onClick={() => setVoice(v.id)}
              >
                <span className="hv-top">
                  <b>{v.name}</b>
                  <em>{v.tag}</em>
                </span>
                <span className="hv-blurb">{v.blurb}</span>
                <Wave bars={18} quiet={voice !== v.id} />
              </button>
            ))}
          </div>

          <button
            className="btn btn-fill btn-big"
            onClick={() => setState("calling")}
            disabled={state === "calling"}
          >
            <span>
              {state === "calling"
                ? "Ringing your mobile…"
                : "Hear her answer as Kedron Plumbing"}
            </span>
            <span className="tic">✆</span>
          </button>
          <p className="st-fine">
            We&rsquo;ll ring the mobile you signed up with. Takes about ten seconds.
          </p>
        </div>
      ) : (
        <div className="hr-result">
          <div className="hr-banner">
            <ShaderBackground className="surface" uniforms={GREEN_MESH} />
            <div className="hrb-in">
              <span className="hrb-kick">Lead captured</span>
              <h1>
                She just booked you <span className="w">a job.</span>
              </h1>
              <p>
                That&rsquo;s a real caller handled end to end — no price invented, no
                detail missed.
              </p>
            </div>
          </div>

          <div className="hr-panels">
            <div className="hr-transcript">
              <span className="hp-kick">What she said</span>
              {[
                ["Emma", "G'day, you've reached Kedron Plumbing — this is Emma. How can I help?"],
                ["Caller", "Hot water's gone, there's water all over the laundry floor."],
                ["Emma", "Right, let's stop the damage first — is the water still running?"],
                ["Caller", "Yeah it is."],
                ["Emma", "There'll be a tap at the front near the meter. Turn it clockwise till it stops. I'll get Dave to you between 2 and 4 today."],
              ].map(([who, line], k) => (
                <div className="hp-turn" key={k} data-agent={who === "Emma" || undefined}>
                  <span>{who}</span>
                  <p>{line}</p>
                </div>
              ))}
            </div>

            <div className="hr-extract">
              <span className="hp-kick">What she captured</span>
              {[
                ["Caller", "Sue Murphy · 0412 884 317"],
                ["Job", "Hot water system failed, leaking"],
                ["Urgency", "Emergency — water isolated"],
                ["Suburb", "Stafford · in your area"],
                ["Booked", "Today, 2:00–4:00pm"],
                ["Value", "~$780 estimated"],
              ].map(([k, v]) => (
                <div className="hp-row" key={k}>
                  <span>{k}</span>
                  <b>{v}</b>
                </div>
              ))}
              <button className="btn btn-fill" onClick={onNext}>
                <span>Now stress-test her</span>
                <span className="tic">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   5 · REHEARSAL — the trust gate
   Twelve callers she has to survive before she's allowed near a
   real one. Go-live stays blocked until the owner rings her too.
   ============================================================ */

const PERSONAS = [
  { n: "Happy homeowner", p: "Details captured, booked, no price invented" },
  { n: "Distressed emergency", p: "Triaged, mains-off instruction, transferred" },
  { n: "Price shopper", p: "No quote invented, lead still captured" },
  { n: "Angry customer", p: "De-escalated, escalated with context" },
  { n: "Vague rambler", p: "One question at a time, lands on a next step" },
  { n: "Broad accent + noise", p: "Reads suburb back, falls back to SMS", fixed: true },
  { n: "Repeat customer", p: "Recognised, not re-interrogated" },
  { n: "Out of area", p: "Declines politely, doesn't book" },
  { n: "Interrupter", p: "Yields, no double-talk, no double booking" },
  { n: "Prompt injection", p: "Refuses, stays in persona, leaks nothing" },
  { n: "Spam caller", p: "Filtered, doesn't count as a lead" },
  { n: "Silence", p: "Prompts twice, hangs up politely, no fake summary" },
];

export function StageRehearsal({ onNext }: { onNext: () => void }) {
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (run >= PERSONAS.length) return;
    const t = window.setTimeout(() => setRun((v) => v + 1), 260);
    return () => window.clearTimeout(t);
  }, [run]);

  const done = run >= PERSONAS.length;
  const fixed = PERSONAS.filter((p) => p.fixed).length;

  return (
    <div className="st st-rehearse">
      <div className="rh-head">
        <span className="kick">
          <span className="bar" />
          Before she answers a real one
        </span>
        <h1>
          Twelve callers, <span className="g">three runs each.</span>
        </h1>
        <p className="st-lede">
          Every kind of caller that breaks a phone agent, run against your rules. Any
          failure is fixed and kept as a permanent test.
        </p>
      </div>

      <div className="rh-grid">
        {PERSONAS.map((p, i) => {
          const state = i < run ? (p.fixed ? "fixed" : "pass") : i === run ? "running" : "queued";
          return (
            <div className="rh-card" key={p.n} data-state={state}>
              <span className="rh-badge">
                {state === "pass" && <Tick />}
                {state === "fixed" && "!"}
                {state === "running" && <i className="rh-spin" />}
              </span>
              <b>{p.n}</b>
              <span className="rh-pass">{p.p}</span>
              <span className="rh-state">
                {state === "pass"
                  ? "Passed ×3"
                  : state === "fixed"
                    ? "Failed once — rule added"
                    : state === "running"
                      ? "Running…"
                      : "Queued"}
              </span>
            </div>
          );
        })}
      </div>

      {done && (
        <div className="rh-gate">
          <div>
            <b>
              {PERSONAS.length - fixed} passed clean, {fixed} fixed and re-run.
            </b>
            <p>
              She&rsquo;s ready — but go-live stays locked until you&rsquo;ve rung her
              yourself. That&rsquo;s the whole point.
            </p>
          </div>
          <div className="rh-gate-btns">
            <a className="btn btn-line" href="tel:+61340135000">
              <span>Ring her now</span>
              <span className="tic">✆</span>
            </a>
            <button className="btn btn-fill" onClick={onNext}>
              <span>I&rsquo;ve heard her — go live</span>
              <span className="tic">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   6 · GO LIVE — KYC, reframed
   Not an identity check. Connecting a phone line, which is what it
   actually is. The one-day wait is a narrated state with a working
   demo number underneath it.
   ============================================================ */

const TIMELINE = [
  { k: "Submitted", v: "Just now", done: true },
  { k: "Details checked", v: "About 2 minutes", done: true },
  { k: "With the carrier", v: "Usually within a day", now: true },
  { k: "Your 07 number live", v: "We'll text you", done: false },
];

export function StageLive() {
  const [abn, setAbn] = useState("");
  const [found, setFound] = useState(false);

  useEffect(() => {
    if (abn.length < 4) {
      setFound(false);
      return;
    }
    const t = window.setTimeout(() => setFound(true), 700);
    return () => window.clearTimeout(t);
  }, [abn]);

  return (
    <div className="st st-live">
      <section className="lv-left">
        <span className="kick">
          <span className="bar" />
          Last step
        </span>
        <h1>
          Let&rsquo;s connect <span className="g">your phone line.</span>
        </h1>
        <p className="st-lede">
          Because it&rsquo;s a real number on a real carrier, they need to know whose
          business it is — same as any phone service. About five minutes.
        </p>

        <label className="bigfield sm">
          <span className="bf-label">Your business name or ABN</span>
          <div className="bf-row">
            <input
              value={abn}
              onChange={(e) => setAbn(e.target.value)}
              placeholder="Kedron Plumbing"
              aria-label="Business name or ABN"
            />
          </div>
        </label>

        {found && (
          <div className="lv-found">
            <Tick className="ic" />
            <div>
              <b>KEDRON PLUMBING PTY LTD</b>
              <span>ABN 61 004 892 771 · registered 2019 · GST from 2019</span>
            </div>
            <span className="lv-src">found on the register</span>
          </div>
        )}

        <p className="st-fine">
          We only ask for what the register can&rsquo;t tell us. No documents unless the
          carrier asks.
        </p>
      </section>

      <aside className="lv-right">
        <div className="lv-demo">
          <ShaderBackground className="surface" uniforms={GREEN_MESH_DEEP} />
          <div className="lvd-in">
            <span className="lvd-kick">
              <i className="live-dot" /> Answering right now
            </span>
            <b>(07) 3000 4182</b>
            <p>
              Your demo number is already live. Point your ads or your Google listing at
              it today — nothing has to wait for the paperwork.
            </p>
          </div>
        </div>

        <div className="lv-timeline">
          <span className="hp-kick">Your real number</span>
          {TIMELINE.map((t) => (
            <div
              className="lvt-row"
              key={t.k}
              data-done={t.done || undefined}
              data-now={t.now || undefined}
            >
              <span className="lvt-dot">{t.done && <Tick />}</span>
              <b>{t.k}</b>
              <span>{t.v}</span>
            </div>
          ))}
        </div>

        <a className="btn btn-fill lv-cta" href="/dashboard">
          <span>Open my dashboard</span>
          <span className="tic">↗</span>
        </a>
      </aside>
    </div>
  );
}
