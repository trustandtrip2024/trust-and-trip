"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Heart, Users, User, Globe2, Mountain, Sunset, Church, Crown,
  Calendar, Clock, Plane, Map, Sparkles, Hourglass,
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { PackageCardProps } from "@/components/ui/PackageCard";
import { DESTINATIONS_BY_DURATION, type DurationId } from "@/data/destinationsByDuration";

export type StyleId =
  | "Honeymoon" | "Family" | "Solo" | "Group"
  | "Adventure" | "Wellness" | "Pilgrim" | "Luxury";

interface StyleMeta {
  id: StyleId;
  label: string;
  tagline: string;
  icon: typeof Heart;
  fallbackImage: string;
  sampleDestinations: string[];
}

const STYLES: StyleMeta[] = [
  { id: "Honeymoon", label: "Honeymoon", tagline: "Quiet rooms. Late checkouts. Privacy that costs less than you think.", icon: Heart,    fallbackImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Bali", "Maldives", "Santorini"] },
  { id: "Family",    label: "Family",    tagline: "Kid-aware schedules. Connecting rooms. No rushed mornings.",          icon: Users,    fallbackImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Kerala", "Switzerland", "Singapore"] },
  { id: "Solo",      label: "Solo",      tagline: "One traveler, every detail handled. Safe stays, easy logistics.",     icon: User,     fallbackImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Spiti", "Vietnam", "Japan"] },
  { id: "Group",     label: "Group",     tagline: "8+ travelers, shared rooms or own. A planner along if you want.",     icon: Globe2,   fallbackImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Thailand", "Andaman", "Goa"] },
  { id: "Adventure", label: "Adventure", tagline: "Treks, dives, drives, nights under sky. Real outfit, real guides.",   icon: Mountain, fallbackImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Ladakh", "Spiti", "Nepal"] },
  { id: "Wellness",  label: "Wellness",  tagline: "Slow mornings. Real food. Yoga that doesn't feel performed.",         icon: Sunset,   fallbackImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Rishikesh", "Kerala", "Bali"] },
  { id: "Pilgrim",   label: "Pilgrim",   tagline: "Helicopter darshans. Hotels close to temples. Elders looked after.",   icon: Church,   fallbackImage: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Char Dham", "Vaishno Devi", "Tirupati"] },
  { id: "Luxury",    label: "Luxury",    tagline: "5-star hotels with character. Aman, Six Senses, Soneva when they fit.", icon: Crown,    fallbackImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Switzerland", "Maldives", "Japan"] },
];

interface DurationMeta { id: DurationId; label: string; tagline: string; icon: typeof Calendar }
const DURATIONS: DurationMeta[] = [
  { id: "long-weekend", label: "Long weekend", tagline: "2–3 nights. Fly Friday, back Sunday.",     icon: Hourglass },
  { id: "3-5",          label: "3–5 days",      tagline: "Short break, no jet lag. India, mostly.", icon: Clock },
  { id: "6-9",          label: "6–9 days",      tagline: "The sweet spot. International is open.",  icon: Plane },
  { id: "10+",          label: "10+ days",      tagline: "The full holiday. Multi-country welcome.", icon: Map },
];

interface Props {
  packagesByStyle?: Partial<Record<StyleId, PackageCardProps[]>>;
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
}

type TabId = "style" | "duration";

export default function BrowseTabs({
  packagesByStyle = {},
  eyebrow = "Browse the way you want",
  titleStart = "By feeling,",
  titleItalic = "or by how long you've got.",
  lede,
}: Props = {}) {
  const [tab, setTab] = useState<TabId>("style");

  return (
    <section
      id="browse"
      aria-labelledby="browse-tabs-title"
      className="py-16 md:py-24 bg-tat-paper dark:bg-tat-charcoal"
    >
      <div className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        <div role="tablist" aria-label="Browse mode" className="mt-7 inline-flex items-center gap-1.5 p-1 rounded-pill bg-tat-charcoal/5 dark:bg-white/10">
          <TabBtn id="style"    current={tab} onClick={setTab} icon={<Sparkles className="h-3.5 w-3.5" />} label="By style" />
          <TabBtn id="duration" current={tab} onClick={setTab} icon={<Calendar className="h-3.5 w-3.5" />} label="By duration" />
        </div>

        <div className="mt-8" key={tab}>
          {tab === "style" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {STYLES.map((meta) => {
                const trips = packagesByStyle[meta.id] ?? [];
                const heroImage = trips[0]?.image || meta.fallbackImage;
                return <StyleTile key={meta.id} meta={meta} count={trips.length} heroImage={heroImage} />;
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {DURATIONS.map((meta) => <DurationTile key={meta.id} meta={meta} />)}
            </div>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            Browse all journeys
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-[11px] text-tat-charcoal/55 dark:text-tat-paper/55 uppercase tracking-wider">
            {tab === "style" ? "8 ways to travel" : "4 trip lengths"}
          </p>
        </div>

        <h2 id="browse-tabs-title" className="sr-only">Browse trips by style or duration</h2>
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

function StyleTile({ meta, count, heroImage }: { meta: StyleMeta; count: number; heroImage: string }) {
  const Icon = meta.icon;
  return (
    <Link
      href={`/packages?style=${encodeURIComponent(meta.id)}`}
      aria-label={`Browse ${meta.label} trips`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-tat-charcoal ring-1 ring-tat-charcoal/10 shadow-soft hover:shadow-soft-lg transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/5]">
        <Image src={heroImage} alt="" fill sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 23vw" quality={70}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:group-hover:scale-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal via-tat-charcoal/55 to-tat-charcoal/15" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/15 backdrop-blur-sm text-white ring-1 ring-white/20">
            <Icon className="h-4 w-4" />
          </span>
          {count > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-tat-gold text-tat-charcoal text-[11px] font-bold">
              {count} {count === 1 ? "trip" : "trips"}
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
          <h3 className="font-display font-medium text-h3 leading-tight">{meta.label}</h3>
          <p className="mt-1 text-body-sm text-white/75 line-clamp-2 leading-snug">{meta.tagline}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-wider text-white/55 truncate">
              {meta.sampleDestinations.slice(0, 3).join(" · ")}
            </p>
            <span className="inline-flex items-center gap-1 text-body-sm font-semibold text-tat-gold whitespace-nowrap group-hover:translate-x-0.5 transition-transform duration-200">
              Plan this trip
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DurationTile({ meta }: { meta: DurationMeta }) {
  const matches = DESTINATIONS_BY_DURATION.filter((d) => d.durations.includes(meta.id));
  const heroImage = matches[0]?.image ?? "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=75";
  const sampleDestinations = matches.slice(0, 3);
  const totalCount = matches.length;
  const minPrice = matches.length > 0 ? Math.min(...matches.map((m) => m.priceFrom)) : 0;
  const Icon = meta.icon;

  return (
    <Link
      href={`/packages?duration=${meta.id}`}
      aria-label={`Trips that fit a ${meta.label.toLowerCase()}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-tat-charcoal ring-1 ring-tat-charcoal/10 shadow-soft hover:shadow-soft-lg transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/5]">
        <Image src={heroImage} alt="" fill sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 23vw" quality={70}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:group-hover:scale-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal via-tat-charcoal/55 to-tat-charcoal/15" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/15 backdrop-blur-sm text-white ring-1 ring-white/20">
            <Icon className="h-4 w-4" />
          </span>
          {totalCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-tat-gold text-tat-charcoal text-[11px] font-bold">
              {totalCount} {totalCount === 1 ? "trip" : "trips"}
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
          <h3 className="font-display font-medium text-h3 leading-tight">{meta.label}</h3>
          <p className="mt-1 text-body-sm text-white/75 leading-snug line-clamp-2">{meta.tagline}</p>
          {sampleDestinations.length > 0 && (
            <ul className="mt-3 flex items-center gap-2">
              {sampleDestinations.map((d) => (
                <li key={d.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/12 backdrop-blur-sm text-[11px] text-white/90">
                  <span className="relative h-4 w-4 rounded-full overflow-hidden bg-white/20 shrink-0" aria-hidden>
                    <Image src={d.image} alt="" fill sizes="16px" className="object-cover" />
                  </span>
                  <span className="truncate max-w-[80px]">{d.name}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
            {minPrice > 0 ? (
              <p className="text-[11px] text-white/65">
                from <span className="font-semibold text-white tnum">₹{minPrice.toLocaleString("en-IN")}</span>
              </p>
            ) : <span />}
            <span className="inline-flex items-center gap-1 text-body-sm font-semibold text-tat-gold group-hover:translate-x-0.5 transition-transform duration-200">
              Plan this trip
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
