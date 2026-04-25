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

export default function PackagesByDurationSection() {
  const [active, setActive] = useState<DurationId>("6-9");
  const items = useMemo(
    () => DESTINATIONS_BY_DURATION.filter((d) => d.durations.includes(active)).slice(0, 4),
    [active]
  );

  return (
    <section aria-labelledby="duration-title" className="py-18 md:py-22 bg-stone-50/60">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader
          eyebrow="Browse by length"
          title="How long do you have?"
          italicTail="We'll fit it in."
          lede="Long weekend, full fortnight, or somewhere in between — every itinerary is sized to the days you actually have."
        />

        <div className="mt-7">
          <ChipFilterGroup
            chips={CHIPS}
            activeId={active}
            onChange={(id) => setActive(id as DurationId)}
            ariaLabel="Filter destinations by trip length"
          />
        </div>

        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((d) => (
            <li key={d.id}>
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
