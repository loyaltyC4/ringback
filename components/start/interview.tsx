"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Streaming, Tick, Wave } from "./primitives";

/* ============================================================
   THE INTERVIEW

   Conversation on the left, the agent's rulebook filling on the
   right. Two things make this different from a form:

   1. The artefact is executable. Every confirmed answer becomes a
      rule in the agent's config with a source stamp — not a field
      in a profile. The owner is watching their receptionist's
      judgement get written.
   2. Read-back validation. The agent proposes the rule in plain
      words and the owner ticks it. Answers are never absorbed
      silently, which is what earns trust for a thing that will
      answer the phone unsupervised.

   Questions the website already answered are skipped explicitly —
   the agent says so, which buys credibility for the ones it does ask.
   ============================================================ */

type Rule = { block: string; label: string; value: string };

type Choice = { text: string; rule?: Rule; note?: string };

type Turn = {
  /** the block this question belongs to, used for the rulebook tabs */
  block: string;
  /** agent lines, streamed one after another */
  say: string[];
  /** how the owner answers */
  kind: "chips" | "multi" | "text";
  choices?: Choice[];
  placeholder?: string;
  /** the rule proposed back for confirmation once they answer */
  readback?: (picked: string[]) => Rule;
};

const BLOCKS = [
  "Emergencies",
  "Pricing",
  "Service area",
  "Hours",
  "Escalation",
  "The words callers use",
  "Never say",
  "War stories",
] as const;

const TURNS: Turn[] = [
  {
    block: "Emergencies",
    say: [
      "I've read kedronplumbing.com.au, so I'll skip everything it already told me — your services, your suburbs, your hours are in.",
      "Let's start with the one that actually keeps you up. What counts as an emergency worth ringing your mobile at 11pm?",
    ],
    kind: "multi",
    choices: [
      { text: "Burst pipe / active flooding" },
      { text: "Gas smell" },
      { text: "No water at all" },
      { text: "Blocked sewage overflowing" },
      { text: "No hot water" },
      { text: "Roof leak in the rain" },
    ],
    readback: (p) => ({
      block: "Emergencies",
      label: "Rings your mobile",
      value: p.join(" · "),
    }),
  },
  {
    block: "Emergencies",
    say: [
      "Good. Now the bit a form can't get at — think of the last one that came in after hours. What did they actually say when you picked up?",
    ],
    kind: "text",
    placeholder: "“There's water coming through the kitchen ceiling…”",
    readback: () => ({
      block: "Emergencies",
      label: "Triage question",
      value: "Ask whether the water is still running, then tell them where the mains tap is before anything else",
    }),
  },
  {
    block: "Pricing",
    say: [
      "This next one protects you legally, so I'm deliberately strict about it.",
      "Is there anything at all you're happy for me to say a price for on the phone?",
    ],
    kind: "chips",
    choices: [
      { text: "Nothing — never quote", note: "Safest. Most operators pick this." },
      { text: "Callout fee only" },
      { text: "Callout + standard hourly" },
    ],
    readback: (p) => ({
      block: "Pricing",
      label: "Quoting",
      value:
        p[0] === "Nothing — never quote"
          ? "Never states a price. Says “Dave will confirm on site” and books the visit."
          : `May state: ${p[0]}. Everything else → “Dave will confirm on site.”`,
    }),
  },
  {
    block: "Service area",
    say: [
      "Your site lists Brisbane Northside. Someone rings from Ipswich — forty minutes the wrong way. What do I do?",
    ],
    kind: "chips",
    choices: [
      { text: "Politely decline" },
      { text: "Take details, you'll decide" },
      { text: "Depends on the job" },
    ],
    readback: (p) => ({
      block: "Service area",
      label: "Out of area",
      value:
        p[0] === "Politely decline"
          ? "Declines politely, doesn't book, offers no callback"
          : p[0] === "Take details, you'll decide"
            ? "Takes name, number and job, flags it to you rather than booking"
            : "Asks what the job is, then flags to you if it's worth the drive",
    }),
  },
  {
    block: "Escalation",
    say: [
      "When should I stop trying and just put them through to you?",
    ],
    kind: "multi",
    choices: [
      { text: "They ask for a human" },
      { text: "They're angry" },
      { text: "It's an emergency" },
      { text: "Anything about an existing job gone wrong" },
      { text: "They've rung twice today" },
    ],
    readback: (p) => ({
      block: "Escalation",
      label: "Hands over when",
      value: p.join(" · "),
    }),
  },
  {
    block: "The words callers use",
    say: [
      "Callers almost never use the right word, and mishearing a suburb is how these things embarrass you.",
      "What do people round Stafford actually call a hot water system?",
    ],
    kind: "multi",
    choices: [
      { text: "HWS" },
      { text: "Hot water unit" },
      { text: "The hot water thing" },
      { text: "Kaliphont" },
      { text: "Rheem" },
    ],
    readback: (p) => ({
      block: "The words callers use",
      label: "Hot water system",
      value: `Also hears: ${p.join(", ")}`,
    }),
  },
  {
    block: "Never say",
    say: [
      "Anything I should never say, even if a caller pushes?",
    ],
    kind: "multi",
    choices: [
      { text: "“We're cheaper than…”" },
      { text: "Any competitor's name" },
      { text: "“Guaranteed”" },
      { text: "A same-day promise" },
      { text: "Anything about warranty" },
    ],
    readback: (p) => ({
      block: "Never say",
      label: "Blocked phrases",
      value: p.join(" · "),
    }),
  },
  {
    block: "War stories",
    say: [
      "Last one, and it's the most useful thing you'll tell me.",
      "Think of a call that went badly — a job you lost, or a customer who got the wrong end of the stick. What happened?",
    ],
    kind: "text",
    placeholder: "“Bloke rang about a leaking tap, my apprentice quoted him $90 over the phone and it turned out to be…”",
    readback: () => ({
      block: "War stories",
      label: "Learned from",
      value: "Never estimate on a tap job sight-unseen — books an inspection instead",
    }),
  },
];

