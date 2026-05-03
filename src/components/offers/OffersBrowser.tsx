"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Clock, Tag, ArrowRight, Star, Zap, X, Globe, Plane } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";

export interface OfferCard {
  slug: string;
  title: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  tag: string;
  hot: boolean;
  endsAt: string;
  rating?: number;
  reviews?: number;
  duration?: string;
  destinationName?: string;
  travelType?: string;
}

interface Props {
  offers: OfferCard[];
  visaFreeSlugs: string[];
}

type CategoryKey = "all" | "honeymoon" | "family" | "group" | "solo" | "international";
type SortKey = "discount-desc" | "ends-soon" | "price-asc" | "price-desc";

const CATEGORIES: { id: CategoryKey; label: string }[] = [
  { id: "all",           label: "All offers" },
  { id: "honeymoon",     label: "Honeymoon" },
  { id: "family",        label: "Family" },
  { id: "group",         label: "Group" },
  { id: "solo",          label: "Solo" },
  { id: "international", label: "International" },
];

function matchesCategory(offer: OfferCard, cat: CategoryKey, indianSlugs: Set<string>): boolean {
  if (cat === "all") return true;
  const tag = (offer.tag ?? "").toLowerCase();
  const travelType = (offer.travelType ?? "").toLowerCase();
  const destSlug = offer.slug.split("-")[0]?.toLowerCase() ?? "";
  if (cat === "honeymoon")     return tag.includes("honeymoon") || travelType === "couple";
  if (cat === "family")        return tag.includes("family") || travelType === "family";
  if (cat === "group")         return tag.includes("group") || tag.includes("bonanza") || travelType === "group";
  if (cat === "solo")          return travelType === "solo";
  if (cat === "international") return !indianSlugs.has(destSlug);
  return true;
}

// Indian destination prefixes used to flag non-Indian offers when the
// "International" category chip is selected. "bali" was previously listed
// here in error and bucketed every Bali deal as domestic — Bali is in
// Indonesia. Char Dham, Kedarnath, Vaishno Devi etc. anchor pilgrim
// offers that should also count as domestic.
const INDIAN_SLUG_PREFIXES = new Set([
  "kerala","goa","manali","rajasthan","ladakh","andaman","shimla",
  "coorg","varanasi","spiti","kashmir","uttarakhand","char","kedarnath",
  "rishikesh","haridwar","leh","sikkim","udaipur","jaipur","jodhpur",
  "munnar","ooty","gangtok","darjeeling","mussoorie","nainital","tirupati",
  "vaishno","pushkar","ranthambore","kanha","puri","mahabaleshwar",
  "lonavala","mount-abu","lakshadweep","pondicherry","north-east",
  "zanskar","do-dham","panchkedar",
]);

const VALID_CATEGORIES: ReadonlySet<CategoryKey> = new Set([
  "all", "honeymoon", "family", "group", "solo", "international",
]);

