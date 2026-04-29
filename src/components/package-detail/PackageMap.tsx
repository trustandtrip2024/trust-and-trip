import Image from "next/image";
import { MapPin, ExternalLink } from "lucide-react";

interface Props {
  coords?: { lat?: number; lng?: number; zoom?: number; label?: string };
  imageOverride?: string;
  destinationName: string;
}

/**
 * "Where you'll be" map block. Three render modes:
 *
 *   1. mapImage (Sanity override) — illustrated route, custom map etc.
 *      Treated as authoritative; shown verbatim.
 *
 *   2. mapCoords (lat + lng) — embeds OpenStreetMap iframe centered on
 *      the coords. No API key, no third-party CDN call from build, no
 *      analytics fingerprint. Tiles served by openstreetmap.org.
 *
 *   3. Neither set — returns null.
 *
 * 'View larger map' link opens openstreetmap.org so users can zoom/pan
 * outside the embed without leaving for Google.
 */
export default function PackageMap({ coords, imageOverride, destinationName }: Props) {
  const hasCoords =
    coords && typeof coords.lat === "number" && typeof coords.lng === "number"
      && !Number.isNaN(coords.lat) && !Number.isNaN(coords.lng);

  if (!imageOverride && !hasCoords) return null;

  const zoom = coords?.zoom ?? 9;
  const lat = coords?.lat ?? 0;
  const lng = coords?.lng ?? 0;

  // OSM bbox calc — small delta so the marker sits centred at the chosen
  // zoom. Higher zoom = tighter bbox. ~0.05 deg per zoom-step works for
  // typical 8-12 range.
  const span = 1.6 / Math.pow(1.5, zoom - 5);
  const bbox = [lng - span, lat - span / 2, lng + span, lat + span / 2].join(",");
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const fullMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
  const label = coords?.label ?? destinationName;

  return (
    <section className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <span className="eyebrow inline-flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 text-tat-gold" />
        Where you&rsquo;ll be
      </span>
      <h2 className="heading-section mt-2 mb-2 text-balance">
        On the map.
      </h2>
      <p className="text-tat-charcoal/65 mb-6 text-sm leading-relaxed max-w-xl">
        Centred on {label}. Tap to open the full map and zoom in on hotels,
        viewpoints, and route highlights.
      </p>

      <div className="relative rounded-2xl overflow-hidden border border-tat-charcoal/10 bg-tat-charcoal/8 aspect-[16/9] md:aspect-[21/9]">
        {imageOverride ? (
          <Image
            src={imageOverride}
            alt={`Map of ${destinationName}`}
            fill
            sizes="(max-width: 1024px) 100vw, 760px"
            className="object-cover"
          />
        ) : (
          <iframe
            src={embedUrl}
            title={`Map of ${destinationName}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full border-0"
          />
        )}

        {/* Pin label */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 text-tat-charcoal text-[11px] uppercase tracking-[0.14em] font-bold px-2.5 py-1.5 rounded-pill backdrop-blur-sm shadow-sm">
          <MapPin className="h-3 w-3 text-tat-gold" />
          {label}
        </div>

        {/* External link */}
        {hasCoords && (
          <a
            href={fullMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-tat-charcoal text-tat-paper text-[11px] uppercase tracking-[0.12em] font-semibold px-3 py-1.5 rounded-pill hover:bg-tat-charcoal/90 transition-colors"
          >
            View larger map
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </section>
  );
}
