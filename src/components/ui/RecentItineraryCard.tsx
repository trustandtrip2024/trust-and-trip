import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import Price from "@/components/Price";

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

// Destination -> small Unsplash thumbnail. Keep keys lowercase + space-collapsed.
const DEST_THUMBS: Record<string, string> = {
  "bali":         "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&q=70&auto=format&fit=crop",
  "switzerland":  "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400&q=70&auto=format&fit=crop",
  "kedarnath":    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=70&auto=format&fit=crop",
  "spiti valley": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=70&auto=format&fit=crop",
  "maldives":     "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=70&auto=format&fit=crop",
  "manali":       "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=70&auto=format&fit=crop",
  "kerala":       "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=70&auto=format&fit=crop",
  "thailand":     "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&q=70&auto=format&fit=crop",
  "char dham":    "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400&q=70&auto=format&fit=crop",
  "japan":        "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=70&auto=format&fit=crop",
  "singapore":    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=70&auto=format&fit=crop",
  "dubai":        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=70&auto=format&fit=crop",
};

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=70&auto=format&fit=crop";

function thumbFor(dest: string) {
  return DEST_THUMBS[dest.toLowerCase()] ?? FALLBACK_THUMB;
}

export default function RecentItineraryCard({
  firstName, city, timeAgo, tripStyle, nights,
  primaryDestination, otherDestinationsCount = 0, price, plannerName, href,
}: Props) {
  const destinationsLine = otherDestinationsCount > 0
    ? `${primaryDestination} +${otherDestinationsCount} more`
    : primaryDestination;
  const thumb = thumbFor(primaryDestination);
  return (
    <article className="tt-card group h-full flex flex-col overflow-hidden transition duration-200 hover:shadow-hover focus-within:shadow-hover">
      {/* Destination banner */}
      <div className="relative aspect-[16/8] bg-tat-charcoal/10 overflow-hidden">
        <Image
          src={thumb}
          alt={`${primaryDestination} preview`}
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
          quality={70}
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/55 via-transparent to-transparent" />
        <span className="absolute top-3 right-3 tt-chip bg-white/95 dark:bg-white/85 dark:text-tat-charcoal">
          {tripStyle}
        </span>
        <p className="absolute bottom-2.5 left-3 inline-flex items-center gap-1 text-meta text-white drop-shadow-sm">
          <MapPin className="h-3.5 w-3.5 text-tat-gold" />
          <span className="font-medium">{destinationsLine}</span>
        </p>
      </div>

      <div className="p-5 md:p-6 flex flex-col gap-3 flex-1">
        {/* Top: traveler */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-9 w-9 rounded-pill bg-tat-orange/15 grid place-items-center font-semibold text-tat-gold shrink-0"
            aria-hidden
          >
            {firstName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-body-sm font-medium text-tat-charcoal truncate">
              {firstName}{" "}
              <span className="text-tat-slate/80 font-normal">· {city}</span>
            </p>
            <p className="text-tag uppercase text-tat-slate/80 mt-0.5">{timeAgo}</p>
          </div>
        </div>

        {/* Trip body */}
        <p className="font-serif text-h3 text-tat-charcoal leading-snug text-balance">
          {nights}N {tripStyle.toLowerCase()} trip to {primaryDestination}
        </p>

        <p className="text-meta text-tat-slate">
          Planned by{" "}
          <span className="font-semibold text-tat-charcoal">{plannerName}</span>
        </p>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-tat-charcoal/12 flex items-end justify-between gap-3">
          <div>
            <Price
              inr={price}
              className="font-serif text-h3 text-tat-charcoal leading-none"
            />
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
      </div>
    </article>
  );
}
