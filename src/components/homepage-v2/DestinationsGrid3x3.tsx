import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import type { Destination } from "@/lib/data";

interface Props {
  destinations: Destination[];
  eyebrow?: string;
  heading?: string;
  highlight?: string;
}

export default function DestinationsGrid3x3({
  destinations,
  eyebrow = "Where to next",
  heading = "Destinations",
  highlight = "worth crossing oceans for.",
}: Props) {
  const items = destinations.slice(0, 9);
  if (items.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-tat-cream/20" aria-labelledby="dest-grid-heading">
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <p className="eyebrow-ember">{eyebrow}</p>
            <h2 id="dest-grid-heading" className="heading-section mt-2 max-w-lg text-balance">
              {heading}
              <span className="italic text-gradient-passion font-light"> {highlight}</span>
            </h2>
          </div>
          <Link
            href="/destinations"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-tat-charcoal/65 hover:text-tat-orange transition-colors group shrink-0"
          >
            All destinations
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3 × 3 grid */}
        <div className="grid grid-cols-3 gap-2.5 md:gap-4">
          {items.map((d) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              className="group relative aspect-[4/5] md:aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden bg-tat-charcoal"
            >
              {d.image && (
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  sizes="(max-width: 768px) 33vw, 280px"
                  quality={70}
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal via-tat-charcoal/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-tat-paper">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3 text-tat-orange" />
                  <span className="text-[9px] uppercase tracking-widest text-tat-paper/65">{d.country}</span>
                </div>
                <h3 className="font-display text-sm md:text-lg font-semibold leading-tight">
                  {d.name}
                </h3>
                <p className="text-[10px] md:text-xs text-tat-paper/60 mt-0.5">
                  ₹{d.priceFrom.toLocaleString("en-IN")}+
                </p>
              </div>
              <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-tat-paper/15 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-3 w-3 text-tat-paper -rotate-45" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex md:hidden justify-center">
          <Link href="/destinations" className="text-sm font-medium text-tat-charcoal/65 hover:text-tat-orange transition-colors inline-flex items-center gap-1.5">
            All destinations <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
