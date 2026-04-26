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

export default function PackageItinerary({ days, endLabel = "End of trip" }: Props) {
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
    <section className="tt-card tt-card-p" aria-labelledby="itinerary-title">
      {/* Header */}
      <p className="tt-eyebrow">Day-by-day Itinerary</p>
      <h2 id="itinerary-title" className="tt-title">
        Your journey, <em>unfolded.</em>
      </h2>

      {/* Controls — stacked on mobile, side-by-side on desktop, both as scroll rails */}
      <div className="mt-5 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-3">
        {/* View toggle */}
        <div className="inline-flex p-1 rounded-pill bg-tat-cream-warm/40 text-[13px] font-medium" role="tablist" aria-label="Itinerary view">
          <button
            onClick={() => setView("detailed")}
            role="tab"
            aria-selected={view === "detailed"}
            className={`px-4 h-9 rounded-pill transition duration-120 ${view === "detailed" ? "bg-white shadow-sm text-tat-charcoal" : "text-tat-slate"}`}
          >
            Detailed
          </button>
          <button
            onClick={() => setView("summarised")}
            role="tab"
            aria-selected={view === "summarised"}
            className={`px-4 h-9 rounded-pill transition duration-120 ${view === "summarised" ? "bg-white shadow-sm text-tat-charcoal" : "text-tat-slate"}`}
          >
            Summarised
          </button>
        </div>

        {/* Filter chips — horizontal scroll on mobile */}
        <div
          role="group"
          aria-label="Filter by category"
          className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap snap-x snap-mandatory md:snap-none pb-1"
        >
          {CHIPS.map(({ id, label, icon: Icon }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                aria-pressed={active}
                className={`tt-chip shrink-0 snap-start ${active ? "tt-chip--active" : ""}`}
              >
                {Icon && <Icon />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline — tighter padding on mobile */}
      <ol className="mt-6 md:mt-8 relative pl-5 md:pl-8 border-l border-dashed border-tat-orange/40 space-y-3 md:space-y-4">
        {filtered.map((d, idx) => (
          <li key={d.day} className="relative">
            <span
              aria-hidden
              className="absolute -left-[23px] md:-left-[33px] top-4 md:top-5 w-[14px] h-[14px] md:w-[18px] md:h-[18px] rounded-full bg-white border-2 border-tat-orange"
            />

            <details open={idx === 0} className="tt-subcard group !p-3 md:!p-5">
              <summary className="flex items-start justify-between gap-3 cursor-pointer list-none">
                <div className="min-w-0">
                  <span className="tt-day-pill">DAY {d.day}</span>
                  <h3 className="mt-2 font-serif text-[16px] md:text-[20px] text-tat-charcoal leading-snug text-balance">
                    {d.title}
                  </h3>
                  {d.subtitle && (
                    <p className="mt-1 text-[12px] md:text-[13px] text-tat-slate">{d.subtitle}</p>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-tat-slate shrink-0 mt-1 transition group-open:rotate-180" />
              </summary>

              {view === "detailed" && (
                <>
                  <p className="mt-3 md:mt-4 text-[14px] md:text-[15px] leading-[1.65] text-tat-charcoal/85">
                    {d.description}
                  </p>

                  {(d.transfer || d.stay || d.highlights || d.meals) && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                      {d.transfer && (filter === "all" || filter === "transfers") && (
                        <div className="flex items-start gap-2.5 p-2.5 md:p-3 rounded-sub bg-tat-cream-warm/30">
                          <span className="h-7 w-7 md:h-8 md:w-8 rounded-md bg-white grid place-items-center shrink-0 text-tat-gold">
                            <Plane className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wide font-semibold text-tat-slate">{d.transfer.label}</p>
                            <p className="text-[13px] font-medium text-tat-charcoal">{d.transfer.value}</p>
                            {d.transfer.meta && (
                              <p className="text-[11px] text-tat-slate mt-0.5">{d.transfer.meta}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {d.stay && (filter === "all" || filter === "stay") && (
                        <div className="flex items-start gap-2.5 p-2.5 md:p-3 rounded-sub bg-tat-cream-warm/30">
                          <span className="h-7 w-7 md:h-8 md:w-8 rounded-md bg-white grid place-items-center shrink-0 text-tat-gold">
                            <Bed className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wide font-semibold text-tat-slate">Stay</p>
                            <p className="text-[13px] font-medium text-tat-charcoal">{d.stay.value}</p>
                            {d.stay.meta && (
                              <p className="text-[11px] text-tat-slate mt-0.5">{d.stay.meta}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {d.highlights && (filter === "all" || filter === "activities") && (
                        <div className="flex items-start gap-2.5 p-2.5 md:p-3 rounded-sub bg-tat-cream-warm/30 md:col-span-2">
                          <span className="h-7 w-7 md:h-8 md:w-8 rounded-md bg-white grid place-items-center shrink-0 text-tat-gold">
                            <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wide font-semibold text-tat-slate">Highlights</p>
                            <p className="text-[13px] font-medium text-tat-charcoal">{d.highlights.value}</p>
                            {d.highlights.images && d.highlights.images.length > 0 && (
                              <ul className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {d.highlights.images.map((src, i) => (
                                  <li
                                    key={i}
                                    className="w-20 h-14 md:w-24 md:h-16 rounded-md bg-tat-charcoal/10 shrink-0 bg-cover bg-center"
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
                        <div className="flex items-start gap-2.5 p-2.5 md:p-3 rounded-sub bg-tat-cream-warm/30 md:col-span-2">
                          <span className="h-7 w-7 md:h-8 md:w-8 rounded-md bg-white grid place-items-center shrink-0 text-tat-gold">
                            <Coffee className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wide font-semibold text-tat-slate">Meals today</p>
                            <p className="text-[13px] font-medium text-tat-charcoal">{mealsLine(d.meals)}</p>
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
      <p className="mt-6 md:mt-8 text-center font-serif italic text-tat-orange text-[16px] md:text-[18px]">
        — {endLabel} —
      </p>
    </section>
  );
}
