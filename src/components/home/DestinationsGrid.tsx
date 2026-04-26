import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import DestinationCardUI from "@/components/ui/DestinationCard";
import type { Destination } from "@/lib/data";

interface Props {
  destinations: Destination[];
  /** Fallback whispers when a destination doc has no `whisper` field set yet. */
  whisperFallbacks?: Record<string, string>;
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
}

const DEFAULT_FALLBACKS: Record<string, string> = {
  uttarakhand:        "Mountains that hold their silence well.",
  kerala:             "Slow water, slower mornings.",
  ladakh:             "Where the road is half the holiday.",
  "himachal-pradesh": "Cold deserts and warm tea.",
  bali:               "Green, gentle, and full of surprises.",
  maldives:           "Where the floor is the ocean.",
  switzerland:        "The Alps, on your terms.",
  japan:              "Old country, careful detail.",
};

export default function DestinationsGrid({
  destinations,
  whisperFallbacks = DEFAULT_FALLBACKS,
  eyebrow = "Destinations",
  titleStart = "Worth crossing oceans,",
  titleItalic = "and state lines.",
  lede = "Sixty places we know well enough to recommend. Eight of our most-loved are below — the rest are a click away.",
}: Props) {
  const items = destinations.slice(0, 8);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="dest-title" className="py-18 md:py-22">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader
          eyebrow={eyebrow}
          title={titleStart}
          italicTail={titleItalic}
          lede={lede}
        />

        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((d) => (
            <li key={d.slug}>
              <DestinationCardUI
                image={d.image}
                name={d.name}
                region={d.region}
                country={d.country}
                whisper={d.whisper ?? whisperFallbacks[d.slug] ?? d.tagline ?? d.region}
                href={`/destinations/${d.slug}`}
              />
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-stone-900 hover:text-amber-700 transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 rounded-sm"
          >
            View all 60+ destinations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
