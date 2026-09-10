"use client";

import { useMemo, useState } from "react";
import { Kicker, TabPill } from "./primitives";

/* ============================================================
   BOOKINGS — week + month calendar with drag-to-reschedule

   Every job Emma put in the calendar. Two views:
     · Week  — time-grid, 7 columns × hourly rows, jobs as blocks
     · Month — day cells with job chips
   Drag a job to any slot (week) or day (month) to reschedule.
   Native HTML5 drag-and-drop; state is the single source of
   truth so both views stay in sync.
   ============================================================ */

type Kind = "emergency" | "standard" | "quote";

type Booking = {
  id: string;
  caller: string;
  job: string;
  where: string;
  kind: Kind;
  /** ISO date yyyy-mm-dd */
  date: string;
  /** 24h start hour, e.g. 9.5 = 9:30 */
  start: number;
  /** duration in hours */
  len: number;
};

/* ---------- date helpers (no libs) ---------- */

const DAY_MS = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
function mondayOf(d: Date) {
  const x = new Date(d);
  const wd = (x.getDay() + 6) % 7; // 0 = Monday
  x.setDate(x.getDate() - wd);
  x.setHours(0, 0, 0, 0);
  return x;
}
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY_MS);
const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fmtHour = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const ap = hh >= 12 ? "p" : "a";
  const h12 = ((hh + 11) % 12) + 1;
  return mm ? `${h12}:${String(mm).padStart(2, "0")}${ap}` : `${h12}${ap}`;
};

/* ---------- seed data, anchored to the current week ---------- */

const TODAY = new Date();
const MON = mondayOf(TODAY);
const D = (offset: number) => iso(addDays(MON, offset));

const SEED: Booking[] = [
  { id: "b1", caller: "Priya Patel", job: "Leaking mixer", where: "Wavell Heights", kind: "standard", date: D(0), start: 9.5, len: 1 },
  { id: "b2", caller: "Marco G", job: "Blocked stormwater", where: "Chermside West", kind: "standard", date: D(0), start: 12, len: 1.5 },
  { id: "b3", caller: "Sue Murphy", job: "HWS replacement", where: "Stafford", kind: "emergency", date: D(0), start: 14, len: 2 },
  { id: "b4", caller: "Jim Taylor", job: "Reno rough-in — quote", where: "Wavell Heights", kind: "quote", date: D(1), start: 8, len: 1 },
  { id: "b5", caller: "Anna Reyes", job: "Tap reseat ×3", where: "Nundah", kind: "standard", date: D(1), start: 10.5, len: 1 },
  { id: "b6", caller: "Ken Wright", job: "Dishwasher install", where: "Windsor", kind: "standard", date: D(2), start: 9, len: 1.5 },
  { id: "b7", caller: "Deb Nguyen", job: "Toilet cistern", where: "Kedron", kind: "standard", date: D(2), start: 13, len: 1 },
  { id: "b8", caller: "Raj Kapoor", job: "Gas cooktop — quote", where: "Gordon Park", kind: "quote", date: D(3), start: 11, len: 1 },
  { id: "b9", caller: "Tom Fisher", job: "Burst pipe follow-up", where: "Wooloowin", kind: "emergency", date: D(4), start: 8, len: 1.5 },
  { id: "b10", caller: "Ellie Ward", job: "Rangehood vent", where: "Stafford", kind: "standard", date: D(4), start: 14.5, len: 1 },
  { id: "b11", caller: "Sam O'Neil", job: "Hot water service", where: "Chermside", kind: "standard", date: D(5), start: 9, len: 1 },
];

const KIND_LABEL: Record<Kind, string> = { emergency: "Emergency", standard: "Standard", quote: "Quote visit" };

/* ---------- week grid ---------- */

const HOURS = Array.from({ length: 11 }, (_, i) => 7 + i); // 7am–5pm
const ROW_PX = 62;

