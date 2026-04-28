"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Users, User, Globe2, Mountain, Sunset, Church, Crown, Sparkles, MapPin, Clock } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ChipFilterGroup from "@/components/ui/ChipFilterGroup";
import type { PackageCardProps } from "@/components/ui/PackageCard";
import Price from "@/components/Price";
import { useTripPlanner } from "@/context/TripPlannerContext";

export type StyleId =
  | "Honeymoon" | "Family" | "Solo" | "Group"
  | "Adventure" | "Wellness" | "Pilgrim" | "Luxury";

const CHIPS: { id: StyleId; label: string; icon: typeof Heart; tagline: string }[] = [
  { id: "Honeymoon", label: "Honeymoon", icon: Heart,    tagline: "Quiet rooms, late checkouts." },
  { id: "Family",    label: "Family",    icon: Users,    tagline: "Kid-aware schedules, no rushed mornings." },
  { id: "Solo",      label: "Solo",      icon: User,     tagline: "Built around one traveler." },
  { id: "Group",     label: "Group",     icon: Globe2,   tagline: "8+ travelers, with a planner along if you want." },
  { id: "Adventure", label: "Adventure", icon: Mountain, tagline: "Treks, dives, drives, nights under sky." },
  { id: "Wellness",  label: "Wellness",  icon: Sunset,   tagline: "Slow mornings, real food." },
  { id: "Pilgrim",   label: "Pilgrim",   icon: Church,   tagline: "Helicopter darshans, hotels close to temples." },
  { id: "Luxury",    label: "Luxury",    icon: Crown,    tagline: "Where the room is half the holiday." },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  packagesByStyle?: Partial<Record<StyleId, PackageCardProps[]>>;
}

function MiniCard({ p }: { p: PackageCardProps }) {
  return (
    <Link
      href={p.href}
      className="group block h-full rounded-2xl bg-white dark:bg-white/5 ring-1 ring-tat-charcoal/8 dark:ring-white/10 overflow-hidden transition duration-200 hover:ring-tat-burnt/30 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
      aria-label={p.title}
    >
      <div className="relative aspect-[4/3] bg-tat-charcoal/15 overflow-hidden">
        <Image
          src={p.image}
          alt=""
          fill
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, 22vw"
          quality={65}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        {p.duration && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 bg-white/95 text-tat-charcoal text-[11px] font-semibold px-2 py-0.5 rounded-pill shadow-card">
            <Clock className="h-3 w-3 text-tat-burnt" />
            {p.duration}
          </span>
        )}
      </div>
      <div className="p-3.5 md:p-4">
        {p.destination && (
          <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-tat-slate/80">
            <MapPin className="h-3 w-3 text-tat-burnt" />
            {p.destination}
          </p>
        )}
        <h3 className="mt-1.5 font-display font-normal text-[15px] md:text-[17px] leading-snug text-tat-charcoal dark:text-tat-paper text-balance line-clamp-2 min-h-[2.5em]">
          {p.title}
        </h3>
        <div className="mt-3 pt-2.5 border-t border-tat-charcoal/8 dark:border-white/10 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-tat-slate/70">From</p>
            <p className="font-display text-[18px] md:text-[20px] text-tat-charcoal dark:text-tat-paper leading-none">
              <Price inr={p.price} />
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-tat-burnt dark:text-tat-gold">
            View
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CustomPlanCard({ style }: { style: StyleId }) {
  const { open: openPlanner } = useTripPlanner();
  return (
    <div className="rounded-2xl bg-tat-cream-warm/40 border border-tat-orange/25 p-5 md:p-6 flex flex-col items-start gap-3">
      <div className="h-9 w-9 rounded-full bg-tat-orange/15 grid place-items-center text-tat-burnt">
        <Sparkles className="h-4 w-4" />
      </div>
      <h3 className="font-display text-[18px] text-tat-charcoal">
        {style} trips, made to order.
      </h3>
      <p className="text-body-sm text-tat-slate">
        We craft these on request — tell us your dates and we&apos;ll send a custom itinerary in 24 hours.
      </p>
      <button
        onClick={() => openPlanner()}
        className="mt-1 inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-burnt hover:underline underline-offset-4"
      >
        Plan my {style.toLowerCase()} trip
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ByHowYouTravelSection({
  eyebrow = "By how you travel",
  titleStart = "Pick a feeling.",
  titleItalic = "We'll do the rest.",
  lede = "The destination matters less than the kind of trip. Choose the mood — we'll match the place.",
  packagesByStyle = {},
}: Props = {}) {
  const [active, setActive] = useState<StyleId>("Honeymoon");

  const items = useMemo(
    () => (packagesByStyle[active] ?? []).slice(0, 8),
    [packagesByStyle, active]
  );
  const tagline = CHIPS.find((c) => c.id === active)?.tagline;
  const empty = items.length === 0;

  return (
    <section
      aria-labelledby="bhyt-title"
      className="py-12 md:py-16 lg:py-20 bg-tat-paper dark:bg-tat-charcoal"
    >
      <div className="container-custom">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        <div className="mt-6">
          <ChipFilterGroup
            chips={CHIPS}
            activeId={active}
            onChange={(id) => setActive(id as StyleId)}
            ariaLabel="Travel style"
          />
          {tagline && (
            <p className="mt-3 text-body-sm text-tat-slate dark:text-tat-paper/65 italic">
              {tagline}
            </p>
          )}
        </div>

        {empty ? (
          <div className="mt-7 max-w-md">
            <CustomPlanCard style={active} />
          </div>
        ) : (
          <div className="mt-7 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-proximity scroll-smooth">
            <ul className="flex w-max gap-3 md:gap-4 lg:gap-5 pb-1.5 pr-5 lg:pr-0">
              {items.map((p) => (
                <li
                  key={p.href}
                  className="shrink-0 snap-start w-[64%] sm:w-[42%] md:w-[30%] lg:w-[23%] xl:w-[19%]"
                >
                  <MiniCard p={p} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-7 flex items-center justify-between gap-4">
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-burnt dark:text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            Browse all journeys
            <ArrowRight className="h-4 w-4" />
          </Link>
          {!empty && (
            <p className="text-[11px] text-tat-charcoal/55 dark:text-tat-paper/55 uppercase tracking-wider">
              {items.length} {active.toLowerCase()} trips
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
