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
  lede = "Long weekend, full fortnight, or somewhere in between — every itinerary is sized to the days you actually have.",
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

        <ul
          className="mt-8 flex flex-nowrap gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5"
        >
          {items.map((d) => (
            <li
              key={d.id}
              className="shrink-0 snap-start w-[78%] sm:w-auto"
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
    </section>
  );
}
