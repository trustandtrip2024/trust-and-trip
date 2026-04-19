"use client";

import { useState, useMemo } from "react";
import PackageCard from "@/components/PackageCard";
import CTASection from "@/components/CTASection";
import { packages, destinations } from "@/lib/data";
import { SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function PackagesPage() {
  const [filterDestination, setFilterDestination] = useState<string>("");
  const [filterTravelType, setFilterTravelType] = useState<string>("");
  const [filterDuration, setFilterDuration] = useState<string>("");
  const [filterPrice, setFilterPrice] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      if (filterDestination && p.destinationSlug !== filterDestination) return false;
      if (filterTravelType && p.travelType !== filterTravelType) return false;
      if (filterDuration) {
        const range = durationRanges.find((d) => d.label === filterDuration);
        if (range && (p.days < range.min || p.days > range.max)) return false;
      }
      if (filterPrice) {
        const range = priceRanges.find((r) => r.label === filterPrice);
        if (range && (p.price < range.min || p.price > range.max)) return false;
      }
      return true;
    });
  }, [filterDestination, filterTravelType, filterDuration, filterPrice]);

  const activeFilterCount =
    (filterDestination ? 1 : 0) +
    (filterTravelType ? 1 : 0) +
    (filterDuration ? 1 : 0) +
    (filterPrice ? 1 : 0);

  const clearAll = () => {
    setFilterDestination("");
    setFilterTravelType("");
    setFilterDuration("");
    setFilterPrice("");
  };

  return (
    <>
      {/* Hero band */}
      <section className="pt-28 md:pt-36 pb-12 md:pb-16 bg-cream border-b border-ink/5">
        <div className="container-custom">
          <span className="eyebrow">Our Packages</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] max-w-4xl text-balance">
            Signature journeys.
            <span className="italic text-gold font-light"> Ready to live.</span>
          </h1>
          <p className="mt-6 text-ink/60 max-w-xl leading-relaxed">
            Every package here was designed by a planner who's been there. Filter by what
            matters, or let us build one from scratch.
          </p>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          {/* Filter bar */}
          <div className="flex items-center justify-between gap-4 mb-8 md:hidden">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-ink text-cream text-sm"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters {activeFilterCount > 0 && <span className="bg-gold text-ink h-5 w-5 rounded-full text-xs flex items-center justify-center">{activeFilterCount}</span>}
            </button>
            <p className="text-sm text-ink/60">{filtered.length} results</p>
          </div>

          <div className="grid md:grid-cols-[260px_1fr] gap-8 lg:gap-12">
            {/* Filters — desktop sidebar (always visible) */}
            <aside className="hidden md:block">
              <div className="md:sticky md:top-28">
                <FilterPanel
                  filterDestination={filterDestination}
                  setFilterDestination={setFilterDestination}
                  filterTravelType={filterTravelType}
                  setFilterTravelType={setFilterTravelType}
                  filterDuration={filterDuration}
                  setFilterDuration={setFilterDuration}
                  filterPrice={filterPrice}
                  setFilterPrice={setFilterPrice}
                  activeFilterCount={activeFilterCount}
                  clearAll={clearAll}
                />
              </div>
            </aside>

            {/* Filters — mobile drawer */}
            <AnimatePresence>
              {filtersOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setFiltersOpen(false)}
                    className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[60] md:hidden"
                  />
                  <motion.aside
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed left-0 top-0 bottom-0 w-full max-w-sm bg-cream z-[70] overflow-y-auto p-6 md:hidden"
                  >
                    <FilterPanel
                      filterDestination={filterDestination}
                      setFilterDestination={setFilterDestination}
                      filterTravelType={filterTravelType}
                      setFilterTravelType={setFilterTravelType}
                      filterDuration={filterDuration}
                      setFilterDuration={setFilterDuration}
                      filterPrice={filterPrice}
                      setFilterPrice={setFilterPrice}
                      activeFilterCount={activeFilterCount}
                      clearAll={clearAll}
                      onClose={() => setFiltersOpen(false)}
                    />
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            {/* Results */}
            <div>
              <div className="hidden md:flex items-center justify-between mb-6">
                <p className="text-sm text-ink/60">
                  <span className="font-medium text-ink">{filtered.length}</span> packages available
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-20 bg-cream rounded-3xl border border-ink/5">
                  <p className="font-display text-2xl mb-2">No packages match your filters</p>
                  <p className="text-ink/60 mb-6">Try clearing some filters to see more options.</p>
                  <button onClick={clearAll} className="btn-outline">Clear filters</button>
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
                      index={i}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}

function FilterPanel({
  filterDestination,
  setFilterDestination,
  filterTravelType,
  setFilterTravelType,
  filterDuration,
  setFilterDuration,
  filterPrice,
  setFilterPrice,
  activeFilterCount,
  clearAll,
  onClose,
}: {
  filterDestination: string;
  setFilterDestination: (v: string) => void;
  filterTravelType: string;
  setFilterTravelType: (v: string) => void;
  filterDuration: string;
  setFilterDuration: (v: string) => void;
  filterPrice: string;
  setFilterPrice: (v: string) => void;
  activeFilterCount: number;
  clearAll: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl">Filters</h3>
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-gold underline-offset-2 hover:underline flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-full hover:bg-ink/5"
              aria-label="Close filters"
            >
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

      <FilterGroup label="Price Range" last>
        <RadioRow
          name="price"
          options={[{ label: "Any", value: "" }].concat(
            priceRanges.map((p) => ({ label: p.label, value: p.label }))
          )}
          value={filterPrice}
          onChange={setFilterPrice}
        />
      </FilterGroup>
    </>
  );
}

function FilterGroup({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`pb-6 mb-6 ${!last ? "border-b border-ink/10" : ""}`}>
      <h4 className="text-[10px] uppercase tracking-[0.25em] text-ink/50 font-medium mb-4">
        {label}
      </h4>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function RadioRow({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      {options.map((o) => (
        <label
          key={o.value}
          className="flex items-center gap-2.5 cursor-pointer group text-sm"
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only peer"
          />
          <span className="h-4 w-4 rounded-full border-2 border-ink/20 peer-checked:border-gold peer-checked:bg-gold flex items-center justify-center transition-colors">
            <span className={`h-1.5 w-1.5 rounded-full ${value === o.value ? "bg-ink" : ""}`} />
          </span>
          <span className="text-ink/80 group-hover:text-ink peer-checked:text-ink peer-checked:font-medium">
            {o.label}
          </span>
        </label>
      ))}
    </>
  );
}
