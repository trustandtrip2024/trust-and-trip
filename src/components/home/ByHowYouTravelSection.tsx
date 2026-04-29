"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Heart, Users, User, Globe2, Mountain, Sunset, Church, Crown,
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { PackageCardProps } from "@/components/ui/PackageCard";

export type StyleId =
  | "Honeymoon" | "Family" | "Solo" | "Group"
  | "Adventure" | "Wellness" | "Pilgrim" | "Luxury";

interface StyleTileMeta {
  id: StyleId;
  label: string;
  tagline: string;
  icon: typeof Heart;
  fallbackImage: string;
  sampleDestinations: string[];
}

// Order optimized for the 4-col desktop grid: top row = highest-volume styles,
// bottom row = niche/aspirational. Mobile reads top-down so the same order works.
const STYLES: StyleTileMeta[] = [
  {
    id: "Honeymoon",
    label: "Honeymoon",
    tagline: "Quiet rooms. Late checkouts. Privacy that costs less than you think.",
    icon: Heart,
    fallbackImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=75",
    sampleDestinations: ["Bali", "Maldives", "Santorini"],
  },
  {
    id: "Family",
    label: "Family",
    tagline: "Kid-aware schedules. Connecting rooms. No rushed mornings.",
    icon: Users,
    fallbackImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=75",
    sampleDestinations: ["Kerala", "Switzerland", "Singapore"],
  },
  {
    id: "Solo",
    label: "Solo",
    tagline: "One traveler, every detail handled. Safe stays, easy logistics.",
    icon: User,
    fallbackImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=75",
    sampleDestinations: ["Spiti", "Vietnam", "Japan"],
  },
  {
    id: "Group",
    label: "Group",
    tagline: "8+ travelers, shared rooms or own. A planner along if you want.",
    icon: Globe2,
    fallbackImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=75",
    sampleDestinations: ["Thailand", "Andaman", "Goa"],
  },
  {
    id: "Adventure",
    label: "Adventure",
    tagline: "Treks, dives, drives, nights under sky. Real outfit, real guides.",
    icon: Mountain,
    fallbackImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=75",
    sampleDestinations: ["Ladakh", "Spiti", "Nepal"],
  },
  {
    id: "Wellness",
    label: "Wellness",
    tagline: "Slow mornings. Real food. Yoga that doesn't feel performed.",
    icon: Sunset,
    fallbackImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=75",
    sampleDestinations: ["Rishikesh", "Kerala", "Bali"],
  },
  {
    id: "Pilgrim",
    label: "Pilgrim",
    tagline: "Helicopter darshans. Hotels close to temples. Elders looked after.",
    icon: Church,
    fallbackImage: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=900&q=75",
    sampleDestinations: ["Kedarnath", "Char Dham", "Tirupati"],
  },
  {
    id: "Luxury",
    label: "Luxury",
    tagline: "Where the room is half the holiday. Hand-picked suites, private cars.",
    icon: Crown,
    fallbackImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=75",
    sampleDestinations: ["Maldives", "Switzerland", "Dubai"],
  },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  packagesByStyle?: Partial<Record<StyleId, PackageCardProps[]>>;
}

function StyleTile({
  meta,
  count,
  heroImage,
}: {
  meta: StyleTileMeta;
  count: number;
  heroImage: string;
}) {
  const Icon = meta.icon;
  const href = `/packages?style=${encodeURIComponent(meta.id)}`;
  return (
    <Link
      href={href}
      aria-label={`Browse ${meta.label} trips`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-tat-charcoal ring-1 ring-tat-charcoal/10 dark:ring-white/10 shadow-soft hover:shadow-soft-lg transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/5]">
        <Image
          src={heroImage}
          alt=""
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 23vw"
          quality={70}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal via-tat-charcoal/55 to-tat-charcoal/15" />

        {/* Top-left: icon badge. Top-right: trip count. */}
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

        {/* Bottom block: label + tagline + sample destinations + CTA */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
          <h3 className="font-display font-medium text-h3 leading-tight">
            {meta.label}
          </h3>
          <p className="mt-1 text-body-sm text-white/75 line-clamp-2 leading-snug">
            {meta.tagline}
          </p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-wider text-white/55 truncate">
              {meta.sampleDestinations.slice(0, 3).join(" · ")}
            </p>
            <span className="inline-flex items-center gap-1 text-body-sm font-semibold text-tat-gold whitespace-nowrap group-hover:translate-x-0.5 transition-transform duration-200">
              Browse
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ByHowYouTravelSection({
  eyebrow = "By how you travel",
  titleStart = "Pick a feeling.",
  titleItalic = "We'll do the rest.",
  lede,
  packagesByStyle = {},
}: Props = {}) {
  return (
    <section
      aria-labelledby="bhyt-title"
      className="py-16 md:py-24 bg-tat-paper dark:bg-tat-charcoal"
    >
      <div className="container-custom">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        {/* 8-tile grid — 1 col mobile, 2 col sm, 4 col lg. Replaces chip+rail
            with direct visual browse: every style is its own portal. */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {STYLES.map((meta) => {
            const trips = packagesByStyle[meta.id] ?? [];
            const heroImage = trips[0]?.image || meta.fallbackImage;
            return (
              <StyleTile
                key={meta.id}
                meta={meta}
                count={trips.length}
                heroImage={heroImage}
              />
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold dark:text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            Browse all journeys
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-[11px] text-tat-charcoal/55 dark:text-tat-paper/55 uppercase tracking-wider">
            8 ways to travel
          </p>
        </div>
      </div>
    </section>
  );
}