type Msg =
  | { who: "agent"; text: string }
  | { who: "owner"; text: string }
  | { who: "rule"; rule: Rule; confirmed: boolean };

export function Interview({ onDone }: { onDone: () => void }) {
  const [turn, setTurn] = useState(0);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [said, setSaid] = useState(0); // how many of this turn's lines have streamed
  const [picked, setPicked] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [rules, setRules] = useState<Rule[]>([]);
  const [tab, setTab] = useState<string>(BLOCKS[0]);
  const [awaitingRule, setAwaitingRule] = useState<Rule | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = TURNS[turn];
  const linesDone = t ? said >= t.say.length : true;

  // keep the newest message in view
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, said, awaitingRule]);

  function answer(values: string[], display?: string) {
    if (!values.length) return;
    setMsgs((m) => [...m, { who: "owner", text: display ?? values.join(", ") }]);
    setPicked([]);
    setDraft("");
    const rb = t.readback?.(values);
    if (rb) {
      setAwaitingRule(rb);
      setTab(rb.block);
    } else {
      next();
    }
  }

  function confirmRule() {
    if (!awaitingRule) return;
    setRules((r) => [...r, awaitingRule]);
    setMsgs((m) => [...m, { who: "rule", rule: awaitingRule, confirmed: true }]);
    setAwaitingRule(null);
    next();
  }

  function next() {
    setSaid(0);
    setTurn((v) => v + 1);
  }

  const progress = Math.round((rules.length / TURNS.length) * 100);
  const grouped = BLOCKS.map((b) => ({
    block: b,
    items: rules.filter((r) => r.block === b),
  }));

  return (
    <div className="iv">
      {/* ---------------- conversation ---------------- */}
      <section className="iv-talk" aria-label="Interview">
        <div className="iv-scroll" ref={scrollRef}>
          <div className="iv-intro">
            <span className="kick">
              <span className="bar" />
              Setting up your receptionist
            </span>
            <h1>
              Fifteen minutes of your head,
              <span className="g"> written into her rules.</span>
            </h1>
            <p>
              Your website told me what you do. It can&rsquo;t tell me how you judge.
              Answer out loud if your hands are full — every answer becomes a rule you
              approve before it goes anywhere near a caller.
            </p>
          </div>

          {msgs.map((m, k) =>
            m.who === "agent" ? (
              <div className="iv-msg agent" key={k}>
                <span className="iv-who">Emma</span>
                <p>{m.text}</p>
              </div>
            ) : m.who === "owner" ? (
              <div className="iv-msg owner" key={k}>
                <p>{m.text}</p>
              </div>
            ) : (
              <div className="iv-ruled" key={k}>
                <Tick className="ic" />
                <div>
                  <b>{m.rule.label}</b>
                  <span>{m.rule.value}</span>
                </div>
                <span className="iv-src">added to {m.rule.block.toLowerCase()}</span>
              </div>
            ),
          )}

          {/* the line currently in flight — finished lines live in msgs */}
          {t && said < t.say.length && (
            <div className="iv-msg agent" key={`${turn}-${said}`}>
              {said === 0 && <span className="iv-who">Emma</span>}
              <Streaming
                text={t.say[said]}
                onDone={() => {
                  const line = t.say[said];
                  setMsgs((m) => [...m, { who: "agent", text: line }]);
                  setSaid((v) => v + 1);
                }}
              />
            </div>
          )}

          {/* read-back: the rule proposed in plain words */}
          {awaitingRule && (
            <div className="iv-readback">
              <span className="rb-tag">So the rule is</span>
              <p>{awaitingRule.value}</p>
              <div className="rb-row">
                <button className="btn btn-fill btn-sm" onClick={confirmRule}>
                  <span>That&rsquo;s right</span>
                  <span className="tic">
                    <Tick />
                  </span>
                </button>
                <button
                  className="rb-edit"
                  onClick={() => {
                    setAwaitingRule(null);
                    next();
                  }}
                >
                  Not quite — I&rsquo;ll reword it
                </button>
              </div>
            </div>
          )}

          {turn >= TURNS.length && (
            <div className="iv-done">
              <h2>
                That&rsquo;s your rulebook.{" "}
                <span className="g">
                  {rules.length === 0
                    ? "Nothing locked in yet — we can do this later."
                    : `${rules.length} rule${rules.length === 1 ? "" : "s"}, all in your words.`}
                </span>
              </h2>
              <p>
                {rules.length === 0
                  ? "You skipped the lot, which is fine — she'll run on the trade defaults until you come back to it."
                  : "Next I'll read it back on a call so you can hear how it sounds coming out of her mouth."}
              </p>
              <button className="btn btn-fill" onClick={onDone}>
                <span>Hear her use it</span>
                <span className="tic">✆</span>
              </button>
            </div>
          )}
        </div>

        {/* ---------------- composer ---------------- */}
        {t && linesDone && !awaitingRule && (
          <div className="iv-answer">
            {(t.kind === "chips" || t.kind === "multi") && (
              <div className="iv-chips">
                {t.choices?.map((c) => {
                  const on = picked.includes(c.text);
                  return (
                    <button
                      key={c.text}
                      className="iv-chip"
                      data-on={on || undefined}
                      onClick={() =>
                        t.kind === "chips"
                          ? answer([c.text])
                          : setPicked((p) =>
                              on ? p.filter((x) => x !== c.text) : [...p, c.text],
                            )
                      }
                    >
                      {c.text}
                      {c.note && <em>{c.note}</em>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="iv-bar">
              <button className="iv-mic" aria-label="Answer by voice">
                <Mic />
                <Wave bars={14} quiet />
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && draft.trim()) answer([draft.trim()]);
                }}
                placeholder={t.placeholder ?? "Say it however you'd say it…"}
              />
              {t.kind === "multi" && picked.length > 0 ? (
                <button className="btn btn-fill btn-sm" onClick={() => answer(picked)}>
                  <span>
                    {picked.length} chosen — next
                  </span>
                  <span className="tic">→</span>
                </button>
              ) : (
                <button
                  className="btn btn-line btn-sm plain"
                  onClick={() => {
                    setMsgs((m) => [
                      ...m,
                      { who: "owner", text: "Not sure — remind me later" },
                    ]);
                    next();
                  }}
                >
                  Not sure
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ---------------- the rulebook ---------------- */}
      <aside className="iv-book" aria-label="Your agent's rulebook">
        <header className="bk-top">
          <div>
            <span className="bk-kick">Kedron Plumbing</span>
            <h2>Emma&rsquo;s rulebook</h2>
          </div>
          <span className="bk-count">
            {rules.length}
            <em>/ {TURNS.length}</em>
          </span>
        </header>

        <div className="bk-progress" aria-hidden>
          <i style={{ width: `${progress}%` }} />
        </div>

        <div className="bk-tabs" role="tablist">
          {grouped.map((g) => (
            <button
              key={g.block}
              role="tab"
              className="bk-tab"
              data-on={tab === g.block || undefined}
              data-filled={g.items.length > 0 || undefined}
              onClick={() => setTab(g.block)}
            >
              {g.block}
              {g.items.length > 0 && <span className="bk-n">{g.items.length}</span>}
            </button>
          ))}
        </div>

        <div className="bk-body">
          {grouped
            .filter((g) => g.block === tab)
            .map((g) => (
              <div key={g.block}>
                {g.items.length === 0 ? (
                  <p className="bk-empty">
                    Nothing here yet — this fills in as you answer.
                  </p>
                ) : (
                  g.items.map((r) => (
                    <div className="bk-rule" key={r.label + r.value}>
                      <span className="bk-l">{r.label}</span>
                      <div>
                        <p>{r.value}</p>
                        <span className="bk-src">
                          <Tick className="t" /> you said this · today
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
        </div>

        <footer className="bk-foot">
          Every line here is executable. Nothing reaches a caller until you&rsquo;ve
          heard it on a test call.
        </footer>
      </aside>
    </div>
  );
}
