"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

interface Day {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  stay: string;
  tip: string;
}

interface Itinerary {
  title: string;
  tagline: string;
  highlights: string[];
  bestTimeToVisit: string;
  estimatedCostRange: string;
  days: Day[];
}

interface Row {
  id: string;
  created_at: string;
  destination: string;
  travel_type: string;
  days: number;
  itinerary: Itinerary;
}

export default function DiffPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/itineraries")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        const list = (data.itineraries ?? []) as Row[];
        setRows(list);
        if (list.length >= 2) {
          setA(list[0].id);
          setB(list[1].id);
        } else if (list.length === 1) {
          setA(list[0].id);
        }
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const left = rows.find((r) => r.id === a) ?? null;
  const right = rows.find((r) => r.id === b) ?? null;

  if (loading) {
    return (
      <main className="container-custom py-10 max-w-4xl">
        <Loader2 className="h-6 w-6 animate-spin text-tat-slate" />
      </main>
    );
  }
  if (error) return <main className="p-8 text-red-600">{error}</main>;

  return (
    <main className="container-custom py-10 max-w-7xl">
      <Link href="/dashboard/itineraries" className="inline-flex items-center gap-1.5 text-meta text-tat-slate hover:text-tat-charcoal">
        <ArrowLeft className="h-3.5 w-3.5" /> All drafts
      </Link>
      <header className="mt-3">
        <p className="tt-eyebrow">Compare drafts</p>
        <h1 className="mt-2 font-display text-display-md text-tat-charcoal">Side-by-side diff</h1>
        <p className="mt-1 text-meta text-tat-slate">
          Pick any two of your past drafts. Days are aligned by number; differences highlighted.
        </p>
      </header>

      {rows.length < 2 ? (
        <p className="mt-12 text-tat-slate">
          You need at least two drafts to compare. Build another via a destination LP.
        </p>
      ) : (
        <>
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <Picker label="Left (older)" value={a} onChange={setA} rows={rows} />
            <Picker label="Right (newer)" value={b} onChange={setB} rows={rows} />
          </div>

          {left && right && (
            <section className="mt-8 grid lg:grid-cols-2 gap-6">
              <Column label="Left" row={left} other={right} />
              <Column label="Right" row={right} other={left} />
            </section>
          )}
        </>
      )}
    </main>
  );
}

function Picker({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows: Row[];
}) {
  return (
    <label className="block">
      <span className="text-tag uppercase text-tat-slate">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 px-3 rounded-card border border-tat-charcoal/15 text-sm bg-white"
      >
        {rows.map((r) => (
          <option key={r.id} value={r.id}>
            {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            {" · "}
            {r.itinerary.title.slice(0, 60)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Column({ label, row, other }: { label: string; row: Row; other: Row }) {
  return (
    <article className="bg-white rounded-card border border-tat-charcoal/10 p-5 md:p-6 shadow-card">
      <p className="tt-eyebrow">{label}</p>
      <h2 className="mt-2 font-display text-h2 text-tat-charcoal leading-tight">{row.itinerary.title}</h2>
      <p className="mt-1 text-meta text-tat-slate italic">{row.itinerary.tagline}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-meta">
        <Stat label="Best time" value={row.itinerary.bestTimeToVisit} other={other.itinerary.bestTimeToVisit} />
        <Stat label="Estimated" value={row.itinerary.estimatedCostRange} other={other.itinerary.estimatedCostRange} />
      </dl>

      <ol className="mt-5 space-y-3">
        {row.itinerary.days.map((d) => {
          const otherDay = other.itinerary.days.find((x) => x.day === d.day);
          return (
            <li key={d.day} className="border-l-2 border-tat-gold/70 pl-4">
              <p className="text-tag uppercase text-tat-slate">Day {d.day}</p>
              <p className="font-serif text-h4 text-tat-charcoal">{d.title}</p>
              <DiffLine label="Morning"   a={d.morning}   b={otherDay?.morning} />
              <DiffLine label="Afternoon" a={d.afternoon} b={otherDay?.afternoon} />
              <DiffLine label="Evening"   a={d.evening}   b={otherDay?.evening} />
              <DiffLine label="Stay"      a={d.stay}      b={otherDay?.stay} muted />
              {d.tip && <DiffLine label="Tip" a={d.tip} b={otherDay?.tip} muted />}
            </li>
          );
        })}
      </ol>
    </article>
  );
}

function Stat({ label, value, other }: { label: string; value: string; other: string }) {
  const changed = value !== other;
  return (
    <div className={changed ? "rounded p-2 bg-amber-50/70 border border-amber-200" : ""}>
      <dt className="text-tag uppercase text-tat-slate">{label}</dt>
      <dd className="text-tat-charcoal">{value}</dd>
    </div>
  );
}

function DiffLine({
  label,
  a,
  b,
  muted,
}: {
  label: string;
  a: string;
  b?: string;
  muted?: boolean;
}) {
  const changed = b != null && a !== b;
  return (
    <p
      className={`text-meta leading-relaxed ${
        muted ? "text-tat-slate" : "text-tat-charcoal/85"
      } ${changed ? "bg-amber-50/70 px-2 py-1 rounded mt-1" : ""}`}
    >
      <strong className={muted ? "text-tat-charcoal" : ""}>{label}. </strong>
      {a}
    </p>
  );
}
