// Loading skeleton for every /lp/<campaign> Meta-ad landing page. All five
// LP routes share the same shell: dark hero band + inline lead form + a
// streamed itinerary widget + FAQ block. Skeleton mirrors that shape so
// visitors see structure within the first paint instead of a white screen
// while the route segment streams.

export default function LpLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero band — dark, matches the real LP hero so the swap doesn't
          punch a contrast jump into the layout. */}
      <section className="relative pt-24 pb-16 md:pt-28 md:pb-20 bg-tat-charcoal">
        <div className="container-custom grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
          {/* Left: headline + bullets */}
          <div className="space-y-5">
            <div className="h-3 w-28 bg-tat-paper/15 rounded-full animate-pulse" />
            <div className="h-12 w-4/5 bg-tat-paper/12 rounded animate-pulse" />
            <div className="h-12 w-3/5 bg-tat-paper/12 rounded animate-pulse" />
            <div className="h-4 w-full max-w-md bg-tat-paper/10 rounded animate-pulse mt-3" />
            <div className="h-4 w-2/3 bg-tat-paper/10 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-3 mt-6 max-w-md">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-tat-paper/10 animate-pulse" />
              ))}
            </div>
          </div>
          {/* Right: lead form card */}
          <div className="bg-tat-paper rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl">
            <div className="h-3 w-24 bg-tat-charcoal/10 rounded-full animate-pulse" />
            <div className="h-7 w-3/4 bg-tat-charcoal/10 rounded animate-pulse" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-11 rounded-xl bg-tat-charcoal/8 animate-pulse" />
              ))}
              <div className="h-12 rounded-xl bg-tat-gold/30 animate-pulse mt-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Itinerary preview band */}
      <section className="py-14 md:py-16 bg-tat-cream/30">
        <div className="container-custom max-w-4xl">
          <div className="h-3 w-32 bg-tat-charcoal/10 rounded-full mx-auto animate-pulse mb-3" />
          <div className="h-9 w-2/3 bg-tat-charcoal/10 rounded mx-auto animate-pulse mb-10" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-tat-charcoal/8 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
