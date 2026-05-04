"use client";

import { useState, useMemo, useEffect, useDeferredValue } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PackageCard from "@/components/PackageCard";
import type { Package, Destination } from "@/lib/data";
import { SlidersHorizontal, X, ArrowUpDown, Star, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { captureIntent } from "@/lib/capture-intent";
import StickyOnScrollUp from "@/components/StickyOnScrollUp";

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

// Mirrors the categories actually used on Sanity package documents (audited
// 2026-05). Chips that returned 0 results ("Budget") are dropped, and the
// long-tail categories ("Wildlife", "Weekend") that exist in content but
// were missing from the chip rail are added so every Sanity tag is surfaced.
const CATEGORY_OPTIONS = [
  "Honeymoon", "Family", "Adventure", "Wellness", "Cultural",
  "Spiritual", "Pilgrim", "Luxury", "Quick Trips", "Weekend",
  "Beach", "Mountain", "Wildlife", "International", "Groups", "Solo",
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

// India region detection — derived from the live Sanity destinations prop
// rather than a hand-maintained slug list. Keeping a static fallback here
// caused `?region=domestic` to silently exclude packages anchored to any
// destination added after the list was last edited (uttarakhand, char-dham,
// tirupati, lakshadweep, spiti-valley, zanskar-valley, etc.). The static
// FALLBACK is kept only as belt-and-braces if `destinations` is empty.
const INDIA_SLUG_FALLBACK = new Set([
  "kerala","goa","manali","rajasthan","ladakh","andaman","shimla","coorg",
  "varanasi","kashmir","sikkim","spiti-valley","zanskar-valley",
  "uttarakhand","char-dham","tirupati","lakshadweep","pondicherry",
  "mahabaleshwar","lonavala","mount-abu","kanha","ranthambore","pushkar",
  "darjeeling","north-east","puri",
]);

// Tier price thresholds — must match the equivalent constants in
// /essentials, /signature and /private so `?tier=` filtering returns
// the same packages a visitor would see on those landing pages.
const ESSENTIALS_CEILING = 50000;
const SIGNATURE_FLOOR    = 50000;
const SIGNATURE_CEILING  = 150000;
const PRIVATE_FLOOR      = 150000;

// Visa-free destinations for Indian passports — mirrors the same list used
// on /destinations and /offers so the `?theme=visa-free` Footer SEO chip
// returns the right packages. Kept as a static set because visa policy is
// political-not-content state; a Sanity-driven flag is overkill.
const VISA_FREE_SLUGS = new Set([
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "jordan", "indonesia", "fiji",
]);

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
  // ?theme= covers Footer SEO chips (visa-free, etc.) that don't map cleanly
  // onto a Sanity category. Right now only "visa-free" is honoured — it
  // filters to packages anchored to a passport-free destination from
  // VISA_FREE_SLUGS. Future themes can extend the same param.
  const initialTheme = sp.get("theme") ?? "";

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
  // Pickup is a RANKING boost, not a hard filter — packages departing from
  // the visitor's chosen city sort to the top, but cards from every other
  // pickup city stay visible below them. Keeps Tier-2 routes (Lucknow,
  // Kanpur, Haridwar) discoverable to a Mumbai visitor without forcing
  // them to clear the filter to see anything else.
  const initialPickup = sp.get("pickup") ?? "";
  const [filterPickup, setFilterPickup] = useState(initialPickup);
  // Tag pivot — chip rail of the most common tags across the currently
  // filtered set. Lets visitors slice on real package metadata (e.g.
  // "Visa on Arrival", "Helicopter Option", "Family Europe") without
  // pre-defining every tag at build time.
  const initialTag = sp.get("tag") ?? "";
  const [filterTag, setFilterTag] = useState(initialTag);
  const [filterStyle, setFilterStyle] = useState(initialStyle);
  const [filterTheme, setFilterTheme] = useState(initialTheme);
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
    if (filterTag) params.set("tag", filterTag);
    if (filterStyle) params.set("style", filterStyle);
    if (filterTheme) params.set("theme", filterTheme);
    if (sortBy && sortBy !== "popular") params.set("sort", sortBy);
    if (filterRegion) params.set("region", filterRegion);

    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [filterDestination, filterTravelType, filterDuration, filterPrice, filterRating, filterCategory, filterTier, filterRegion, filterPickup, filterTag, filterStyle, filterTheme, sortBy, pathname, router]);

  // India-vs-international detection from the live `destinations` prop.
  // Falls back to the curated slug set only if Sanity returned nothing,
  // so the page never crashes during a refetch. See INDIA_SLUG_FALLBACK
  // for the rationale.
  const indiaSlugs = useMemo(() => {
    if (destinations.length === 0) return INDIA_SLUG_FALLBACK;
    const set = new Set<string>();
    for (const d of destinations) {
      if (d.country === "India") set.add(d.slug);
    }
    // Layer the fallback in so a destination missing the country field
    // doesn't accidentally drop out of the domestic bucket.
    INDIA_SLUG_FALLBACK.forEach((s) => set.add(s));
    return set;
  }, [destinations]);

  const filtered = useMemo(() => {
    const list = packages.filter((p) => {
      if (filterDestination && p.destinationSlug !== filterDestination) return false;
      if (filterTravelType && p.travelType !== filterTravelType) return false;
      if (filterRegion === "domestic" && !indiaSlugs.has(p.destinationSlug)) return false;
      if (filterRegion === "international" && indiaSlugs.has(p.destinationSlug)) return false;
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
        // Tier filter must match the price-threshold logic used by the
        // dedicated /essentials, /signature and /private landing pages.
        // Earlier this filtered on a non-existent "Budget" category and
        // returned 0 results for ?tier=essentials.
        const cats = (p.categories ?? []).map((c) => c.toLowerCase());
        const isLuxury = cats.includes("luxury");
        if (filterTier === "essentials" && p.price >= ESSENTIALS_CEILING) return false;
        if (filterTier === "signature"  && (p.price < SIGNATURE_FLOOR || p.price >= SIGNATURE_CEILING || isLuxury)) return false;
        if (filterTier === "private"    && p.price < PRIVATE_FLOOR && !isLuxury) return false;
      }
      // Pickup is intentionally NOT a hard filter — see filterPickup
      // declaration above. The boost is applied during sort below so a
      // visitor anchored to "Lucknow" still sees Mumbai, Delhi and metro
      // departures, just ranked below the matching Lucknow trips.
      if (filterTag) {
        if (!p.tags?.includes(filterTag)) return false;
      }
      if (filterTheme === "visa-free") {
        if (!VISA_FREE_SLUGS.has(p.destinationSlug)) return false;
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

    // Sort. Pickup boost is layered on every sort mode — even on
    // price-asc/desc, the chosen pickup city's trips float to the top of
    // their respective price band so the visitor sees their own departure
    // options first without losing the sort intent.
    const pickupTag = filterPickup ? `ex-${filterPickup}` : "";
    const matchesPickup = (p: Package) =>
      pickupTag ? (p.tags?.includes(pickupTag) ? 1 : 0) : 0;

    const sorted = [...list];
    const baseCmp = (a: Package, b: Package): number => {
      switch (sortBy) {
        case "price-asc":    return a.price - b.price;
        case "price-desc":   return b.price - a.price;
        case "rating":       return (b.rating ?? 0) - (a.rating ?? 0);
        case "duration-asc": return a.days - b.days;
        case "newest":       return 0;
        case "popular":
        default: {
          const sa = (a.rating ?? 0) * (a.reviews ?? 0) + (a.trending ? 100 : 0);
          const sb = (b.rating ?? 0) * (b.reviews ?? 0) + (b.trending ? 100 : 0);
          return sb - sa;
        }
      }
    };
    if (sortBy === "newest") sorted.reverse();
    sorted.sort((a, b) => matchesPickup(b) - matchesPickup(a) || baseCmp(a, b));
    return sorted;
  }, [packages, filterDestination, filterTravelType, filterDuration, filterPrice, filterRating, filterCategory, filterStyle, filterTheme, filterTier, filterRegion, filterPickup, filterTag, indiaSlugs, sortBy]);

  const activeFilterCount =
    (filterDestination ? 1 : 0) +
    (filterTravelType ? 1 : 0) +
    (filterDuration ? 1 : 0) +
    (filterPrice ? 1 : 0) +
    (filterRating ? 1 : 0) +
    (filterCategory ? 1 : 0) +
    (filterStyle ? 1 : 0) +
    (filterTheme ? 1 : 0) +
    (filterTag ? 1 : 0);

  // Top tag pivots from the currently filtered set. Strips internal-only
  // tags (ex-<city>, Domestic, International — already surfaced as their
  // own chips) so the rail shows real content metadata. Capped at 12 so
  // it stays a single overflow row on mobile.
  const tagPivots = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of filtered) {
      for (const t of p.tags ?? []) {
        if (!t || t.startsWith("ex-")) continue;
        if (t === "Domestic" || t === "International") continue;
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [filtered]);

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
    setFilterTag("");
    setFilterStyle("");
    setFilterTheme("");
    setSortBy("popular");
  };

  // Source-city pickup options derived from `ex-<city>` tags. Drives the
  // Pickup section inside the filter drawer.
  const pickupCities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of packages) {
      for (const t of p.tags ?? []) {
        if (t.startsWith("ex-")) counts.set(t.slice(3), (counts.get(t.slice(3)) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [packages]);

  return (
    <section className="pb-12 md:pb-16">
      {/* Sticky toolbar — collapses tier + region + filter + sort into a
          single bar that hides on scroll-down and reveals on scroll-up. */}
      <StickyOnScrollUp className="bg-tat-paper/95 backdrop-blur-md border-b border-tat-charcoal/8">
        <div className="container-custom py-3 flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 h-10 px-3.5 rounded-full bg-tat-charcoal text-tat-paper text-[13px] font-semibold"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-tat-gold text-tat-charcoal h-5 min-w-[20px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-1 shrink-0">
            {[
              { v: "",           l: "All" },
              { v: "essentials", l: "Essentials" },
              { v: "signature",  l: "Signature" },
              { v: "private",    l: "Private" },
            ].map((t) => {
              const active = filterTier === t.v;
              return (
                <button
                  key={t.v || "all-tier"}
                  type="button"
                  onClick={() => setFilterTier(t.v)}
                  aria-pressed={active}
                  className={`shrink-0 h-9 px-3 rounded-full text-[12px] font-semibold transition-colors ${
                    active
                      ? "bg-tat-charcoal text-tat-paper"
                      : "text-tat-charcoal/70 hover:bg-tat-charcoal/8"
                  }`}
                >
                  {t.l}
                </button>
              );
            })}
          </div>

          <span className="hidden sm:block h-5 w-px bg-tat-charcoal/15 shrink-0" />

          <div className="flex items-center gap-1 shrink-0">
            {[
              { v: "",              l: "All" },
              { v: "domestic",      l: "India" },
              { v: "international", l: "Intl" },
            ].map((r) => {
              const active = filterRegion === r.v;
              return (
                <button
                  key={r.v || "all-region"}
                  type="button"
                  onClick={() => setFilterRegion(r.v)}
                  aria-pressed={active}
                  className={`shrink-0 h-9 px-3 rounded-full text-[12px] font-semibold transition-colors ${
                    active
                      ? "bg-tat-gold text-tat-charcoal"
                      : "text-tat-charcoal/70 hover:bg-tat-charcoal/8"
                  }`}
                >
                  {r.l}
                </button>
              );
            })}
          </div>

          <div className="ml-auto relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none h-10 pl-9 pr-4 rounded-full border border-tat-charcoal/15 text-[12px] font-semibold text-tat-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-tat-gold/40"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-tat-charcoal/50 pointer-events-none" />
          </div>
        </div>
      </StickyOnScrollUp>

      <div className="container-custom pt-6 md:pt-8">
        {/* Mobile-only tier chips — too many to fit alongside the filter
            button on a phone, so they fall below the sticky bar instead. */}
        <div className="sm:hidden flex items-center gap-1 overflow-x-auto no-scrollbar mb-4">
          {[
            { v: "",           l: "All tiers" },
            { v: "essentials", l: "Essentials" },
            { v: "signature",  l: "Signature" },
            { v: "private",    l: "Private" },
          ].map((t) => {
            const active = filterTier === t.v;
            return (
              <button
                key={t.v || "all-tier-m"}
                type="button"
                onClick={() => setFilterTier(t.v)}
                aria-pressed={active}
                className={`shrink-0 h-8 px-3 rounded-full text-[12px] font-semibold transition-colors ${
                  active
                    ? "bg-tat-charcoal text-tat-paper"
                    : "bg-white border border-tat-charcoal/15 text-tat-charcoal/70"
                }`}
              >
                {t.l}
              </button>
            );
          })}
        </div>

        {/* Drawer — same panel for every viewport. Replaces the old
            desktop sidebar + mobile drawer split so we maintain one filter
            surface instead of two. */}
        <AnimatePresence>
          {filtersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setFiltersOpen(false)}
                className="fixed inset-0 bg-tat-charcoal/60 backdrop-blur-sm z-[60]"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-full max-w-sm bg-tat-paper z-[70] overflow-y-auto p-6"
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
                  filterPickup={filterPickup}
                  setFilterPickup={setFilterPickup}
                  pickupCities={pickupCities}
                  filterTag={filterTag}
                  setFilterTag={setFilterTag}
                  tagPivots={tagPivots}
                  activeFilterCount={activeFilterCount}
                  clearAll={clearAll}
                  onClose={() => setFiltersOpen(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div>
          {/* Active filter chips — Pickup is a soft boost (not counted in
              activeFilterCount) but still shown as a removable chip so the
              visitor can clear it without re-opening the drawer. */}
          {(activeFilterCount > 0 || filterPickup) && (
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
              filterTheme={filterTheme}
              clearTheme={() => setFilterTheme("")}
              filterTag={filterTag}
              clearTag={() => setFilterTag("")}
              filterPickup={filterPickup}
              clearPickup={() => setFilterPickup("")}
              clearAll={clearAll}
            />
          )}

          <p className="text-sm text-tat-charcoal/60 mb-5">
            <span className="font-medium text-tat-charcoal">{filtered.length}</span> packages
            {activeFilterCount > 0 && (
              <span className="text-tat-charcoal/45"> · {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} applied</span>
            )}
          </p>

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
            ) : activeFilterCount === 0 && !filterTier && !filterRegion && !filterPickup ? (
              // Default browse view — group results into category sections.
              // Reads as a guided "what kind of trip?" landing rather than a
              // flat 100-row grid. The first 8 cards in each category render;
              // a "See all in <category>" link sets the category filter so
              // the visitor lands in the flat grid scoped to that pivot.
              <GroupedByCategory
                packages={filtered}
                onPickCategory={setFilterCategory}
                pickup={filterPickup}
              />
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
                    pickupCity={pickupCityFor(p)}
                    pickupMatch={!!filterPickup && p.tags?.includes(`ex-${filterPickup}`)}
                    index={i}
                  />
                ))}
                <CustomTripCTACard />
              </div>
            )}
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
  filterPickup: string;
  setFilterPickup: (v: string) => void;
  pickupCities: [string, number][];
  filterTag: string;
  setFilterTag: (v: string) => void;
  tagPivots: [string, number][];
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
  filterPickup, setFilterPickup, pickupCities,
  filterTag, setFilterTag, tagPivots,
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
            <button onClick={onClose} className="p-2 rounded-full hover:bg-tat-charcoal/5">
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

      <FilterGroup label="Minimum rating">
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

      {pickupCities.length > 0 && (
        <FilterGroup label="Boost pickup city">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterPickup("")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                !filterPickup
                  ? "bg-tat-orange text-white border-tat-orange"
                  : "bg-tat-paper text-tat-charcoal/65 border-tat-charcoal/15 hover:border-tat-charcoal/30"
              }`}
            >
              All cities
            </button>
            {pickupCities.map(([city, n]) => {
              const active = filterPickup === city;
              const label = city.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <button
                  key={city}
                  onClick={() => setFilterPickup(active ? "" : city)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? "bg-tat-orange text-white border-tat-orange"
                      : "bg-tat-paper text-tat-charcoal/65 border-tat-charcoal/15 hover:border-tat-charcoal/30"
                  }`}
                >
                  Ex {label}
                  <span className={`text-[10px] ${active ? "text-white/70" : "text-tat-charcoal/40"}`}>{n}</span>
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}

      {tagPivots.length > 0 && (
        <FilterGroup label="Pivot by tag" last>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterTag("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                !filterTag
                  ? "bg-tat-charcoal text-tat-paper border-tat-charcoal"
                  : "bg-tat-paper text-tat-charcoal/65 border-tat-charcoal/15 hover:border-tat-charcoal/30"
              }`}
            >
              All
            </button>
            {tagPivots.map(([tag, n]) => {
              const active = filterTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setFilterTag(active ? "" : tag)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? "bg-tat-gold/20 text-tat-charcoal border-tat-gold"
                      : "bg-tat-paper text-tat-charcoal/65 border-tat-charcoal/15 hover:border-tat-charcoal/30"
                  }`}
                >
                  {tag}
                  <span className={`text-[10px] ${active ? "text-tat-charcoal/60" : "text-tat-charcoal/40"}`}>{n}</span>
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}
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

// Pickup-city helper — surfaces the FIRST `ex-<city>` tag a package
// carries as a human-readable label. Returns "" when the package has no
// pickup tag (those depart from any metro the visitor can fly out of).
function pickupCityFor(p: Package): string {
  const ex = p.tags?.find((t) => t.startsWith("ex-"));
  if (!ex) return "";
  return ex.slice(3).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Default browse view — slices the result list into top categories so the
// /packages landing reads as a guided "what kind of trip?" page rather
// than a 300-row catalog. Only kicks in when no filter is applied; once
// the visitor narrows, the page reverts to the flat grid.
function GroupedByCategory({
  packages,
  onPickCategory,
  pickup,
}: {
  packages: Package[];
  onPickCategory: (c: string) => void;
  pickup: string;
}) {
  // Display order — lifestyle categories first, audience next, region last.
  const ORDER = [
    "Honeymoon", "Family", "Adventure", "Wellness", "Spiritual",
    "Pilgrim", "Beach", "Mountain", "Wildlife", "Luxury", "Cultural",
    "Quick Trips", "Weekend", "International", "Groups", "Solo",
  ];
  const buckets = useMemo(() => {
    const map = new Map<string, Package[]>();
    for (const p of packages) {
      const cats = p.categories ?? [];
      if (cats.length === 0) {
        const key = "Other";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(p);
        continue;
      }
      // Place package under its FIRST recognised category so it doesn't
      // appear in three sections. Falls back to its first category if
      // none are in the curated ORDER.
      const primary = cats.find((c) => ORDER.includes(c)) ?? cats[0];
      if (!map.has(primary)) map.set(primary, []);
      map.get(primary)!.push(p);
    }
    return map;
  }, [packages]);

  // Render in display order, then any leftover keys, then "Other" last.
  const ordered: [string, Package[]][] = [];
  for (const cat of ORDER) {
    const arr = buckets.get(cat);
    if (arr && arr.length > 0) ordered.push([cat, arr]);
  }
  for (const [cat, arr] of buckets) {
    if (cat === "Other") continue;
    if (!ORDER.includes(cat)) ordered.push([cat, arr]);
  }
  if (buckets.has("Other")) ordered.push(["Other", buckets.get("Other")!]);

  return (
    <div className="space-y-12">
      {ordered.map(([cat, arr]) => {
        const showAll = arr.length > 8;
        const slice = arr.slice(0, 8);
        return (
          <section key={cat} aria-labelledby={`cat-${cat}`}>
            <header className="flex items-end justify-between gap-3 mb-4">
              <div>
                <h3
                  id={`cat-${cat}`}
                  className="font-display text-h3 font-medium text-tat-charcoal"
                >
                  {cat}
                </h3>
                <p className="text-xs text-tat-charcoal/55 mt-0.5">
                  {arr.length} package{arr.length === 1 ? "" : "s"}
                  {pickup && (
                    <> · {arr.filter((p) => p.tags?.includes(`ex-${pickup}`)).length} from {pickup.replace(/-/g, " ")}</>
                  )}
                </p>
              </div>
              {showAll && (
                <button
                  type="button"
                  onClick={() => onPickCategory(cat)}
                  className="text-xs font-semibold text-tat-gold hover:text-tat-charcoal underline-offset-2 hover:underline"
                >
                  See all {arr.length} →
                </button>
              )}
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
              {slice.map((p, i) => (
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
                  pickupCity={pickupCityFor(p)}
                  pickupMatch={!!pickup && p.tags?.includes(`ex-${pickup}`)}
                  index={i}
                />
              ))}
            </div>
          </section>
        );
      })}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
        <CustomTripCTACard />
      </div>
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
  filterTheme: string;
  clearTheme: () => void;
  filterTag: string;
  clearTag: () => void;
  filterPickup: string;
  clearPickup: () => void;
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
  filterTheme, clearTheme,
  filterTag, clearTag,
  filterPickup, clearPickup,
  clearAll,
}: ChipsProps) {
  const destName = filterDestination
    ? destinations.find((d) => d.slug === filterDestination)?.name ?? filterDestination
    : "";

  const chips: { label: string; onRemove: () => void }[] = [];
  if (filterDestination) chips.push({ label: destName, onRemove: clearDestination });
  if (filterStyle) chips.push({ label: `Style: ${filterStyle}`, onRemove: clearStyle });
  if (filterTheme === "visa-free") chips.push({ label: "Visa-free for Indians", onRemove: clearTheme });
  if (filterTravelType) chips.push({ label: filterTravelType, onRemove: clearTravelType });
  if (filterCategory) chips.push({ label: filterCategory, onRemove: clearCategory });
  if (filterTag) chips.push({ label: `#${filterTag}`, onRemove: clearTag });
  if (filterPickup) {
    const lbl = filterPickup.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    chips.push({ label: `Boost: ${lbl}`, onRemove: clearPickup });
  }
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
