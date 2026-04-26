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
          <div className="h-10 w-10 rounded-pill bg-tat-orange/15 grid place-items-center font-semibold text-tat-gold shrink-0" aria-hidden>
            {firstName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-body-sm font-medium text-tat-charcoal truncate">
              {firstName} <span className="text-tat-slate/80 font-normal">· {city}</span>
            </p>
            <p className="text-tag uppercase text-tat-slate/80 mt-0.5">{timeAgo}</p>
          </div>
        </div>
        <span className="tt-chip shrink-0">{tripStyle}</span>
      </div>

      {/* Trip body */}
      <div>
        <p className="inline-flex items-center gap-1 text-meta text-tat-slate/80">
          <MapPin className="h-3.5 w-3.5 text-tat-gold" />
          <span className="text-tat-charcoal font-medium">{destinationsLine}</span>
        </p>
        <p className="mt-2 font-serif text-h3 text-tat-charcoal leading-snug text-balance">
          {nights}N {tripStyle.toLowerCase()} trip to {primaryDestination}
        </p>
      </div>

      {/* Planner — the brand-distinguishing detail */}
      <p className="text-meta text-tat-slate">
        Planned by{" "}
        <span className="font-semibold text-tat-charcoal">{plannerName}</span>
      </p>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-tat-charcoal/12 flex items-end justify-between gap-3">
        <div>
          <p className="font-serif text-h3 text-tat-charcoal leading-none">
            ₹{price.toLocaleString("en-IN")}
          </p>
          <p className="text-tag uppercase text-tat-slate/80 mt-1">/ person</p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-body-sm font-medium text-tat-charcoal hover:text-tat-gold transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
        >
          View itinerary
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      </div>
    </article>
  );
}
