import PackageCardSkeleton from "@/components/PackageCardSkeleton";

export default function DestinationDetailLoading() {
  return (
    <>
      {/* Hero skeleton — soft cream gradient instead of dark charcoal so
          the loading state reads as "loading" not "broken page". */}
      <div className="h-[85vh] min-h-[600px] w-full bg-gradient-to-br from-tat-cream via-tat-paper to-tat-cream animate-pulse" />

      {/* Overview skeleton */}
      <section className="py-20 md:py-24">
        <div className="container-custom grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20">
          <div className="space-y-4">
            <div className="h-3 w-20 bg-tat-charcoal/8 rounded-full animate-pulse" />
            <div className="h-8 w-56 bg-tat-charcoal/8 rounded animate-pulse" />
            <div className="space-y-2 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-tat-charcoal/8 rounded animate-pulse" style={{ width: `${75 + i * 5}%` }} />
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-tat-charcoal/8 animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* Packages skeleton */}
      <section className="py-16 md:py-20 bg-tat-cream/30">
        <div className="container-custom">
          <div className="h-8 w-64 bg-tat-charcoal/8 rounded animate-pulse mb-10" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <PackageCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
