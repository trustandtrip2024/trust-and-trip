export default function PackageDetailLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="relative h-[80vh] min-h-[560px] w-full bg-tat-charcoal/20 animate-pulse" />

      {/* Content skeleton */}
      <section className="py-16 md:py-20">
        <div className="container-custom grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">
          <div className="space-y-10">
            {/* Highlights */}
            <div>
              <div className="h-3 w-24 bg-tat-charcoal/8 rounded-full animate-pulse mb-4" />
              <div className="h-8 w-64 bg-tat-charcoal/8 rounded animate-pulse mb-6" />
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-tat-charcoal/8 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div>
              <div className="h-3 w-32 bg-tat-charcoal/8 rounded-full animate-pulse mb-4" />
              <div className="h-8 w-48 bg-tat-charcoal/8 rounded animate-pulse mb-6" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-tat-charcoal/8 animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="h-96 rounded-3xl bg-tat-charcoal/8 animate-pulse" />
        </div>
      </section>
    </>
  );
}
