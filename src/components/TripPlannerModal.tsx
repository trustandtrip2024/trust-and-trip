"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowRight, ArrowLeft, MapPin,
  CheckCircle2, Loader2, Star, Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTripPlanner } from "@/context/TripPlannerContext";
import { sanityClient, urlFor } from "@/lib/sanity"; // urlFor used for package result images
import { analytics } from "@/lib/analytics";

// ─── Destination image fallbacks (all 23 Sanity destinations) ─────────────────

const DEST_IMAGES: Record<string, string> = {
  bali:       "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=75&auto=format&fit=crop",
  maldives:   "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=75&auto=format&fit=crop",
  kerala:     "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=75&auto=format&fit=crop",
  manali:     "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=75&auto=format&fit=crop",
  goa:        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=75&auto=format&fit=crop",
  shimla:     "https://images.unsplash.com/photo-1626015365107-3a71e18c5268?w=400&q=75&auto=format&fit=crop",
  ladakh:     "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=400&q=75&auto=format&fit=crop",
  rajasthan:  "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=75&auto=format&fit=crop",
  andaman:    "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=400&q=75&auto=format&fit=crop",
  coorg:      "https://images.unsplash.com/photo-1626015365107-3a71e18c5268?w=400&q=75&auto=format&fit=crop",
  varanasi:   "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400&q=75&auto=format&fit=crop",
  agra:       "https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=75&auto=format&fit=crop",
  thailand:   "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=75&auto=format&fit=crop",
  dubai:      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=75&auto=format&fit=crop",
  switzerland:"https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=400&q=75&auto=format&fit=crop",
  paris:      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=75&auto=format&fit=crop",
  japan:      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=75&auto=format&fit=crop",
  singapore:  "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=75&auto=format&fit=crop",
  malaysia:   "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=75&auto=format&fit=crop",
  nepal:      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=75&auto=format&fit=crop",
  turkey:     "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&q=75&auto=format&fit=crop",
  australia:  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=75&auto=format&fit=crop",
  "sri-lanka":"https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?w=400&q=75&auto=format&fit=crop",
};

