import Image from "next/image";
import { Hotel as HotelIcon, Star, MapPin } from "lucide-react";

export interface PackageHotel {
  city?: string;
  nights?: number;
  name: string;
  stars?: number;
  description?: string;
  image?: string;
}

interface Props {
  hotels: PackageHotel[];
}

export default function PackageHotelsRail({ hotels }: Props) {
  if (!hotels?.length) return null;

  return (
    <div className="-mx-4 md:mx-0 overflow-x-auto no-scrollbar">
      <ul className="flex gap-4 px-4 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5">
        {hotels.map((h, i) => (
          <li
            key={`${h.name}-${i}`}
            className="shrink-0 w-[280px] md:w-auto rounded-2xl overflow-hidden bg-tat-paper ring-1 ring-tat-charcoal/8 dark:bg-white/[0.04] dark:ring-white/10"
          >
            <div className="relative aspect-[4/3] w-full bg-tat-charcoal/5">
              {h.image ? (
                <Image
                  src={h.image}
                  alt={h.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 280px"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-tat-charcoal/30">
                  <HotelIcon className="h-10 w-10" />
                </div>
              )}
              {h.city && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tat-charcoal/80 text-tat-paper text-[10px] uppercase tracking-[0.16em]">
                  <MapPin className="h-2.5 w-2.5" />
                  {h.city}
                  {h.nights ? ` · ${h.nights}N` : ""}
                </span>
              )}
            </div>
            <div className="p-4 md:p-5">
              <h3 className="font-display text-h4 text-tat-charcoal dark:text-tat-paper leading-tight">
                {h.name}
              </h3>
              {h.stars ? (
                <div className="flex items-center gap-0.5 mt-1.5">
                  {[...Array(5)].map((_, s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s < (h.stars ?? 0)
                          ? "fill-tat-gold text-tat-gold"
                          : "text-tat-charcoal/15 dark:text-tat-paper/20"
                      }`}
                    />
                  ))}
                  <span className="text-meta text-tat-slate/70 dark:text-tat-paper/55 ml-1">
                    {h.stars}-star
                  </span>
                </div>
              ) : null}
              {h.description ? (
                <p className="mt-3 text-body-sm text-tat-charcoal/75 dark:text-tat-paper/75 leading-relaxed line-clamp-3">
                  {h.description}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
