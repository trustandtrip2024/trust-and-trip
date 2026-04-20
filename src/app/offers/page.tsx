export const revalidate = 30;

import Link from "next/link";
import Image from "next/image";
import { getOfferPackages } from "@/lib/sanity-queries";
import { Clock, Tag, ArrowRight, Flame, Star } from "lucide-react";
import CTASection from "@/components/CTASection";

export const metadata = {
  title: "Offers — Trust and Trip",
  description: "Limited-time journeys, exclusive rates, and curated deals.",
};

const OFFER_LABELS = [
  { title: "Monsoon Escape", discount: 20, endsIn: "3 days" },
  { title: "Honeymoon Festival", discount: 15, endsIn: "7 days" },
  { title: "Early Bird Special", discount: 25, endsIn: "14 days" },
  { title: "Flash Weekend Sale", discount: 10, endsIn: "24 hours" },
  { title: "Group Bonanza", discount: 18, endsIn: "5 days" },
  { title: "Premium Getaway", discount: 12, endsIn: "10 days" },
  { title: "Last Minute Deal", discount: 22, endsIn: "48 hours" },
  { title: "Seasonal Special", discount: 16, endsIn: "6 days" },
];

export default async function OffersPage() {
  const packages = await getOfferPackages();

  const offers = packages.map((p, i) => {
    const meta = OFFER_LABELS[i % OFFER_LABELS.length];
    return {
      ...p,
      discount: meta.discount,
      offerTitle: meta.title,
      endsIn: meta.endsIn,
      originalPrice: Math.round(p.price / (1 - meta.discount / 100)),
    };
  });

  return (
    <>
      <section className="pt-28 md:pt-36 pb-12 bg-cream">
        <div className="container-custom max-w-4xl">
          <span className="eyebrow">Limited offers</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] text-balance">
            Exceptional trips,
            <span className="italic text-gold font-light"> exceptional pricing.</span>
          </h1>
          <p className="mt-6 text-ink/60 max-w-xl leading-relaxed">
            For a limited time, we&apos;ve negotiated special rates on some of our most-loved
            journeys. When they&apos;re gone, they&apos;re gone.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-custom">
          {offers.length === 0 ? (
            <div className="text-center py-20 bg-cream rounded-3xl border border-ink/5">
              <p className="font-display text-2xl mb-2">New offers dropping soon</p>
              <p className="text-ink/60 mb-6">Check back shortly or talk to a planner for exclusive rates.</p>
              <Link href="/contact" className="btn-primary">Talk to a planner</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {offers.map((offer) => (
                <Link
                  key={offer.slug}
                  href={`/packages/${offer.slug}`}
                  className="group relative overflow-hidden rounded-3xl bg-ink"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={offer.image}
                      alt={offer.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

                    {/* Discount tag */}
                    <div className="absolute top-5 left-5 flex items-center gap-2">
                      <div className="bg-gold text-ink px-4 py-2 rounded-full text-sm font-display font-semibold flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        {offer.discount}% OFF
                      </div>
                      {offer.trending && (
                        <div className="bg-ink/60 backdrop-blur-sm text-cream px-3 py-2 rounded-full text-[11px] flex items-center gap-1">
                          <Flame className="h-3 w-3 text-gold" />
                          Trending
                        </div>
                      )}
                    </div>

                    {/* Ends in */}
                    <div className="absolute top-5 right-5 bg-cream/20 backdrop-blur-md border border-cream/20 text-cream px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-gold" />
                      Ends in {offer.endsIn}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-cream">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">
                        {offer.offerTitle}
                      </p>
                      <h3 className="font-display text-2xl md:text-3xl font-medium leading-tight mb-3">
                        {offer.title}
                      </h3>
                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mb-4">
                        <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                        <span className="text-xs text-cream/80">{offer.rating} · {offer.reviews} reviews</span>
                        <span className="text-cream/40 mx-1">·</span>
                        <span className="text-xs text-cream/70">{offer.duration}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-cream/60">Starting from</p>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-display text-2xl text-gold">
                              ₹{offer.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-sm text-cream/40 line-through">
                              ₹{offer.originalPrice.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm text-cream/90 group-hover:text-gold transition-colors">
                          View
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Don't see your destination?"
        subtitle="Tell us where you want to go — we often have unlisted deals and insider rates for our planners' favourite spots."
      />
    </>
  );
}