const FALLBACK_DESTS = [
  { slug: "kerala",    name: "Kerala",          country: "India",              priceFrom: 28000, image: DEST_IMAGES.kerala },
  { slug: "goa",       name: "Goa",             country: "India",              priceFrom: 18000, image: DEST_IMAGES.goa },
  { slug: "manali",    name: "Manali",          country: "India",              priceFrom: 20000, image: DEST_IMAGES.manali },
  { slug: "rajasthan", name: "Rajasthan",       country: "India",              priceFrom: 22000, image: DEST_IMAGES.rajasthan },
  { slug: "shimla",    name: "Shimla",          country: "India",              priceFrom: 15000, image: DEST_IMAGES.shimla },
  { slug: "ladakh",    name: "Ladakh",          country: "India",              priceFrom: 30000, image: DEST_IMAGES.ladakh },
  { slug: "andaman",   name: "Andaman Islands", country: "India",              priceFrom: 35000, image: DEST_IMAGES.andaman },
  { slug: "coorg",     name: "Coorg",           country: "India",              priceFrom: 14000, image: DEST_IMAGES.coorg },
  { slug: "varanasi",  name: "Varanasi",        country: "India",              priceFrom: 12000, image: DEST_IMAGES.varanasi },
  { slug: "agra",      name: "Agra",            country: "India",              priceFrom: 10000, image: DEST_IMAGES.agra },
  { slug: "bali",      name: "Bali",            country: "Indonesia",          priceFrom: 45000, image: DEST_IMAGES.bali },
  { slug: "maldives",  name: "Maldives",        country: "Maldives",           priceFrom: 85000, image: DEST_IMAGES.maldives },
  { slug: "thailand",  name: "Thailand",        country: "Thailand",           priceFrom: 35000, image: DEST_IMAGES.thailand },
  { slug: "dubai",     name: "Dubai",           country: "United Arab Emirates", priceFrom: 55000, image: DEST_IMAGES.dubai },
  { slug: "switzerland", name: "Switzerland",   country: "Switzerland",        priceFrom: 125000, image: DEST_IMAGES.switzerland },
  { slug: "paris",     name: "Paris",           country: "France",             priceFrom: 110000, image: DEST_IMAGES.paris },
  { slug: "japan",     name: "Japan",           country: "Japan",              priceFrom: 90000, image: DEST_IMAGES.japan },
  { slug: "singapore", name: "Singapore",       country: "Singapore",          priceFrom: 65000, image: DEST_IMAGES.singapore },
  { slug: "malaysia",  name: "Malaysia",        country: "Malaysia",           priceFrom: 45000, image: DEST_IMAGES.malaysia },
  { slug: "nepal",     name: "Nepal",           country: "Nepal",              priceFrom: 25000, image: DEST_IMAGES.nepal },
  { slug: "turkey",    name: "Turkey",          country: "Turkey",             priceFrom: 80000, image: DEST_IMAGES.turkey },
  { slug: "australia", name: "Australia",       country: "Australia",          priceFrom: 150000, image: DEST_IMAGES.australia },
  { slug: "sri-lanka", name: "Sri Lanka",       country: "Sri Lanka",          priceFrom: 35000, image: DEST_IMAGES["sri-lanka"] },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ["destination", "travelers", "duration", "budget", "results"] as const;
type Step = (typeof STEPS)[number];

const TRAVEL_TYPES = [
  { value: "Couple", emoji: "💑", label: "Couple", desc: "Romantic escape for two" },
  { value: "Family", emoji: "👨‍👩‍👧‍👦", label: "Family", desc: "Memories with loved ones" },
  { value: "Group", emoji: "🎉", label: "Group", desc: "Unforgettable with friends" },
  { value: "Solo", emoji: "🧭", label: "Solo", desc: "Your pace, your rules" },
];

const DURATIONS = ["3 – 5 days", "5 – 7 days", "7 – 10 days", "10+ days"];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const BUDGETS = [
  { value: "budget", label: "Budget", symbol: "₹", range: "Under ₹50,000", desc: "Great value picks", min: 0, max: 50000 },
  { value: "standard", label: "Standard", symbol: "₹₹", range: "₹50K – ₹1L", desc: "Most popular tier", min: 50000, max: 100000 },
  { value: "premium", label: "Premium", symbol: "₹₹₹", range: "₹1L – ₹2L", desc: "Elevated comfort", min: 100000, max: 200000 },
  { value: "luxury", label: "Luxury", symbol: "₹₹₹₹", range: "Above ₹2L", desc: "No compromises", min: 200000, max: 9999999 },
];

const DUR_MAP: Record<string, { min: number; max: number }> = {
  "3 – 5 days": { min: 3, max: 5 },
  "5 – 7 days": { min: 5, max: 7 },
  "7 – 10 days": { min: 7, max: 10 },
  "10+ days": { min: 10, max: 99 },
};

const PACKAGE_FIELDS = `
  "title": title,
  "slug": slug.current,
  "destinationName": destination->name,
  "destinationSlug": destination->slug.current,
  "price": price,
  "duration": duration,
  "rating": rating,
  "travelType": travelType,
  "image": image
`;

// ─── Slide animation ──────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TripPlannerModal() {
  const { isOpen, selections, close, update } = useTripPlanner();
  const router = useRouter();

  const [step, setStep] = useState<Step>("destination");
  const [dir, setDir] = useState(1);
  const [tab, setTab] = useState<"india" | "international">("india");
  // Track viewport so the modal can be suppressed on mobile — the home
  // page already exposes a 5-step wizard inline (MobileStickySearch in the
  // header after scroll, and the hero wizard above the fold). Showing this
  // full-screen modal on top of those was redundant. On mobile we close
  // the request and scroll the hero into view so the user lands on the
  // inline experience instead.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isOpen && isMobile) {
      // Scroll to the hero search wizard so the user lands on the inline
      // 5-step flow, then close the would-be modal.
      const hero = document.getElementById("hero-search");
      if (hero) hero.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
      close();
    }
  }, [isOpen, isMobile, close]);

  // Reset to step 1 every time modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("destination");
      setDir(1);
      setResults([]);
    }
  }, [isOpen]);

  // Destination data
  const [destinations, setDestinations] = useState<
    { slug: string; name: string; country: string; image: string; priceFrom: number }[]
  >([]);
  const [destsLoading, setDestsLoading] = useState(false);

  // Results data
  const [results, setResults] = useState<
    { slug: string; title: string; destinationName: string; price: number; duration: string; rating: number; travelType: string; image: string }[]
  >([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Fetch destinations — slug/name/country/priceFrom only, images come from local map
  useEffect(() => {
    if (!isOpen || destinations.length > 0) return;
    setDestsLoading(true);
    sanityClient
      .fetch<{ slug: string; name: string; country: string; priceFrom: number }[]>(
        `*[_type == "destination"] | order(country asc, name asc) { "slug": slug.current, name, country, priceFrom }`
      )
      .then((raw) =>
        setDestinations(
          raw.map((d) => ({
            ...d,
            image: DEST_IMAGES[d.slug] ?? "",
          }))
        )
      )
      .catch(() => {
        // Fallback: use hardcoded list if Sanity is unreachable
        setDestinations(FALLBACK_DESTS);
      })
      .finally(() => setDestsLoading(false));
  }, [isOpen, destinations.length]);

  // Fetch results when we hit the results step — with progressive fallback
  useEffect(() => {
    if (step !== "results") return;
    setResultsLoading(true);

    const dur = selections.duration ? DUR_MAP[selections.duration] : null;
    const bud = BUDGETS.find((b) => b.value === selections.budget);

    type DurEntry = { min: number; max: number } | null | undefined;
    type BudEntry = { min: number; max: number; value: string; label: string; symbol: string; range: string; desc: string } | null | undefined;
    const buildQuery = (dest: string | null, type: string | null, d: DurEntry, b: BudEntry) => {
      const filters = [
        `_type == "package"`,
        dest ? `destination->slug.current == "${dest}"` : null,
        type ? `travelType == "${type}"` : null,
        d ? `days >= ${d.min}` : null,
        d ? `days <= ${d.max}` : null,
        b ? `price >= ${b.min}` : null,
        b && b.max < 9999999 ? `price <= ${b.max}` : null,
      ].filter(Boolean).join(" && ");
      return `*[${filters}] | order(rating desc) [0...6] { ${PACKAGE_FIELDS} }`;
    };

    const mapResults = (raw: any[]) =>
      raw.map((p) => ({
        ...p,
        image: p.image ? urlFor(p.image).width(200).height(150).quality(75).url() : "",
      }));

    // Try exact match first, then progressively loosen filters
    sanityClient
      .fetch(buildQuery(selections.destination || null, selections.travelType || null, dur, bud))
      .then(async (raw: any[]) => {
        if (raw.length > 0) return mapResults(raw);
        // Loosen: drop duration + budget, keep dest + type
        const r2 = await sanityClient.fetch(buildQuery(selections.destination || null, selections.travelType || null, null, null));
        if (r2.length > 0) return mapResults(r2);
        // Loosen more: drop type too, keep dest
        const r3 = await sanityClient.fetch(buildQuery(selections.destination || null, null, null, null));
        if (r3.length > 0) return mapResults(r3);
        // Final fallback: top-rated packages regardless
        const r4 = await sanityClient.fetch(buildQuery(null, null, null, null));
        return mapResults(r4);
      })
      .then((results) => {
        setResults(results);
        analytics.plannerSearch(
          selections.destination || "any",
          selections.travelType || "any",
          selections.budget || "any"
        );
        return results;
      })
      .catch(() => setResults([]))
      .finally(() => setResultsLoading(false));
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (next: Step, direction = 1) => {
    setDir(direction);
    setStep(next);
  };

  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) go(STEPS[idx - 1], -1);
  };

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) go(STEPS[idx + 1], 1);
  };

  const handleViewAll = () => {
    const params = new URLSearchParams();
    if (selections.destination) params.set("destination", selections.destination);
    if (selections.travelType) params.set("type", selections.travelType);
    if (selections.duration) params.set("duration", selections.duration);
    if (selections.budget) params.set("budget", selections.budget);
    close();
    router.push(`/packages?${params.toString()}`);
  };

  const filteredDests = destinations.filter((d) =>
    tab === "india" ? d.country === "India" : d.country !== "India"
  );

  const stepIndex = STEPS.indexOf(step);

  if (!isOpen || isMobile) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-tat-charcoal/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <motion.div
          key="panel"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative w-full max-w-2xl bg-tat-paper rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col max-h-[92vh] md:max-h-[88vh]"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-tat-charcoal/8 shrink-0">
            <div className="flex items-center gap-3">
              {stepIndex > 0 && step !== "results" && (
                <button onClick={goBack} className="p-1.5 rounded-full hover:bg-tat-charcoal/5 transition-colors">
                  <ArrowLeft className="h-4 w-4 text-tat-charcoal/60" />
                </button>
              )}
              <span className="text-[11px] uppercase tracking-[0.2em] text-tat-charcoal/50 font-medium">
                {step === "results" ? "Your Trips" : `Step ${stepIndex + 1} of 4`}
              </span>
            </div>
            <button
              onClick={close}
              className="p-2 rounded-full hover:bg-tat-charcoal/5 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-tat-charcoal/60" />
            </button>
          </div>

          {/* Progress bar */}
          {step !== "results" && (
            <div className="h-1 bg-tat-charcoal/8 shrink-0">
              <motion.div
                className="h-full bg-tat-gold rounded-full"
                animate={{ width: `${((stepIndex + 1) / 4) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          )}

          {/* Step content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                {step === "destination" && (
                  <StepDestination
                    tab={tab}
                    setTab={setTab}
                    destinations={filteredDests}
                    loading={destsLoading}
                    selected={selections.destination}
                    onSelect={(slug, name) => {
                      update({ destination: slug, destinationName: name });
                      goNext();
                    }}
                    onSkip={() => {
                      update({ destination: "", destinationName: "" });
                      goNext();
                    }}
                  />
                )}
                {step === "travelers" && (
                  <StepTravelers
                    selected={selections.travelType}
                    onSelect={(v) => { update({ travelType: v }); goNext(); }}
                    onSkip={() => { update({ travelType: "" }); goNext(); }}
                  />
                )}
                {step === "duration" && (
                  <StepDuration
                    selectedDuration={selections.duration}
                    selectedMonth={selections.month}
                    onDuration={(v) => update({ duration: v })}
                    onMonth={(v) => update({ month: v })}
                    onNext={goNext}
                    onSkip={() => { update({ duration: "", month: "" }); goNext(); }}
                  />
                )}
                {step === "budget" && (
                  <StepBudget
                    selected={selections.budget}
                    onSelect={(v) => { update({ budget: v }); goNext(); }}
                    onSkip={() => { update({ budget: "" }); goNext(); }}
                  />
                )}
                {step === "results" && (
                  <StepResults
                    packages={results}
                    loading={resultsLoading}
                    selections={selections}
                    onViewAll={handleViewAll}
                    onReset={() => {
                      go("destination", -1);
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Step 1: Destination ──────────────────────────────────────────────────────

function StepDestination({
  tab, setTab, destinations, loading, selected, onSelect, onSkip,
}: {
  tab: "india" | "international";
  setTab: (t: "india" | "international") => void;
  destinations: { slug: string; name: string; image: string; priceFrom: number }[];
  loading: boolean;
  selected: string;
  onSelect: (slug: string, name: string) => void;
  onSkip: () => void;
}) {
  return (
    <div className="px-6 py-6">
      <h2 className="font-display text-2xl md:text-3xl font-medium text-balance">
        Where would you like to go?
      </h2>
      <p className="mt-2 text-sm text-tat-charcoal/55">Pick a destination or browse all packages.</p>

      {/* Tab switcher */}
      <div className="flex gap-2 mt-5 mb-5">
        {(["india", "international"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              tab === t
                ? "bg-tat-charcoal text-tat-paper"
                : "bg-tat-charcoal/8 text-tat-charcoal/60 hover:bg-tat-charcoal/12"
            }`}
          >
            {t === "india" ? "🇮🇳 India" : "🌍 International"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 text-tat-gold animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {destinations.map((d) => (
            <button
              key={d.slug}
              onClick={() => onSelect(d.slug, d.name)}
              className={`relative group overflow-hidden rounded-xl aspect-[4/3] text-left transition-all duration-200 ${
                selected === d.slug ? "ring-2 ring-tat-gold ring-offset-2" : ""
              }`}
            >
              {d.image ? (
                <Image src={d.image} alt={d.name} fill quality={65} className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="150px" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-tat-charcoal/80 to-tat-charcoal/40" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/90 via-tat-charcoal/20 to-transparent" />
              {selected === d.slug && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="h-4 w-4 text-tat-gold fill-tat-gold" />
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 p-2">
                <p className="text-tat-paper text-[11px] font-medium leading-tight">{d.name}</p>
                <p className="text-tat-paper/55 text-[9px] mt-0.5">₹{d.priceFrom.toLocaleString("en-IN")}+</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button onClick={onSkip} className="text-sm text-tat-charcoal/50 hover:text-tat-charcoal transition-colors">
          Skip — show all destinations
        </button>
        <span className="text-xs text-tat-charcoal/30">{destinations.length} destinations</span>
      </div>
    </div>
  );
}

// ─── Step 2: Travelers ────────────────────────────────────────────────────────

function StepTravelers({
  selected, onSelect, onSkip,
}: {
  selected: string;
  onSelect: (v: string) => void;
  onSkip: () => void;
}) {
  return (
    <div className="px-6 py-6">
      <h2 className="font-display text-2xl md:text-3xl font-medium text-balance">
        Who&apos;s joining the adventure?
      </h2>
      <p className="mt-2 text-sm text-tat-charcoal/55">We&apos;ll tailor packages to your travel style.</p>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {TRAVEL_TYPES.map(({ value, emoji, label, desc }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 text-center ${
              selected === value
                ? "border-tat-gold bg-tat-gold/8"
                : "border-tat-charcoal/10 hover:border-tat-charcoal/25 bg-white"
            }`}
          >
            <span className="text-4xl">{emoji}</span>
            <span className="font-display text-lg font-medium">{label}</span>
            <span className="text-xs text-tat-charcoal/55 leading-snug">{desc}</span>
            {selected === value && (
              <CheckCircle2 className="h-4 w-4 text-tat-gold fill-tat-gold mt-1" />
            )}
          </button>
        ))}
      </div>

      <button onClick={onSkip} className="mt-5 text-sm text-tat-charcoal/50 hover:text-tat-charcoal transition-colors">
        Skip this step
      </button>
    </div>
  );
}

// ─── Step 3: Duration ─────────────────────────────────────────────────────────

function StepDuration({
  selectedDuration, selectedMonth, onDuration, onMonth, onNext, onSkip,
}: {
  selectedDuration: string;
  selectedMonth: string;
  onDuration: (v: string) => void;
  onMonth: (v: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="px-6 py-6">
      <h2 className="font-display text-2xl md:text-3xl font-medium text-balance">
        When are you planning?
      </h2>
      <p className="mt-2 text-sm text-tat-charcoal/55">Pick a rough timeframe — nothing is fixed yet.</p>

      {/* Month grid */}
      <div className="mt-5 mb-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-tat-charcoal/50 font-medium mb-3">
          Preferred Month
        </p>
        <div className="grid grid-cols-4 gap-2">
          {MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => onMonth(selectedMonth === m ? "" : m)}
              className={`py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedMonth === m
                  ? "bg-tat-gold text-tat-charcoal"
                  : "bg-tat-charcoal/6 text-tat-charcoal/70 hover:bg-tat-charcoal/12"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-tat-charcoal/50 font-medium mb-3">
          Trip Duration
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => onDuration(selectedDuration === d ? "" : d)}
              className={`py-3 px-4 rounded-xl text-sm font-medium text-left transition-all duration-200 flex items-center justify-between ${
                selectedDuration === d
                  ? "bg-tat-gold/15 border-2 border-tat-gold text-tat-charcoal"
                  : "bg-tat-charcoal/6 border-2 border-transparent text-tat-charcoal/70 hover:bg-tat-charcoal/10"
              }`}
            >
              {d}
              {selectedDuration === d && <CheckCircle2 className="h-4 w-4 text-tat-gold" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button onClick={onSkip} className="text-sm text-tat-charcoal/50 hover:text-tat-charcoal transition-colors">
          Skip
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-tat-teal text-tat-paper px-6 py-2.5 rounded-full text-sm font-medium hover:bg-tat-teal-deep transition-all duration-300"
        >
          Next <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Budget ───────────────────────────────────────────────────────────

function StepBudget({
  selected, onSelect, onSkip,
}: {
  selected: string;
  onSelect: (v: string) => void;
  onSkip: () => void;
}) {
  return (
    <div className="px-6 py-6">
      <h2 className="font-display text-2xl md:text-3xl font-medium text-balance">
        What&apos;s your budget per person?
      </h2>
      <p className="mt-2 text-sm text-tat-charcoal/55">Approximate is fine — we have options at every level.</p>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {BUDGETS.map(({ value, label, symbol, range, desc }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`flex flex-col gap-2 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
              selected === value
                ? "border-tat-gold bg-tat-gold/8"
                : "border-tat-charcoal/10 hover:border-tat-charcoal/25 bg-white"
            }`}
          >
            <span className="font-display text-2xl text-tat-gold">{symbol}</span>
            <span className="font-display text-lg font-medium">{label}</span>
            <span className="text-xs font-medium text-tat-charcoal/70">{range}</span>
            <span className="text-[11px] text-tat-charcoal/45">{desc}</span>
            {selected === value && (
              <CheckCircle2 className="h-4 w-4 text-tat-gold fill-tat-gold mt-1" />
            )}
          </button>
        ))}
      </div>

      <button onClick={onSkip} className="mt-5 text-sm text-tat-charcoal/50 hover:text-tat-charcoal transition-colors">
        Skip — show all budgets
      </button>
    </div>
  );
}

// ─── Step 5: Results ──────────────────────────────────────────────────────────

function StepResults({
  packages, loading, selections, onViewAll, onReset,
}: {
  packages: { slug: string; title: string; destinationName: string; price: number; duration: string; rating: number; travelType: string; image: string }[];
  loading: boolean;
  selections: { destination: string; travelType: string; duration: string; budget: string };
  onViewAll: () => void;
  onReset: () => void;
}) {
  const budgetLabel = BUDGETS.find((b) => b.value === selections.budget)?.label ?? "";

  const tags = [
    selections.travelType,
    budgetLabel,
    selections.duration,
  ].filter(Boolean);

  return (
    <div className="px-6 py-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="h-10 w-10 text-tat-gold animate-spin" />
          <p className="text-tat-charcoal/60 text-sm">Finding your perfect trips…</p>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-medium">
                {packages.length > 0
                  ? `✨ We found ${packages.length} trips for you!`
                  : "No exact matches"}
              </h2>
              {packages.length === 0 && (
                <p className="mt-2 text-sm text-tat-charcoal/55">
                  Try relaxing a few filters — or let us customize a trip for you.
                </p>
              )}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((t) => (
                <span key={t} className="bg-tat-gold/15 text-tat-charcoal text-[11px] font-medium px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Package preview list */}
          <div className="mt-5 space-y-3">
            {packages.map((p) => (
              <Link
                key={p.slug}
                href={`/packages/${p.slug}`}
                className="flex items-center gap-3 bg-white rounded-2xl p-3 hover:shadow-soft transition-all duration-300 group"
                onClick={onViewAll}
              >
                <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0">
                  {p.image && (
                    <Image src={p.image} alt={p.title} fill quality={65} className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="80px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[13px] font-medium text-tat-charcoal leading-snug line-clamp-2 group-hover:text-tat-gold transition-colors">
                    {p.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-tat-charcoal/50">
                    <MapPin className="h-3 w-3" />
                    <span>{p.destinationName}</span>
                    <span>·</span>
                    <Clock className="h-3 w-3" />
                    <span>{p.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-tat-gold text-tat-gold" />
                    <span className="text-[11px] font-medium text-tat-charcoal">{p.rating}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-base font-medium text-tat-charcoal">
                    ₹{p.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-tat-charcoal/40">/person</p>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onViewAll}
              className="flex-1 flex items-center justify-center gap-2 bg-tat-teal text-tat-paper py-3 rounded-full text-sm font-medium hover:bg-tat-teal-deep transition-all duration-300"
            >
              See all matching packages
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/customize-trip"
              className="flex-1 flex items-center justify-center gap-2 border border-tat-charcoal/20 text-tat-charcoal py-3 rounded-full text-sm font-medium hover:border-tat-gold hover:text-tat-gold transition-all duration-300"
            >
              Customize a trip instead
            </Link>
          </div>

          <button
            onClick={onReset}
            className="mt-4 w-full text-center text-xs text-tat-charcoal/40 hover:text-tat-charcoal/70 transition-colors"
          >
            ← Start over with different preferences
          </button>
        </>
      )}
    </div>
  );
}
