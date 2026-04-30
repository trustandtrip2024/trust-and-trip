import type { Package, Destination } from "./data";

const SITE = "https://trustandtrip.com";

const TRAVEL_TYPE_AUDIENCE: Record<Package["travelType"], string> = {
  Couple: "Couples planning a honeymoon, anniversary, or first trip together.",
  Family: "Families with kids 6+, multi-generational trips, school-break travel.",
  Group:  "Friends, college groups, and adventurous families travelling together.",
  Solo:   "Independent travellers, sabbatical takers, and weekend introverts.",
};

const VISA_FREE_SLUGS = new Set([
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "indonesia", "fiji",
]);

export interface PackageSeoFill {
  bestFor: string;
  whyThisPackage: string[];
  faqs: { q: string; a: string }[];
  keywords: string[];
  speakableSelectors: string[];
}

export function fillPackageSeo(pkg: Package, dest?: Destination | null): PackageSeoFill {
  const bestFor = pkg.bestFor?.trim() || TRAVEL_TYPE_AUDIENCE[pkg.travelType];

  const whyThisPackage =
    pkg.whyThisPackage && pkg.whyThisPackage.length > 0
      ? pkg.whyThisPackage
      : [
          `${pkg.duration} curated for ${pkg.travelType.toLowerCase()} travellers — pace and inclusions matched to the audience.`,
          `Every transfer, hotel, and activity vetted by a real planner who has been to ${pkg.destinationName}.`,
          `Free changes until you approve the final itinerary — pay only when it feels right.`,
        ];

  const faqs = pkg.faqs && pkg.faqs.length > 0 ? pkg.faqs : synthesiseFaqs(pkg, dest);

  const keywords = Array.from(
    new Set([
      pkg.title,
      `${pkg.destinationName} tour packages`,
      `${pkg.destinationName} ${pkg.travelType.toLowerCase()} packages`,
      `${pkg.destinationName} itinerary`,
      `${pkg.destinationName} trip cost from India`,
      `${pkg.duration} ${pkg.destinationName} tour`,
      ...(pkg.categories ?? []),
      ...(pkg.tags ?? []),
      `Trust and Trip ${pkg.destinationName}`,
      "travel agency India",
    ]),
  ).filter(Boolean);

  const speakableSelectors = ["#package-summary", "#package-faqs"];

  return { bestFor, whyThisPackage, faqs, keywords, speakableSelectors };
}

function synthesiseFaqs(pkg: Package, dest?: Destination | null): { q: string; a: string }[] {
  const visaFree = dest ? VISA_FREE_SLUGS.has(dest.slug) : false;
  const isInternational = dest ? dest.country.toLowerCase() !== "india" : false;
  const bestTime = dest?.bestTimeToVisit || pkg.itinerary[0]?.title || "year-round";
  const inclusionsLine =
    pkg.inclusions && pkg.inclusions.length > 0
      ? pkg.inclusions.slice(0, 4).join("; ")
      : `${pkg.nights} nights of stay, daily breakfast, private transfers, sightseeing per itinerary, and 24/7 Trust and Trip concierge support`;

  const faqs: { q: string; a: string }[] = [
    {
      q: `What is included in the ${pkg.title} package?`,
      a: `The ${pkg.duration} ${pkg.destinationName} package includes ${inclusionsLine}. Final inclusions are confirmed in your custom itinerary before you pay.`,
    },
    {
      q: `What is the best time to visit ${pkg.destinationName} for this trip?`,
      a: `The best time to visit ${pkg.destinationName} for this trip is ${bestTime}. Trust and Trip plans your dates around weather, festival calendars, and crowd levels — share your preferred travel month and we will validate.`,
    },
    {
      q: `Who is this ${pkg.destinationName} package best suited for?`,
      a: `This ${pkg.duration} package is built for ${TRAVEL_TYPE_AUDIENCE[pkg.travelType].toLowerCase()} The pace, hotel category, and activity mix are tuned to that traveller type, and every detail can be adjusted before booking.`,
    },
    {
      q: isInternational
        ? `Do Indian passport holders need a visa for ${pkg.destinationName}?`
        : `Are domestic flights or train fares included in this package?`,
      a: isInternational
        ? visaFree
          ? `${pkg.destinationName} is currently visa-free for Indian passport holders, subject to immigration rules at arrival. Trust and Trip can still help with documentation and travel insurance.`
          : `Yes — ${pkg.destinationName} requires a visa for Indian passport holders. Trust and Trip will guide you through the visa application, document checklist, and processing timelines.`
        : `Domestic flights and train fares are not included by default but can be added on request. Once your travel city and dates are confirmed, we will share the cheapest fare options for your group.`,
    },
    {
      q: `Can the itinerary be customised for our group?`,
      a: `Yes — every Trust and Trip itinerary is fully customisable. Hotels, day order, activities, and pace are tuned to your dates and preferences before any payment is taken. Customisation is free.`,
    },
    {
      q: `How much advance booking is required for ${pkg.destinationName}?`,
      a: pkg.limitedSlots
        ? `This ${pkg.destinationName} package is on a limited-slots departure — book at least 30–45 days in advance to lock hotels and seat-in-coach transfers. Last-minute trips can sometimes be honoured at a premium.`
        : `Trust and Trip recommends booking ${pkg.destinationName} trips at least 21 days in advance for the best hotel rates and confirmed availability. Tighter timelines are usually possible at a small surcharge.`,
    },
  ];

  return faqs;
}

