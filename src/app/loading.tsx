// Root-level loading fallback. Shown for the brief window between cold-
// cache navigation and the first SSR byte arriving on any route that
// doesn't ship its own loading.tsx.
//
// Intentionally generic — neutral hero band + content rectangles — so it
// reads as "loading" on blog, about, contact, lp/*, experiences, etc.
// without looking like a broken homepage when the wrong page is loading.
// Routes with distinctive shape (packages/[slug], destinations/[slug],
// home itself via Suspense) override this with their own loading.tsx.

export default function RootLoading() {
  return (
    <div className="min-h-[80vh]">
      {/* Hero band — soft cream wash, no structural elements that
          presume page shape. */}
      <div className="relative h-[40vh] min-h-[280px] w-full bg-gradient-to-br from-tat-cream via-tat-paper to-tat-cream animate-pulse" />

      {/* Content placeholder — three lines + body block. Sized small
          enough that it doesn't ghost-render headings on pages with very
          tall heros, but big enough to fill the viewport so the scroll
          position doesn't snap when real content loads. */}
      <section className="container-custom py-14 md:py-16">
        <div className="space-y-3 max-w-3xl">
          <div className="h-3 w-24 bg-tat-charcoal/8 rounded-full animate-pulse" />
          <div className="h-9 w-4/5 bg-tat-charcoal/8 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-tat-charcoal/6 rounded animate-pulse mt-4" />
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-tat-charcoal/8 animate-pulse" />
          ))}
        </div>
      </section>
    </div>
  );
}
