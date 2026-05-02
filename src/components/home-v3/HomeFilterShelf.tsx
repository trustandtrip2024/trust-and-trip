"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight, Wallet, Gem, Crown, Sparkles, CalendarDays, Sun, Snowflake,
  Waves, Mountain, Landmark, Stamp, Compass, Plane, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PackageCard, { type PackageCardProps } from "@/components/ui/PackageCard";
import ShelfRail, { HOME_RAIL_ITEM } from "@/components/ui/ShelfRail";
import SortSelect from "@/components/ui/SortSelect";
import { useHashState } from "@/lib/use-hash-state";

type BudgetId = "any" | "under-50k" | "50k-1L" | "1L-2L" | "2L-plus";
type WhenId   = "any" | "may" | "summer" | "winter";
type VibeId   = "any" | "beach" | "mountain" | "cultural" | "pilgrim" | "adventure";
type VisaId   = "off" | "on";
type SortId   = "rated" | "cheapest" | "priciest" | "longest";

interface Props {
  packages: PackageCardProps[];
  visaFreeHrefs: string[];
  mayFriendlyHrefs: string[];
  /** Slug fragments (lowercased) per vibe, matched against href + destination. */
  vibeHrefs: Record<Exclude<VibeId, "any">, string[]>;
}

const BUDGET_CHIPS: { id: BudgetId; label: string; icon: LucideIcon; min: number; max: number }[] = [
  { id: "any",       label: "Any budget", icon: Sparkles, min: 0,      max: Infinity },
  { id: "under-50k", label: "Under ₹50k", icon: Wallet,   min: 0,      max: 50000    },
  { id: "50k-1L",    label: "₹50k–₹1L",   icon: Sparkles, min: 50000,  max: 100000   },
  { id: "1L-2L",     label: "₹1L–₹2L",    icon: Gem,      min: 100000, max: 200000   },
  { id: "2L-plus",   label: "₹2L+",       icon: Crown,    min: 200000, max: Infinity },
];

const WHEN_CHIPS: { id: WhenId; label: string; icon: LucideIcon }[] = [
  { id: "any",    label: "Any time", icon: CalendarDays },
  { id: "may",    label: "May",      icon: CalendarDays },
  { id: "summer", label: "Summer",   icon: Sun },
  { id: "winter", label: "Winter",   icon: Snowflake },
];

const VIBE_CHIPS: { id: VibeId; label: string; icon: LucideIcon }[] = [
  { id: "any",       label: "Any vibe",  icon: Sparkles },
  { id: "beach",     label: "Beach",     icon: Waves },
  { id: "mountain",  label: "Mountain",  icon: Mountain },
  { id: "cultural",  label: "Cultural",  icon: Landmark },
  { id: "pilgrim",   label: "Pilgrim",   icon: Stamp },
  { id: "adventure", label: "Adventure", icon: Compass },
];

const SORT_OPTIONS = [
  { value: "rated",    label: "Top rated" },
  { value: "cheapest", label: "Cheapest" },
  { value: "priciest", label: "Priciest" },
  { value: "longest",  label: "Longest" },
];

// "Summer" = May–Aug month-friendly destinations (cool escapes); "Winter"
// = warm-weather destinations. Slug heuristics — replace with proper
// season metadata when content is structured. For now, "summer" reuses
// the May-friendly set + Europe/UK; "winter" overlaps with visa-free
// warm escapes.
const SUMMER_HINTS = ["switzerland", "iceland", "norway", "uk", "england", "scotland", "europe", "kashmir", "ladakh", "spiti", "himachal"];
const WINTER_HINTS = ["bali", "thailand", "maldives", "vietnam", "mauritius", "fiji", "kerala", "goa", "andaman"];

function durationDays(d?: string): number {
  if (!d) return 0;
  const m = /(\d+)/.exec(d);
  return m ? parseInt(m[1], 10) : 0;
}

