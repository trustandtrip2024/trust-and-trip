import Link from "next/link";
import { ArrowRight, Plane } from "lucide-react";

interface Pick {
  slug: string;
  name: string;
  reason: string;
}

interface Props {
  city: string;
  picks: Pick[];
}

/**
 * Renders only when the visitor's city has been detected by edge
 * geolocation and matched to a metro in the recommendations table.
 * Keeps copy honest — no fabricated prices, only flight time / route
 * notes that we can verify off any aviation source.
 */
export default function CityFavouritesStrip({ city, picks }: Props) {
  if (!picks || picks.length === 0) return null;

  return (
    <section
      aria-label={`Trip ideas for ${city} travelers`}
      className="bg-tat-cream-warm/30 border-b border-tat-charcoal/8 dark:bg-tat-charcoal/95 dark:border-white/10"
    >
      <div className="container-custom py-6 md:py-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="grid place-items-center h-9 w-9 rounded-full bg-tat-gold/15 text-tat-gold shrink-0">
              <Plane className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="tt-eyebrow">From {city}</p>
              <h2 className="mt-0.5 font-display text-h3 font-medium text-tat-charcoal dark:text-tat-paper">
                Closest. Easiest. Most-flown by{" "}
                <em className="not-italic italic text-tat-gold">{city} travelers.</em>
              </h2>
            </div>
          </div>
          <Link
            href="/destinations"
            className="self-start sm:self-center inline-flex items-center gap-1.5 text-body-sm font-medium text-tat-charcoal/80 hover:text-tat-gold whitespace-nowrap"
          >
            See all destinations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2.5">
          {picks.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/destinations/${p.slug}`}
                className="group inline-flex items-center gap-2 rounded-pill border border-tat-charcoal/15 bg-white/80 dark:bg-white/5 dark:border-white/15 hover:border-tat-gold/60 hover:bg-tat-gold/8 px-4 py-2 transition-all"
              >
                <span className="font-display text-body-sm font-medium text-tat-charcoal dark:text-tat-paper">
                  {p.name}
                </span>
                <span className="text-meta text-tat-charcoal/55 dark:text-tat-paper/60">
                  · {p.reason}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-tat-charcoal/40 group-hover:text-tat-gold group-hover:translate-x-0.5 transition" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
