import "server-only";
import { headers } from "next/headers";

/**
 * Indian metros we surface in copy as "from <city>" personalization.
 * Order matters — first match wins on alias resolution.
 */
const KNOWN_METROS = [
  { city: "Mumbai", aliases: ["mumbai", "bombay", "navi mumbai", "thane"] },
  { city: "Delhi", aliases: ["delhi", "new delhi", "noida", "gurgaon", "gurugram", "ghaziabad", "faridabad"] },
  { city: "Bengaluru", aliases: ["bengaluru", "bangalore"] },
  { city: "Hyderabad", aliases: ["hyderabad", "secunderabad"] },
  { city: "Chennai", aliases: ["chennai", "madras"] },
  { city: "Kolkata", aliases: ["kolkata", "calcutta"] },
  { city: "Pune", aliases: ["pune"] },
  { city: "Ahmedabad", aliases: ["ahmedabad"] },
] as const;

export type DetectedCity = typeof KNOWN_METROS[number]["city"];

export interface GeoContext {
  /** Normalized metro name when the visitor is in one we cover, else null. */
  city: DetectedCity | null;
  /** Raw city from edge geolocation (may be a tier-2 town, not in metros). */
  rawCity: string;
  /** ISO-2 country code from edge geolocation. */
  country: string;
  /** Convenience flag — true when the visitor is in India. */
  isIndia: boolean;
}

export function getGeoContext(): GeoContext {
  const h = headers();
  const rawCity = h.get("x-tt-geo-city") ?? "";
  const country = h.get("x-tt-geo-country") ?? "";
  const lower = rawCity.toLowerCase().trim();

  const match = KNOWN_METROS.find((m) =>
    m.aliases.some((a) => lower === a || lower.includes(a)),
  );

  return {
    city: match?.city ?? null,
    rawCity,
    country,
    isIndia: country === "IN",
  };
}

/**
 * Top-3 destinations to surface for a given metro. Picked on flight
 * connectivity + popularity, not pricing — keeps copy honest when we
 * don't have live inventory. Order matters; first is the "headline".
 */
const CITY_RECOMMENDATIONS: Record<DetectedCity, { slug: string; name: string; reason: string }[]> = {
  Mumbai: [
    { slug: "maldives",     name: "Maldives",     reason: "Direct flights, 4 hr" },
    { slug: "bali",         name: "Bali",         reason: "Direct flights, 6 hr" },
    { slug: "dubai",        name: "Dubai",        reason: "Direct flights, 3 hr" },
  ],
  Delhi: [
    { slug: "uttarakhand",  name: "Char Dham Yatra", reason: "Direct overland, 6 hr" },
    { slug: "kashmir",      name: "Kashmir",      reason: "Direct flights, 1.5 hr" },
    { slug: "thailand",     name: "Thailand",     reason: "Direct flights, 4.5 hr" },
  ],
  Bengaluru: [
    { slug: "kerala",       name: "Kerala",       reason: "Direct flights, 1 hr" },
    { slug: "andaman",      name: "Andaman",      reason: "Direct flights, 3 hr" },
    { slug: "sri-lanka",    name: "Sri Lanka",    reason: "Direct flights, 1.5 hr" },
  ],
  Hyderabad: [
    { slug: "kerala",       name: "Kerala",       reason: "Direct flights, 1.5 hr" },
    { slug: "thailand",     name: "Thailand",     reason: "Direct flights, 4 hr" },
    { slug: "singapore",    name: "Singapore",    reason: "Direct flights, 5 hr" },
  ],
  Chennai: [
    { slug: "sri-lanka",    name: "Sri Lanka",    reason: "Direct flights, 1.5 hr" },
    { slug: "andaman",      name: "Andaman",      reason: "Direct flights, 2.5 hr" },
    { slug: "thailand",     name: "Thailand",     reason: "Direct flights, 4 hr" },
  ],
  Kolkata: [
    { slug: "bhutan",       name: "Bhutan",       reason: "Direct flights, 1 hr" },
    { slug: "thailand",     name: "Thailand",     reason: "Direct flights, 2.5 hr" },
    { slug: "sikkim",       name: "Sikkim",       reason: "Closest hill state" },
  ],
  Pune: [
    { slug: "goa",          name: "Goa",          reason: "Drive 7 hr or fly 1 hr" },
    { slug: "bali",         name: "Bali",         reason: "Connect via Mumbai, 7 hr" },
    { slug: "kerala",       name: "Kerala",       reason: "Direct flights, 2 hr" },
  ],
  Ahmedabad: [
    { slug: "rajasthan",    name: "Rajasthan",    reason: "Drive 6 hr or fly 1 hr" },
    { slug: "dubai",        name: "Dubai",        reason: "Direct flights, 3 hr" },
    { slug: "maldives",     name: "Maldives",     reason: "Connect via Mumbai, 6 hr" },
  ],
};

export function getCityRecommendations(city: DetectedCity | null) {
  if (!city) return null;
  return { city, picks: CITY_RECOMMENDATIONS[city] };
}
