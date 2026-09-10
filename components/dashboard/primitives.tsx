"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   PRIMITIVES — shared bits for the dashboard pages
   Kicker, Card, Kbd, SiriOrb, WaveformPlayer, AreaChart,
   RangeSlider, ChipEditor.
   ============================================================ */

/* ---------- typographic bits ---------- */

export function Kicker({ children }: { children: React.ReactNode }) {
  return <span className="k-kick">{children}</span>;
}

export function TabPill({ items, value, onChange }: { items: readonly { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="tabpill" role="tablist">
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          aria-selected={it.id === value}
          data-on={it.id === value || undefined}
          onClick={() => onChange(it.id)}
        >
          <span>{it.label}</span>
          {typeof it.count === "number" && <span className="tabpill-n">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   SIRI ORB — pure CSS aurora sphere.
   Layers: base gradient (voice palette) + rotating conic aurora
   band + slow-breathing halo. Morphs when props.palette changes.
   Give it size="hero" for the big centrepiece, size="chip" for
   voice-picker chips.
   ============================================================ */

export type OrbPalette = { a: string; b: string; c: string; halo: string };

export const ORB_PALETTES: Record<string, OrbPalette> = {
  emma: { a: "#7fe0b1", b: "#1f6f4a", c: "#0b3826", halo: "#7fe0b1" },
  jack: { a: "#c9ded3", b: "#5b7e6d", c: "#233732", halo: "#a8c2b5" },
  hannah: { a: "#f4d7a4", b: "#c58b4a", c: "#4d2f18", halo: "#f4d7a4" },
  liam: { a: "#a9c0e6", b: "#3b558c", c: "#12203f", halo: "#a9c0e6" },
};

export function SiriOrb({
  palette = ORB_PALETTES.emma,
  size = "hero",
  active = true,
  speaking = false,
  className,
}: {
  palette?: OrbPalette;
  size?: "hero" | "card" | "chip";
  active?: boolean;
  speaking?: boolean;
  className?: string;
}) {
  const style: React.CSSProperties = {
    ["--pa" as string]: palette.a,
    ["--pb" as string]: palette.b,
    ["--pc" as string]: palette.c,
    ["--ph" as string]: palette.halo,
  };
  return (
    <span
      className={`orb orb-${size}${className ? ` ${className}` : ""}`}
      data-active={active || undefined}
      data-speaking={speaking || undefined}
      style={style}
      aria-hidden
    >
      <span className="orb-halo" />
      <span className="orb-core">
        <span className="orb-aurora" />
        <span className="orb-band" />
        <span className="orb-shine" />
      </span>
    </span>
  );
}

/* ============================================================
   WAVEFORM PLAYER — scrubbable, deterministic bars, clean chrome
   Bars generated from a seeded sine so the same call always shows
   the same waveform. Progress fills bars up to `progress`.
   ============================================================ */

function seedWaveform(seed: string, bars = 96) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rnd = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 0xffffffff;
  };
  return Array.from({ length: bars }, (_, k) => {
    const t = k / (bars - 1);
    const env = 0.5 + 0.5 * Math.sin(t * Math.PI * 1.4 + 0.6);
    const a = 0.5 + 0.5 * Math.sin(k * 0.37 + rnd() * 6);
    const b = 0.5 + 0.5 * Math.sin(k * 1.71 + rnd() * 4);
    const c = 0.5 + 0.5 * Math.sin(k * 3.11 + rnd() * 2);
    return Math.min(1, Math.max(0.08, 0.14 + env * (0.5 * a + 0.3 * b + 0.2 * c)));
  });
}

export function WaveformPlayer({
  seed = "default",
  duration = 118, // seconds
  bars = 96,
}: {
  seed?: string;
  duration?: number;
  bars?: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0); // seconds
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    startRef.current = performance.now() - t * 1000;
    const step = (now: number) => {
      const secs = (now - startRef.current) / 1000;
      if (secs >= duration) {
        setT(duration);
        setPlaying(false);
        return;
      }
      setT(secs);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const heights = seedWaveform(seed, bars);
  const progress = Math.min(1, t / duration);
  const mm = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;

  const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    setT(p * duration);
    if (playing) startRef.current = performance.now() - p * duration * 1000;
  };

  return (
    <div className="wf" data-playing={playing || undefined}>
      <button className="wf-play" onClick={() => setPlaying((v) => !v)} aria-label={playing ? "Pause" : "Play"}>
        {playing ? (
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden><path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor"/></svg>
        )}
      </button>
      <div className="wf-bars" onClick={onSeek} role="slider" aria-valuemin={0} aria-valuemax={duration} aria-valuenow={t}>
        {heights.map((h, k) => (
          <i
            key={k}
            style={{ height: `${Math.round(h * 100)}%` }}
            data-on={k / bars <= progress || undefined}
          />
        ))}
      </div>
      <span className="wf-t">
        {mm(t)}<span className="wf-t-sep"> · </span><span className="wf-t-full">{mm(duration)}</span>
      </span>
    </div>
  );
}

/* ============================================================
   AREA CHART — SVG, gradient fill, single series, hover halo
   Data is a series of {label, value}. Hero chart for Value page.
   ============================================================ */

export function AreaChart({
  data,
  width = 720,
  height = 260,
  currency = "$",
}: {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  currency?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 44, r: 20, t: 24, b: 32 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d.value)) * 1.1;
  const step = w / (data.length - 1);
  const x = (i: number) => pad.l + i * step;
  const y = (v: number) => pad.t + h - (v / max) * h;

  // Smooth cardinal-ish path
  const line = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`)
    .join(" ");
  const fill = `${line} L${x(data.length - 1).toFixed(1)},${(pad.t + h).toFixed(1)} L${pad.l.toFixed(1)},${(pad.t + h).toFixed(1)} Z`;

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (max / yTicks) * i);
  const fmt = (n: number) => n >= 1000 ? `${currency}${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${currency}${Math.round(n)}`;

  return (
    <svg
      className="area"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      onMouseLeave={() => setHover(null)}
      role="img"
      aria-label="Recovered revenue over time"
    >
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* baseline grid */}
      {ticks.map((tv, i) => (
        <g key={i}>
          <line x1={pad.l} x2={width - pad.r} y1={y(tv)} y2={y(tv)} stroke="currentColor" strokeOpacity="0.06" />
          <text x={pad.l - 8} y={y(tv) + 4} fontSize="10" textAnchor="end" fill="currentColor" opacity="0.42" fontFamily="var(--font-mono)">
            {fmt(tv)}
          </text>
        </g>
      ))}

      {/* area + line */}
      <path d={fill} fill="url(#area-fill)" />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* dots + hover targets */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.value)} r={hover === i ? 4.5 : 2.5} fill="currentColor" style={{ transition: "r .2s" }} />
          {i % Math.ceil(data.length / 8) === 0 && (
            <text x={x(i)} y={height - 10} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.5" fontFamily="var(--font-mono)">
              {d.label}
            </text>
          )}
          <rect
            x={x(i) - step / 2}
            y={pad.t}
            width={step}
            height={h}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        </g>
      ))}

      {/* hover tooltip */}
      {hover !== null && (
        <g>
          <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + h} stroke="currentColor" strokeOpacity="0.24" strokeDasharray="2 2" />
          <g transform={`translate(${Math.min(x(hover), width - pad.r - 90)},${Math.max(y(data[hover].value) - 44, pad.t)})`}>
            <rect x="0" y="0" width="90" height="34" rx="8" fill="var(--color-ink)" />
            <text x="10" y="14" fontSize="10" fill="rgba(247,245,238,0.68)" fontFamily="var(--font-mono)">{data[hover].label}</text>
            <text x="10" y="27" fontSize="12" fill="#fff" fontFamily="var(--font-display)" fontWeight="700">{fmt(data[hover].value)}</text>
          </g>
        </g>
      )}
    </svg>
  );
}

/* ============================================================
   RANGE SLIDER — labeled ticks, big number readout
   ============================================================ */

export function RangeSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  ticks,
  label,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  ticks?: string[];
  label?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="rng">
      {label && <span className="rng-label">{label}</span>}
      <div className="rng-track">
        <div className="rng-fill" style={{ width: `${pct}%` }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
        <span className="rng-thumb" style={{ left: `${pct}%` }} />
      </div>
      {ticks && (
        <div className="rng-ticks">
          {ticks.map((t, i) => (
            <span key={i} data-on={i === Math.round(pct / (100 / (ticks.length - 1))) || undefined}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CHIP EDITOR — add / remove tokens (used for never-quote,
   emergency-triggers, service-area etc.)
   ============================================================ */

export function ChipEditor({
  values,
  onChange,
  placeholder = "Add and press Enter",
  tone = "default",
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  tone?: "default" | "warn" | "danger";
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="chips" data-tone={tone}>
      {values.map((v) => (
        <span className="chip" key={v}>
          {v}
          <button onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>×</button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={placeholder}
      />
    </div>
  );
}
