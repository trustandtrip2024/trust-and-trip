export default function DestinationTileSkeleton() {
  return (
    <div className="rounded-xl md:rounded-2xl aspect-square bg-tat-charcoal/8 animate-pulse overflow-hidden relative">
      {/* Country badge */}
      <div className="absolute top-2.5 left-2.5 h-5 w-14 rounded-full bg-tat-charcoal/15 animate-pulse" />
      {/* Name + price */}
      <div className="absolute bottom-0 inset-x-0 p-3 space-y-1.5">
        <div className="h-3.5 w-20 bg-tat-charcoal/20 rounded animate-pulse" />
        <div className="h-2.5 w-14 bg-tat-charcoal/15 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
