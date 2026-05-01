"use client";

import { useState, useMemo, useEffect, useDeferredValue } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PackageCard from "@/components/PackageCard";
import type { Package, Destination } from "@/lib/data";
import { SlidersHorizontal, X, ArrowUpDown, Star, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { captureIntent } from "@/lib/capture-intent";

const durationRanges = [
  { label: "3 – 5 days", min: 3, max: 5 },
  { label: "5 – 7 days", min: 5, max: 7 },
  { label: "7 – 10 days", min: 7, max: 10 },
  { label: "10+ days", min: 10, max: 99 },
];

const priceRanges = [
  { label: "Under ₹50,000", min: 0, max: 50000 },
  { label: "₹50K – ₹1L", min: 50000, max: 100000 },
  { label: "₹1L – ₹2L", min: 100000, max: 200000 },
  { label: "Above ₹2L", min: 200000, max: Infinity },
];

const travelTypes = ["Couple", "Family", "Group", "Solo"];

const CATEGORY_OPTIONS = [
  "Honeymoon", "Family", "Adventure", "Wellness", "Cultural",
  "Spiritual", "Pilgrim", "Luxury", "Budget", "Quick Trips",
  "Beach", "Mountain", "International", "Groups", "Solo",
];

const ratingFloors = [
  { label: "4.5+", value: "4.5" },
  { label: "4.0+", value: "4.0" },
  { label: "3.5+", value: "3.5" },
];

const sortOptions = [
  { label: "Popularity", value: "popular" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
  { label: "Duration: Short to Long", value: "duration-asc" },
  { label: "Newest first", value: "newest" },
];

const INDIA_SLUGS = new Set(["kerala","goa","manali","rajasthan","ladakh","andaman","shimla","coorg","varanasi","agra","shimla-kasol","rishikesh-mussoorie","sikkim","meghalaya","tawang","kashmir","spiti","ooty-coonoor","hampi"]);

interface Props {
  packages: Package[];
  destinations: Destination[];
}

const BUDGET_TO_PRICE: Record<string, string> = {
  budget: "Under ₹50,000",
  standard: "₹50K – ₹1L",
  premium: "₹1L – ₹2L",
  luxury: "Above ₹2L",
};

export default function PackagesClient({
  packages,
  destinations,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  // useSearchParams reads URL on the client. Suspense boundary above this
  // client component lets the page stay statically renderable; the param
  // values resolve post-hydration.
  const sp = useSearchParams();
  const initialDestination = sp.get("destination") ?? "";
  const initialTravelType = sp.get("type") ?? "";
  const initialDuration = sp.get("duration") ?? "";
  const initialBudget = sp.get("budget") ?? "";
  const initialRegion = sp.get("region") ?? "";
  const initialCategory = sp.get("category") ?? "";
  // ?style= comes from BrowseByStyle tiles on the home page. It maps to
  // category-based filtering (with Pilgrim covering Pilgrim+Spiritual,
  // and Family/Solo/Group falling back to travelType when the category
  // is missing on older docs). Without this, every tile click landed on
  // the unfiltered packages list and showed irrelevant trips.
  const initialStyle = sp.get("style") ?? "";

  const resolvedPrice = initialBudget ? (BUDGET_TO_PRICE[initialBudget] ?? "") : "";
  const resolvedDuration = initialDuration
    ? durationRanges.find((d) => d.label.replace(/\s/g, "") === initialDuration.replace(/\s/g, ""))?.label ?? ""
    : "";

  const [filterDestination, setFilterDestination] = useState(initialDestination);
  const [filterTravelType, setFilterTravelType] = useState(initialTravelType);
  const [filterDuration, setFilterDuration] = useState(resolvedDuration);
  const [filterPrice, setFilterPrice] = useState(resolvedPrice);
  const [filterRating, setFilterRating] = useState("");
  const [filterCategory, setFilterCategory] = useState(initialCategory);
  // Tier (Essentials/Signature/Private) is derived from existing categories so
  // we don't need a Sanity migration. We keep it as a separate filter state
  // because "Signature" maps to "no Budget AND no Luxury", which a single
  // category-string filter can't express.
  const initialTier = sp.get("tier") ?? "";
  const [filterTier, setFilterTier] = useState(initialTier);
  // Region toggles the existing ?region= URL param via state so the chips
  // stay in sync without a full page reload.
  const [filterRegion, setFilterRegion] = useState(initialRegion);
  // Source-city pickup. Tier-2/3 routes (Lucknow/Kanpur/Haridwar) are an
  // open slot vs Veena (Mumbai/Pune-anchored) and PYT (metro-only).
  const initialPickup = sp.get("pickup") ?? "";
  const [filterPickup, setFilterPickup] = useState(initialPickup);
  const [filterStyle, setFilterStyle] = useState(initialStyle);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync state → URL (shallow, no scroll)
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterDestination) params.set("destination", filterDestination);
    if (filterTravelType) params.set("type", filterTravelType);
    if (filterDuration) params.set("duration", filterDuration.replace(/\s/g, ""));
    if (filterPrice) {
      const key = Object.entries(BUDGET_TO_PRICE).find(([, v]) => v === filterPrice)?.[0];
      if (key) params.set("budget", key);
    }
    if (filterRating) params.set("rating", filterRating);
    if (filterCategory) params.set("category", filterCategory);
    if (filterTier) params.set("tier", filterTier);
    if (filterPickup) params.set("pickup", filterPickup);
    if (filterStyle) params.set("style", filterStyle);
    if (sortBy && sortBy !== "popular") params.set("sort", sortBy);
    if (filterRegion) params.set("region", filterRegion);

    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [filterDestination, filterTravelType, filterDuration, filterPrice, filterRating, filterCategory, filterTier, filterRegion, filterPickup, filterStyle, sortBy, pathname, router]);

  const filtered = useMemo(() => {
    const list = packages.filter((p) => {
      if (filterDestination && p.destinationSlug !== filterDestination) return false;
      if (filterTravelType && p.travelType !== filterTravelType) return false;
      if (filterRegion === "domestic" && !INDIA_SLUGS.has(p.destinationSlug)) return false;
      if (filterRegion === "international" && INDIA_SLUGS.has(p.destinationSlug)) return false;
      if (filterDuration) {
        const range = durationRanges.find((d) => d.label === filterDuration);
        if (range && (p.days < range.min || p.days > range.max)) return false;
      }
      if (filterPrice) {
        const range = priceRanges.find((r) => r.label === filterPrice);
        if (range && (p.price < range.min || p.price > range.max)) return false;
      }
      if (filterRating) {
        const floor = parseFloat(filterRating);
        if (!p.rating || p.rating < floor) return false;
      }
      if (filterCategory) {
        if (!p.categories || !p.categories.includes(filterCategory)) return false;
      }
      if (filterTier) {
        const cats = (p.categories ?? []).map((c) => c.toLowerCase());
        if (filterTier === "essentials" && !cats.includes("budget")) return false;
        if (filterTier === "private"    && !cats.includes("luxury")) return false;
        if (filterTier === "signature"  && (cats.includes("budget") || cats.includes("luxury"))) return false;
      }
      if (filterPickup) {
        if (!p.tags?.includes(`ex-${filterPickup}`)) return false;
      }
      if (filterStyle) {
        const cats = (p.categories ?? []).map((c) => c.toLowerCase());
        const tt = p.travelType ?? "";
        let ok = false;
        switch (filterStyle) {
          case "Honeymoon": ok = cats.includes("honeymoon"); break;
          case "Family":    ok = cats.includes("family") || tt === "Family"; break;
          case "Solo":      ok = cats.includes("solo") || tt === "Solo"; break;
          case "Group":     ok = cats.includes("groups") || tt === "Group"; break;
          case "Adventure": ok = cats.includes("adventure"); break;
          case "Wellness":  ok = cats.includes("wellness"); break;
          case "Pilgrim":   ok = cats.includes("pilgrim") || cats.includes("spiritual"); break;
          case "Luxury":    ok = cats.includes("luxury"); break;
          default:          ok = true;
        }
        if (!ok) return false;
      }
      return true;
    });

    // Sort
    const sorted = [...list];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "duration-asc":
        sorted.sort((a, b) => a.days - b.days);
        break;
      case "newest":
        // heuristic: reverse original order (closest to array end = newest in Sanity)
        sorted.reverse();
        break;
      case "popular":
      default:
        sorted.sort((a, b) => {
          const scoreA = (a.rating ?? 0) * (a.reviews ?? 0) + (a.trending ? 100 : 0);
          const scoreB = (b.rating ?? 0) * (b.reviews ?? 0) + (b.trending ? 100 : 0);
          return scoreB - scoreA;
        });
    }
    return sorted;
  }, [packages, filterDestination, filterTravelType, filterDuration, filterPrice, filterRating, filterCategory, filterStyle, filterTier, filterRegion, filterPickup, sortBy]);

  const activeFilterCount =
    (filterDestination ? 1 : 0) +
    (filterTravelType ? 1 : 0) +
    (filterDuration ? 1 : 0) +
    (filterPrice ? 1 : 0) +
    (filterRating ? 1 : 0) +
    (filterCategory ? 1 : 0) +
    (filterStyle ? 1 : 0);

  const clearAll = () => {
    setFilterDestination("");
    setFilterTravelType("");
    setFilterDuration("");
    setFilterPrice("");
    setFilterRating("");
    setFilterCategory("");
    setFilterTier("");
    setFilterRegion("");
    setFilterPickup("");
    setFilterStyle("");
    setSortBy("popular");
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        {/* Tier + region chip rail — quick top-level segmenting that maps to
            existing categories/region filters. Renders on every viewport. */}
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-tat-charcoal/50 shrink-0">Tier</span>
            {[
              { v: "",           l: "All",        sub: "Every budget" },
              { v: "essentials", l: "Essentials", sub: "Pocket-friendly" },
              { v: "signature",  l: "Signature",  sub: "Hand-curated" },
              { v: "private",    l: "Private",    sub: "Bespoke + concierge" },
            ].map((t) => {
              const active = filterTier === t.v;
              return (
                <button
                  key={t.v || "all-tier"}
                  type="button"
                  onClick={() => setFilterTier(t.v)}
                  aria-pressed={active}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    active
                      ? "bg-tat-charcoal text-tat-paper border-tat-charcoal"
                      : "bg-white text-tat-charcoal/70 border-tat-charcoal/15 hover:border-tat-charcoal/30 hover:text-tat-charcoal"
                  }`}
                >
                  {t.l}
                  <span className={`text-[10px] font-normal ${active ? "text-tat-paper/70" : "text-tat-charcoal/45"}`}>· {t.sub}</span>
                </button>
              );
            })}
          </div>
          {filterTier && filterTier !== "" && (() => {
            const tierLink = filterTier === "essentials" ? "/essentials"
              : filterTier === "signature" ? "/signature"
              : filterTier === "private"   ? "/private"
              : null;
            if (!tierLink) return null;
            return (
              <p className="text-[11px] text-tat-charcoal/55">
                Want the dedicated story for this tier?{" "}
                <Link href={tierLink} className="font-semibold text-tat-gold hover:text-tat-charcoal underline-offset-2 hover:underline">
                  Visit the {filterTier.charAt(0).toUpperCase() + filterTier.slice(1)} page →
                </Link>
              </p>
            );
          })()}
          {(() => {
            // Source-city pickup rail. Surfaces only when any package carries
            // an `ex-*` tag, so the chip strip disappears for flat catalogs
            // and keeps the UI honest.
            const cityCounts = new Map<string, number>();
            for (const p of packages) {
              for (const t of p.tags ?? []) {
                if (t.startsWith("ex-")) cityCounts.set(t.slice(3), (cityCounts.get(t.slice(3)) ?? 0) + 1);
              }
            }
            if (!cityCounts.size) return null;
            const cities = [...cityCounts.entries()].sort((a, b) => b[1] - a[1]);
            return (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-tat-charcoal/50 shrink-0">Pickup from</span>
                <button
                  type="button"
                  onClick={() => setFilterPickup("")}
                  aria-pressed={!filterPickup}
                  className={`shrink-0 inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    !filterPickup
                      ? "bg-tat-orange text-white border-tat-orange"
                      : "bg-white text-tat-charcoal/70 border-tat-charcoal/15 hover:border-tat-charcoal/30"
                  }`}
                >
                  Any city
                </button>
                {cities.map(([city, n]) => {
                  const active = filterPickup === city;
                  const label = city.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setFilterPickup(active ? "" : city)}
                      aria-pressed={active}
                      className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                        active
                          ? "bg-tat-orange text-white border-tat-orange"
                          : "bg-white text-tat-charcoal/70 border-tat-charcoal/15 hover:border-tat-charcoal/30 hover:text-tat-charcoal"
                      }`}
                    >
                      Ex {label}
                      <span className={`text-[10px] ${active ? "text-white/70" : "text-tat-charcoal/40"}`}>{n}</span>
                    </button>
                  );
                })}
              </div>
            );
          })()}

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-tat-charcoal/50 shrink-0">Region</span>
            {[
              { v: "",              l: "All regions" },
              { v: "domestic",      l: "India" },
              { v: "international", l: "International" },
            ].map((r) => {
              const active = filterRegion === r.v;
              return (
                <button
                  key={r.v || "all-region"}
                  type="button"
                  onClick={() => setFilterRegion(r.v)}
                  aria-pressed={active}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    active
                      ? "bg-tat-gold text-tat-charcoal border-tat-gold"
                      : "bg-white text-tat-charcoal/70 border-tat-charcoal/15 hover:border-tat-charcoal/30 hover:text-tat-charcoal"
                  }`}
                >
                  {r.l}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile bar */}
        <div className="flex items-center justify-between gap-3 mb-6 lg:hidden">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-tat-charcoal text-tat-paper text-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{" "}
            {activeFilterCount > 0 && (
              <span className="bg-tat-gold text-tat-charcoal h-5 w-5 rounded-full text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-8 pr-6 py-2.5 rounded-full border border-tat-charcoal/15 text-sm text-tat-charcoal bg-tat-paper focus:outline-none focus:ring-2 focus:ring-tat-gold/40"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-tat-charcoal/50 pointer-events-none" />
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pb-24 no-scrollbar">
              <FilterPanel
                destinations={destinations}
                filterDestination={filterDestination}
                setFilterDestination={setFilterDestination}
                filterTravelType={filterTravelType}
                setFilterTravelType={setFilterTravelType}
                filterDuration={filterDuration}
                setFilterDuration={setFilterDuration}
                filterPrice={filterPrice}
                setFilterPrice={setFilterPrice}
                filterRating={filterRating}
                setFilterRating={setFilterRating}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                activeFilterCount={activeFilterCount}
                clearAll={clearAll}
              />
            </div>
          </aside>

          {/* Mobile drawer */}
          <AnimatePresence>
            {filtersOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setFiltersOpen(false)}
                  className="fixed inset-0 bg-tat-charcoal/60 backdrop-blur-sm z-[60] lg:hidden"
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed left-0 top-0 bottom-0 w-full max-w-sm bg-tat-paper z-[70] overflow-y-auto p-6 lg:hidden"
                >
                  <FilterPanel
                    destinations={destinations}
                    filterDestination={filterDestination}
                    setFilterDestination={setFilterDestination}
                    filterTravelType={filterTravelType}
                    setFilterTravelType={setFilterTravelType}
                    filterDuration={filterDuration}
                    setFilterDuration={setFilterDuration}
                    filterPrice={filterPrice}
                    setFilterPrice={setFilterPrice}
                    filterRating={filterRating}
                    setFilterRating={setFilterRating}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    activeFilterCount={activeFilterCount}
                    clearAll={clearAll}
                    onClose={() => setFiltersOpen(false)}
                  />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <div>
            {/* Active filter chips — visible on both mobile and desktop. */}
            {activeFilterCount > 0 && (
              <ActiveFilterChips
                destinations={destinations}
                filterDestination={filterDestination}
                clearDestination={() => setFilterDestination("")}
                filterTravelType={filterTravelType}
                clearTravelType={() => setFilterTravelType("")}
                filterDuration={filterDuration}
                clearDuration={() => setFilterDuration("")}
                filterPrice={filterPrice}
                clearPrice={() => setFilterPrice("")}
                filterRating={filterRating}
                clearRating={() => setFilterRating("")}
                filterCategory={filterCategory}
                clearCategory={() => setFilterCategory("")}
                filterStyle={filterStyle}
                clearStyle={() => setFilterStyle("")}
                clearAll={clearAll}
              />
            )}

            {/* Desktop results header */}
            <div className="hidden lg:flex items-center justify-between mb-6 gap-4 flex-wrap">
              <p className="text-sm text-tat-charcoal/60">
                <span className="font-medium text-tat-charcoal">{filtered.length}</span> packages
                {activeFilterCount > 0 && (
                  <span className="text-tat-charcoal/45"> · {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} applied</span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-tat-charcoal/50">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-tat-charcoal/15 text-sm text-tat-charcoal bg-white hover:border-tat-charcoal/30 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 transition-colors"
                  >
                    {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-tat-charcoal/50 pointer-events-none" />
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-tat-paper rounded-3xl border border-tat-charcoal/5 px-6">
                <p className="text-5xl mb-5">🧭</p>
                <p className="font-display text-h2 font-medium mb-2">
                  No packages match these filters
                </p>
                <p className="text-tat-charcoal/60 mb-8 max-w-sm mx-auto leading-relaxed">
                  Try relaxing a filter or two — we have 130+ packages across 23 destinations.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button onClick={clearAll} className="btn-primary">
                    Clear all filters
                  </button>
                  <a
                    href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I%20can't%20find%20what%20I'm%20looking%20for.%20Can%20you%20help?"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => captureIntent("whatsapp_click", { note: "Packages list — no-results Ask a planner" })}
                    className="btn-outline"
                  >
                    Ask a planner
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
                {filtered.map((p, i) => (
                  <PackageCard
                    key={p.slug}
                    title={p.title}
                    slug={p.slug}
                    image={p.image}
                    duration={p.duration}
                    price={p.price}
                    rating={p.rating}
                    reviews={p.reviews}
                    destinationName={p.destinationName}
                    travelType={p.travelType}
                    trending={p.trending}
                    limitedSlots={p.limitedSlots}
                    categories={p.categories}
                    index={i}
                  />
                ))}
                <CustomTripCTACard />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface PanelProps {
  destinations: Destination[];
  filterDestination: string;
  setFilterDestination: (v: string) => void;
  filterTravelType: string;
  setFilterTravelType: (v: string) => void;
  filterDuration: string;
  setFilterDuration: (v: string) => void;
  filterPrice: string;
  setFilterPrice: (v: string) => void;
  filterRating: string;
  setFilterRating: (v: string) => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  activeFilterCount: number;
  clearAll: () => void;
  onClose?: () => void;
}

function FilterPanel({
  destinations, filterDestination, setFilterDestination,
  filterTravelType, setFilterTravelType,
  filterDuration, setFilterDuration,
  filterPrice, setFilterPrice,
  filterRating, setFilterRating,
  filterCategory, setFilterCategory,
  activeFilterCount, clearAll, onClose,
}: PanelProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl">Filters</h3>
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-tat-gold underline-offset-2 hover:underline flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-2 rounded-full hover:bg-tat-charcoal/5">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <FilterGroup label="Destination">
        <DestinationFilter
          destinations={destinations}
          value={filterDestination}
          onChange={setFilterDestination}
        />
      </FilterGroup>

      <FilterGroup label="Travel Type">
        <RadioRow
          name="travelType"
          options={[{ label: "All", value: "" }].concat(
            travelTypes.map((t) => ({ label: t, value: t }))
          )}
          value={filterTravelType}
          onChange={setFilterTravelType}
        />
      </FilterGroup>

      <FilterGroup label="Category">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterCategory("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !filterCategory
                ? "bg-tat-charcoal text-tat-paper border-tat-charcoal"
                : "bg-tat-paper text-tat-charcoal/65 border-tat-charcoal/15 hover:border-tat-charcoal/30"
            }`}
          >
            All
          </button>
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(filterCategory === c ? "" : c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filterCategory === c
                  ? "bg-tat-gold/15 text-tat-charcoal border-tat-gold"
                  : "bg-tat-paper text-tat-charcoal/65 border-tat-charcoal/15 hover:border-tat-charcoal/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Duration">
        <RadioRow
          name="duration"
          options={[{ label: "Any", value: "" }].concat(
            durationRanges.map((d) => ({ label: d.label, value: d.label }))
          )}
          value={filterDuration}
          onChange={setFilterDuration}
        />
      </FilterGroup>

      <FilterGroup label="Price Range">
        <RadioRow
          name="price"
          options={[{ label: "Any", value: "" }].concat(
            priceRanges.map((p) => ({ label: p.label, value: p.label }))
          )}
          value={filterPrice}
          onChange={setFilterPrice}
        />
      </FilterGroup>

      <FilterGroup label="Minimum rating" last>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterRating("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !filterRating
                ? "bg-tat-charcoal text-tat-paper border-tat-charcoal"
                : "bg-tat-paper text-tat-charcoal/65 border-tat-charcoal/15 hover:border-tat-charcoal/30"
            }`}
          >
            Any
          </button>
          {ratingFloors.map((r) => (
            <button
              key={r.value}
              onClick={() => setFilterRating(r.value)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filterRating === r.value
                  ? "bg-tat-gold/15 text-tat-charcoal border-tat-gold"
                  : "bg-tat-paper text-tat-charcoal/65 border-tat-charcoal/15 hover:border-tat-charcoal/30"
              }`}
            >
              <Star className="h-3 w-3 fill-tat-gold text-tat-gold" />
              {r.label}
            </button>
          ))}
        </div>
      </FilterGroup>
    </>
  );
}