export default function OffersBrowser({ offers, visaFreeSlugs }: Props) {
  // Header offers dropdown links pre-seed the category via ?cat=… so
  // visitors arriving from "Honeymoon Specials" land directly on the
  // honeymoon-filtered grid instead of the unfiltered list.
  const sp = useSearchParams();
  const initialCat = (() => {
    const raw = sp.get("cat");
    if (raw && VALID_CATEGORIES.has(raw as CategoryKey)) return raw as CategoryKey;
    return "all" as CategoryKey;
  })();

  const [category, setCategory] = useState<CategoryKey>(initialCat);
  const [sort, setSort] = useState<SortKey>("discount-desc");
  const [visaFree, setVisaFree] = useState(false);

  const visaSet = useMemo(() => new Set(visaFreeSlugs), [visaFreeSlugs]);
  const indianSlugs = useMemo(() => {
    const s = new Set<string>();
    INDIAN_SLUG_PREFIXES.forEach((p) => s.add(p));
    return s;
  }, []);

  const filtered = useMemo(() => {
    let list = offers.filter((o) => matchesCategory(o, category, indianSlugs));
    if (visaFree) {
      list = list.filter((o) => {
        const slug = o.slug.split("-")[0]?.toLowerCase() ?? "";
        return [...visaSet].some((v) => slug.includes(v) || (o.destinationName ?? "").toLowerCase().includes(v));
      });
    }
    list = [...list].sort((a, b) => {
      if (sort === "discount-desc") return b.discount - a.discount;
      if (sort === "ends-soon")     return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime();
      if (sort === "price-asc")     return a.price - b.price;
      if (sort === "price-desc")    return b.price - a.price;
      return 0;
    });
    return list;
  }, [offers, category, sort, visaFree, indianSlugs, visaSet]);

  const hot = filtered.filter((o) => o.hot);
  const regular = filtered.filter((o) => !o.hot);

  const activeFilters = Number(category !== "all") + Number(visaFree) + Number(sort !== "discount-desc");

  function clearAll() {
    setCategory("all");
    setVisaFree(false);
    setSort("discount-desc");
  }

  return (
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-16 lg:top-20 z-30 bg-tat-paper/95 backdrop-blur-md border-b border-tat-charcoal/10">
        <div className="container-custom py-3 md:py-4 space-y-3">
          <div className="flex items-center gap-2 md:gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 md:h-11 px-3 md:px-4 rounded-full bg-tat-cream-warm/40 ring-1 ring-tat-charcoal/10 text-[12px] md:text-[13px] font-medium text-tat-charcoal focus:outline-none focus:ring-2 focus:ring-tat-gold cursor-pointer"
              aria-label="Sort offers"
            >
              <option value="discount-desc">Sort: Biggest discount</option>
              <option value="ends-soon">Ending soonest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
            <p className="text-[12px] text-tat-charcoal/55 ml-auto whitespace-nowrap">
              <strong className="font-semibold text-tat-charcoal">{filtered.length}</strong> deal{filtered.length === 1 ? "" : "s"}
              {activeFilters > 0 && <span> · filtered</span>}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
            {CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                active={category === c.id}
                onClick={() => setCategory(c.id)}
                icon={c.id === "international" ? Globe : undefined}
              >
                {c.label}
              </Chip>
            ))}
            <span className="h-5 w-px bg-tat-charcoal/15 mx-1 shrink-0" />
            <Chip active={visaFree} onClick={() => setVisaFree((v) => !v)} icon={Plane}>
              Visa-free
            </Chip>
            {activeFilters > 0 && (
              <>
                <span className="h-5 w-px bg-tat-charcoal/15 mx-1 shrink-0" />
                <button
                  type="button"
                  onClick={clearAll}
                  className="shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-full text-[12px] font-semibold text-tat-charcoal/70 hover:text-tat-charcoal hover:bg-tat-charcoal/8"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <section className="py-20">
          <div className="container-custom text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-tat-gold/10 grid place-items-center">
              <Tag className="h-6 w-6 text-tat-gold" />
            </div>
            <h3 className="mt-4 font-display text-xl text-tat-charcoal">No active deals match those filters.</h3>
            <p className="mt-1 text-[13px] text-tat-charcoal/60">
              We negotiate unlisted rates too — ask a planner what&rsquo;s possible.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-tat-charcoal text-white text-[13px] font-semibold"
              >
                Clear filters
              </button>
              <a
                href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I'm%20looking%20for%20an%20unlisted%20deal."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-whatsapp text-white text-[13px] font-semibold"
              >
                Ask a planner
              </a>
            </div>
          </div>
        </section>
      ) : (
        <>
          {hot.length > 0 && (
            <section className="py-8 md:py-10" id="deals">
              <div className="container-custom">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <h2 className="font-display text-[22px] md:text-[26px] font-medium text-tat-charcoal inline-flex items-center gap-2.5">
                    <Zap className="h-5 w-5 text-tat-gold" />
                    Flash deals — ending soon
                  </h2>
                </div>
                <div className="md:hidden -mx-5 px-5 overflow-x-auto snap-x snap-mandatory no-scrollbar">
                  <ul className="flex gap-4 pb-2 pr-5">
                    {hot.map((o) => (
                      <li key={o.slug} className="shrink-0 snap-start w-[82%] sm:w-[60%]">
                        <Card offer={o} size="sm" />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="hidden md:grid md:grid-cols-3 gap-4 md:gap-5">
                  {hot.map((o) => <Card key={o.slug} offer={o} size="sm" />)}
                </div>
              </div>
            </section>
          )}

          <section className="py-8 md:py-12">
            <div className="container-custom">
              {regular.length > 0 && (
                <h2 className="font-display text-[22px] md:text-[26px] font-medium text-tat-charcoal mb-5">
                  All current deals
                </h2>
              )}
              <div className="md:hidden -mx-5 px-5 overflow-x-auto snap-x snap-mandatory no-scrollbar">
                <ul className="flex gap-5 pb-2 pr-5">
                  {regular.map((o) => (
                    <li key={o.slug} className="shrink-0 snap-start w-[82%] sm:w-[58%]">
                      <Card offer={o} size="lg" />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hidden md:grid md:grid-cols-2 gap-6 md:gap-8">
                {regular.map((o) => <Card key={o.slug} offer={o} size="lg" />)}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}

function Chip({
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
          : "bg-tat-cream-warm/40 text-tat-charcoal/75 ring-1 ring-tat-charcoal/10 hover:bg-tat-charcoal/8",
      ].join(" ")}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function Card({ offer, size }: { offer: OfferCard; size: "sm" | "lg" }) {
  const isLg = size === "lg";
  return (
    <Link
      href={`/packages/${offer.slug}`}
      className="group relative overflow-hidden rounded-3xl bg-tat-charcoal block"
    >
      <div className={`relative ${isLg ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <Image
          src={offer.image}
          alt={offer.title}
          fill
          sizes={isLg ? "(max-width: 768px) 100vw, 50vw" : "33vw"}
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal via-tat-charcoal/40 to-transparent" />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="bg-tat-gold text-tat-charcoal px-3 py-1.5 rounded-full text-xs font-display font-semibold flex items-center gap-1">
            <Tag className="h-3 w-3" />{offer.discount}% OFF
          </div>
          {offer.hot && (
            <div className="bg-tat-orange text-white px-3 py-1.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" />Flash
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 bg-tat-charcoal/70 backdrop-blur-md border border-tat-paper/20 px-3 py-1.5 rounded-full flex items-center gap-2">
          <Clock className="h-3 w-3 text-tat-gold shrink-0" />
          <CountdownTimer endsAt={offer.endsAt} />
        </div>

        <div className={`absolute inset-x-0 bottom-0 ${isLg ? "p-6 md:p-8" : "p-5"} text-tat-paper`}>
          <p className="text-[10px] uppercase tracking-[0.25em] text-tat-gold mb-1.5">{offer.tag}</p>
          <h3 className={`font-display ${isLg ? "text-2xl md:text-3xl" : "text-lg"} font-medium leading-tight mb-2`}>
            {offer.title}
          </h3>
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="h-3 w-3 fill-tat-gold text-tat-gold" />
            <span className="text-xs text-tat-paper/70">
              {offer.rating ?? 4.8} · {offer.reviews ?? "100"} reviews · {offer.duration}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-tat-paper/50 uppercase tracking-wider">Starting from</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-display text-xl text-tat-gold">₹{offer.price.toLocaleString("en-IN")}</span>
                <span className="text-sm text-tat-paper/40 line-through">₹{offer.originalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-tat-paper/80 group-hover:text-tat-gold transition-colors">
              View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
