export default function PackageDetailLoading() {
  return (
    <>
      {/* Hero skeleton — height MUST match the real hero in page.tsx
          (h-[55vh] min-h-[380px]) so hydration doesn't punch a 25vh
          gap into the layout the moment the real page replaces this one.
          Soft cream gradient reads as "loading", not "broken". */}
      <div className="relative h-[55vh] min-h-[380px] w-full bg-gradient-to-br from-tat-cream via-tat-paper to-tat-cream animate-pulse" />

      {/* Content skeleton — grid template MUST match page.tsx
          (lg:grid-cols-[1fr_360px], gap-8 lg:gap-12) so the sidebar
          column doesn't jump when the real page swaps in. */}
      <section className="py-8 md:py-12 pb-24 lg:pb-12">
        <div className="container-custom grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
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
