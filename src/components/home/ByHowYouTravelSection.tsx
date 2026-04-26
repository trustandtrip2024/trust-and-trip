"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Users, User, Globe2, Mountain, Sunset, Church, Crown } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ChipFilterGroup from "@/components/ui/ChipFilterGroup";
import PackageCardUI from "@/components/ui/PackageCard";
import { STYLE_PACKAGES, type StyleId } from "@/data/packagesByStyle";

const CHIPS: { id: StyleId; label: string; icon: typeof Heart; subtitle: string }[] = [
  { id: "Honeymoon", label: "Honeymoon", icon: Heart,    subtitle: "Quiet rooms, late checkouts, dinners that end with stars." },
  { id: "Family",    label: "Family",    icon: Users,    subtitle: "Kid-aware schedules, second helpings, no rushed mornings." },
  { id: "Solo",      label: "Solo",      icon: User,     subtitle: "Built around one traveler, with safety in the small print." },
  { id: "Group",     label: "Group",     icon: Globe2,   subtitle: "For 8+, with a planner who'll travel with you if you want." },
  { id: "Adventure", label: "Adventure", icon: Mountain, subtitle: "Treks, dives, drives, and nights under proper sky." },
  { id: "Wellness",  label: "Wellness",  icon: Sunset,   subtitle: "Slow mornings, real food, and nothing on the itinerary you didn't pick." },
  { id: "Pilgrim",   label: "Pilgrim",   icon: Church,   subtitle: "Helicopter darshans, vegetarian planning, hotels close to temples." },
  { id: "Luxury",    label: "Luxury",    icon: Crown,    subtitle: "Where the room is half the holiday." },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
}

export default function ByHowYouTravelSection({
  eyebrow = "By how you travel",
  titleStart = "Pick a feeling.",
  titleItalic = "We'll do the rest.",
  lede = "The destination matters less than the kind of trip you want it to be. Choose the mood — we'll match the place.",
}: Props = {}) {
  const [active, setActive] = useState<StyleId>("Honeymoon");

  const items = useMemo(
    () => STYLE_PACKAGES.filter((p) => p.style === active).slice(0, 6),
    [active]
  );
  const subtitle = CHIPS.find((c) => c.id === active)?.subtitle;

  return (
    <section aria-labelledby="bhyt-title" className="py-18 md:py-22">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        <div className="mt-7">
          <ChipFilterGroup
            chips={CHIPS}
            activeId={active}
            onChange={(id) => setActive(id as StyleId)}
            ariaLabel="Travel style"
          />
          {subtitle && (
            <p className="mt-3 text-body text-stone-600 italic font-serif">{subtitle}</p>
          )}
        </div>

        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((p) => (
            <li key={p.id}>
              <PackageCardUI {...p} />
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-stone-900 hover:text-amber-700 transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 rounded-sm"
          >
            Browse all journeys
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
