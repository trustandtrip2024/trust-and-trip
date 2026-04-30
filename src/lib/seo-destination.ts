import type { Destination } from "./data";

const SITE = "https://trustandtrip.com";

const VISA_FREE_SLUGS = new Set([
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "indonesia", "fiji",
]);

export function destinationBreadcrumbLd(d: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Destinations", item: `${SITE}/destinations` },
      { "@type": "ListItem", position: 3, name: d.name, item: `${SITE}/destinations/${d.slug}` },
    ],
  };
}

export function destinationFaqLd(d: Destination) {
  const isInternational = d.country.toLowerCase() !== "india";
  const visaFree = VISA_FREE_SLUGS.has(d.slug);
  const faqs: { q: string; a: string }[] = [
    {
      q: `What is the best time to visit ${d.name}?`,
      a: `The best time to visit ${d.name} is ${d.bestTimeToVisit || "year-round, with shoulder months offering the best mix of weather and pricing"}. Trust and Trip plans your dates around weather, festivals, and crowd levels.`,
    },
    {
      q: `How many days are ideal for a ${d.name} trip?`,
      a: `${d.idealDuration || "5 to 7 days"} is the ideal duration for a ${d.name} trip. Shorter weekend trips and longer extended itineraries can both be customised based on your travel goals.`,
    },
    {
      q: `What is the starting cost of a ${d.name} package from India?`,
      a: `Trust and Trip's ${d.name} packages start from ₹${d.priceFrom.toLocaleString("en-IN")} per person, including stays, transfers, and curated experiences. Final pricing depends on hotel category, season, and group size.`,
    },
    {
      q: isInternational
        ? `Do Indian passport holders need a visa for ${d.name}?`
        : `Are flights or trains included in the ${d.name} tour package?`,
      a: isInternational
        ? visaFree
          ? `${d.name} is currently visa-free for Indian passport holders, subject to immigration rules at arrival. Trust and Trip handles documentation and travel insurance for full peace of mind.`
          : `Yes — ${d.name} requires a visa for Indian passport holders. Trust and Trip provides end-to-end visa support including document checklists and processing-time guidance.`
        : `Domestic flights and train fares are not included by default but can be added on request. Trust and Trip will share the cheapest fare options once your travel city and dates are confirmed.`,
    },
    {
      q: `What are the must-do experiences in ${d.name}?`,
      a: `Top experiences in ${d.name} include ${(d.thingsToDo || []).slice(0, 4).join(", ") || "iconic sights, local food, and offbeat moments only locals know"}. Every Trust and Trip itinerary balances marquee sights with quieter, photo-worthy hours.`,
    },
  ];
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

export function destinationKeywords(d: Destination): string[] {
  return Array.from(
    new Set([
      `${d.name} tour packages`,
      `${d.name} tour packages from India`,
      `${d.name} honeymoon packages`,
      `${d.name} family tour`,
      `${d.name} group tour`,
      `${d.name} solo trip`,
      `${d.name} itinerary`,
      `${d.name} travel cost`,
      `${d.name} best time to visit`,
      `Trust and Trip ${d.name}`,
      ...(d.highlights || []),
    ]),
  ).filter(Boolean);
}