function FilterGroup({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`pb-6 mb-6 ${!last ? "border-b border-tat-charcoal/10" : ""}`}>
      <h4 className="text-[10px] uppercase tracking-[0.25em] text-tat-charcoal/50 font-medium mb-4">{label}</h4>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function RadioRow({
  name, options, value, onChange,
}: {
  name: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-2.5 cursor-pointer group text-sm">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only peer"
          />
          <span className="h-4 w-4 rounded-full border-2 border-tat-charcoal/20 peer-checked:border-tat-gold peer-checked:bg-tat-gold flex items-center justify-center transition-colors">
            <span className={`h-1.5 w-1.5 rounded-full ${value === o.value ? "bg-tat-charcoal" : ""}`} />
          </span>
          <span className="text-tat-charcoal/80 group-hover:text-tat-charcoal peer-checked:text-tat-charcoal peer-checked:font-medium">
            {o.label}
          </span>
        </label>
      ))}
    </>
  );
}

// Search-able, grouped destination filter — replaces the flat radio list
// in the FilterPanel sidebar so users can find destinations like "Spiti"
// or "Bali" without scanning a 25-row column. Uses useDeferredValue so the
// keystroke handler stays snappy even with longer destination lists.
function DestinationFilter({
  destinations, value, onChange,
}: {
  destinations: Destination[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const { domestic, international } = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const match = (d: Destination) =>
      !q || d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q);
    return {
      domestic: destinations.filter((d) => d.country === "India" && match(d)),
      international: destinations.filter((d) => d.country !== "India" && match(d)),
    };
  }, [destinations, deferredQuery]);

  const totalMatches = domestic.length + international.length;

  return (
    <div className="space-y-3">
      {/* Search input */}
      <label htmlFor="dest-filter-search" className="sr-only">Search destinations</label>
      <input
        id="dest-filter-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search destinations…"
        className="w-full px-3 py-2 rounded-lg border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal placeholder:text-tat-charcoal/40 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-charcoal/30"
      />

      {/* "All" reset row */}
      <label className="flex items-center gap-2.5 cursor-pointer group text-sm">
        <input
          type="radio"
          name="destination"
          value=""
          checked={value === ""}
          onChange={() => onChange("")}
          className="peer sr-only"
        />
        <span className="h-4 w-4 rounded-full border-2 border-tat-charcoal/25 peer-checked:border-tat-charcoal flex items-center justify-center transition-colors">
          <span className={`h-1.5 w-1.5 rounded-full ${value === "" ? "bg-tat-charcoal" : ""}`} />
        </span>
        <span className="text-tat-charcoal/80 group-hover:text-tat-charcoal peer-checked:text-tat-charcoal peer-checked:font-medium">
          All destinations
        </span>
      </label>

      {totalMatches === 0 && (
        <p className="text-xs text-tat-charcoal/45 italic px-1">
          No destinations match &ldquo;{deferredQuery}&rdquo;.
        </p>
      )}

      {domestic.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-tat-charcoal/45">
            Domestic
          </p>
          <RadioRow
            name="destination"
            options={domestic.map((d) => ({ label: d.name, value: d.slug }))}
            value={value}
            onChange={onChange}
          />
        </div>
      )}

      {international.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-tat-charcoal/45">
            International
          </p>
          <RadioRow
            name="destination"
            options={international.map((d) => ({ label: d.name, value: d.slug }))}
            value={value}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}

