export default function PackageDetailLoading() {
  return (
    <>
      {/* Hero skeleton — matches the live 55vh / 380px floor. */}
      <div className="relative h-[55vh] min-h-[380px] w-full bg-tat-charcoal/15 animate-pulse" />

      {/* Section nav skeleton */}
      <div className="sticky top-[64px] z-40 bg-white border-b border-tat-charcoal/8">
        <div className="container-custom flex gap-6 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 w-16 bg-tat-charcoal/8 rounded-full animate-pulse" />
          ))}
        </div>
      </div>

      {/* Content + sidebar — matches live 1fr / 360px split. */}
      <div className="container-custom py-8 md:py-12 pb-24 lg:pb-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
          <div className="min-w-0 space-y-8">
            {/* Gallery */}
            <div className="aspect-[16/9] rounded-2xl bg-tat-charcoal/8 animate-pulse" />

            {/* Why this package */}
            <div className="rounded-2xl bg-tat-charcoal/5 p-6 space-y-3 animate-pulse">
              <div className="h-3 w-32 bg-tat-charcoal/15 rounded-full" />
              <div className="h-4 w-3/4 bg-tat-charcoal/15 rounded" />
              <div className="h-4 w-2/3 bg-tat-charcoal/15 rounded" />
              <div className="h-4 w-3/5 bg-tat-charcoal/15 rounded" />
            </div>

            {/* Highlights ribbon */}
            <div className="grid sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-tat-charcoal/8 animate-pulse" />
              ))}
            </div>

            {/* Itinerary days */}
            <div className="space-y-3">
              <div className="h-3 w-32 bg-tat-charcoal/8 rounded-full animate-pulse" />
              <div className="h-8 w-48 bg-tat-charcoal/8 rounded animate-pulse" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-tat-charcoal/8 animate-pulse" />
              ))}
            </div>

            {/* Inclusions accordion */}
            <div className="space-y-3">
              <div className="h-3 w-44 bg-tat-charcoal/8 rounded-full animate-pulse" />
              <div className="h-8 w-56 bg-tat-charcoal/8 rounded animate-pulse" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-card bg-tat-charcoal/8 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Sticky sidebar skeleton */}
          <div className="space-y-3">
            <div className="h-[420px] rounded-3xl bg-tat-charcoal/8 animate-pulse" />
            <div className="h-24 rounded-2xl bg-tat-charcoal/8 animate-pulse" />
          </div>
        </div>
      </div>
    </>
  );
}
