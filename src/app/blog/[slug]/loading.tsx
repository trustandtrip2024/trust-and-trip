export default function BlogPostLoading() {
  return (
    <article className="min-h-[80vh]">
      {/* Hero image */}
      <div className="relative h-[55vh] min-h-[400px] w-full bg-gradient-to-br from-tat-cream via-tat-paper to-tat-cream animate-pulse" />

      {/* Title block, sized like a real article header */}
      <div className="container-custom max-w-3xl -mt-24 md:-mt-32 relative z-10">
        <div className="bg-white rounded-3xl shadow-soft p-8 md:p-10 space-y-4">
          <div className="h-3 w-24 bg-tat-charcoal/8 rounded-full animate-pulse" />
          <div className="h-10 w-4/5 bg-tat-charcoal/8 rounded animate-pulse" />
          <div className="h-10 w-3/5 bg-tat-charcoal/8 rounded animate-pulse" />
          <div className="flex gap-3 pt-2">
            <div className="h-3 w-20 bg-tat-charcoal/6 rounded-full animate-pulse" />
            <div className="h-3 w-24 bg-tat-charcoal/6 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Body paragraphs */}
      <div className="container-custom max-w-3xl py-12 md:py-16 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-tat-charcoal/6 rounded animate-pulse"
            style={{ width: `${72 + ((i * 7) % 24)}%` }}
          />
        ))}
      </div>
    </article>
  );
}
