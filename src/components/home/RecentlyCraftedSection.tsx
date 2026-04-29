"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ChipFilterGroup from "@/components/ui/ChipFilterGroup";
import RecentItineraryCard from "@/components/ui/RecentItineraryCard";
import { RECENT_ITINERARIES } from "@/data/recentItineraries";

const CHIPS = [
  { id: "all",        label: "All" },
  { id: "under-50k",  label: "Under ₹50K" },
  { id: "50k-1.5l",   label: "₹50K–1.5L" },
  { id: "1.5l-2.5l",  label: "₹1.5L–2.5L" },
  { id: "luxury",     label: "Luxury" },
  { id: "yatra",      label: "Yatra" },
  { id: "honeymoon",  label: "Honeymoon" },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
}

export default function RecentlyCraftedSection({
  eyebrow = "Recently crafted",
  titleStart = "Real itineraries,",
  titleItalic = "fresh off the road.",
  lede = "143 trips planned this month. These are the most recent. Tap any one — we'll build you something similar in 24 hours.",
}: Props = {}) {
  const [active, setActive] = useState("all");

  const items = useMemo(() => {
    if (active === "all") return RECENT_ITINERARIES.slice(0, 12);
    return RECENT_ITINERARIES.filter((i) => i.priceBucket === active).slice(0, 12);
  }, [active]);

  return (
    <section aria-labelledby="recent-title" className="py-16 md:py-24">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        <div className="mt-7">
          <ChipFilterGroup
            chips={CHIPS}
            activeId={active}
            onChange={setActive}
            ariaLabel="Filter recent itineraries by budget or style"
          />
        </div>

        {items.length === 0 ? (
          <p className="mt-10 text-body text-tat-slate">
            No recent itineraries match this filter yet — try another, or see all recent itineraries below.
          </p>
        ) : (
          // Single horizontal rail at every breakpoint — shipping the same
          // snap-scroll story on web + mobile reads as a curated reel rather
          // than a static grid that suddenly compresses on phone.
          <div className="mt-8 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
            <ul className="flex w-max gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="shrink-0 snap-start w-[78%] sm:w-[48%] md:w-[32%] lg:w-[24%]"
                >
                  <RecentItineraryCard
                    firstName={it.firstName}
                    city={it.city}
                    timeAgo={it.timeAgo}
                    tripStyle={it.tripStyle}
                    nights={it.nights}
                    primaryDestination={it.primaryDestination}
                    otherDestinationsCount={it.otherDestinationsCount}
                    price={it.price}
                    plannerName={it.plannerName}
                    href={it.href}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/packages?sort=recent"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-tat-charcoal hover:text-tat-gold transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            See all recent itineraries
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
