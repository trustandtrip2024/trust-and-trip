import JsonLd from "@/components/JsonLd";
import { HOME_FAQS } from "@/lib/home-faqs";

const SITE = "https://trustandtrip.com";

interface Props {
  rating: number;
  reviewCount: number;
  totalTravelers: number;
}

export default function HomepageSchema({ rating, reviewCount, totalTravelers }: Props) {
  const data: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "Trust and Trip",
      alternateName: "Trust & Trip Experiences",
      description: "Custom-planned holiday packages from India — honeymoon, family, solo, group, pilgrim. A real planner builds your itinerary in 24 hours.",
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE}/packages?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "@id": `${SITE}/#organization`,
      url: SITE,
      name: "Trust and Trip Experiences Pvt. Ltd.",
      legalName: "Trust and Trip Experiences Pvt. Ltd.",
      logo: `${SITE}/logo.png`,
      image: `${SITE}/og-image.jpg`,
      description: "Custom holiday packages from India. Free itinerary in 24 hours. 4.9★ on Google with 8,000+ travelers since 2019.",
      foundingDate: "2019",
      areaServed: { "@type": "Country", name: "India" },
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: "+91-8115-999-588",
          availableLanguage: ["English", "Hindi"],
          areaServed: "IN",
        },
      ],
      sameAs: [
        "https://www.instagram.com/trustandtrip/",
        "https://www.facebook.com/trustandtrip",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating.toFixed(1),
        reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
      slogan: "Trips that feel made just for you",
      makesOffer: [
        { "@type": "Offer", name: "Honeymoon packages", url: `${SITE}/packages?style=Honeymoon` },
        { "@type": "Offer", name: "Family holidays", url: `${SITE}/packages?style=Family` },
        { "@type": "Offer", name: "Pilgrim journeys", url: `${SITE}/packages?theme=yatra` },
        { "@type": "Offer", name: "Visa-free escapes", url: `${SITE}/packages?theme=visa-free` },
      ],
      knowsAbout: [
        "Honeymoon", "Family vacation", "Pilgrim travel", "Char Dham", "Vaishno Devi",
        "Tirupati", "Bali", "Maldives", "Switzerland", "Kerala", "Rajasthan",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${SITE}/#faq`,
      mainEntity: HOME_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${SITE}/#webpage`,
      url: SITE,
      name: "Trust and Trip — Trips that feel made just for you",
      description: `A real planner builds your itinerary in 24 hours. Free until you're sure. ${rating.toFixed(1)} on Google · ${totalTravelers.toLocaleString("en-IN")}+ travelers since 2019.`,
      isPartOf: { "@id": `${SITE}/#website` },
      about: { "@id": `${SITE}/#organization` },
      inLanguage: "en-IN",
    },
  ];

  return <JsonLd data={data} />;
}
