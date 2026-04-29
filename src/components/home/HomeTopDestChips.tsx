import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Destination } from "@/lib/data";

interface Props {
  destinations: Destination[];
  /** Names (case-sensitive match) to feature first. Falls back to first 12. */
  featured?: string[];
}

const DEFAULT_FEATURED = [
  "Bali", "Maldives", "Thailand", "Dubai", "Switzerland",
  "Singapore", "Vietnam", "Kashmir", "Kerala", "Andaman",
  "Char Dham", "Ladakh",
];

export default function HomeTopDestChips({ destinations, featured = DEFAULT_FEATURED }: Props) {
  if (!destinations?.length) return null;

  // Order by featured list first, then fill with remaining destinations.
  const byName = new Map(destinations.map((d) => [d.name, d]));
  const ordered: Destination[] = [];
  for (const name of featured) {
    const d = byName.get(name);
    if (d) { ordered.push(d); byName.delete(name); }
  }
  for (const d of byName.values()) ordered.push(d);
  const items = ordered.slice(0, 12);

  return (
    <section id="destinations" aria-labelledby="topdest-title" className="py-10 md:py-14 bg-tat-paper dark:bg-tat-charcoal/95 border-y border-tat-charcoal/8 dark:border-white/10">
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 mb-5 md:mb-6">
          <div>
            <p className="tt-eyebrow">Top destinations</p>
            <h2 id="topdest-title" className="mt-1 font-display font-normal text-2xl md:text-3xl text-tat-charcoal dark:text-tat-paper">
              Where travelers are going{" "}
              <em className="not-italic font-display italic text-tat-gold dark:text-tat-gold">this season.</em>
            </h2>
          </div>
          <Link
            href="/destinations"
            className="hidden sm:inline-flex items-center gap-1 text-body-sm font-semibold text-tat-gold dark:text-tat-gold hover:underline underline-offset-4"
          >
            All 60+
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ul
          aria-label="Top destinations"
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 snap-x snap-proximity pb-2"
        >
          {items.map((d) => (
            <li key={d.slug} className="shrink-0 snap-start">
              <Link
                href={`/destinations/${d.slug}`}
                className="group block w-[150px] md:w-[170px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-2xl"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-tat-charcoal/15">
                  <Image
                    src={d.image}
                    alt={d.name}
                    fill
                    sizes="170px"
                    quality={65}
                    className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="font-display text-white text-[15px] md:text-base leading-tight">
                      {d.name}
                    </p>
                    {d.priceFrom && (
                      <p className="text-[11px] text-white/85 leading-tight">
                        From ₹{d.priceFrom.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
