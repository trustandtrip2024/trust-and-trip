import Image from "next/image";
import { Star, Hotel, MapPin, Moon } from "lucide-react";

interface MultiHotel {
  city?: string;
  nights?: number;
  name: string;
  stars?: number;
  description?: string;
  image?: string;
}

interface Props {
  hotels: MultiHotel[];
  activities: string[];
}

/**
 * Multi-city stay block. Used when a package has hotels[] array set in
 * Sanity (e.g. Switzerland: 2N Zurich → 2N Interlaken → 2N Zermatt). Each
 * hotel renders with city header + nights pill + star rating + image.
 *
 * Replaces the single-hotel block on packages that span multiple cities.
 * Falls back to single-hotel block (caller-side) when hotels[] is empty.
 */
export default function PackageHotels({ hotels, activities }: Props) {
  return (
    <section id="hotel" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <span className="eyebrow">Where you&rsquo;ll stay</span>
      <h2 className="heading-section mt-2 mb-6 text-balance">
        Comfort you&rsquo;ll
        <span className="italic text-tat-gold font-light"> remember.</span>
      </h2>

      <ul className="space-y-4">
        {hotels.map((h, i) => {
          const stars = h.stars ?? 3;
          return (
            <li
              key={`${h.name}-${i}`}
              className="bg-tat-cream/40 rounded-2xl overflow-hidden grid md:grid-cols-[260px_1fr] gap-0 md:gap-6 border border-tat-charcoal/8"
            >
              {h.image ? (
                <div className="relative aspect-[4/3] md:aspect-auto md:h-full bg-tat-charcoal/8">
                  <Image
                    src={h.image}
                    alt={h.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 260px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] md:aspect-auto md:h-full bg-gradient-to-br from-tat-gold/15 via-tat-cream to-tat-paper grid place-items-center">
                  <Hotel className="h-10 w-10 text-tat-gold/60" />
                </div>
              )}

              <div className="p-5 md:p-6 md:py-7 flex flex-col justify-center">
                {(h.city || typeof h.nights === "number") && (
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {h.city && (
                      <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-charcoal/60">
                        <MapPin className="h-3 w-3 text-tat-gold" />
                        {h.city}
                      </span>
                    )}
                    {typeof h.nights === "number" && h.nights > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-tat-orange">
                        <Moon className="h-3 w-3" />
                        {h.nights} {h.nights === 1 ? "night" : "nights"}
                      </span>
                    )}
                  </div>
                )}
                <h3 className="font-display text-h3 font-medium text-tat-charcoal leading-tight">
                  {h.name}
                </h3>
                <div className="flex items-center gap-1 mt-1.5">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-3.5 w-3.5 ${idx < stars ? "fill-tat-gold text-tat-gold" : "text-tat-charcoal/15"}`}
                    />
                  ))}
                  <span className="text-xs text-tat-charcoal/50 ml-1">
                    {stars}-star
                  </span>
                </div>
                {h.description && (
                  <p className="mt-2.5 text-tat-charcoal/70 leading-relaxed text-sm">
                    {h.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Activities */}
      {activities.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-tat-charcoal/50 mb-3 font-medium">
            Signature activities
          </p>
          <div className="flex flex-wrap gap-2">
            {activities.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tat-charcoal text-tat-paper text-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-tat-gold" />
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