function matchesAnyHint(p: PackageCardProps, hints: string[]): boolean {
  const slug = p.href.replace(/^\/packages\//, "").split("/")[0];
  const dest = (p.destination ?? "").toLowerCase();
  return hints.some((h) => slug.includes(h) || dest.includes(h));
}

/**
 * Multi-dimensional filter shelf. Replaces BudgetChipShelf +
 * MayMixedChipShelf + VisaFreeShelf — visitors used to scroll past three
 * near-identical rails on different axes. Now: one rail, four chip
 * groups (Budget · When · Vibe · Visa-free), one sort menu. All state
 * persists in the URL hash so deep-links work and refresh stays sticky.
 */
export default function HomeFilterShelf({
  packages, visaFreeHrefs, mayFriendlyHrefs, vibeHrefs,
}: Props) {
  const [budget, setBudget] = useHashState<BudgetId>("budget", "any");
  const [when,   setWhen]   = useHashState<WhenId>("when", "any");
  const [vibe,   setVibe]   = useHashState<VibeId>("vibe", "any");
  const [visa,   setVisa]   = useHashState<VisaId>("visa", "off");
  const [sort,   setSort]   = useHashState<SortId>("sort", "rated");

  const visaSet = useMemo(() => new Set(visaFreeHrefs), [visaFreeHrefs]);
  const maySet  = useMemo(() => new Set(mayFriendlyHrefs), [mayFriendlyHrefs]);

  const filtered = useMemo(() => {
    const budgetCfg = BUDGET_CHIPS.find((c) => c.id === budget) ?? BUDGET_CHIPS[0];
    return packages.filter((p) => {
      if (p.price < budgetCfg.min || p.price >= budgetCfg.max) return false;
      if (visa === "on" && !visaSet.has(p.href)) return false;
      if (when === "may" && !maySet.has(p.href)) return false;
      if (when === "summer" && !matchesAnyHint(p, SUMMER_HINTS)) return false;
      if (when === "winter" && !matchesAnyHint(p, WINTER_HINTS)) return false;
      if (vibe !== "any") {
        const hints = vibeHrefs[vibe] ?? [];
        if (!matchesAnyHint(p, hints)) return false;
      }
      return true;
    });
  }, [packages, budget, when, vibe, visa, visaSet, maySet, vibeHrefs]);

  const items = useMemo(() => {
    const list = [...filtered];
    if (sort === "rated")    list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "cheapest") list.sort((a, b) => a.price - b.price);
    if (sort === "priciest") list.sort((a, b) => b.price - a.price);
    if (sort === "longest")  list.sort((a, b) => durationDays(b.duration) - durationDays(a.duration));
    return list.slice(0, 12);
  }, [filtered, sort]);

  const activeCount =
    (budget !== "any" ? 1 : 0) +
    (when !== "any" ? 1 : 0) +
    (vibe !== "any" ? 1 : 0) +
    (visa === "on" ? 1 : 0);

  const resetAll = () => {
    setBudget("any");
    setWhen("any");
    setVibe("any");
    setVisa("off");
    setSort("rated");
  };

  return (
    <section
      id="filter"
      aria-labelledby="filter-shelf-title"
      className="py-12 md:py-16 bg-tat-cream-warm/30 dark:bg-tat-charcoal/95 scroll-mt-28 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Find your trip
            </p>
            <h2
              id="filter-shelf-title"
              className="mt-2 font-display font-normal text-[24px] md:text-[30px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Pick the knobs,{" "}
              <em className="not-italic font-display italic text-tat-gold">we&apos;ll match the trips.</em>
            </h2>
            <p className="mt-1 text-[12px] text-tat-charcoal/60 dark:text-tat-paper/60 tabular-nums">
              {filtered.length} trip{filtered.length === 1 ? "" : "s"} matching{" "}
              {activeCount === 0 ? "everything" : `${activeCount} filter${activeCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-tat-charcoal/60 hover:text-tat-charcoal underline-offset-4 hover:underline"
              >
                <X className="h-3 w-3" aria-hidden />
                Reset
              </button>
            )}
            <Link
              href="/packages"
              className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
            >
              Full catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 4 chip dimensions — Budget · When · Vibe · Visa-free + sort.
            On mobile each row scrolls horizontally; on desktop they stack
            vertically inside one card so the visitor reads them as a
            unified filter, not separate shelves. */}
        <div className="mt-6 rounded-2xl bg-white/80 dark:bg-white/5 border border-tat-charcoal/8 p-3 md:p-4 space-y-2 md:space-y-2.5">
          <ChipGroup label="Budget"   value={budget} setValue={(v) => setBudget(v as BudgetId)} chips={BUDGET_CHIPS} />
          <ChipGroup label="When"     value={when}   setValue={(v) => setWhen(v as WhenId)}     chips={WHEN_CHIPS} />
          <ChipGroup label="Vibe"     value={vibe}   setValue={(v) => setVibe(v as VibeId)}     chips={VIBE_CHIPS} />
          <div className="flex items-center gap-2 pt-1.5 flex-wrap">
            <span className="shrink-0 w-16 text-[11px] uppercase tracking-[0.16em] font-semibold text-tat-charcoal/55">
              Visa
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={visa === "on"}
              onClick={() => setVisa(visa === "on" ? "off" : "on")}
              className={[
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-[12px] font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2",
                visa === "on"
                  ? "bg-tat-success-fg/95 text-white border border-tat-success-fg"
                  : "bg-white text-tat-charcoal/80 border border-tat-charcoal/15 hover:border-tat-gold/60 hover:text-tat-gold",
              ].join(" ")}
            >
              <Plane className="h-3.5 w-3.5" aria-hidden />
              Visa-free only
            </button>
            <div className="ml-auto hidden sm:block">
              <SortSelect
                value={sort}
                onChange={(v) => setSort(v as SortId)}
                options={SORT_OPTIONS}
                ariaLabel="Sort trips by"
              />
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="mt-6 -mx-5 px-5 lg:mx-0 lg:px-0">
            <ShelfRail ariaLabel="Filtered trips">
              {items.map((p) => (
                <li
                  key={`${budget}-${when}-${vibe}-${visa}-${sort}-${p.href}`}
                  className={HOME_RAIL_ITEM}
                >
                  <PackageCard {...p} density="compact" />
                </li>
              ))}
            </ShelfRail>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-tat-charcoal/15 p-6 text-center">
            <p className="text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70">
              No trips match all {activeCount} filter{activeCount === 1 ? "" : "s"}.
            </p>
            <button
              type="button"
              onClick={resetAll}
              className="mt-3 inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
            >
              Reset filters
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="sm:hidden mt-5 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            Full catalogue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ChipGroup<T extends string>({
  label, value, setValue, chips,
}: {
  label: string;
  value: T;
  setValue: (v: T) => void;
  chips: { id: T; label: string; icon: LucideIcon }[];
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
      <span className="shrink-0 w-16 text-[11px] uppercase tracking-[0.16em] font-semibold text-tat-charcoal/55">
        {label}
      </span>
      <div
        role="tablist"
        aria-label={`Filter trips by ${label.toLowerCase()}`}
        className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1"
      >
        {chips.map(({ id, label: chipLabel, icon: Icon }) => {
          const isActive = id === value;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setValue(id)}
              className={[
                "shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[12px] font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2",
                isActive
                  ? "bg-tat-charcoal text-tat-paper border border-tat-charcoal"
                  : "bg-white text-tat-charcoal/80 border border-tat-charcoal/15 hover:border-tat-gold/60 hover:text-tat-gold",
              ].join(" ")}
            >
              <Icon className="h-3 w-3" aria-hidden />
              {chipLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
