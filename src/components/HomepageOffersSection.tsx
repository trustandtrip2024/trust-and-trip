import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Clock, Flame } from "lucide-react";
import { getOfferPackages } from "@/lib/sanity-queries";

function getEndDate(slug: string, days: number): string {
  const base = new Date();
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  base.setDate(base.getDate() + days + (hash % 5));
  return base.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const OFFER_META = [
  { tag: "Summer Sale", discount: 22, days: 3, hot: true },
  { tag: "Honeymoon Special", discount: 18, days: 7, hot: false },
  { tag: "Early Bird", discount: 25, days: 14, hot: false },
  { tag: "Flash Deal", discount: 12, days: 1, hot: true },
  { tag: "Group Bonanza", discount: 20, days: 5, hot: false },
  { tag: "Premium Escape", discount: 15, days: 10, hot: false },
];

export default async function HomepageOffersSection() {
  const packages = await getOfferPackages();
  if (!packages.length) return null;

  const offers = packages.slice(0, 6).map((p, i) => {
    const meta = OFFER_META[i % OFFER_META.length];
    return {
      ...p,
      discount: meta.discount,
      tag: meta.tag,
      hot: meta.hot,
      endsLabel: getEndDate(p.slug, meta.days),
      originalPrice: Math.round(p.price / (1 - meta.discount / 100)),
    };
  });

  return (
    <section className="py-20 md:py-28 bg-tat-charcoal text-tat-paper" aria-labelledby="offers-heading">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-10 md:mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-tat-gold/70 font-medium mb-3">
              <Zap className="h-3 w-3" />
              Limited Time Offers
            </span>
            <h2 id="offers-heading" className="heading-section text-tat-paper max-w-sm text-balance">
              Exceptional trips,
              <span className="italic text-tat-gold font-light"> exceptional savings.</span>
            </h2>
          </div>
          <Link
            href="/offers"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-tat-paper/50 hover:text-tat-gold transition-colors group shrink-0"
          >
            All offers
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Offers grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {offers.map((offer) => (
            <Link
              key={offer.slug}
              href={`/packages/${offer.slug}`}
              className="group relative bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/60 via-tat-charcoal/10 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 bg-tat-gold text-tat-charcoal text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full">
                    {offer.discount}% OFF
                  </span>
                  {offer.hot && (
                    <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                      <Flame className="h-2.5 w-2.5" />
                      Hot
                    </span>
                  )}
                </div>

                {/* Tag */}
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-medium text-tat-paper/80 bg-tat-charcoal/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                    {offer.tag}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-display text-base font-medium text-tat-paper leading-snug group-hover:text-tat-gold transition-colors line-clamp-2 mb-2">
                  {offer.title}
                </h3>

                <div className="flex items-center gap-3 text-[11px] text-tat-paper/45 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {offer.duration}
                  </span>
                  <span className="flex items-center gap-1 text-red-400/80">
                    <Clock className="h-3 w-3" />
                    Ends {offer.endsLabel}
                  </span>
                </div>

                <div className="flex items-end justify-between border-t border-white/8 pt-3">
                  <div>
                    <p className="text-[10px] text-tat-paper/35 line-through mb-0.5">
                      ₹{offer.originalPrice.toLocaleString("en-IN")}
                    </p>
                    <p className="font-display text-lg text-tat-paper">
                      ₹{offer.price.toLocaleString("en-IN")}
                      <span className="text-[11px] font-sans font-normal text-tat-paper/45 ml-1">/ person</span>
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-tat-gold/15 group-hover:bg-tat-gold flex items-center justify-center transition-all duration-300">
                    <ArrowRight className="h-3.5 w-3.5 text-tat-gold group-hover:text-tat-charcoal transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex md:hidden justify-center">
          <Link
            href="/offers"
            className="inline-flex items-center gap-2 text-sm font-medium text-tat-paper/55 hover:text-tat-gold transition-colors"
          >
            See all offers <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
