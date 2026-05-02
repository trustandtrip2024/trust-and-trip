import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Destination } from "@/lib/data";

interface Props {
  /** Six destinations, ordered. Slot 0 = hero, 1-2 = medium, 3-5 = small. */
  destinations: Destination[];
  /** Optional headline override per slot. Falls back to destination.tagline. */
  taglines?: (string | undefined)[];
}

/**
 * Editorial mosaic — six destinations in a magazine-style grid. Replaces
 * TrendingDestinations + the trio of chip-filtered shelves. Tile sizes
 * vary on purpose so the page doesn't read like a uniform product grid.
 *
 * Curated by editors via Sanity (or hard-coded fallback). No algorithm,
 * no auto-rotation. The intent is "these are six trips we'd send our
 * own family on" — six is a manageable set, more isn't more.
 *
 * Mobile: stacks vertically, hero tile first, others 2-up.
 */
export default function HomeEditorialMosaic({ destinations, taglines = [] }: Props) {
  if (destinations.length < 6) return null;

  const [hero, m1, m2, s1, s2, s3] = destinations;
  const tag = (i: number, fallback?: string) =>
    taglines[i] ?? fallback ?? "";

  return (
    <section
      aria-labelledby="mosaic-heading"
      className="py-14 md:py-20 bg-tat-paper"
    >
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6 md:mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Trips we'd send our own family on
            </p>
            <h2
              id="mosaic-heading"
              className="mt-2 font-display text-[28px] md:text-[40px] leading-[1.05] text-tat-charcoal text-balance max-w-[20ch]"
            >
              Six destinations. Hand-picked. Refreshed monthly.
            </h2>
          </div>
          <Link
            href="/destinations"
            className="self-start md:self-end inline-flex items-center gap-1.5 text-[13px] font-semibold text-tat-charcoal/70 hover:text-tat-charcoal transition-colors"
          >
            Open the catalogue
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {/* Desktop: 12-col asymmetric grid; Mobile: stack. */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-12 md:auto-rows-[180px] lg:auto-rows-[210px]">
          {/* Hero tile — col-span-6 row-span-2 on desktop */}
          <div className="md:col-span-6 md:row-span-2 aspect-[4/5] md:aspect-auto">
            <Tile destination={hero} tagline={tag(0, hero.tagline)} feature />
          </div>
          {/* Medium 1 — col-span-3 row-span-2 */}
          <div className="md:col-span-3 md:row-span-2 aspect-[4/5] md:aspect-auto">
            <Tile destination={m1} tagline={tag(1, m1.tagline)} feature />
          </div>
          {/* Small 1 — col-span-3 row-span-1 */}
          <div className="md:col-span-3 md:row-span-1 aspect-[16/10] md:aspect-auto">
            <Tile destination={s1} tagline={tag(3, s1.tagline)} />
          </div>
          {/* Small 2 — col-span-3 row-span-1 */}
          <div className="md:col-span-3 md:row-span-1 aspect-[16/10] md:aspect-auto">
            <Tile destination={s2} tagline={tag(4, s2.tagline)} />
          </div>
          {/* Medium 2 — col-span-6 row-span-1 (wide) */}
          <div className="md:col-span-6 md:row-span-1 aspect-[16/10] md:aspect-auto">
            <Tile destination={m2} tagline={tag(2, m2.tagline)} />
          </div>
          {/* Small 3 — col-span-3 row-span-1 (NB: needs an even mobile row count, so we promote to 6 on mobile) */}
          <div className="md:col-span-3 md:row-span-1 aspect-[16/10] md:aspect-auto">
            <Tile destination={s3} tagline={tag(5, s3.tagline)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({
  destination,
  tagline,
  feature = false,
}: {
  destination: Destination;
  tagline: string;
  feature?: boolean;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group relative block h-full w-full overflow-hidden rounded-2xl md:rounded-3xl bg-tat-charcoal/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
    >
      <Image
        src={destination.image}
        alt=""
        fill
        sizes={feature ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <div className={`absolute inset-x-0 bottom-0 ${feature ? "p-5 md:p-7" : "p-4 md:p-5"} text-white`}>
        <p className={`uppercase tracking-[0.22em] font-semibold text-white/85 ${feature ? "text-[11px]" : "text-[10px]"}`}>
          {destination.country}
        </p>
        <h3 className={`font-display ${feature ? "text-[26px] md:text-[36px] leading-[1.05]" : "text-[18px] md:text-[22px] leading-tight"} mt-1 max-w-[18ch] text-balance`}>
          {destination.name}
        </h3>
        {tagline && (
          <p className={`mt-1 max-w-[34ch] ${feature ? "text-[13px] md:text-[14px]" : "text-[12px]"} text-white/80 leading-snug line-clamp-2`}>
            {tagline}
          </p>
        )}
        {feature && (
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 group-hover:underline">
            From ₹{destination.priceFrom?.toLocaleString("en-IN")}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </span>
        )}
      </div>
    </Link>
  );
}
