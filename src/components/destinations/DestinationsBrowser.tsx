"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight, MapPin, IndianRupee, Compass, Search, Plane, Calendar,
  MessageCircle, X, Globe, Sparkles,
} from "lucide-react";
import type { Destination } from "@/lib/data";
import { useTripPlanner } from "@/context/TripPlannerContext";

interface Props {
  destinations: Destination[];
  packageCountBySlug: Record<string, number>;
  indiaSlugs: string[];
  visaFreeSlugs: string[];
}

type RegionFilter = "all" | "india" | "international";
type BudgetFilter = "all" | "under-50k" | "50k-1l" | "1l-plus";
type SortKey = "popular" | "price-asc" | "price-desc" | "name";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function isInBestTime(bestTimeToVisit: string, month: string): boolean {
  if (!bestTimeToVisit) return false;
  const t = bestTimeToVisit.toLowerCase();
  return t.includes(month.toLowerCase());
}

function bestMonthsLabel(bestTimeToVisit: string): string | null {
  if (!bestTimeToVisit) return null;
  const matches = MONTHS.filter((m) => isInBestTime(bestTimeToVisit, m));
  if (!matches.length) return null;
  if (matches.length > 4) return matches[0] + "–" + matches[matches.length - 1];
  return matches.join(" · ");
}

