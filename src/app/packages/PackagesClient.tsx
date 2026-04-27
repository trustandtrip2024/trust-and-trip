"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import PackageCard from "@/components/PackageCard";
import type { Package, Destination } from "@/lib/data";
import { SlidersHorizontal, X, ArrowUpDown, Star } from "lucide-react";
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

const INDIA_SLUGS = new Set(["kerala","goa","manali","rajasthan","ladakh","andaman","shimla","coorg","varanasi","agra"]);

interface Props {
  packages: Package[];
  destinations: Destination[];
  initialDestination?: string;
  initialTravelType?: string;
  initialDuration?: string;
  initialBudget?: string;
  initialRegion?: string;
  initialCategory?: string;
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
  initialDestination = "",
  initialTravelType = "",
  initialDuration = "",
  initialBudget = "",
  initialRegion = "",
  initialCategory = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

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
    if (sortBy && sortBy !== "popular") params.set("sort", sortBy);
    if (initialRegion) params.set("region", initialRegion);

    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [filterDestination, filterTravelType, filterDuration, filterPrice, filterRating, filterCategory, sortBy, initialRegion, pathname, router]);

  const filtered = useMemo(() => {
    const list = packages.filter((p) => {
      if (filterDestination && p.destinationSlug !== filterDestination) return false;
      if (filterTravelType && p.travelType !== filterTravelType) return false;
      if (initialRegion === "domestic" && !INDIA_SLUGS.has(p.destinationSlug)) return false;
      if (initialRegion === "international" && INDIA_SLUGS.has(p.destinationSlug)) return false;
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
  }, [packages, filterDestination, filterTravelType, filterDuration, filterPrice, filterRating, filterCategory, sortBy, initialRegion]);

  const activeFilterCount =
    (filterDestination ? 1 : 0) +
    (filterTravelType ? 1 : 0) +
    (filterDuration ? 1 : 0) +
    (filterPrice ? 1 : 0) +
    (filterRating ? 1 : 0) +
    (filterCategory ? 1 : 0);

  const clearAll = () => {
    setFilterDestination("");
    setFilterTravelType("");
    setFilterDuration("");
    setFilterPrice("");
    setFilterRating("");
    setFilterCategory("");
    setSortBy("popular");
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        {/* Mobile bar */}
        <div className="flex items-center justify-between gap-3 mb-6 md:hidden">
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

        <div className="grid md:grid-cols-[260px_1fr] gap-8 lg:gap-12">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <div className="md:sticky md:top-28">
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
                  className="fixed inset-0 bg-tat-charcoal/60 backdrop-blur-sm z-[60] md:hidden"
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed left-0 top-0 bottom-0 w-full max-w-sm bg-tat-paper z-[70] overflow-y-auto p-6 md:hidden"
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
            {/* Desktop results header */}
            <div className="hidden md:flex items-center justify-between mb-6 gap-4 flex-wrap">
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
                <p className="font-display text-2xl font-medium mb-2">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
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
            <button onClick={onClose} className="md:hidden p-2 rounded-full hover:bg-tat-charcoal/5">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <FilterGroup label="Destination">
        <RadioRow
          name="destination"
          options={[{ label: "All", value: "" }].concat(
            destinations.map((d) => ({ label: d.name, value: d.slug }))
          )}
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
