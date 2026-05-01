"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronDown, ChevronLeft, ChevronRight, Mountain, Bed, Plane, Coffee, MapPin,
  Maximize2, Minimize2, Sparkles, MessageCircle, Image as ImageIcon,
  Camera, Sunrise, Footprints, Clock, ArrowRightLeft, Lightbulb,
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
  arrival:  { label: "Arrival",  tooltip: "Land, settle in, gentle start.",       cls: "text-tat-charcoal/60 border-tat-charcoal/15" },
  travel:   { label: "Travel",   tooltip: "Mostly on the move between cities.",   cls: "text-tat-charcoal/60 border-tat-charcoal/15" },
  light:    { label: "Light",    tooltip: "Easy day — room to breathe.",          cls: "text-tat-success-fg border-tat-success-fg/30" },
  moderate: { label: "Moderate", tooltip: "Balanced pace — sights and downtime.", cls: "text-tat-gold border-tat-gold/40" },
  packed:   { label: "Packed",   tooltip: "Full day — wear comfortable shoes.",   cls: "text-tat-orange border-tat-orange/40" },
};

type DayChip = { icon: React.ComponentType<{ className?: string }>; label: string; tone: "neutral" | "gold" | "success" | "orange" };

// Derive secondary chips per day from whatever Sanity gives us. No
// fabricated data — every chip maps to a real signal in description /
// highlights / meals / transfer / stay. Order matters: most informative
// chip first so it survives line-wrap on narrow viewports.
function derivedChips(d: ItineraryDay): DayChip[] {
  const chips: DayChip[] = [];
  const desc = (d.description ?? "").toLowerCase();
  const photos = d.highlights?.images?.length ?? 0;

  // Photo day — three or more day-photos uploaded by content team.
  if (photos >= 3) {
    chips.push({ icon: Camera, label: `${photos} photos`, tone: "gold" });
  }
  // Multi-stop transfer — two place names connected with → / to / hyphen.
  if (d.transfer?.value && /\s(?:to|→|-|–|\bvia\b)\s/i.test(d.transfer.value)) {
    chips.push({ icon: ArrowRightLeft, label: "Multi-stop", tone: "neutral" });
  }
  // View moment — sunrise / sunset / panorama in the description.
  if (/\b(sunrise|sunset|panorama|viewpoint|vantage|skyline|ghat\s*aarti)\b/.test(desc)) {
    chips.push({ icon: Sunrise, label: "Golden hour", tone: "gold" });
  }
  // Walking-heavy — trek / hike / climb / steep keywords.
  if (/\b(trek|trekking|hike|hiking|climb|steep|footpath|walk\s+up|ascent)\b/.test(desc)) {
    chips.push({ icon: Footprints, label: "Walking day", tone: "orange" });
  }
  // Free time / leisure — explicit "at leisure" or "on your own".
  if (/\b(at\s+leisure|on\s+your\s+own|free\s+afternoon|free\s+morning|free\s+day|relax\s+at\s+the\s+(hotel|resort|villa))\b/.test(desc)) {
    chips.push({ icon: Clock, label: "Free time", tone: "success" });
  }
  // Optional add-on — language signalling skip-able activity.
  if (/\b(optional|optional\s+excursion|optional\s+activity|optional\s+visit|skip)\b/.test(desc)) {
    chips.push({ icon: Sparkles, label: "Skip / swap", tone: "neutral" });
  }

  return chips.slice(0, 3); // cap to keep the row tidy
}

const CHIP_TONE: Record<DayChip["tone"], string> = {
  neutral: "bg-tat-charcoal/[0.04] text-tat-charcoal/70",
  gold:    "bg-tat-gold/12 text-tat-gold",
  success: "bg-tat-success-fg/10 text-tat-success-fg",
  orange:  "bg-tat-orange/10 text-tat-orange",
};

function DayChips({ chips }: { chips: DayChip[] }) {
  if (chips.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-1.5">
      {chips.map((c, i) => (
        <li
          key={i}
          className={`inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-semibold ${CHIP_TONE[c.tone]}`}
        >
          <c.icon className="h-3 w-3" aria-hidden />
          {c.label}
        </li>
      ))}
    </ul>
  );
}

