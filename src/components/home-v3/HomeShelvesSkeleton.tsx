import PackageCardSkeleton from "@/components/PackageCardSkeleton";

/**
 * Streaming fallback for the below-fold shelves block. Shown while the
 * Sanity package fetches inside HomeShelves resolve. Sized to roughly
 * match the rendered output so the page doesn't jump 2000px when the
 * real content arrives.
 */
export default function HomeShelvesSkeleton() {
  return (
    <>
      {/* Featured packages skeleton */}
      <section className="py-14 md:py-16 bg-tat-paper">
        <div className="container-custom">
          <div className="space-y-3 mb-8">
            <div className="h-3 w-24 bg-tat-charcoal/8 rounded-full animate-pulse" />
            <div className="h-8 w-80 bg-tat-charcoal/8 rounded animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <PackageCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Generic chip shelf skeleton */}
      <section className="py-14 md:py-16">
        <div className="container-custom">
          <div className="space-y-3 mb-8">
            <div className="h-3 w-32 bg-tat-charcoal/8 rounded-full animate-pulse" />
            <div className="h-8 w-72 bg-tat-charcoal/8 rounded animate-pulse" />
          </div>
          <div className="flex gap-2 mb-6 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-24 bg-tat-charcoal/8 rounded-full animate-pulse shrink-0" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <PackageCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
