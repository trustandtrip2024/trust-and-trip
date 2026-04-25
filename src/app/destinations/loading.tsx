import DestinationTileSkeleton from "@/components/DestinationTileSkeleton";

export default function DestinationsLoading() {
  return (
    <>
      <section className="pt-28 md:pt-36 pb-12 bg-tat-paper">
        <div className="container-custom">
          <div className="h-3 w-24 bg-tat-charcoal/8 rounded-full animate-pulse mb-4" />
          <div className="h-10 w-72 bg-tat-charcoal/8 rounded animate-pulse mb-3" />
          <div className="h-4 w-80 bg-tat-charcoal/8 rounded animate-pulse" />
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <DestinationTileSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
