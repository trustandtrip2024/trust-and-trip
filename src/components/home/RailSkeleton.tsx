/**
 * Loading skeleton for horizontal rail sections (deals, reviews, UGC,
 * pilgrim, by-style). Renders a ghost section header + shimmering card
 * placeholders so the page reserves height *and* signals "loading"
 * rather than just an empty box.
 *
 * Pure CSS — no JS, no client component. Used inside next/dynamic
 * `loading: () => <RailSkeleton ... />`.
 */
interface Props {
  cards?: number;
  /** Card aspect ratio — "portrait" matches DestinationCard / MiniCard,
   *  "square" matches PackageCard, "wide" matches blog teaser. */
  aspect?: "portrait" | "square" | "wide";
  /** Approximate section height — kept close to the live component to
   *  avoid CLS when the real content swaps in. */
  height?: number;
}

export default function RailSkeleton({ cards = 4, aspect = "portrait", height = 560 }: Props = {}) {
  const aspectClass =
    aspect === "wide"
      ? "aspect-[4/3]"
      : aspect === "square"
      ? "aspect-square"
      : "aspect-[3/4]";

  return (
    <section
      aria-busy="true"
      aria-label="Loading"
      style={{ minHeight: height }}
      className="py-14 md:py-20 bg-tat-paper dark:bg-tat-charcoal/95"
    >
      <div className="container-custom">
        {/* Header ghost */}
        <div className="max-w-2xl">
          <div className="h-3 w-28 rounded-full bg-tat-charcoal/8 dark:bg-white/8 animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(0,0,0,0.04),transparent)] [background-size:200%_100%]" />
          <div className="mt-3 h-7 w-3/4 rounded-md bg-tat-charcoal/8 dark:bg-white/8" />
          <div className="mt-2 h-4 w-2/3 rounded-md bg-tat-charcoal/6 dark:bg-white/6" />
        </div>

        {/* Cards ghost */}
        <ul className="mt-7 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: cards }).map((_, i) => (
            <li key={i} className={`${aspectClass} rounded-card bg-tat-charcoal/8 dark:bg-white/8 overflow-hidden relative`}>
              <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] [background-size:200%_100%]" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
