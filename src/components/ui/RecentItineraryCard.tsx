import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

interface Props {
  firstName: string;
  city: string;
  timeAgo: string;
  tripStyle: string;
  nights: number;
  primaryDestination: string;
  otherDestinationsCount?: number;
  price: number;
  plannerName: string;
  href: string;
}

export default function RecentItineraryCard({
  firstName, city, timeAgo, tripStyle, nights,
  primaryDestination, otherDestinationsCount = 0, price, plannerName, href,
}: Props) {
  const destinationsLine = otherDestinationsCount > 0
    ? `${primaryDestination} +${otherDestinationsCount} more`
    : primaryDestination;
  return (
    <article className="tt-card tt-card-p group h-full flex flex-col gap-4 transition duration-200 hover:shadow-hover focus-within:shadow-hover">
      {/* Top: traveler */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-pill bg-amber-100 grid place-items-center font-semibold text-amber-800 shrink-0" aria-hidden>
            {firstName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-body-sm font-medium text-stone-900 truncate">
              {firstName} <span className="text-stone-500 font-normal">· {city}</span>
            </p>
            <p className="text-tag uppercase text-stone-500 mt-0.5">{timeAgo}</p>
          </div>
        </div>
        <span className="tt-chip shrink-0">{tripStyle}</span>
      </div>

      {/* Trip body */}
      <div>
        <p className="inline-flex items-center gap-1 text-meta text-stone-500">
          <MapPin className="h-3.5 w-3.5 text-amber-700" />
          <span className="text-stone-800 font-medium">{destinationsLine}</span>
        </p>
        <p className="mt-2 font-serif text-h3 text-stone-900 leading-snug text-balance">
          {nights}N {tripStyle.toLowerCase()} trip to {primaryDestination}
        </p>
      </div>

      {/* Planner — the brand-distinguishing detail */}
      <p className="text-meta text-stone-600">
        Planned by{" "}
        <span className="font-semibold text-stone-900">{plannerName}</span>
      </p>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-stone-200/70 flex items-end justify-between gap-3">
        <div>
          <p className="font-serif text-h3 text-stone-900 leading-none">
            ₹{price.toLocaleString("en-IN")}
          </p>
          <p className="text-tag uppercase text-stone-500 mt-1">/ person</p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-body-sm font-medium text-stone-900 hover:text-amber-700 transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 rounded-sm"
        >
          View itinerary
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      </div>
    </article>
  );
}
