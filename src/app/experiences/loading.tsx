export default function ExperiencesLoading() {
  return (
    <div className="min-h-[80vh]">
      {/* Header */}
      <section className="bg-gradient-to-br from-tat-cream via-tat-paper to-tat-cream pt-24 pb-12 md:pt-28 md:pb-16">
        <div className="container-custom max-w-3xl text-center space-y-4">
          <div className="h-3 w-24 bg-tat-charcoal/8 rounded-full mx-auto animate-pulse" />
          <div className="h-10 w-2/3 bg-tat-charcoal/8 rounded mx-auto animate-pulse" />
          <div className="h-4 w-3/4 bg-tat-charcoal/6 rounded mx-auto animate-pulse" />
        </div>
      </section>

      {/* Experience tile grid — wider tiles than blog cards */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/2] rounded-2xl bg-tat-charcoal/8 animate-pulse" />
                <div className="h-5 w-3/4 bg-tat-charcoal/8 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-tat-charcoal/6 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
