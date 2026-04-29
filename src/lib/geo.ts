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
