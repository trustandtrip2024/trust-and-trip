export const revalidate = 30;

import Link from "next/link";
import IntentAnchor from "@/components/IntentAnchor";
import Image from "next/image";
import { getOfferPackages } from "@/lib/sanity-queries";
import { Clock, Tag, ArrowRight, Flame, Star, Zap, MessageCircle } from "lucide-react";
import CTASection from "@/components/CTASection";
import CountdownTimer from "@/components/CountdownTimer";

export const metadata = {
  title: "Offers & Deals — Trust and Trip",
  description: "Limited-time journeys, exclusive rates, and curated deals — save up to 25% on handcrafted packages.",
  alternates: { canonical: "https://trustandtrip.com/offers" },
};

// End dates rolling from today — refreshes every revalidation cycle
function getEndDate(slug: string, days: number): string {
  const base = new Date();
  // Offset by slug hash so each package gets a stable-looking end date
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  base.setDate(base.getDate() + days + (hash % 5));
  base.setHours(23, 59, 59, 0);
  return base.toISOString();
}

const OFFERS = [
  { tag: "Summer Sale", discount: 22, days: 3, hot: true },
  { tag: "Honeymoon Special", discount: 18, days: 7, hot: false },
  { tag: "Early Bird", discount: 25, days: 14, hot: false },
  { tag: "Flash Deal", discount: 12, days: 1, hot: true },
  { tag: "Group Bonanza", discount: 20, days: 5, hot: false },
  { tag: "Premium Escape", discount: 15, days: 10, hot: false },
  { tag: "Last Minute", discount: 22, days: 2, hot: true },
  { tag: "Seasonal Pick", discount: 16, days: 8, hot: false },
];