// Editorial serif numeral — big, italic, gold. The visual anchor for
// each day in the timeline.
function DayNumeral({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="font-display italic font-light text-tat-gold leading-none select-none tracking-tight"
    >
      <span className="block text-[56px] md:text-[88px]">{String(n).padStart(2, "0")}</span>
    </span>
  );
}

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
  const [mobileDay, setMobileDay] = useState(0);
  const mobileRailRef = useRef<HTMLOListElement>(null);
  const mobileSlideRefs = useRef<Map<number, HTMLLIElement>>(new Map());

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
    const details = el.querySelector<HTMLDetailsElement>("details");
    if (details) details.open = true;
  }

  useEffect(() => {
    const rail = mobileRailRef.current;
    if (!rail || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number(visible.target.getAttribute("data-mobile-idx"));
        if (!Number.isNaN(idx)) setMobileDay(idx);
      },
      { root: rail, threshold: [0.6, 0.9] },
    );
    mobileSlideRefs.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [filtered]);

  function gotoMobileDay(idx: number) {
    const slide = mobileSlideRefs.current.get(idx);
    if (!slide) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    slide.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
    requestAnimationFrame(() => {
      slide.focus({ preventScroll: true });
    });
  }

  function onMobileRailKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      gotoMobileDay(Math.max(0, mobileDay - 1));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      gotoMobileDay(Math.min(filtered.length - 1, mobileDay + 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      gotoMobileDay(0);
    } else if (e.key === "End") {
      e.preventDefault();
      gotoMobileDay(filtered.length - 1);
    }
  }

  function toggleAll() {
    const next = !(allOpen ?? false);
    dayRefs.current.forEach((li) => {
      const details = li.querySelector<HTMLDetailsElement>("details");
      if (details) details.open = next;
    });
    setAllOpen(next);
  }

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

  // Inline meta line for a day — text-led, icon-prefixed, no boxes.
  // Replaces the boxed grid that used to live on the desktop card.
  function MetaRow({ d }: { d: ItineraryDay }) {
    const items: React.ReactNode[] = [];

    if (d.transfer && (filter === "all" || filter === "transfers")) {
      items.push(
        <span key="transfer" className="inline-flex items-center gap-1.5">
          <Plane className="h-3.5 w-3.5 text-tat-gold shrink-0" aria-hidden />
          <span className="font-medium text-tat-charcoal">{d.transfer.value}</span>
          {d.transfer.meta && <span className="text-tat-charcoal/55">· {d.transfer.meta}</span>}
        </span>,
      );
    }
    if (d.stay && (filter === "all" || filter === "stay")) {
      items.push(
        <span key="stay" className="inline-flex items-center gap-1.5">
          <Bed className="h-3.5 w-3.5 text-tat-gold shrink-0" aria-hidden />
          <span className="font-medium text-tat-charcoal">{d.stay.value}</span>
          {d.stay.meta && <span className="text-tat-charcoal/55">· {d.stay.meta}</span>}
        </span>,
      );
    }
    if (d.meals && (filter === "all" || filter === "meals")) {
      items.push(
        <span key="meals" className="inline-flex items-center gap-1.5">
          <Coffee className="h-3.5 w-3.5 text-tat-gold shrink-0" aria-hidden />
          <span className="text-tat-charcoal/85">{mealsLine(d.meals)}</span>
        </span>,
      );
    }
    if (d.highlights && (filter === "all" || filter === "activities")) {
      items.push(
        <span key="hl" className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-tat-gold shrink-0" aria-hidden />
          <span className="text-tat-charcoal/85">{d.highlights.value}</span>
        </span>,
      );
    }

    if (items.length === 0) return null;

    return (
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            {it}
          </span>
        ))}
      </div>
    );
  }

  return (
    <section className="py-2" aria-labelledby="itinerary-title">
      {/* Header — editorial, no card. */}
      <p className="eyebrow">Day-by-day Itinerary</p>
      <h2 id="itinerary-title" className="heading-section mt-2 mb-3 text-balance">
        Your journey,{" "}
        <span className="italic text-tat-gold font-light">unfolded.</span>
      </h2>
      <p className="text-[13px] text-tat-charcoal/55 max-w-2xl">
        {days.length}-day plan with pace, stay, transfers and meals on each day. Swap, slow down,
        or add anything — every day is editable before you pay.
      </p>

      {/* Trip totals — desktop only. Inline meta line, no chips. */}
      <div className="mt-5 hidden md:flex md:flex-wrap md:items-center md:gap-x-5 md:gap-y-2 text-[12px] text-tat-charcoal/65">
        <span className="inline-flex items-center gap-1.5 text-tat-charcoal font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-tat-gold" aria-hidden />
          {days.length} {days.length === 1 ? "day" : "days"}
        </span>
        {totals.stays > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Bed className="h-3.5 w-3.5 text-tat-gold" aria-hidden />
            {totals.stays} {totals.stays === 1 ? "stay" : "stays"}
          </span>
        )}
        {totals.transfers > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Plane className="h-3.5 w-3.5 text-tat-gold" aria-hidden />
            {totals.transfers} {totals.transfers === 1 ? "transfer" : "transfers"}
          </span>
        )}
        {totals.activities > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Mountain className="h-3.5 w-3.5 text-tat-gold" aria-hidden />
            {totals.activities} sightseeing {totals.activities === 1 ? "block" : "blocks"}
          </span>
        )}
        {totals.meals > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Coffee className="h-3.5 w-3.5 text-tat-gold" aria-hidden />
            {totals.meals} {totals.meals === 1 ? "meal" : "meals"} included
          </span>
        )}
        {totals.photos > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-tat-gold" aria-hidden />
            {totals.photos} {totals.photos === 1 ? "photo" : "photos"}
          </span>
        )}
      </div>

      {/* Controls — desktop only. */}
      <div className="mt-6 hidden md:flex md:items-center md:justify-between md:gap-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-pill bg-tat-cream-warm/40 text-[13px] font-medium" role="tablist" aria-label="Itinerary view">
            <button
              onClick={() => setView("detailed")}
              role="tab"
              aria-selected={view === "detailed"}
              className={`px-4 h-9 rounded-pill transition duration-120 ${view === "detailed" ? "bg-white shadow-sm text-tat-charcoal" : "text-tat-charcoal/65"}`}
            >
              Detailed
            </button>
            <button
              onClick={() => setView("summarised")}
              role="tab"
              aria-selected={view === "summarised"}
              className={`px-4 h-9 rounded-pill transition duration-120 ${view === "summarised" ? "bg-white shadow-sm text-tat-charcoal" : "text-tat-charcoal/65"}`}
            >
              Summarised
            </button>
          </div>

          {view === "detailed" && days.length > 1 && (
            <button
              type="button"
              onClick={toggleAll}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-pill bg-tat-cream-warm/40 text-tat-charcoal/65 hover:text-tat-charcoal hover:bg-tat-cream-warm/70 text-[12px] font-medium transition-colors"
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

      {/* Day-jump nav — desktop only. */}
      {filtered.length > 1 && (
        <div
          ref={trackRef}
          role="navigation"
          aria-label="Jump to day"
          className="hidden md:flex mt-6 mx-0 px-0 pt-2 pb-2 gap-1.5 overflow-x-auto no-scrollbar sticky top-16 lg:top-20 z-10 bg-tat-cream/40 backdrop-blur-md border-b border-tat-charcoal/8"
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
                    : "bg-tat-cream-warm/40 text-tat-charcoal/65 hover:bg-tat-cream-warm/70",
                ].join(" ")}
              >
                Day {d.day}
              </button>
            );
          })}
        </div>
      )}

      {/* MOBILE carousel — slides become softer cream tiles, no white card. */}
      <section
        className="md:hidden mt-6"
        aria-roledescription="carousel"
        aria-label="Day-by-day itinerary"
      >
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {filtered[mobileDay]
            ? `Day ${filtered[mobileDay].day} of ${filtered.length}, ${filtered[mobileDay].title}`
            : ""}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[18px] font-medium text-tat-charcoal" aria-hidden="true">
              Day {filtered[mobileDay]?.day ?? 1}
            </span>
            <span className="text-[12px] text-tat-charcoal/45" aria-hidden="true">
              of {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Carousel controls">
            <button
              type="button"
              onClick={() => gotoMobileDay(Math.max(0, mobileDay - 1))}
              disabled={mobileDay === 0}
              aria-label={mobileDay === 0 ? "Previous day (already on first day)" : `Previous day, go to Day ${filtered[mobileDay - 1]?.day}`}
              aria-controls="itinerary-mobile-rail"
              className="h-11 w-11 rounded-full bg-tat-cream-warm/50 text-tat-charcoal grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed active:bg-tat-cream-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => gotoMobileDay(Math.min(filtered.length - 1, mobileDay + 1))}
              disabled={mobileDay === filtered.length - 1}
              aria-label={mobileDay === filtered.length - 1 ? "Next day (already on last day)" : `Next day, go to Day ${filtered[mobileDay + 1]?.day}`}
              aria-controls="itinerary-mobile-rail"
              className="h-11 w-11 rounded-full bg-tat-cream-warm/50 text-tat-charcoal grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed active:bg-tat-cream-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Jump to day"
          className="flex items-center gap-1 mb-3 overflow-x-auto no-scrollbar"
        >
          {filtered.map((d, i) => (
            <button
              key={d.day}
              type="button"
              role="tab"
              aria-selected={i === mobileDay}
              aria-current={i === mobileDay ? "step" : undefined}
              aria-label={`Go to day ${d.day}: ${d.title}`}
              tabIndex={i === mobileDay ? 0 : -1}
              onClick={() => gotoMobileDay(i)}
              className="shrink-0 py-2.5 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold rounded"
            >
              <span
                className={[
                  "block h-1 rounded-full transition-all",
                  i === mobileDay ? "w-6 bg-tat-gold" : "w-2 bg-tat-charcoal/15",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>

        <ol
          ref={mobileRailRef}
          id="itinerary-mobile-rail"
          tabIndex={0}
          onKeyDown={onMobileRailKeyDown}
          aria-label={`${filtered.length} day-by-day slides`}
          className="-mx-5 px-5 flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2 rounded-lg"
          style={{ scrollPaddingLeft: "1.25rem", scrollPaddingRight: "1.25rem" }}
        >
          {filtered.map((d, idx) => {
            const pace = classifyPace(d, idx, filtered.length);
            const paceMeta = PACE_META[pace];
            return (
              <li
                key={d.day}
                data-mobile-idx={idx}
                ref={(el) => {
                  if (el) mobileSlideRefs.current.set(idx, el);
                  else mobileSlideRefs.current.delete(idx);
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`Day ${d.day} of ${filtered.length}: ${d.title}`}
                aria-hidden={idx !== mobileDay}
                tabIndex={-1}
                className="snap-center shrink-0 w-[calc(100vw-2.5rem)] bg-tat-cream-warm/40 rounded-2xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2 scroll-mt-24"
              >
                <div className="flex items-start justify-between gap-3">
                  <DayNumeral n={d.day} />
                  <span
                    title={paceMeta.tooltip}
                    aria-label={`Pace: ${paceMeta.label}. ${paceMeta.tooltip}`}
                    className={`shrink-0 inline-flex items-center h-6 px-2.5 rounded-pill text-[10px] font-semibold uppercase tracking-wider border bg-transparent ${paceMeta.cls}`}
                  >
                    {paceMeta.label}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-[20px] text-tat-charcoal leading-snug text-balance">
                  {d.title}
                </h3>
                {d.subtitle && (
                  <p className="mt-1 text-[12px] text-tat-charcoal/55">{d.subtitle}</p>
                )}
                <DayChips chips={derivedChips(d)} />
                <p className="mt-3 text-[14px] leading-[1.65] text-tat-charcoal/85 line-clamp-[8]">
                  {d.description}
                </p>

                {(d.transfer || d.stay || d.highlights || d.meals) && (
                  <div className="mt-3 space-y-1.5 text-[12px]">
                    {d.transfer && (
                      <div className="flex items-start gap-2">
                        <Plane className="h-3.5 w-3.5 mt-0.5 text-tat-gold shrink-0" aria-hidden />
                        <div className="min-w-0">
                          <span className="font-semibold text-tat-charcoal">{d.transfer.value}</span>
                          {d.transfer.meta && <span className="text-tat-charcoal/55"> · {d.transfer.meta}</span>}
                        </div>
                      </div>
                    )}
                    {d.stay && (
                      <div className="flex items-start gap-2">
                        <Bed className="h-3.5 w-3.5 mt-0.5 text-tat-gold shrink-0" aria-hidden />
                        <div className="min-w-0">
                          <span className="font-semibold text-tat-charcoal">{d.stay.value}</span>
                          {d.stay.meta && <span className="text-tat-charcoal/55"> · {d.stay.meta}</span>}
                        </div>
                      </div>
                    )}
                    {d.highlights && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 text-tat-gold shrink-0" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-tat-charcoal">{d.highlights.value}</p>
                          {d.highlights.images && d.highlights.images.length > 0 && (
                            <ul className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                              {d.highlights.images.map((src, i) => (
                                <li
                                  key={i}
                                  className="w-16 h-12 rounded-md bg-tat-charcoal/10 shrink-0 bg-cover bg-center"
                                  style={{ backgroundImage: `url(${src})` }}
                                  aria-hidden
                                />
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                    {d.meals && (
                      <div className="flex items-start gap-2">
                        <Coffee className="h-3.5 w-3.5 mt-0.5 text-tat-gold shrink-0" aria-hidden />
                        <span className="text-tat-charcoal/85">{mealsLine(d.meals)}</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => askAriaAboutDay(d)}
                  aria-label={`Ask Aria about Day ${d.day}: ${d.title}`}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-pill bg-tat-gold/15 active:bg-tat-gold/30 text-tat-gold text-[12px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  Ask Aria about Day {d.day}
                </button>
              </li>
            );
          })}
        </ol>

        {filtered.length > 1 && mobileDay === 0 && (
          <p className="text-center text-[11px] text-tat-charcoal/40 mt-1" aria-hidden="true">
            Swipe or use arrow keys to see Day {filtered[1]?.day} →
          </p>
        )}
      </section>

      {/* DESKTOP timeline — editorial spread.
          No card chrome. Each day is a typographic entry: oversized
          serif numeral on the left, content on the right, hairline
          divider between days. The vertical dashed rail is gone — the
          numerals are the rhythm now. */}
      <ol className="hidden md:block mt-10">
        {filtered.map((d, idx) => {
          const pace = classifyPace(d, idx, filtered.length);
          const paceMeta = PACE_META[pace];
          const isLast = idx === filtered.length - 1;
          return (
            <li
              key={d.day}
              data-day={d.day}
              ref={(el) => {
                if (el) dayRefs.current.set(d.day, el);
                else dayRefs.current.delete(d.day);
              }}
              className={`relative grid grid-cols-[120px_1fr] gap-7 lg:gap-10 py-8 lg:py-10 ${isLast ? "" : "border-b border-tat-charcoal/10"}`}
            >
              {/* Left rail — numeral + meta */}
              <div className="pt-1">
                <DayNumeral n={d.day} />
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-tat-charcoal/45 font-semibold">
                  Day {d.day}
                </p>
                <span
                  title={paceMeta.tooltip}
                  aria-label={`Pace: ${paceMeta.label}. ${paceMeta.tooltip}`}
                  className={`mt-3 inline-flex items-center h-6 px-2.5 rounded-pill text-[10px] font-semibold uppercase tracking-wider border bg-transparent ${paceMeta.cls}`}
                >
                  {paceMeta.label}
                </span>
              </div>

              {/* Right column — content */}
              <details open={idx === 0} className="group">
                <summary className="flex items-start justify-between gap-3 cursor-pointer list-none">
                  <div className="min-w-0">
                    <h3 className="font-display text-[24px] lg:text-[28px] font-medium text-tat-charcoal leading-[1.2] text-balance">
                      {d.title}
                    </h3>
                    {d.subtitle && (
                      <p className="mt-1.5 text-[13px] text-tat-charcoal/55">{d.subtitle}</p>
                    )}
                    <DayChips chips={derivedChips(d)} />
                  </div>
                  <ChevronDown className="w-5 h-5 text-tat-charcoal/45 shrink-0 mt-2 transition group-open:rotate-180" aria-hidden />
                </summary>

                {view === "detailed" && (
                  <>
                    <p className="mt-4 text-[15px] leading-[1.75] text-tat-charcoal/80 max-w-[62ch]">
                      {d.description}
                    </p>

                    <MetaRow d={d} />

                    {d.highlights?.images && d.highlights.images.length > 0 && (filter === "all" || filter === "activities") && (
                      <ul className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {d.highlights.images.map((src, i) => (
                          <li
                            key={i}
                            className="w-28 h-20 rounded-lg bg-tat-charcoal/10 shrink-0 bg-cover bg-center ring-1 ring-tat-charcoal/8"
                            style={{ backgroundImage: `url(${src})` }}
                            aria-hidden
                          />
                        ))}
                      </ul>
                    )}

                    {/* Per-day Aria handoff — text-link weight, no card. */}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => askAriaAboutDay(d)}
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-tat-gold hover:text-tat-charcoal transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                        Ask Aria about Day {d.day}
                      </button>
                      <span className="text-[12px] text-tat-charcoal/45">
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

      {/* End-of-itinerary flexibility callout — appears under the day list
          on desktop AND mobile. Not a card; uses a quiet rule + offset
          composition so it reads as part of the editorial spread. */}
      <aside className="mt-10 md:mt-14 grid grid-cols-[auto_1fr] gap-5 md:gap-7 pt-8 border-t border-tat-charcoal/10">
        <Lightbulb className="h-7 w-7 text-tat-gold mt-0.5" aria-hidden />
        <div className="max-w-[62ch]">
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
            What you can change
          </p>
          <h3 className="mt-2 font-display text-[20px] md:text-[24px] font-medium text-tat-charcoal leading-tight text-balance">
            None of this is locked in.{" "}
            <span className="italic text-tat-gold font-light">Tell us what to flex.</span>
          </h3>
          <p className="mt-3 text-[14px] leading-[1.7] text-tat-charcoal/75">
            Swap a hotel, add a city, slow down a packed day, request a private
            guide for the highlights, push the start by a week, build in a buffer
            day if elders are travelling. Every line in this plan is editable
            before you pay — that&rsquo;s not a feature, it&rsquo;s how we plan.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {packageTitle && (
              <button
                type="button"
                onClick={() => {
                  if (typeof window === "undefined") return;
                  try { window.sessionStorage.setItem("tt_aria_text_preload", `Looking at "${packageTitle}"${destinationName ? ` for ${destinationName}` : ""}. Tell me what's flexible — hotels, pace, dates, group size — and what trade-offs each change would create.`); } catch {}
                  window.dispatchEvent(new CustomEvent("tt:aria-open"));
                }}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-tat-gold/15 hover:bg-tat-gold/25 text-tat-gold text-[12px] font-semibold transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                Ask Aria what to flex
              </button>
            )}
            <span className="text-[12px] text-tat-charcoal/55">
              Or WhatsApp the planner direct on{" "}
              <a href="https://wa.me/918115999588" target="_blank" rel="noopener noreferrer" className="font-semibold text-tat-charcoal hover:text-tat-gold">
                +91 81159 99588
              </a>.
            </span>
          </div>
        </div>
      </aside>

      {/* End-of-trip flourish — typographic, not a card */}
      <div className="mt-10 md:mt-14 flex items-center justify-center gap-4">
        <span className="h-px w-10 bg-tat-gold/40" aria-hidden />
        <p className="font-display italic text-tat-gold text-[16px] md:text-[20px]">
          {endLabel}
        </p>
        <span className="h-px w-10 bg-tat-gold/40" aria-hidden />
      </div>
    </section>
  );
}