// Inline summary of every applied filter as removable chips. Shown above
// the results grid so users see what's filtering without opening the panel
// and can remove a single filter without touching the rest.
interface ChipsProps {
  destinations: Destination[];
  filterDestination: string;
  clearDestination: () => void;
  filterTravelType: string;
  clearTravelType: () => void;
  filterDuration: string;
  clearDuration: () => void;
  filterPrice: string;
  clearPrice: () => void;
  filterRating: string;
  clearRating: () => void;
  filterCategory: string;
  clearCategory: () => void;
  filterStyle: string;
  clearStyle: () => void;
  clearAll: () => void;
}

function ActiveFilterChips({
  destinations,
  filterDestination, clearDestination,
  filterTravelType, clearTravelType,
  filterDuration, clearDuration,
  filterPrice, clearPrice,
  filterRating, clearRating,
  filterCategory, clearCategory,
  filterStyle, clearStyle,
  clearAll,
}: ChipsProps) {
  const destName = filterDestination
    ? destinations.find((d) => d.slug === filterDestination)?.name ?? filterDestination
    : "";

  const chips: { label: string; onRemove: () => void }[] = [];
  if (filterDestination) chips.push({ label: destName, onRemove: clearDestination });
  if (filterStyle) chips.push({ label: `Style: ${filterStyle}`, onRemove: clearStyle });
  if (filterTravelType) chips.push({ label: filterTravelType, onRemove: clearTravelType });
  if (filterCategory) chips.push({ label: filterCategory, onRemove: clearCategory });
  if (filterDuration) chips.push({ label: filterDuration, onRemove: clearDuration });
  if (filterPrice) chips.push({ label: filterPrice, onRemove: clearPrice });
  if (filterRating) chips.push({ label: `${filterRating}★ +`, onRemove: clearRating });

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-2 mb-5">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.onRemove}
          className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-tat-charcoal/8 hover:bg-tat-charcoal/15 text-tat-charcoal text-xs transition-colors"
          aria-label={`Remove filter ${c.label}`}
        >
          {c.label}
          <X className="h-3 w-3 opacity-60" aria-hidden />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-tat-gold hover:text-tat-charcoal underline-offset-2 hover:underline transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

// Filler card that always sits at the end of the package grid so the last
// row never reads as orphaned. Doubles as a soft conversion path for users
// who don't see a perfect match in the listed packages.
function CustomTripCTACard() {
  return (
    <Link
      href="/customize-trip"
      onClick={() => captureIntent("customize_click", { note: "Packages grid · Custom-trip CTA card" })}
      className="group flex flex-col justify-between rounded-3xl border-2 border-dashed border-tat-gold/30 bg-gradient-to-br from-tat-gold/5 via-transparent to-tat-gold/15 hover:border-tat-gold hover:from-tat-gold/15 transition-colors p-6 md:p-7 min-h-[420px]"
    >
      <div>
        <span className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-tat-gold/15 text-tat-gold mb-4">
          <Sparkles className="h-5 w-5" />
        </span>
        <p className="text-[10px] uppercase tracking-[0.22em] text-tat-gold font-semibold">Don&apos;t see what you want?</p>
        <h3 className="mt-2 font-display text-h3 font-medium text-tat-charcoal text-balance">
          We craft custom itineraries in <em className="not-italic italic font-display text-tat-gold">24 hours</em>.
        </h3>
        <p className="mt-3 text-sm text-tat-charcoal/65 leading-relaxed">
          Tell us where, when, and the kind of trip you want. A real planner
          builds your itinerary, free until you&apos;re sure.
        </p>
      </div>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-tat-gold group-hover:gap-2 transition-all">
        Plan my custom trip
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
