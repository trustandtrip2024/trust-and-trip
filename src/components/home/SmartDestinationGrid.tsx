"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plane, ShieldCheck, Flame } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Destination } from "@/lib/data";

interface VisaFreeItem {
  name: string;
  country: string;
  rule: string;
  whisper: string;
  image: string;
  href: string;
}

const VISA_FREE: VisaFreeItem[] = [
  { name: "Thailand",  country: "Southeast Asia", rule: "Visa-free · 60 days",       whisper: "Beaches, temples, street-food at midnight.", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=70", href: "/packages?destination=thailand" },
  { name: "Bali",      country: "Indonesia",      rule: "Visa-on-arrival · 30 days", whisper: "Green, gentle, full of surprises.",          image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=70", href: "/destinations/bali" },
  { name: "Maldives",  country: "Indian Ocean",   rule: "Visa-on-arrival · 30 days", whisper: "Where the floor is the ocean.",              image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=70", href: "/destinations/maldives" },
  { name: "Sri Lanka", country: "South Asia",     rule: "Free e-visa · 30 days",     whisper: "Hill country tea, southern coast surf.",     image: "https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?auto=format&fit=crop&w=900&q=70", href: "/packages?destination=sri-lanka" },
  { name: "Bhutan",    country: "Himalayas",      rule: "Visa-free for Indians",     whisper: "Slow valleys, monasteries above the clouds.", image: "https://images.unsplash.com/photo-1558005530-a7958896ec60?auto=format&fit=crop&w=900&q=70", href: "/packages?destination=bhutan" },
  { name: "Mauritius", country: "Indian Ocean",   rule: "Visa-free · 90 days",       whisper: "Volcanic beaches and creole afternoons.",     image: "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=900&q=70", href: "/packages?destination=mauritius" },
];

const TRENDING_FEATURED = [
  "Bali", "Maldives", "Thailand", "Dubai", "Switzerland",
  "Singapore", "Vietnam", "Kashmir", "Kerala", "Andaman",
  "Char Dham", "Ladakh",
];

interface Props {
  destinations: Destination[];
}

type TabId = "trending" | "visa-free";

export default function SmartDestinationGrid({ destinations }: Props) {
  const [tab, setTab] = useState<TabId>("trending");

  const trending = (() => {
    if (!destinations?.length) return [];
    const byName = new Map(destinations.map((d) => [d.name, d]));
    const ordered: Destination[] = [];
    for (const name of TRENDING_FEATURED) {
      const d = byName.get(name);
      if (d) { ordered.push(d); byName.delete(name); }
    }
    for (const d of byName.values()) ordered.push(d);
    return ordered.slice(0, 12);
  })();

  return (
    <section
      id="destinations"
      aria-labelledby="smart-dest-title"
      className="py-16 md:py-24 bg-tat-paper dark:bg-tat-charcoal/95"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-[1480px]">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeader
            eyebrow="Where to next"
            title="Pick a destination,"
            italicTail="we'll plan the rest."
            lede={tab === "trending"
              ? "Most-booked destinations this season — across India and beyond."
              : "Visa-free or visa-on-arrival for Indian passports. Pack and go."}
          />
          {tab === "visa-free" && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-tat-gold/10 border border-tat-gold/30 text-tat-gold text-[12px] font-medium uppercase tracking-[0.12em]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              For Indian passports
            </span>
          )}
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Destination filter" className="mt-7 inline-flex items-center gap-1.5 p-1 rounded-pill bg-tat-charcoal/5 dark:bg-white/10">
          <TabBtn id="trending"  current={tab} onClick={setTab} icon={<Flame className="h-3.5 w-3.5" />} label="Trending now" />
          <TabBtn id="visa-free" current={tab} onClick={setTab} icon={<Plane className="h-3.5 w-3.5" />} label="Visa-free" />
        </div>

        {/* Body — keyed so tab switch resets scroll on the rail */}
        <div className="mt-7" key={tab}>
          {tab === "trending" ? (
            <ul
              aria-label="Trending destinations"
              className="flex gap-4 lg:gap-5 overflow-x-auto no-scrollbar -mx-5 px-5 lg:mx-0 lg:px-0 snap-x snap-mandatory pb-2"
            >
              {trending.map((d) => (
                <li key={d.slug} className="shrink-0 snap-start w-[55%] sm:w-[40%] md:w-[28%] lg:w-[20%] xl:w-[18%]">
                  <Link
                    href={`/destinations/${d.slug}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-2xl"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-tat-charcoal/15">
                      <Image
                        src={d.image}
                        alt={d.name}
                        fill
                        sizes="(max-width: 640px) 55vw, (max-width: 1024px) 28vw, 20vw"
                        quality={70}
                        className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/72 to-transparent" />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        <p className="font-display text-white text-[15px] md:text-base leading-tight">
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
          ) : (
            <ul
              aria-label="Visa-free destinations"
              className="flex gap-4 lg:gap-5 overflow-x-auto no-scrollbar -mx-5 px-5 lg:mx-0 lg:px-0 snap-x snap-mandatory pb-2"
            >
              {VISA_FREE.map((d) => (
                <li key={d.name} className="shrink-0 snap-start w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[30%]">
                  <Link
                    href={d.href}
                    className="group relative block aspect-[4/5] rounded-card overflow-hidden bg-tat-charcoal shadow-card transition duration-200 hover:shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
                  >
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 33vw"
                      quality={70}
                      className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/85 via-tat-charcoal/30 to-transparent" />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-tat-orange text-tat-paper text-[11px] font-medium uppercase tracking-[0.1em]">
                      <Plane className="h-3 w-3" aria-hidden />
                      {d.rule}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-white">
                      <p className="text-tag uppercase text-white/65">{d.country}</p>
                      <h3 className="mt-1 font-display font-normal text-h3 text-white leading-tight">
                        {d.name}
                      </h3>
                      <p className="mt-1.5 text-meta text-white/80 line-clamp-2">
                        {d.whisper}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-meta text-white/85 group-hover:text-tat-gold transition duration-120">
                        Plan this trip
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
          <p className="text-meta text-tat-charcoal/60 dark:text-tat-paper/55 max-w-2xl">
            {tab === "visa-free"
              ? "Visa rules updated for Indian passports as of 2025. Verify on the official embassy site before booking."
              : "60+ destinations curated by planners who've actually been there."}
          </p>
          <Link
            href={tab === "visa-free" ? "/packages?type=international" : "/destinations"}
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            {tab === "visa-free" ? "See all international packages" : "All 60+ destinations"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <h2 id="smart-dest-title" className="sr-only">Where to next</h2>
      </div>
    </section>
  );
}

function TabBtn({
  id, current, onClick, icon, label,
}: {
  id: TabId; current: TabId; onClick: (id: TabId) => void; icon: React.ReactNode; label: string;
}) {
  const active = current === id;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onClick(id)}
      className={[
        "inline-flex items-center gap-1.5 h-9 px-4 rounded-pill text-[13px] font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2",
        active
          ? "bg-tat-charcoal text-white shadow-card dark:bg-white dark:text-tat-charcoal"
          : "text-tat-charcoal/70 hover:bg-tat-charcoal/5 dark:text-tat-paper/75 dark:hover:bg-white/10",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}
