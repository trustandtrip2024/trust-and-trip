import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import { sanityClient } from "@/lib/sanity";
import TripCard from "@/components/ui/TripCard";

interface RawTrip {
  slug: string;
  title: string;
  destinationName: string;
  duration?: string;
  price: number;
  image?: { asset?: { url?: string } };
  imageHero?: { asset?: { url?: string } };
  nextDate: string;
  slotsLeft?: number;
  batchLabel?: string;
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80&auto=format&fit=crop";

/**
 * Real fixed-departure trips. Pulls Sanity packages whose `departures[]`
 * contain at least one future date with slotsLeft > 0, sorted by the
 * soonest such departure ascending. Top 6.
 *
 * Replaces LiveDeals (which used 6 hardcoded "deals") with honest
 * urgency. Self-hides when no future departures exist — no pretend
 * scarcity, no fake countdown timers.
 */
export default async function HomeOpenTrips() {
  const today = new Date().toISOString().slice(0, 10);

  const raw = await sanityClient
    .fetch<RawTrip[]>(
      `*[_type == "package"
         && count(departures[date >= $today && coalesce(slotsLeft, 0) > 0]) > 0
       ] {
        "slug": slug.current,
        title,
        "destinationName": destination->name,
        duration,
        price,
        "image": image{ asset->{ url } },
        "imageHero": heroImage{ asset->{ url } },
        "nextDate": (departures[date >= $today && coalesce(slotsLeft, 0) > 0]
                      | order(date asc))[0].date,
        "slotsLeft": (departures[date >= $today && coalesce(slotsLeft, 0) > 0]
                       | order(date asc))[0].slotsLeft,
        "batchLabel": (departures[date >= $today && coalesce(slotsLeft, 0) > 0]
                        | order(date asc))[0].batchLabel
      } | order(nextDate asc) [0...6]`,
      { today },
    )
    .catch(() => [] as RawTrip[]);

  if (!raw.length) return null;

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <section
      aria-labelledby="open-trips-heading"
      className="py-14 md:py-18 bg-tat-cream-warm/30"
    >
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6 md:mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Open trips
            </p>
            <h2
              id="open-trips-heading"
              className="mt-2 font-display text-[24px] md:text-[34px] leading-[1.05] text-tat-charcoal text-balance max-w-[22ch]"
            >
              Real departures, real seats remaining.
            </h2>
          </div>
          <Link
            href="/packages"
            className="self-start md:self-end inline-flex items-center gap-1.5 text-[13px] font-semibold text-tat-charcoal/70 hover:text-tat-charcoal transition-colors"
          >
            All open trips
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {raw.map((t) => {
            const url = t.image?.asset?.url ?? t.imageHero?.asset?.url ?? FALLBACK_IMG;
            const image = url.startsWith("https://cdn.sanity.io")
              ? `${url}?w=900&q=75&auto=format&fit=crop`
              : url;
            return (
              <li key={t.slug} className="relative">
                <TripCard
                  href={`/packages/${t.slug}`}
                  image={image}
                  destination={t.destinationName}
                  title={t.title}
                  duration={t.duration}
                  priceFrom={t.price}
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-tat-charcoal shadow-sm">
                  <Calendar className="h-3 w-3 text-tat-gold" aria-hidden />
                  {fmtDate(t.nextDate)}
                  {typeof t.slotsLeft === "number" && (
                    <span className="text-tat-orange">· {t.slotsLeft} left</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
