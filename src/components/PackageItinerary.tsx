"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronDown, Mountain, Bed, Plane, Coffee, MapPin,
  Maximize2, Minimize2, Sparkles, MessageCircle, Image as ImageIcon,
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
  /** When set, enables the per-day "Ask Aria" handoff button. */
  packageTitle?: string;
  destinationName?: string;
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

function mealCount(m?: ItineraryDay["meals"]) {
  if (!m) return 0;
  return (m.breakfast ? 1 : 0) + (m.lunch ? 1 : 0) + (m.dinner ? 1 : 0);
}

type Pace = "arrival" | "travel" | "light" | "moderate" | "packed";

// Derive a per-day intensity badge from whatever Sanity ships back. The
// goal is a single honest signal: "is this day busy or breathing?". The
// classifier prefers explicit signals (transfers, highlights, meal density,
// description size) before falling back to "moderate" so opinionated days
// always over-ride the default. Title heuristics catch arrival/departure
// days the data sometimes mislabels as activity-light.
function classifyPace(d: ItineraryDay, idx: number, total: number): Pace {
  const titleLc = d.title.toLowerCase();
  const isFirst = idx === 0;
  const isLast = idx === total - 1;

  if (isFirst && /(arrival|arrive|welcome|check[- ]?in)/.test(titleLc)) return "arrival";
  if (isLast && /(depart|farewell|check[- ]?out|return)/.test(titleLc)) return "travel";

  const meals = mealCount(d.meals);
  const hasHighlights = !!d.highlights;
  const hasTransfer = !!d.transfer;
  const hasStay = !!d.stay;
  const descLen = d.description?.length ?? 0;

  if (hasTransfer && !hasHighlights) return "travel";
  if (hasHighlights && (meals >= 3 || descLen > 900)) return "packed";
  if (!hasHighlights && !hasStay && meals <= 1 && descLen < 350) return "light";
  if (hasHighlights || meals >= 2 || descLen >= 600) return "moderate";

  return "moderate";
}

const PACE_META: Record<Pace, { label: string; tooltip: string; cls: string }> = {
  arrival:  { label: "Arrival",  tooltip: "Land, settle in, gentle start.",         cls: "bg-tat-cream-warm/70 text-tat-charcoal/70" },
  travel:   { label: "Travel",   tooltip: "Mostly on the move between cities.",     cls: "bg-tat-cream-warm/70 text-tat-charcoal/70" },
  light:    { label: "Light",    tooltip: "Easy day — room to breathe.",            cls: "bg-tat-success-fg/12 text-tat-success-fg" },
  moderate: { label: "Moderate", tooltip: "Balanced pace — sights and downtime.",   cls: "bg-tat-gold/15 text-tat-gold" },
  packed:   { label: "Packed",   tooltip: "Full day — wear comfortable shoes.",     cls: "bg-tat-orange/15 text-tat-orange" },
};

