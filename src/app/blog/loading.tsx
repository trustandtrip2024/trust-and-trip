export default function BlogLoading() {
  return (
    <div className="min-h-[80vh] bg-tat-paper">
      {/* Header band */}
      <section className="bg-gradient-to-br from-tat-cream via-tat-paper to-tat-cream pt-24 pb-12 md:pt-28 md:pb-16">
        <div className="container-custom max-w-3xl text-center space-y-4">
          <div className="h-3 w-20 bg-tat-charcoal/8 rounded-full mx-auto animate-pulse" />
          <div className="h-10 w-3/5 bg-tat-charcoal/8 rounded mx-auto animate-pulse" />
          <div className="h-4 w-4/5 bg-tat-charcoal/6 rounded mx-auto animate-pulse" />
        </div>
      </section>

      {/* Article grid */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/3] rounded-2xl bg-tat-charcoal/8 animate-pulse" />
                <div className="h-3 w-20 bg-tat-charcoal/8 rounded-full animate-pulse" />
                <div className="h-6 w-4/5 bg-tat-charcoal/8 rounded animate-pulse" />
                <div className="h-4 w-full bg-tat-charcoal/6 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-tat-charcoal/6 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