export default async function OffersPage() {
  const packages = await getOfferPackages();

  const offers = packages.map((p, i) => {
    const meta = OFFERS[i % OFFERS.length];
    return {
      ...p,
      discount: meta.discount,
      tag: meta.tag,
      hot: meta.hot,
      endsAt: getEndDate(p.slug, meta.days),
      originalPrice: Math.round(p.price / (1 - meta.discount / 100)),
    };
  });

  const hotOffers = offers.filter((o) => o.hot);
  const regularOffers = offers.filter((o) => !o.hot);

  return (
    <>
      {/* Urgency banner */}
      <div className="bg-tat-gold text-tat-charcoal py-3 text-center text-sm font-medium">
        <span className="flex items-center justify-center gap-2">
          <Zap className="h-4 w-4" />
          Summer Sale — Save up to 25% on select packages. Limited availability.
          <Link href="#deals" className="underline font-semibold">See deals →</Link>
        </span>
      </div>

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 bg-tat-paper">
        <div className="container-custom max-w-4xl">
          <span className="eyebrow">Limited offers</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] text-balance">
            Exceptional trips,
            <span className="italic text-tat-gold font-light"> exceptional pricing.</span>
          </h1>
          <p className="mt-5 text-tat-charcoal/60 max-w-xl leading-relaxed">
            For a limited time, we've negotiated special rates on our most-loved journeys.
            When they're gone, they're gone.
          </p>
        </div>
      </section>

      {/* Flash deals */}
      {hotOffers.length > 0 && (
        <section className="pb-4 md:pb-6" id="deals">
          <div className="container-custom">
            <div className="flex items-center gap-2 mb-5">
              <Flame className="h-5 w-5 text-tat-gold" />
              <h2 className="font-display text-xl font-medium">Flash Deals — Ending Soon</h2>
            </div>
            {/* Mobile: horizontal snap-rail so users can swipe through deals
                without an endless single-column stack. */}
            <div className="md:hidden -mx-5 px-5 overflow-x-auto snap-x snap-mandatory no-scrollbar">
              <ul className="flex gap-4 pb-2 pr-5">
                {hotOffers.map((offer) => (
                  <li key={offer.slug} className="shrink-0 snap-start w-[82%] sm:w-[60%]">
                    <OfferCard offer={offer} size="sm" />
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden md:grid md:grid-cols-3 gap-4 md:gap-5">
              {hotOffers.map((offer) => (
                <OfferCard key={offer.slug} offer={offer} size="sm" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All deals */}
      <section className="py-10 md:py-14">
        <div className="container-custom">
          {regularOffers.length > 0 && (
            <h2 className="font-display text-xl font-medium mb-6">All Current Deals</h2>
          )}
          {offers.length === 0 ? (
            <div className="text-center py-20 bg-tat-paper rounded-3xl border border-tat-charcoal/5">
              <p className="font-display text-2xl mb-2">New offers dropping soon</p>
              <p className="text-tat-charcoal/60 mb-6">Check back shortly or talk to a planner for exclusive rates.</p>
              <Link href="/contact" className="btn-primary">Talk to a planner</Link>
            </div>
          ) : (
            <>
              {/* Mobile: horizontal snap-rail */}
              <div className="md:hidden -mx-5 px-5 overflow-x-auto snap-x snap-mandatory no-scrollbar">
                <ul className="flex gap-5 pb-2 pr-5">
                  {regularOffers.map((offer) => (
                    <li key={offer.slug} className="shrink-0 snap-start w-[82%] sm:w-[58%]">
                      <OfferCard offer={offer} size="lg" />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hidden md:grid md:grid-cols-2 gap-6 md:gap-8">
                {regularOffers.map((offer) => (
                  <OfferCard key={offer.slug} offer={offer} size="lg" />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* WhatsApp CTA band */}
      <section className="bg-tat-charcoal text-tat-paper py-10">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="eyebrow text-tat-gold">Exclusive rates</p>
            <h2 className="font-display text-2xl md:text-3xl font-medium mt-1 text-balance">
              Don't see your destination? Ask for an unlisted deal.
            </h2>
          </div>
          <IntentAnchor
            href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I'm%20looking%20for%20a%20special%20deal%20on%20my%20trip."
            target="_blank" rel="noopener noreferrer"
            intent="whatsapp_click"
            metadata={{ note: "Offers page — Ask for unlisted deal" }}
            className="shrink-0 flex items-center gap-2 bg-whatsapp text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-whatsapp-hover transition-colors"
          >
            <MessageCircle className="h-4 w-4 fill-white" />
            Ask a planner
          </IntentAnchor>
        </div>
      </section>

      <CTASection />
    </>
  );
}

function OfferCard({ offer, size }: { offer: any; size: "sm" | "lg" }) {
  const isLg = size === "lg";
  return (
    <Link
      href={`/packages/${offer.slug}`}
      className={`group relative overflow-hidden rounded-3xl bg-tat-charcoal block`}
    >
      <div className={`relative ${isLg ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <Image
          src={offer.image}
          alt={offer.title}
          fill
          sizes={isLg ? "(max-width: 768px) 100vw, 50vw" : "33vw"}
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal via-tat-charcoal/40 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="bg-tat-gold text-tat-charcoal px-3 py-1.5 rounded-full text-xs font-display font-semibold flex items-center gap-1">
            <Tag className="h-3 w-3" />{offer.discount}% OFF
          </div>
          {offer.hot && (
            <div className="bg-tat-orange text-white px-3 py-1.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" />Flash
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="absolute top-4 right-4 bg-tat-charcoal/70 backdrop-blur-md border border-tat-paper/20 px-3 py-1.5 rounded-full flex items-center gap-2">
          <Clock className="h-3 w-3 text-tat-gold shrink-0" />
          <CountdownTimer endsAt={offer.endsAt} />
        </div>

        <div className={`absolute inset-x-0 bottom-0 ${isLg ? "p-6 md:p-8" : "p-5"} text-tat-paper`}>
          <p className="text-[10px] uppercase tracking-[0.25em] text-tat-gold mb-1.5">{offer.tag}</p>
          <h3 className={`font-display ${isLg ? "text-2xl md:text-3xl" : "text-lg"} font-medium leading-tight mb-2`}>
            {offer.title}
          </h3>
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="h-3 w-3 fill-tat-gold text-tat-gold" />
            <span className="text-xs text-tat-paper/70">{offer.rating} · {offer.reviews} reviews · {offer.duration}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-tat-paper/50 uppercase tracking-wider">Starting from</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-display text-xl text-tat-gold">₹{offer.price.toLocaleString("en-IN")}</span>
                <span className="text-sm text-tat-paper/40 line-through">₹{offer.originalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-tat-paper/80 group-hover:text-tat-gold transition-colors">
              View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