export default function PackageItinerary({
  days,
  endLabel = "End of trip",
  packageTitle,
  destinationName,
}: Props) {
  const [view, setView] = useState<View>("detailed");
  const [filter, setFilter] = useState<Filter>("all");
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [allOpen, setAllOpen] = useState<boolean | null>(null);
  const dayRefs = useRef<Map<number, HTMLLIElement>>(new Map());
  const trackRef = useRef<HTMLDivElement>(null);

  // Aggregate trip stats — surface counts before the day-by-day list so
  // skim-readers see the shape of the trip without expanding any card.
  const totals = useMemo(() => {
    let stays = 0, transfers = 0, activities = 0, mealsCt = 0, photos = 0;
    days.forEach((d) => {
      if (d.stay) stays++;
      if (d.transfer) transfers++;
      if (d.highlights) activities++;
      mealsCt += mealCount(d.meals);
      photos += d.highlights?.images?.length ?? 0;
    });
    return { stays, transfers, activities, meals: mealsCt, photos };
  }, [days]);

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

  // Track which day's card is closest to the viewport top so the day-jump
  // pill highlights it. IntersectionObserver with a top-band rootMargin so
  // the active state flips as cards cross the upper third of the screen.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        )[0];
        const dayAttr = topMost.target.getAttribute("data-day");
        if (dayAttr) setActiveDay(Number(dayAttr));
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );
    dayRefs.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [filtered]);

  // Keep the active day-pill scrolled into view inside the horizontal track.
  useEffect(() => {
    if (activeDay === null) return;
    const track = trackRef.current;
    if (!track) return;
    const pill = track.querySelector<HTMLButtonElement>(`[data-day-pill="${activeDay}"]`);
    if (!pill) return;
    const tr = track.getBoundingClientRect();
    const pr = pill.getBoundingClientRect();
    if (pr.left < tr.left || pr.right > tr.right) {
      pill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeDay]);

  function jumpToDay(day: number) {
    const el = dayRefs.current.get(day);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top, behavior: "smooth" });
    // Force-open the details element so the user lands on visible content.
    const details = el.querySelector<HTMLDetailsElement>("details");
    if (details) details.open = true;
  }

  // Bulk expand/collapse — flips every <details> element inside the day refs.
  // Tracks the last action via allOpen so the toggle button label can swap.
  function toggleAll() {
    const next = !(allOpen ?? false);
    dayRefs.current.forEach((li) => {
      const details = li.querySelector<HTMLDetailsElement>("details");
      if (details) details.open = next;
    });
    setAllOpen(next);
  }

  // Hand a specific day's question to Aria via sessionStorage preload.
  // The chat widget reads "tt_aria_text_preload" on the next "tt:aria-open"
  // event and stuffs it into the input box.
  function askAriaAboutDay(d: ItineraryDay) {
    if (typeof window === "undefined") return;
    const ctx = packageTitle
      ? `the "${packageTitle}" trip${destinationName ? ` to ${destinationName}` : ""}`
      : destinationName
        ? `the trip to ${destinationName}`
        : "this trip";
    const msg = `Tell me more about Day ${d.day} — "${d.title}" — on ${ctx}. What's the pace like, how much walking, and is there room to swap activities?`;
    try { window.sessionStorage.setItem("tt_aria_text_preload", msg); } catch {}
    window.dispatchEvent(new CustomEvent("tt:aria-open"));
  }

  return (
    <section className="tt-card tt-card-p" aria-labelledby="itinerary-title">
      {/* Header */}
      <p className="tt-eyebrow">Day-by-day Itinerary</p>
      <h2 id="itinerary-title" className="tt-title">
        Your journey, <em>unfolded.</em>
      </h2>

      {/* Trip totals — shape of the trip in one glance. Each pill only renders
          when its underlying count is non-zero so short trips don't show
          empty noise. */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 md:gap-2">
        <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-pill bg-tat-gold/15 text-tat-gold text-[11px] font-semibold">
          <Sparkles className="h-3 w-3" />
          {days.length} {days.length === 1 ? "day" : "days"}
        </span>
        {totals.stays > 0 && (
          <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-pill bg-tat-cream-warm/60 text-tat-slate text-[11px] font-medium">
            <Bed className="h-3 w-3" />
            {totals.stays} {totals.stays === 1 ? "stay" : "stays"}
          </span>
        )}
        {totals.transfers > 0 && (
          <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-pill bg-tat-cream-warm/60 text-tat-slate text-[11px] font-medium">
            <Plane className="h-3 w-3" />
            {totals.transfers} {totals.transfers === 1 ? "transfer" : "transfers"}
          </span>
        )}
        {totals.activities > 0 && (
          <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-pill bg-tat-cream-warm/60 text-tat-slate text-[11px] font-medium">
            <Mountain className="h-3 w-3" />
            {totals.activities} sightseeing {totals.activities === 1 ? "block" : "blocks"}
          </span>
        )}
        {totals.meals > 0 && (
          <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-pill bg-tat-cream-warm/60 text-tat-slate text-[11px] font-medium">
            <Coffee className="h-3 w-3" />
            {totals.meals} {totals.meals === 1 ? "meal" : "meals"} included
          </span>
        )}
        {totals.photos > 0 && (
          <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-pill bg-tat-cream-warm/60 text-tat-slate text-[11px] font-medium">
            <ImageIcon className="h-3 w-3" />
            {totals.photos} {totals.photos === 1 ? "photo" : "photos"}
          </span>
        )}
      </div>

      {/* Controls — stacked on mobile, side-by-side on desktop, both as scroll rails */}
      <div className="mt-5 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-3">
        <div className="flex items-center gap-2">
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

          {/* Expand/collapse all — only useful in detailed view */}
          {view === "detailed" && days.length > 1 && (
            <button
              type="button"
              onClick={toggleAll}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-pill bg-tat-cream-warm/40 text-tat-slate hover:text-tat-charcoal hover:bg-tat-cream-warm/70 text-[12px] font-medium transition-colors"
              aria-pressed={allOpen ?? false}
            >
              {allOpen ? (
                <><Minimize2 className="h-3.5 w-3.5" /> Collapse all</>
              ) : (
                <><Maximize2 className="h-3.5 w-3.5" /> Expand all</>
              )}
            </button>
          )}
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

      {/* Day-jump nav — sticky pill rail of Day 1, Day 2 ... that scrolls
          to each day's card. Active pill follows the viewport. */}
      {filtered.length > 1 && (
        <div
          ref={trackRef}
          role="navigation"
          aria-label="Jump to day"
          className="mt-5 -mx-5 md:mx-0 px-5 md:px-0 pt-2 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar sticky top-16 lg:top-20 z-10 bg-white/90 backdrop-blur-md border-b border-tat-charcoal/8"
        >
          {filtered.map((d) => {
            const active = activeDay === d.day;
            return (
              <button
                key={d.day}
                type="button"
                data-day-pill={d.day}
                onClick={() => jumpToDay(d.day)}
                className={[
                  "shrink-0 inline-flex items-center h-7 px-2.5 rounded-pill text-[11px] font-semibold transition duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-1",
                  active
                    ? "bg-tat-gold text-tat-charcoal shadow-card"
                    : "bg-tat-cream-warm/40 text-tat-slate hover:bg-tat-cream-warm/70",
                ].join(" ")}
              >
                Day {d.day}
              </button>
            );
          })}
        </div>
      )}

      {/* Timeline — tighter padding on mobile */}
      <ol className="mt-6 md:mt-8 relative pl-5 md:pl-8 border-l border-dashed border-tat-orange/40 space-y-3 md:space-y-4">
        {filtered.map((d, idx) => {
          const pace = classifyPace(d, idx, filtered.length);
          const paceMeta = PACE_META[pace];
          return (
          <li
            key={d.day}
            data-day={d.day}
            ref={(el) => {
              if (el) dayRefs.current.set(d.day, el);
              else dayRefs.current.delete(d.day);
            }}
            className="relative"
          >
            <span
              aria-hidden
              className="absolute -left-[23px] md:-left-[33px] top-4 md:top-5 w-[14px] h-[14px] md:w-[18px] md:h-[18px] rounded-full bg-white border-2 border-tat-orange"
            />

            <details open={idx === 0} className="tt-subcard group !p-3 md:!p-5">
              <summary className="flex items-start justify-between gap-3 cursor-pointer list-none">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="tt-day-pill">DAY {d.day}</span>
                    <span
                      title={paceMeta.tooltip}
                      aria-label={`Pace: ${paceMeta.label}. ${paceMeta.tooltip}`}
                      className={`inline-flex items-center h-5 px-2 rounded-pill text-[10px] font-semibold uppercase tracking-wide ${paceMeta.cls}`}
                    >
                      {paceMeta.label}
                    </span>
                  </div>
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

                  {/* Per-day Aria handoff — surfaces the most common
                      objection ("can I tweak Day X?") right where it
                      forms instead of pushing it to the end of the page. */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-3 border-t border-tat-charcoal/6">
                    <button
                      type="button"
                      onClick={() => askAriaAboutDay(d)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-pill bg-tat-gold/15 hover:bg-tat-gold/25 text-tat-gold text-[12px] font-semibold transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Ask Aria about Day {d.day}
                    </button>
                    <span className="text-[11px] text-tat-charcoal/45">
                      Want to swap, slow down, or add something? Tell us.
                    </span>
                  </div>
                </>
              )}
            </details>
          </li>
          );
        })}
      </ol>

      {/* End-of-trip flourish */}
      <p className="mt-6 md:mt-8 text-center font-serif italic text-tat-orange text-[16px] md:text-[18px]">
        — {endLabel} —
      </p>
    </section>
  );
}
