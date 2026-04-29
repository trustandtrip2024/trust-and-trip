"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Users, User, Globe2, Mountain, Sunset, Church, Crown, Sparkles, MapPin } from "lucide-react";
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

function MiniCard({ p, styleLabel }: { p: PackageCardProps; styleLabel: string }) {
  return (
    <Link
      href={p.href}
      className="group relative block h-full aspect-[3/4] rounded-card overflow-hidden bg-tat-charcoal shadow-card transition duration-200 hover:shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
      aria-label={p.title}
    >
      <Image
        src={p.image}
        alt=""
        fill
        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 30vw, 22vw"
        quality={70}
        className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/85 via-tat-charcoal/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-white">
        {p.destination && (
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-white/70">
            <MapPin className="h-3 w-3 text-tat-orange-soft" />
            <span>{p.destination}</span>
          </div>
        )}
        <h3 className="mt-1 font-display font-medium text-h3 text-white leading-tight line-clamp-2">
          {p.title}
        </h3>
        <p className="mt-1.5 italic text-body-sm text-white/80 line-clamp-1">
          {styleLabel}
          {p.duration ? ` · ${p.duration}` : ""}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 text-[12.5px]">
          <span className="text-white/75">
            from <Price inr={p.price} className="font-semibold text-white" />
          </span>
          <span className="inline-flex items-center gap-1 text-white/85 group-hover:text-tat-orange-soft transition duration-120">
            Explore
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
      <div className="h-9 w-9 rounded-full bg-tat-orange/15 grid place-items-center text-tat-gold">
        <Sparkles className="h-4 w-4" />
      </div>
      <h3 className="font-display text-h3 text-tat-charcoal">
        {style} trips, made to order.
      </h3>
      <p className="text-body-sm text-tat-slate">
        We craft these on request — tell us your dates and we&apos;ll send a custom itinerary in 24 hours.
      </p>
      <button
        onClick={() => openPlanner()}
        className="mt-1 inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
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
            <ul className="flex w-max gap-4 md:gap-4 lg:gap-5 pb-1.5 pr-5 lg:pr-0">
              {items.map((p) => (
                <li
                  key={p.href}
                  className="shrink-0 snap-start w-[78%] sm:w-[48%] md:w-[34%] lg:w-[24%] xl:w-[24%]"
                >
                  <MiniCard p={p} styleLabel={active} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-7 flex items-center justify-between gap-4">
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold dark:text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
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