export default function DestinationsBrowser({
  destinations,
  packageCountBySlug,
  indiaSlugs,
  visaFreeSlugs,
}: Props) {
  const { open: openPlanner } = useTripPlanner();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<RegionFilter>("all");
  const [budget, setBudget] = useState<BudgetFilter>("all");
  const [visaFree, setVisaFree] = useState(false);
  const [month, setMonth] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("popular");

  const indiaSet = useMemo(() => new Set(indiaSlugs), [indiaSlugs]);
  const visaSet = useMemo(() => new Set(visaFreeSlugs), [visaFreeSlugs]);

  const isIndia = (d: Destination) => d.country === "India" || indiaSet.has(d.slug);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = destinations.filter((d) => {
      if (q) {
        const blob = `${d.name} ${d.country} ${d.tagline} ${d.region}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (region === "india" && !isIndia(d)) return false;
      if (region === "international" && isIndia(d)) return false;
      if (visaFree && !visaSet.has(d.slug)) return false;
      if (month && !isInBestTime(d.bestTimeToVisit, month)) return false;
      if (budget === "under-50k" && (d.priceFrom <= 0 || d.priceFrom >= 50000)) return false;
      if (budget === "50k-1l" && (d.priceFrom < 50000 || d.priceFrom >= 100000)) return false;
      if (budget === "1l-plus" && d.priceFrom < 100000) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return (a.priceFrom || 99999999) - (b.priceFrom || 99999999);
      if (sort === "price-desc") return (b.priceFrom || 0) - (a.priceFrom || 0);
      if (sort === "name") return a.name.localeCompare(b.name);
      // popular = by package count desc, then by name
      const ca = packageCountBySlug[a.slug] ?? 0;
      const cb = packageCountBySlug[b.slug] ?? 0;
      if (cb !== ca) return cb - ca;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [destinations, query, region, budget, visaFree, month, sort, indiaSet, visaSet, packageCountBySlug]);

  const india = filtered.filter(isIndia);
  const international = filtered.filter((d) => !isIndia(d));

  const activeFilters =
    Number(query.length > 0) +
    Number(region !== "all") +
    Number(budget !== "all") +
    Number(visaFree) +
    Number(!!month);

  function clearAll() {
    setQuery("");
    setRegion("all");
    setBudget("all");
    setVisaFree(false);
    setMonth("");
  }

  function askAria(d: Destination) {
    if (typeof window === "undefined") return;
    const msg = `Tell me about ${d.name} — best time to go, ideal duration, and rough budget per person.`;
    try {
      window.sessionStorage.setItem("tt_aria_text_preload", msg);
    } catch {}
    window.dispatchEvent(new CustomEvent("tt:aria-open"));
  }

  return (
    <>
      {/* Sticky filter bar — sits below sticky site header. The lg:top-20
          matches Header h-20; mobile uses top-16 to mirror StickySubnav. */}
      <div className="sticky top-16 lg:top-20 z-30 bg-tat-paper/95 dark:bg-tat-charcoal/95 backdrop-blur-md border-b border-tat-charcoal/10 dark:border-white/10">
        <div className="container-custom py-3 md:py-4 space-y-3">
          {/* Row 1: search + sort */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tat-charcoal/45 pointer-events-none" aria-hidden />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Bali, Maldives, Char Dham…"
                className="w-full h-10 md:h-11 pl-10 pr-9 rounded-full bg-tat-cream-warm/40 dark:bg-white/5 ring-1 ring-tat-charcoal/10 dark:ring-white/10 text-[14px] text-tat-charcoal dark:text-tat-paper placeholder:text-tat-charcoal/40 focus:outline-none focus:ring-2 focus:ring-tat-gold"
                aria-label="Search destinations"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded-full hover:bg-tat-charcoal/8"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5 text-tat-charcoal/55" />
                </button>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 md:h-11 px-3 md:px-4 rounded-full bg-tat-cream-warm/40 dark:bg-white/5 ring-1 ring-tat-charcoal/10 dark:ring-white/10 text-[12px] md:text-[13px] font-medium text-tat-charcoal dark:text-tat-paper focus:outline-none focus:ring-2 focus:ring-tat-gold cursor-pointer"
              aria-label="Sort destinations"
            >
              <option value="popular">Sort: Popular</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">A–Z</option>
            </select>
          </div>

          {/* Row 2: chip filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
            <SegmentChip active={region === "all"} onClick={() => setRegion("all")} icon={Globe}>All</SegmentChip>
            <SegmentChip active={region === "india"} onClick={() => setRegion("india")}>India</SegmentChip>
            <SegmentChip active={region === "international"} onClick={() => setRegion("international")}>International</SegmentChip>

            <span className="h-5 w-px bg-tat-charcoal/15 dark:bg-white/15 mx-1 shrink-0" />

            <SegmentChip active={visaFree} onClick={() => setVisaFree((v) => !v)} icon={Plane}>Visa-free</SegmentChip>

            <span className="h-5 w-px bg-tat-charcoal/15 dark:bg-white/15 mx-1 shrink-0" />

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-9 px-3 rounded-full bg-tat-cream-warm/40 dark:bg-white/5 ring-1 ring-tat-charcoal/10 dark:ring-white/10 text-[12px] font-medium text-tat-charcoal dark:text-tat-paper focus:outline-none focus:ring-2 focus:ring-tat-gold cursor-pointer shrink-0"
              aria-label="Best in month"
            >
              <option value="">Any month</option>
              {MONTHS.map((m) => <option key={m} value={m}>Best in {m}</option>)}
            </select>

            <span className="h-5 w-px bg-tat-charcoal/15 dark:bg-white/15 mx-1 shrink-0" />

            <SegmentChip active={budget === "all"} onClick={() => setBudget("all")}>Any budget</SegmentChip>
            <SegmentChip active={budget === "under-50k"} onClick={() => setBudget("under-50k")}>Under ₹50k</SegmentChip>
            <SegmentChip active={budget === "50k-1l"} onClick={() => setBudget("50k-1l")}>₹50k–1L</SegmentChip>
            <SegmentChip active={budget === "1l-plus"} onClick={() => setBudget("1l-plus")}>₹1L+</SegmentChip>

            {activeFilters > 0 && (
              <>
                <span className="h-5 w-px bg-tat-charcoal/15 dark:bg-white/15 mx-1 shrink-0" />
                <button
                  type="button"
                  onClick={clearAll}
                  className="shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-full text-[12px] font-semibold text-tat-charcoal/70 hover:text-tat-charcoal hover:bg-tat-charcoal/8"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Result counter + empty state */}
      <div className="container-custom pt-6 md:pt-8">
        <p className="text-[12px] text-tat-charcoal/55 dark:text-tat-paper/55">
          Showing <span className="font-semibold text-tat-charcoal dark:text-tat-paper">{filtered.length}</span> of {destinations.length} destinations
          {activeFilters > 0 && <span> · {activeFilters} filter{activeFilters > 1 ? "s" : ""} applied</span>}
        </p>
      </div>

      {filtered.length === 0 ? (
        <section className="py-20 bg-tat-paper">
          <div className="container-custom text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-tat-gold/10 grid place-items-center">
              <Compass className="h-6 w-6 text-tat-gold" />
            </div>
            <h3 className="mt-4 font-display text-xl text-tat-charcoal">No destinations match those filters.</h3>
            <p className="mt-1 text-[13px] text-tat-charcoal/60">Try clearing a filter or ask a real planner what fits.</p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-tat-charcoal text-white text-[13px] font-semibold"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={() => openPlanner()}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-tat-gold text-white text-[13px] font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ask a planner
              </button>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* India grid */}
          {region !== "international" && india.length > 0 && (
            <section className="py-10 md:py-14 bg-tat-paper">
              <div className="container-custom">
                <SectionHeader
                  eyebrow="Domestic"
                  titleStart="Incredible"
                  titleItalic="India"
                  count={india.length}
                  href="/packages?region=india"
                  hrefLabel="View India trips"
                  subtitle={`${india.length} ${india.length === 1 ? "destination" : "destinations"} across mountains, backwaters, deserts and coastlines.`}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                  {india.map((d, i) => (
                    <DestinationCard
                      key={d.slug}
                      d={d}
                      compact
                      priority={i < 4}
                      packageCount={packageCountBySlug[d.slug]}
                      visaFree={visaSet.has(d.slug)}
                      onAskAria={() => askAria(d)}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {region !== "india" && international.length > 0 && (
            <section className="py-10 md:py-14 bg-tat-paper">
              <div className="container-custom">
                <SectionHeader
                  eyebrow="International"
                  titleStart="Around"
                  titleItalic="the World"
                  count={international.length}
                  href="/packages?region=international"
                  hrefLabel="View international trips"
                  subtitle={`${international.length} ${international.length === 1 ? "destination" : "destinations"} across Asia, Europe, the Middle East and beyond.`}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {international.map((d, i) => (
                    <DestinationCard
                      key={d.slug}
                      d={d}
                      priority={i < 3}
                      packageCount={packageCountBySlug[d.slug]}
                      visaFree={visaSet.has(d.slug)}
                      onAskAria={() => askAria(d)}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

function SegmentChip({
  active, onClick, icon: Icon, children,
}: {
  active?: boolean;
  onClick: () => void;
  icon?: typeof Globe;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "shrink-0 inline-flex items-center gap-1.5 h-9 px-3 md:px-3.5 rounded-full text-[12px] font-semibold transition-colors whitespace-nowrap",
        active
          ? "bg-tat-charcoal text-white"
          : "bg-tat-cream-warm/40 dark:bg-white/5 text-tat-charcoal/75 dark:text-tat-paper/75 ring-1 ring-tat-charcoal/10 dark:ring-white/10 hover:bg-tat-charcoal/8 dark:hover:bg-white/10",
      ].join(" ")}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function SectionHeader({
  eyebrow, titleStart, titleItalic, count, href, hrefLabel, subtitle,
}: {
  eyebrow: string;
  titleStart: string;
  titleItalic: string;
  count: number;
  href: string;
  hrefLabel: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6 md:mb-8 gap-4">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="heading-section mt-2">
          {titleStart}
          <span className="italic text-tat-gold font-light"> {titleItalic}</span>
        </h2>
        <p className="mt-2 text-tat-charcoal/55 text-sm max-w-md">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="hidden md:flex items-center gap-1.5 text-sm text-tat-charcoal/55 hover:text-tat-gold transition-colors shrink-0"
      >
        {hrefLabel} <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function DestinationCard({
  d, compact, priority, packageCount, visaFree, onAskAria,
}: {
  d: Destination;
  compact?: boolean;
  priority?: boolean;
  packageCount?: number;
  visaFree?: boolean;
  onAskAria: () => void;
}) {
  const months = bestMonthsLabel(d.bestTimeToVisit);
  const aspect = compact ? "aspect-[4/3]" : "aspect-[16/10]";

  return (
    <article className="group relative bg-white dark:bg-white/[0.03] rounded-2xl overflow-hidden border border-tat-charcoal/8 dark:border-white/10 hover:border-tat-charcoal/20 hover:shadow-lg transition-all duration-300 flex flex-col">
      <Link href={`/destinations/${d.slug}`} className="block">
        <div className={`relative ${aspect} overflow-hidden bg-tat-cream`}>
          <Image
            src={d.image}
            alt={d.name}
            fill
            sizes={compact ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={priority}
          />
          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {!compact && (
              <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-medium text-tat-charcoal uppercase tracking-wider">
                <MapPin className="h-3 w-3 text-tat-gold" />
                {d.country}
              </span>
            )}
            {compact && (
              <span className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-[10px] uppercase tracking-widest font-medium text-tat-charcoal/70">
                {d.region}
              </span>
            )}
            {visaFree && (
              <span className="inline-flex items-center gap-1 bg-tat-success-bg/95 backdrop-blur-sm rounded-full px-2 py-1 text-[10px] font-semibold text-tat-success-fg uppercase tracking-wide">
                <Plane className="h-3 w-3" />
                Visa-free
              </span>
            )}
          </div>
          {/* Top-right arrow on hover */}
          <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/0 group-hover:bg-white/90 grid place-items-center transition-all duration-300">
            <ArrowUpRight className="h-4 w-4 text-tat-charcoal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {/* Best months pill — bottom left */}
          {months && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-tat-charcoal/85 backdrop-blur-sm text-white rounded-full px-2 py-1 text-[10px] font-medium">
              <Calendar className="h-3 w-3" />
              Best in {months}
            </span>
          )}
        </div>
      </Link>

      <div className="px-4 md:px-5 py-4 flex flex-col flex-1">
        <Link href={`/destinations/${d.slug}`} className="block">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={`font-display ${compact ? "text-lg" : "text-xl"} font-medium text-tat-charcoal dark:text-tat-paper group-hover:text-tat-gold transition-colors leading-tight truncate`}>
                {d.name}
              </h3>
              {d.tagline && (
                <p className="text-xs text-tat-charcoal/50 dark:text-tat-paper/50 mt-0.5 leading-snug truncate">{d.tagline}</p>
              )}
            </div>
          </div>
        </Link>

        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 text-tat-charcoal/50 dark:text-tat-paper/50 min-w-0">
            {d.priceFrom > 0 && (
              <p className="inline-flex items-center gap-0.5 whitespace-nowrap">
                <IndianRupee className="h-3 w-3" />
                <span>from</span>
                <span className="font-semibold text-tat-charcoal/80 dark:text-tat-paper/80 ml-0.5">₹{d.priceFrom.toLocaleString("en-IN")}</span>
              </p>
            )}
            {typeof packageCount === "number" && packageCount > 0 && (
              <p className="inline-flex items-center gap-1 text-[11px] font-medium text-tat-charcoal/55 dark:text-tat-paper/55 whitespace-nowrap">
                <Compass className="h-3 w-3" />
                {packageCount} {packageCount === 1 ? "trip" : "trips"}
              </p>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href={`/destinations/${d.slug}`}
            className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-full bg-tat-charcoal text-white text-[12px] font-semibold hover:bg-tat-charcoal/90"
          >
            Explore
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={onAskAria}
            className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-full bg-tat-gold/10 text-tat-gold text-[12px] font-semibold hover:bg-tat-gold/20"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Ask Aria
          </button>
        </div>
      </div>
    </article>
  );
}
