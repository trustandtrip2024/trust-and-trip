// Root-level loading fallback. Shown for the brief window between cold-
// cache navigation and the first SSR byte arriving. Without this, users
// reported a white flash on the homepage and on routes that don't have
// their own loading.tsx (about, contact, blog, etc).
//
// Designed to look like the homepage above-the-fold so the first paint
// reads as "loading the brand" rather than "broken page".

export default function RootLoading() {
  return (
    <>
      {/* Hero placeholder — matches Hero.tsx height + cream tone, not the
          dark charcoal grey used previously which read as "broken". */}
      <section className="relative isolate overflow-hidden bg-tat-cream">
        <div className="relative h-[70vh] min-h-[520px] w-full bg-tat-cream">
          {/* Soft brand wash so the area doesn't read as a blank rectangle */}
          <div className="absolute inset-0 bg-gradient-to-br from-tat-cream via-tat-paper to-tat-cream animate-pulse" />
          <div className="container-custom relative h-full flex items-end pb-20">
            <div className="max-w-2xl space-y-5">
              <div className="h-3 w-32 bg-tat-charcoal/8 rounded-full animate-pulse" />
              <div className="h-12 w-4/5 bg-tat-charcoal/8 rounded-lg animate-pulse" />
              <div className="h-12 w-3/5 bg-tat-charcoal/8 rounded-lg animate-pulse" />
              <div className="h-4 w-2/3 bg-tat-charcoal/6 rounded animate-pulse" />
              <div className="flex gap-3 pt-2">
                <div className="h-12 w-40 bg-tat-charcoal/10 rounded-full animate-pulse" />
                <div className="h-12 w-44 bg-tat-charcoal/8 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust ribbon placeholder */}
      <section className="bg-tat-paper border-y border-tat-charcoal/8">
        <div className="container-custom py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-tat-charcoal/8 animate-pulse" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-20 bg-tat-charcoal/8 rounded animate-pulse" />
                <div className="h-3 w-28 bg-tat-charcoal/6 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* First content shelf placeholder — destinations rail */}
      <section className="py-14 md:py-16">
        <div className="container-custom">
          <div className="space-y-3 mb-8">
            <div className="h-3 w-24 bg-tat-charcoal/8 rounded-full animate-pulse" />
            <div className="h-8 w-72 bg-tat-charcoal/8 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-tat-charcoal/8 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
