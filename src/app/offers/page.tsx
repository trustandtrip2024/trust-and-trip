export const revalidate = 30;

import Link from "next/link";
import IntentAnchor from "@/components/IntentAnchor";
import { getOfferPackages } from "@/lib/sanity-queries";
import { Zap, MessageCircle } from "lucide-react";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import OffersBrowser, { type OfferCard } from "@/components/offers/OffersBrowser";

export const metadata = {
  title: "Offers & Deals — Trust and Trip",
  description: "Limited-time journeys, exclusive rates, and curated deals — save up to 25% on handcrafted packages.",
  alternates: { canonical: "https://trustandtrip.com/offers" },
  openGraph: {
    title: "Offers & Deals — Trust and Trip",
    description: "Limited-time journeys, exclusive rates, and curated deals — save up to 25%.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Offers & Deals — Trust and Trip",
    description: "Save up to 25% on handcrafted packages.",
  },
};

// Visa-free for Indian passports — keep aligned with /destinations + home.
const VISA_FREE_SLUGS = [
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "jordan", "indonesia", "fiji",
];

// End dates rolling from today — refreshes every revalidation cycle
function getEndDate(slug: string, days: number): string {
  const base = new Date();
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  base.setDate(base.getDate() + days + (hash % 5));
  base.setHours(23, 59, 59, 0);
  return base.toISOString();
}

const OFFER_TEMPLATES = [
  { tag: "Summer Sale",       discount: 22, days: 3,  hot: true },
  { tag: "Honeymoon Special", discount: 18, days: 7,  hot: false },
  { tag: "Early Bird",        discount: 25, days: 14, hot: false },
  { tag: "Flash Deal",        discount: 12, days: 1,  hot: true },
  { tag: "Group Bonanza",     discount: 20, days: 5,  hot: false },
  { tag: "Premium Escape",    discount: 15, days: 10, hot: false },
  { tag: "Last Minute",       discount: 22, days: 2,  hot: true },
  { tag: "Seasonal Pick",     discount: 16, days: 8,  hot: false },
];

export default async function OffersPage() {
  const packages = await getOfferPackages();

  const offers: OfferCard[] = packages.map((p, i) => {
    const meta = OFFER_TEMPLATES[i % OFFER_TEMPLATES.length];
    return {
      slug: p.slug,
      title: p.title,
      image: p.image,
      price: p.price,
      originalPrice: Math.round(p.price / (1 - meta.discount / 100)),
      discount: meta.discount,
      tag: meta.tag,
      hot: meta.hot,
      endsAt: getEndDate(p.slug, meta.days),
      rating: p.rating,
      reviews: p.reviews,
      duration: p.duration,
      destinationName: p.destinationName,
      travelType: p.travelType,
    };
  });

  // Schema.org ItemList of Product+Offer entries — search engines surface
  // these as rich deal results with strikethrough price + sale-end date.
  const offersLd = offers.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trust and Trip — Active travel deals",
    numberOfItems: offers.length,
    itemListElement: offers.slice(0, 25).map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: o.title,
        image: o.image,
        url: `https://trustandtrip.com/packages/${o.slug}`,
        brand: { "@type": "Brand", name: "Trust and Trip" },
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: o.price,
          highPrice: o.originalPrice,
          lowPrice: o.price,
          priceValidUntil: o.endsAt,
          availability: "https://schema.org/InStock",
          url: `https://trustandtrip.com/packages/${o.slug}`,
          seller: { "@type": "TravelAgency", name: "Trust and Trip" },
        },
        ...(o.rating && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: o.rating,
            reviewCount: o.reviews,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      },
    })),
  } : null;

  return (
    <>
      {offersLd && <JsonLd data={offersLd} />}

      {/* Urgency banner */}
      <div className="bg-tat-gold text-tat-charcoal py-3 text-center text-sm font-medium">
        <span className="flex items-center justify-center gap-2">
          <Zap className="h-4 w-4" />
          {offers.length} active deals · Save up to 25%. Limited availability.
          <Link href="#deals" className="underline font-semibold">See deals →</Link>
        </span>
      </div>

      {/* Hero */}
      <section className="pt-20 md:pt-28 pb-8 md:pb-12 bg-tat-paper">
        <div className="container-custom max-w-4xl">
          <span className="eyebrow">Limited offers</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] text-balance">
            Exceptional trips,
            <span className="italic text-tat-gold font-light"> exceptional pricing.</span>
          </h1>
          <p className="mt-4 text-tat-charcoal/60 max-w-xl leading-relaxed">
            For a limited time, we&apos;ve negotiated special rates on our most-loved journeys.
            When they&rsquo;re gone, they&rsquo;re gone.
          </p>
        </div>
      </section>

      {offers.length === 0 ? (
        <section className="py-20">
          <div className="container-custom max-w-2xl text-center bg-tat-paper rounded-3xl border border-tat-charcoal/5 py-12 px-6">
            <p className="font-display text-2xl mb-2">New offers dropping soon</p>
            <p className="text-tat-charcoal/60 mb-6">
              Check back shortly or talk to a planner for unlisted rates.
            </p>
            <Link href="/contact" className="btn-primary">Talk to a planner</Link>
          </div>
        </section>
      ) : (
        <OffersBrowser offers={offers} visaFreeSlugs={VISA_FREE_SLUGS} />
      )}

      {/* WhatsApp CTA band */}
      <section className="bg-tat-charcoal text-tat-paper py-10">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="eyebrow text-tat-gold">Exclusive rates</p>
            <h2 className="font-display text-h2 font-medium mt-1 text-balance">
              Don&rsquo;t see your destination? Ask for an unlisted deal.
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
