export default function PackageCardSkeleton() {
  return (
    <div className="card-travel h-full flex flex-col overflow-hidden">
      {/* Image placeholder */}
      <div className="aspect-[4/3] bg-ink/8 animate-pulse" />

      <div className="p-4 md:p-6 flex-1 flex flex-col gap-3">
        {/* Destination + type */}
        <div className="h-3 w-2/5 bg-ink/8 rounded-full animate-pulse" />
        {/* Title line 1 */}
        <div className="h-5 w-4/5 bg-ink/8 rounded animate-pulse" />
        {/* Title line 2 */}
        <div className="h-5 w-3/5 bg-ink/8 rounded animate-pulse" />
        {/* Duration + rating */}
        <div className="flex gap-3 mt-1">
          <div className="h-3 w-20 bg-ink/8 rounded-full animate-pulse" />
          <div className="h-3 w-16 bg-ink/8 rounded-full animate-pulse" />
        </div>
        {/* Price row */}
        <div className="mt-auto pt-4 border-t border-ink/5 flex items-end justify-between">
          <div className="space-y-1.5">
            <div className="h-2.5 w-16 bg-ink/8 rounded-full animate-pulse" />
            <div className="h-7 w-28 bg-ink/8 rounded animate-pulse" />
          </div>
          <div className="h-9 w-9 rounded-full bg-ink/8 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
