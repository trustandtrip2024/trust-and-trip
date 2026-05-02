"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import type { Destination } from "@/lib/data";

interface Props {
  destinations: Destination[];
}

type FilterId = "all" | "india" | "asia" | "europe" | "beach" | "mountain" | "pilgrim";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all",      label: "All" },
  { id: "india",    label: "India" },
  { id: "asia",     label: "Asia" },
  { id: "europe",   label: "Europe" },
  { id: "beach",    label: "Beach" },
  { id: "mountain", label: "Mountain" },
  { id: "pilgrim",  label: "Pilgrim" },
];

const THEME_TAGS: Record<string, FilterId[]> = {
  bali:        ["beach"],
  maldives:    ["beach"],
  thailand:    ["beach"],
  goa:         ["beach", "india"],
  andaman:     ["beach", "india"],
  kerala:      ["india"],
  switzerland: ["mountain"],
  ladakh:      ["mountain", "india"],
  spiti:       ["mountain", "india"],
  kashmir:     ["mountain", "india"],
  bhutan:      ["mountain"],
  nepal:       ["mountain"],
  santorini:   ["beach"],
  "char-dham": ["pilgrim", "india", "mountain"],
  vaishnodevi: ["pilgrim", "india"],
  tirupati:    ["pilgrim", "india"],
  varanasi:    ["pilgrim", "india"],
  // 2026 catalogue refresh — keep filter chips populated for the new dests
  lakshadweep:    ["beach", "india"],
  pondicherry:    ["beach", "india"],
  darjeeling:     ["mountain", "india"],
  "mount-abu":    ["mountain", "india", "pilgrim"],
  mahabaleshwar:  ["mountain", "india"],
  lonavala:       ["mountain", "india"],
  manali:         ["mountain", "india"],
  "shimla-kasol": ["mountain", "india"],
  sikkim:         ["mountain", "india"],
  meghalaya:      ["mountain", "india"],
  tawang:         ["mountain", "india"],
  coorg:          ["mountain", "india"],
  "ooty-coonoor": ["mountain", "india"],
  pushkar:        ["pilgrim", "india"],
  "rishikesh-mussoorie": ["pilgrim", "mountain", "india"],
  cambodia:       ["pilgrim"],
  "sri-lanka":    ["beach"],
  mauritius:      ["beach"],
  "hong-kong":    ["beach"],
  "south-korea":  ["mountain"],
  iceland:        ["mountain"],
};

const FEATURED_ORDER = [
  "Bali", "Maldives", "Thailand", "Dubai", "Switzerland",
  "Singapore", "Vietnam", "Kashmir", "Kerala", "Andaman",
  "Char Dham", "Ladakh",
];

function tagsFor(d: Destination): Set<FilterId> {
  const tags = new Set<FilterId>();
  tags.add(d.region.toLowerCase() as FilterId);
  if (d.country?.toLowerCase() === "india") tags.add("india");
  for (const t of THEME_TAGS[d.slug] ?? []) tags.add(t);
  return tags;
}

export default function TrendingDestinations({ destinations }: Props) {
  const [filter, setFilter] = useState<FilterId>("all");

  const ordered = useMemo(() => {
    if (!destinations?.length) return [];
    const byName = new Map(destinations.map((d) => [d.name, d]));
    const out: Destination[] = [];
    for (const name of FEATURED_ORDER) {
      const d = byName.get(name);
      if (d) { out.push(d); byName.delete(name); }
    }
    for (const d of byName.values()) out.push(d);
    return out;
  }, [destinations]);

  const visible = useMemo(() => {
    if (filter === "all") return ordered.slice(0, 12);
    return ordered.filter((d) => tagsFor(d).has(filter)).slice(0, 12);
  }, [ordered, filter]);

  return (
    <section
      id="destinations"
      aria-labelledby="trending-dest-title"
      className="py-14 md:py-20 bg-tat-paper dark:bg-tat-charcoal scroll-mt-28 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Where to next
            </p>
            <h2
              id="trending-dest-title"
              className="mt-2 font-display font-normal text-[26px] md:text-[36px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Trending destinations,{" "}
              <em className="not-italic font-display italic text-tat-gold">picked by planners.</em>
            </h2>
          </div>
          <Link
            href="/destinations"
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            All 60+ destinations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Filter chips */}
        <div
          role="tablist"
          aria-label="Destination filter"
          className="mt-5 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar"
        >
          <div className="inline-flex items-center gap-1.5">
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={[
                    "shrink-0 inline-flex items-center h-9 px-4 rounded-pill text-[13px] font-semibold transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2",
                    active
                      ? "bg-tat-charcoal text-white dark:bg-white dark:text-tat-charcoal shadow-card"
                      : "bg-tat-charcoal/5 dark:bg-white/10 text-tat-charcoal/75 dark:text-tat-paper/75 hover:bg-tat-charcoal/10",
                  ].join(" ")}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid — 2 col mobile, 3 col sm, 4 col md, 6 col lg */}
        {visible.length === 0 ? (
          <p className="mt-10 text-center text-body-sm text-tat-charcoal/60 dark:text-tat-paper/60">
            No destinations in this filter yet — try another.
          </p>
        ) : (
          <ul
            aria-label="Trending destinations"
            className="mt-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"
          >
            {visible.map((d, i) => (
              <li key={d.slug}>
                <Link
                  href={`/destinations/${d.slug}`}
                  prefetch={false}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-2xl"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-tat-charcoal/15">
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 17vw"
                      quality={55}
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.06] motion-reduce:group-hover:scale-100"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
                    {i < 3 && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-tat-orange/95 text-white text-[10px] font-semibold uppercase tracking-wider">
                        <Flame className="h-2.5 w-2.5" aria-hidden />
                        Trending
                      </span>
                    )}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <p className="font-display text-white text-[14px] md:text-[15px] leading-tight">
                        {d.name}
                      </p>
                      {d.priceFrom && (
                        <p className="text-[11px] text-white/85 leading-tight">
                          From ₹{d.priceFrom.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-meta text-tat-charcoal/55 dark:text-tat-paper/55 text-center sm:text-left">
          60+ destinations curated by planners who&apos;ve actually been there.
        </p>
      </div>
    </section>
  );
}