function WeekView({
  weekStart,
  bookings,
  onMove,
}: {
  weekStart: Date;
  bookings: Booking[];
  onMove: (id: string, date: string, start: number) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCell, setOverCell] = useState<string | null>(null);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="cal-week">
      {/* header row of days */}
      <div className="cw-corner" />
      {days.map((d, i) => {
        const isToday = iso(d) === iso(TODAY);
        return (
          <div className="cw-dayhead" key={i} data-today={isToday || undefined}>
            <span className="cw-wd">{WD[i]}</span>
            <span className="cw-dn">{d.getDate()}</span>
          </div>
        );
      })}

      {/* body: time gutter + 7 day columns */}
      <div className="cw-gutter">
        {HOURS.map((h) => (
          <div className="cw-hour" key={h} style={{ height: ROW_PX }}>
            <span>{fmtHour(h)}</span>
          </div>
        ))}
      </div>

      {days.map((d, di) => {
        const dayIso = iso(d);
        const dayBookings = bookings.filter((b) => b.date === dayIso);
        return (
          <div className="cw-col" key={di}>
            {HOURS.map((h) => {
              const cellKey = `${dayIso}-${h}`;
              return (
                <div
                  key={h}
                  className="cw-cell"
                  style={{ height: ROW_PX }}
                  data-over={overCell === cellKey || undefined}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverCell(cellKey);
                  }}
                  onDragLeave={() => setOverCell((c) => (c === cellKey ? null : c))}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragId) onMove(dragId, dayIso, h);
                    setDragId(null);
                    setOverCell(null);
                  }}
                />
              );
            })}

            {/* positioned booking blocks */}
            {dayBookings.map((b) => {
              const top = (b.start - HOURS[0]) * ROW_PX;
              const height = b.len * ROW_PX - 6;
              return (
                <article
                  key={b.id}
                  className="cw-ev"
                  data-kind={b.kind}
                  data-dragging={dragId === b.id || undefined}
                  draggable
                  onDragStart={() => setDragId(b.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverCell(null);
                  }}
                  style={{ top: top + 2, height: Math.max(height, 30) }}
                  title={`${b.caller} — ${b.job}`}
                >
                  <span className="cw-ev-time">{fmtHour(b.start)}</span>
                  <b className="cw-ev-caller">{b.caller}</b>
                  <span className="cw-ev-job">{b.job}</span>
                </article>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- month grid ---------- */

function MonthView({
  monthAnchor,
  bookings,
  onMove,
}: {
  monthAnchor: Date;
  bookings: Booking[];
  onMove: (id: string, date: string, start: number) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overDay, setOverDay] = useState<string | null>(null);

  const gridStart = mondayOf(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1));
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const thisMonth = monthAnchor.getMonth();

  return (
    <div className="cal-month">
      <div className="cm-head">
        {WD.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="cm-grid">
        {cells.map((d, i) => {
          const dayIso = iso(d);
          const dayBookings = bookings.filter((b) => b.date === dayIso).sort((a, b) => a.start - b.start);
          const inMonth = d.getMonth() === thisMonth;
          const isToday = dayIso === iso(TODAY);
          return (
            <div
              key={i}
              className="cm-cell"
              data-out={!inMonth || undefined}
              data-today={isToday || undefined}
              data-over={overDay === dayIso || undefined}
              onDragOver={(e) => {
                e.preventDefault();
                setOverDay(dayIso);
              }}
              onDragLeave={() => setOverDay((c) => (c === dayIso ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) {
                  const moved = bookings.find((b) => b.id === dragId);
                  onMove(dragId, dayIso, moved ? moved.start : 9);
                }
                setDragId(null);
                setOverDay(null);
              }}
            >
              <span className="cm-dn">{d.getDate()}</span>
              <div className="cm-chips">
                {dayBookings.slice(0, 3).map((b) => (
                  <span
                    key={b.id}
                    className="cm-chip"
                    data-kind={b.kind}
                    data-dragging={dragId === b.id || undefined}
                    draggable
                    onDragStart={() => setDragId(b.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverDay(null);
                    }}
                    title={`${b.caller} — ${b.job} · ${fmtHour(b.start)}`}
                  >
                    <span className="cm-chip-t">{fmtHour(b.start)}</span>
                    {b.caller}
                  </span>
                ))}
                {dayBookings.length > 3 && <span className="cm-more">+{dayBookings.length - 3} more</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- the page ---------- */

const VIEWS = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
] as const;

export function Bookings() {
  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>(SEED);
  const [flash, setFlash] = useState<string | null>(null);

  const weekStart = useMemo(() => addDays(MON, weekOffset * 7), [weekOffset]);
  const monthAnchor = useMemo(
    () => new Date(TODAY.getFullYear(), TODAY.getMonth() + monthOffset, 1),
    [monthOffset],
  );

  const move = (id: string, date: string, start: number) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, date, start } : b)));
    const b = bookings.find((x) => x.id === id);
    if (b) {
      const d = new Date(date);
      setFlash(`Moved ${b.caller} → ${WD[(d.getDay() + 6) % 7]} ${d.getDate()} at ${fmtHour(start)} · caller notified by SMS`);
      window.setTimeout(() => setFlash(null), 3600);
    }
  };

  const weekLabel = `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()].slice(0, 3)} – ${addDays(weekStart, 6).getDate()} ${MONTHS[addDays(weekStart, 6).getMonth()].slice(0, 3)}`;
  const monthLabel = `${MONTHS[monthAnchor.getMonth()]} ${monthAnchor.getFullYear()}`;

  const weekCount = bookings.filter((b) => {
    const t = new Date(b.date).getTime();
    return t >= weekStart.getTime() && t < addDays(weekStart, 7).getTime();
  }).length;

  const back = () => (view === "week" ? setWeekOffset((v) => v - 1) : setMonthOffset((v) => v - 1));
  const fwd = () => (view === "week" ? setWeekOffset((v) => v + 1) : setMonthOffset((v) => v + 1));
  const today = () => (view === "week" ? setWeekOffset(0) : setMonthOffset(0));

  return (
    <>
      <header className="page-h">
        <div>
          <Kicker>Every job Emma put on your books</Kicker>
          <h1 className="page-title">Bookings</h1>
        </div>
        <div className="page-h-right">
          <div className="pb-summary">
            <b>{weekCount}</b> <span>this week · drag any job to reschedule</span>
          </div>
          <TabPill items={VIEWS.map((v) => ({ ...v }))} value={view} onChange={(id) => setView(id as typeof view)} />
        </div>
      </header>

      <div className="cal-bar">
        <div className="cal-nav">
          <button onClick={back} aria-label="Previous">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className="cal-today" onClick={today}>Today</button>
          <button onClick={fwd} aria-label="Next">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
        <h2 className="cal-range">{view === "week" ? weekLabel : monthLabel}</h2>
        <div className="cal-legend">
          <span data-kind="emergency">Emergency</span>
          <span data-kind="standard">Standard</span>
          <span data-kind="quote">Quote visit</span>
        </div>
      </div>

      <section className="card cal-card">
        {view === "week" ? (
          <WeekView weekStart={weekStart} bookings={bookings} onMove={move} />
        ) : (
          <MonthView monthAnchor={monthAnchor} bookings={bookings} onMove={move} />
        )}
      </section>

      <div className="cal-flash" data-show={!!flash || undefined} role="status">
        {flash && (
          <>
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {flash}
          </>
        )}
      </div>
    </>
  );
}
