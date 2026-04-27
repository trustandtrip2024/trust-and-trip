"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles, Calendar, MapPin, ArrowRight } from "lucide-react";

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
  source: string;
  itinerary: Itinerary;
  matched_packages?: { slug: string; title: string; currentPrice: number; rating: number }[];
}

export default function CustomerItinerariesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/itineraries")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        setRows(data.itineraries ?? []);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="container-custom py-10 max-w-4xl">
      <header>
        <p className="tt-eyebrow">Your itinerary drafts</p>
        <h1 className="mt-2 font-display text-display-md text-tat-charcoal">Saved drafts</h1>
        <p className="mt-1 text-meta text-tat-slate">
          Every draft our AI planner has built for you. Reach out on WhatsApp to refine any one of them.
        </p>
      </header>

      {loading && (
        <div className="mt-12 grid place-items-center text-tat-slate">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {error && (
        <p className="mt-12 text-meta text-red-600">{error}</p>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="mt-10 rounded-card border border-dashed border-tat-charcoal/15 p-10 text-center">
          <Sparkles className="h-8 w-8 mx-auto text-tat-gold/60" />
          <p className="mt-3 font-display text-h3 text-tat-charcoal">No drafts yet</p>
          <p className="mt-1 text-tat-slate max-w-xs mx-auto">
            Build your first AI-drafted itinerary on a destination landing page.
          </p>
          <Link
            href="/lp/maldives-honeymoon"
            className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-pill bg-tat-orange text-white text-sm font-medium hover:bg-tat-orange/90"
          >
            Try the Maldives planner
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <ul className="mt-8 space-y-4">
          {rows.map((r) => (
            <li
              key={r.id}
              className="bg-white rounded-card border border-tat-charcoal/10 shadow-card overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === r.id ? null : r.id)}
                className="w-full text-left px-5 md:px-6 py-4 flex items-start justify-between gap-4 hover:bg-tat-paper/40 transition"
              >
                <div className="min-w-0">
                  <p className="font-display text-h3 text-tat-charcoal leading-tight truncate">
                    {r.itinerary.title}
                  </p>
                  <p className="mt-1 text-meta text-tat-slate truncate">{r.itinerary.tagline}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-meta text-tat-slate">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-tat-gold" />
                      {r.destination}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {r.days} days · {r.travel_type}
                    </span>
                    <span>
                      {new Date(r.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <ArrowRight
                  className={`shrink-0 h-4 w-4 mt-2 text-tat-charcoal/50 transition-transform ${openId === r.id ? "rotate-90" : ""}`}
                />
              </button>

              {openId === r.id && (
                <div className="border-t border-tat-charcoal/8 px-5 md:px-6 py-5 bg-tat-paper/30">
                  <dl className="grid grid-cols-2 gap-4 text-meta mb-4">
                    <div>
                      <dt className="text-tag uppercase text-tat-slate">Best time</dt>
                      <dd className="text-tat-charcoal">{r.itinerary.bestTimeToVisit}</dd>
                    </div>
                    <div>
                      <dt className="text-tag uppercase text-tat-slate">Estimated</dt>
                      <dd className="text-tat-charcoal">{r.itinerary.estimatedCostRange}</dd>
                    </div>
                  </dl>
                  <ol className="space-y-3">
                    {r.itinerary.days.map((d) => (
                      <li
                        key={d.day}
                        className="border-l-2 border-tat-gold/70 pl-4"
                      >
                        <p className="text-tag uppercase text-tat-slate">Day {d.day}</p>
                        <p className="font-serif text-h4 text-tat-charcoal">{d.title}</p>
                        <p className="mt-1 text-meta text-tat-charcoal/80">
                          <strong>Morning. </strong>{d.morning}
                        </p>
                        <p className="text-meta text-tat-charcoal/80">
                          <strong>Afternoon. </strong>{d.afternoon}
                        </p>
                        <p className="text-meta text-tat-charcoal/80">
                          <strong>Evening. </strong>{d.evening}
                        </p>
                        <p className="text-meta text-tat-slate">
                          <strong>Stay. </strong>{d.stay}
                        </p>
                      </li>
                    ))}
                  </ol>

                  {r.matched_packages && r.matched_packages.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-tat-charcoal/10">
                      <p className="tt-eyebrow">Matched ready-made trips</p>
                      <ul className="mt-3 space-y-2">
                        {r.matched_packages.map((p) => (
                          <li key={p.slug}>
                            <Link
                              href={`/packages/${p.slug}`}
                              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-card border border-tat-charcoal/10 bg-white hover:border-tat-orange/40 transition"
                            >
                              <span className="text-body-sm text-tat-charcoal truncate">{p.title}</span>
                              <span className="text-meta text-tat-slate shrink-0 tabular-nums">
                                ★ {p.rating.toFixed(1)} · ₹{p.currentPrice.toLocaleString("en-IN")}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a
                    href={`/api/wa/click?src=customer_dashboard_itineraries&dest=${encodeURIComponent(r.destination)}&msg=${encodeURIComponent(`Hi Trust and Trip — I'd like to refine the "${r.itinerary.title}" draft.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-pill bg-emerald-600 text-white text-meta font-medium hover:bg-emerald-700"
                  >
                    Refine on WhatsApp
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
