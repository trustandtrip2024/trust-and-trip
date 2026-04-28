"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, Users, User, Globe2, Mountain, Sunset, Church, Crown, Sparkles } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ChipFilterGroup from "@/components/ui/ChipFilterGroup";
import PackageCardUI, { type PackageCardProps } from "@/components/ui/PackageCard";
import { useTripPlanner } from "@/context/TripPlannerContext";

export type StyleId =
  | "Honeymoon" | "Family" | "Solo" | "Group"
  | "Adventure" | "Wellness" | "Pilgrim" | "Luxury";

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
  /** Real packages from Sanity, grouped by style. Empty styles show a custom-plan CTA. */
  packagesByStyle?: Partial<Record<StyleId, PackageCardProps[]>>;
}

function CustomPlanCard({ style }: { style: StyleId }) {
  const { open: openPlanner } = useTripPlanner();
  return (
    <article className="tt-card tt-card-p flex flex-col items-start justify-center gap-4 text-center bg-tat-cream-warm/30 border-tat-orange/30">
      <div className="h-12 w-12 rounded-pill bg-tat-orange/15 grid place-items-center text-tat-gold self-center">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="font-serif text-h3 text-tat-charcoal self-center">
        {style} trips, made to order.
      </h3>
      <p className="text-body text-tat-slate self-center max-w-sm">
        We craft these on request — tell us your dates, your dream, and we&apos;ll send a custom itinerary in 24 hours.
      </p>
      <button
        onClick={() => openPlanner()}
        className="tt-cta self-center !w-auto !min-w-[220px]"
      >
        Plan my {style.toLowerCase()} trip
        <ArrowRight className="h-4 w-4" />
      </button>
    </article>
  );
}

export default function ByHowYouTravelSection({
  eyebrow = "By how you travel",
  titleStart = "Pick a feeling.",
  titleItalic = "We'll do the rest.",
  lede = "The destination matters less than the kind of trip you want it to be. Choose the mood — we'll match the place.",
  packagesByStyle = {},
}: Props = {}) {
  const [active, setActive] = useState<StyleId>("Honeymoon");

  const items = useMemo(
    () => (packagesByStyle[active] ?? []).slice(0, 6),
    [packagesByStyle, active]
  );
  const subtitle = CHIPS.find((c) => c.id === active)?.subtitle;
  const empty = items.length === 0;

  return (
    <section
      aria-labelledby="bhyt-title"
      className="py-10 md:py-16 lg:py-24 bg-tat-paper dark:bg-tat-charcoal"
    >
      <div className="container-custom">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        <div className="mt-7">
          <ChipFilterGroup
            chips={CHIPS}
            activeId={active}
            onChange={(id) => setActive(id as StyleId)}
            ariaLabel="Travel style"
          />
          {/* Mood subtitle — editorial italic so it reads as the active
              chip's tagline rather than auxiliary copy. Animated swap when
              the active chip changes. */}
          <AnimatePresence mode="wait">
            {subtitle && (
              <motion.p
                key={active}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mt-4 font-display italic text-[17px] md:text-[20px] leading-snug text-tat-burnt dark:text-tat-gold max-w-2xl"
              >
                &ldquo;{subtitle}&rdquo;
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {empty ? (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <CustomPlanCard style={active} />
          </div>
        ) : (
          /* Single unified snap-slider that scales across every breakpoint.
             Mobile: ~72% peek. Tablet/desktop: progressively more cards
             visible, with snap-proximity (not mandatory) so users near an
             edge can free-scroll without the snap fighting them. */
          <div className="mt-8 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-proximity scroll-smooth">
            <motion.ul
              key={`u-${active}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex w-max gap-4 lg:gap-6 pb-2 pr-5 lg:pr-0"
            >
              {items.map((p) => (
                <li
                  key={p.href}
                  className="shrink-0 snap-start w-[72%] sm:w-[48%] md:w-[40%] lg:w-[31%] xl:w-[28%]"
                >
                  <PackageCardUI {...p} />
                </li>
              ))}
            </motion.ul>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-4">
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-tat-charcoal dark:text-tat-paper hover:text-tat-gold transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            Browse all journeys
            <ArrowRight className="h-4 w-4" />
          </Link>
          {!empty && (
            <p className="text-[12px] text-tat-charcoal/55 dark:text-tat-paper/60">
              Showing {Math.min(items.length, 6)} {active.toLowerCase()} trips
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