export function packageBreadcrumbLd(pkg: Package) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Packages", item: `${SITE}/packages` },
      {
        "@type": "ListItem",
        position: 3,
        name: pkg.destinationName,
        item: `${SITE}/destinations/${pkg.destinationSlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: pkg.title,
        item: `${SITE}/packages/${pkg.slug}`,
      },
    ],
  };
}

export function packageFaqLd(faqs: { q: string; a: string }[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function packageTouristTripLd(pkg: Package, dest?: Destination | null) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.description,
    image: pkg.heroImage,
    url: `${SITE}/packages/${pkg.slug}`,
    touristType: pkg.travelType,
    itinerary: pkg.itinerary.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.title,
      description: d.description,
    })),
    ...(dest && {
      subjectOf: {
        "@type": "Place",
        name: dest.name,
        address: { "@type": "PostalAddress", addressCountry: dest.country },
      },
    }),
    offers: {
      "@type": "Offer",
      url: `${SITE}/packages/${pkg.slug}`,
      priceCurrency: "INR",
      price: pkg.price,
      availability: pkg.limitedSlots
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/InStock",
      seller: {
        "@type": "TravelAgency",
        name: "Trust and Trip",
        url: SITE,
      },
    },
    ...(pkg.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: pkg.rating,
        reviewCount: pkg.reviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

export function speakableLd(selectors: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: selectors,
    },
  };
}

// Derive a 12-month tag strip from a destination's free-form
// bestTimeToVisit string. We classify each month into peak / shoulder /
// off / avoid using simple substring matches. Falls back to "shoulder"
// when the string is empty so the strip still renders.
const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export function synthesiseBestMonths(
  pkg: Package,
  dest?: Destination | null,
): NonNullable<Package["bestMonths"]> {
  if (pkg.bestMonths && pkg.bestMonths.length > 0) return pkg.bestMonths;
  const src = (dest?.bestTimeToVisit || "").toLowerCase();
  if (!src) return [];
  const peak = new Set<number>();
  for (let i = 0; i < 12; i++) {
    if (src.includes(MONTH_NAMES[i].slice(0, 3))) peak.add(i + 1);
  }
  // Range expansion — "April to October" mentions april + october; fill in
  // the months between when both anchors are present.
  const peakArr = [...peak].sort((a, b) => a - b);
  if (peakArr.length >= 2) {
    const lo = peakArr[0];
    const hi = peakArr[peakArr.length - 1];
    if (hi - lo <= 8) {
      for (let m = lo; m <= hi; m++) peak.add(m);
    }
  }
  if (peak.size === 0) return [];
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    if (peak.has(month)) return { month, tag: "peak" as const, note: "Best window" };
    // Two months immediately around the peak window are shoulder.
    const adjacent = peak.has(((month - 2 + 12) % 12) + 1) || peak.has((month % 12) + 1);
    return adjacent
      ? { month, tag: "shoulder" as const, note: "Pricing softens" }
      : { month, tag: "off" as const };
  });
}

const VISA_FREE = new Set([
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "indonesia", "fiji",
]);
const VISA_ON_ARRIVAL = new Set([
  "thailand", "cambodia", "kenya", "mauritius", "vietnam", "indonesia", "bali",
]);
const VISA_TYPE: Record<string, string> = {
  france: "Schengen short-stay (Type C)",
  italy: "Schengen short-stay (Type C)",
  uk: "UK Standard Visitor visa",
  russia: "e-Visa (most cities)",
  "south-korea": "K-ETA (online authorisation)",
  "hong-kong": "Visa-free for 14 days",
  cambodia: "e-Visa or visa on arrival",
};

export function synthesiseVisaInfo(
  pkg: Package,
  dest?: Destination | null,
): NonNullable<Package["visaInfo"]> | undefined {
  if (pkg.visaInfo) return pkg.visaInfo;
  if (!dest) return undefined;
  const slug = dest.slug;
  const isInternational = dest.country.toLowerCase() !== "india";
  if (!isInternational) return undefined;
  const visaType =
    VISA_TYPE[slug] ||
    (VISA_FREE.has(slug)
      ? "Visa-free for Indian passports"
      : VISA_ON_ARRIVAL.has(slug)
        ? "Visa on arrival or e-Visa"
        : "Pre-arrival visa required");
  return {
    required: !VISA_FREE.has(slug),
    visaType,
    processingDays: VISA_FREE.has(slug) ? 0 : VISA_ON_ARRIVAL.has(slug) ? 3 : 14,
    notes: `Trust and Trip handles visa documentation, courier, and tracking for ${dest.name}. Final processing time depends on consulate workload and travel season.`,
  };
}

export function founderPersonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Akash Mishra",
    jobTitle: "Founder, Trust and Trip",
    worksFor: { "@type": "TravelAgency", name: "Trust and Trip", url: SITE },
    url: `${SITE}/about`,
    sameAs: [
      "https://www.linkedin.com/company/trust-and-trip",
      "https://www.instagram.com/trust_and_trip",
    ],
    knowsAbout: [
      "Travel planning",
      "India tour packages",
      "Honeymoon destinations",
      "Pilgrim circuits",
      "International travel from India",
      "Wildlife safaris",
    ],
  };
}
