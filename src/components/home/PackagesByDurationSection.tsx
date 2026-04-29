"use client";

import { useMemo, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import ChipFilterGroup from "@/components/ui/ChipFilterGroup";
import DestinationCardUI from "@/components/ui/DestinationCard";
import { DESTINATIONS_BY_DURATION, type DurationId } from "@/data/destinationsByDuration";

const CHIPS: { id: DurationId; label: string }[] = [
  { id: "3-5",          label: "3–5 days" },
  { id: "6-9",          label: "6–9 days" },
  { id: "10+",          label: "10+ days" },
  { id: "long-weekend", label: "Just a long weekend" },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  /** When part of a Browse cluster, drop the top padding so it flows
   *  visually as one section with the preceding ByHowYouTravel block. */
  tightTop?: boolean;
}

export default function PackagesByDurationSection({
  eyebrow = "Browse by length",
  titleStart = "How long do you have?",
  titleItalic = "We'll fit it in.",
  // Lede intentionally undefined — the duration chips below speak for themselves.
  lede,
  tightTop = false,
}: Props = {}) {
  const [active, setActive] = useState<DurationId>("6-9");
  const items = useMemo(
    () => DESTINATIONS_BY_DURATION.filter((d) => d.durations.includes(active)).slice(0, 4),
    [active]
  );

  return (
    <section aria-labelledby="duration-title" className={`${tightTop ? "pt-4 md:pt-6 pb-16 md:pb-24" : "py-16 md:py-24"} bg-tat-paper`}>
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        <div className="mt-7">
          <ChipFilterGroup
            chips={CHIPS}
            activeId={active}
            onChange={(id) => setActive(id as DurationId)}
            ariaLabel="Filter destinations by trip length"
          />
        </div>

        {/* Single horizontal rail at every breakpoint to match the other
            home rails (RecentlyCrafted, ByHowYouTravel, OfferDeals). */}
        <div className="mt-8 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
          <ul className="flex w-max gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0">
            {items.map((d) => (
              <li
                key={d.id}
                className="shrink-0 snap-start w-[78%] sm:w-[48%] md:w-[32%] lg:w-[24%]"
              >
                <DestinationCardUI
                  image={d.image}
                  name={d.name}
                  region={d.region}
                  country={d.country}
                  whisper={d.whisper}
                  packageCount={d.packageCount}
                  priceFrom={d.priceFrom}
                  href={d.href}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
