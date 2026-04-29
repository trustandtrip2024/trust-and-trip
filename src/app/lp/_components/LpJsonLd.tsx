import type { LpFaqItem } from "./LpFaq";

export interface LpJsonLdProps {
  pageUrl: string;
  serviceName: string;
  serviceDescription: string;
  serviceImage?: string;
  areaServed: string;
  faqItems: LpFaqItem[];
  offers: {
    name: string;
    description: string;
    priceInr: number;
    nights: string;
  }[];
  aggregateRating?: { value: number; count: number };
}

const ORG = {
  "@type": "TravelAgency",
  name: "Trust and Trip",
  url: "https://trustandtrip.com",
  logo: "https://trustandtrip.com/logo.png",
  telephone: "+91-7849096402",
};

export default function LpJsonLd({
  pageUrl,
  serviceName,
  serviceDescription,
  serviceImage,
  areaServed,
  faqItems,
  offers,
  aggregateRating,
}: LpJsonLdProps) {
  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const serviceJson: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Travel package",
    name: serviceName,
    description: serviceDescription,
    provider: ORG,
    areaServed,
    url: pageUrl,
    ...(serviceImage ? { image: serviceImage } : {}),
    ...(aggregateRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: aggregateRating.value.toFixed(1),
            reviewCount: aggregateRating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: serviceName,
      itemListElement: offers.map((o) => ({
        "@type": "Offer",
        name: o.name,
        description: `${o.nights} · ${o.description}`,
        priceCurrency: "INR",
        price: o.priceInr,
        priceValidUntil: "2026-12-31",
        availability: "https://schema.org/InStock",
        url: `${pageUrl}#lead-form`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJson) }}
      />
    </>
  );
}
