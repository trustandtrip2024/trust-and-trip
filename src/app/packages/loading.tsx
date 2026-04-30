import PackageCardSkeleton from "@/components/PackageCardSkeleton";

export default function PackagesLoading() {
  return (
    <>
      {/* Header skeleton */}
      <section className="pt-28 md:pt-36 pb-12 md:pb-16 bg-tat-paper border-b border-tat-charcoal/5">
        <div className="container-custom">
          <div className="h-3 w-24 bg-tat-charcoal/8 rounded-full animate-pulse mb-4" />
          <div className="h-10 w-80 bg-tat-charcoal/8 rounded animate-pulse mb-3" />
          <div className="h-4 w-96 bg-tat-charcoal/8 rounded animate-pulse" />
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <PackageCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
