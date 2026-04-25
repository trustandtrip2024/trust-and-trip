"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown, Mountain, Bed, Plane, Coffee, MapPin,
} from "lucide-react";

type Filter = "all" | "activities" | "stay" | "transfers" | "meals";
type View = "detailed" | "summarised";

export interface ItineraryDay {
  day: number;
  title: string;
  subtitle?: string;
  description: string;
  transfer?: { label: string; value: string; meta?: string };
  stay?:     { value: string; meta?: string };
  highlights?: { value: string; images?: string[] };
  meals?:    { breakfast?: boolean; lunch?: boolean; dinner?: boolean; lunchPacked?: boolean };
}

interface Props {
  days: ItineraryDay[];
  endLabel?: string;
}

const CHIPS: { id: Filter; label: string; icon: React.ComponentType<{ className?: string }> | null }[] = [
  { id: "all",        label: "All",        icon: null },
  { id: "activities", label: "Activities", icon: Mountain },
  { id: "stay",       label: "Stay",       icon: Bed },
  { id: "transfers",  label: "Transfers",  icon: Plane },
  { id: "meals",      label: "Meals",      icon: Coffee },
];

function mealsLine(m: NonNullable<ItineraryDay["meals"]>) {
  const inc: string[] = [];
  if (m.breakfast) inc.push("Breakfast");
  if (m.lunch) inc.push("Lunch");
  if (m.dinner) inc.push("Dinner");
  const trail = m.lunchPacked ? " · Lunch packed" : "";
  return inc.length ? `${inc.join(" · ")} included${trail}` : "Meals on own";
}

export default function PackageItinerary({ days, endLabel = "End of Yatra" }: Props) {
  const [view, setView] = useState<View>("detailed");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return days;
    return days.filter((d) => {
      if (filter === "activities") return !!d.highlights;
      if (filter === "stay")       return !!d.stay;
      if (filter === "transfers")  return !!d.transfer;
      if (filter === "meals")      return !!d.meals;
      return true;
    });
  }, [days, filter]);

  return (
    <section className="tt-card" aria-labelledby="itinerary-title">
      {/* Header */}
      <p className="tt-eyebrow">Day-by-day Itinerary</p>
      <h2 id="itinerary-title" className="tt-title">
        Your journey, <em>unfolded.</em>
      </h2>

      {/* Controls */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* View toggle */}
        <div className="inline-flex p-1 rounded-pill bg-stone-100 text-[13px] font-medium" role="tablist" aria-label="Itinerary view">
          <button
            onClick={() => setView("detailed")}
            role="tab"
            aria-selected={view === "detailed"}
            className={`px-4 h-9 rounded-pill transition ${view === "detailed" ? "bg-white shadow-sm text-stone-900" : "text-stone-600"}`}
          >
            Detailed
          </button>
          <button
            onClick={() => setView("summarised")}
            role="tab"
            aria-selected={view === "summarised"}
            className={`px-4 h-9 rounded-pill transition ${view === "summarised" ? "bg-white shadow-sm text-stone-900" : "text-stone-600"}`}
          >
            Summarised
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {CHIPS.map(({ id, label, icon: Icon }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                aria-pressed={active}
                className={`tt-chip ${active ? "!bg-stone-900 !text-white" : ""}`}
              >
                {Icon && <Icon />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <ol className="mt-8 relative pl-6 md:pl-8 border-l border-dashed border-amber-300/60 space-y-4">
        {filtered.map((d, idx) => (
          <li key={d.day} className="relative">
            <span
              aria-hidden
              className="absolute -left-[27px] md:-left-[33px] top-5 w-[18px] h-[18px] rounded-full bg-white border-2 border-amber-600"
            />

            <details open={idx === 0} className="tt-subcard group">
              <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                <div className="min-w-0">
                  <span className="tt-day-pill">DAY {d.day}</span>
                  <h3 className="mt-2 font-serif text-[18px] md:text-[20px] text-stone-900 leading-snug">
                    {d.title}
                  </h3>
                  {d.subtitle && (
                    <p className="mt-1 text-[13px] text-stone-500">{d.subtitle}</p>
                  )}
                </div>
                <ChevronDown className="w-5 h-5 text-stone-500 shrink-0 transition group-open:rotate-180" />
              </summary>

              {view === "detailed" && (
                <>
                  <p className="mt-4 text-[15px] leading-[1.65] text-stone-700">
                    {d.description}
                  </p>

                  {(d.transfer || d.stay || d.highlights || d.meals) && (
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {d.transfer && (filter === "all" || filter === "transfers") && (
                        <div className="tt-meta p-3 rounded-sub bg-stone-50">
                          <span className="tt-meta-ico"><Plane /></span>
                          <div>
                            <p className="tt-meta-lbl">{d.transfer.label}</p>
                            <p className="tt-meta-val">{d.transfer.value}</p>
                            {d.transfer.meta && (
                              <p className="text-[12px] text-stone-500 mt-0.5">{d.transfer.meta}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {d.stay && (filter === "all" || filter === "stay") && (
                        <div className="tt-meta p-3 rounded-sub bg-stone-50">
                          <span className="tt-meta-ico"><Bed /></span>
                          <div>
                            <p className="tt-meta-lbl">Stay</p>
                            <p className="tt-meta-val">{d.stay.value}</p>
                            {d.stay.meta && (
                              <p className="text-[12px] text-stone-500 mt-0.5">{d.stay.meta}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {d.highlights && (filter === "all" || filter === "activities") && (
                        <div className="tt-meta p-3 rounded-sub bg-stone-50 md:col-span-2">
                          <span className="tt-meta-ico"><MapPin /></span>
                          <div className="min-w-0">
                            <p className="tt-meta-lbl">Highlights</p>
                            <p className="tt-meta-val">{d.highlights.value}</p>
                            {d.highlights.images && d.highlights.images.length > 0 && (
                              <ul className="mt-2 flex gap-2 overflow-x-auto pb-1">
                                {d.highlights.images.map((src, i) => (
                                  <li
                                    key={i}
                                    className="w-24 h-16 rounded-md bg-stone-200 shrink-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${src})` }}
                                    aria-hidden
                                  />
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}

                      {d.meals && (filter === "all" || filter === "meals") && (
                        <div className="tt-meta p-3 rounded-sub bg-stone-50 md:col-span-2">
                          <span className="tt-meta-ico"><Coffee /></span>
                          <div>
                            <p className="tt-meta-lbl">Meals today</p>
                            <p className="tt-meta-val">{mealsLine(d.meals)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </details>
          </li>
        ))}
      </ol>

      {/* End-of-trip flourish */}
      <p className="mt-8 text-center font-serif italic text-amber-700/80 text-[18px]">
        — {endLabel} —
      </p>
    </section>
  );
}
