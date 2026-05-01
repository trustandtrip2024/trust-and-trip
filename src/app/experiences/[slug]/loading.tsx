export default function ExperienceDetailLoading() {
  return (
    <div className="min-h-[80vh]">
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[480px] w-full bg-gradient-to-br from-tat-cream via-tat-paper to-tat-cream animate-pulse" />

      {/* Body */}
      <section className="container-custom max-w-4xl py-12 md:py-16 space-y-8">
        <div className="space-y-3">
          <div className="h-3 w-24 bg-tat-charcoal/8 rounded-full animate-pulse" />
          <div className="h-9 w-3/5 bg-tat-charcoal/8 rounded animate-pulse" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-tat-charcoal/8 animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-tat-charcoal/6 rounded animate-pulse"
              style={{ width: `${70 + ((i * 9) % 25)}%` }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
