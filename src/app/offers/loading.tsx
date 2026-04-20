export default function OffersLoading() {
  return (
    <>
      <section className="pt-28 md:pt-36 pb-12 bg-cream">
        <div className="container-custom max-w-4xl">
          <div className="h-3 w-28 bg-ink/8 rounded-full animate-pulse mb-4" />
          <div className="h-10 w-64 bg-ink/8 rounded animate-pulse mb-3" />
          <div className="h-4 w-80 bg-ink/8 rounded animate-pulse" />
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-custom grid md:grid-cols-2 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[16/10] rounded-3xl bg-ink/10 animate-pulse" />
          ))}
        </div>
      </section>
    </>
  );
}
