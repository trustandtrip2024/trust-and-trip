import {
  Hotel, Utensils, Plane, Camera, Bus, Ship, Train,
  ShieldCheck, FileCheck2, Wifi, UserRound, Mountain,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TourInclude {
  id: string;
  icon: LucideIcon;
  label: string;
}

// Keyword buckets — order matters for tie-breaking. Each bucket fires once
// per package max; we pick the first inclusion that matches per bucket so
// the UI never shows two "Meals" tiles. Lowercase match against inclusions[].
const BUCKETS: Array<{ id: string; icon: LucideIcon; label: string; keywords: RegExp[] }> = [
  {
    id: "hotel",
    icon: Hotel,
    label: "Hotel",
    keywords: [/\bhotel/, /\bstay\b/, /accommodat/, /\bresort/, /homestay/, /\blodge/, /\bvilla/],
  },
  {
    id: "meals",
    icon: Utensils,
    label: "Meals",
    keywords: [/\bmeal/, /breakfast/, /\bdinner/, /\blunch/, /\bfood\b/, /\bbuffet/, /\bcuisine/],
  },
  {
    id: "flight",
    icon: Plane,
    label: "Flight",
    keywords: [/\bflight/, /\bairfare/, /\bairline/, /\bairport.*pick/, /\bseat\b/],
  },
  {
    id: "sightseeing",
    icon: Camera,
    label: "Sightseeing",
    keywords: [/sightseeing/, /\btour\b/, /\bexcursion/, /\bvisit/, /city tour/, /\battraction/],
  },
  {
    id: "transport",
    icon: Bus,
    label: "Transport",
    keywords: [/\btransfer/, /\btransport/, /\bcab\b/, /\bbus\b/, /\bcoach/, /\bcar\b/, /private vehicle/, /\bdriver\b/],
  },
  {
    id: "cruise",
    icon: Ship,
    label: "Cruise",
    keywords: [/\bcruise/, /\bferry/, /\bboat\b/, /\byacht/, /houseboat/],
  },
  {
    id: "train",
    icon: Train,
    label: "Train",
    keywords: [/\btrain\b/, /\brail\b/, /\bglacier express\b/],
  },
  {
    id: "guide",
    icon: UserRound,
    label: "Guide",
    keywords: [/\bguide\b/, /\bescort/, /tour leader/, /\bhost\b/],
  },
  {
    id: "visa",
    icon: FileCheck2,
    label: "Visa",
    keywords: [/\bvisa\b/, /\bevisa\b/, /e-visa/],
  },
  {
    id: "insurance",
    icon: ShieldCheck,
    label: "Insurance",
    keywords: [/insurance/, /\bcoverage/],
  },
  {
    id: "wifi",
    icon: Wifi,
    label: "Wi-Fi",
    keywords: [/\bwifi\b/, /wi-fi/, /internet/],
  },
  {
    id: "activities",
    icon: Mountain,
    label: "Activities",
    keywords: [/\bactivit/, /\badventure/, /\bsafari/, /\btrek/, /scuba/, /snorkel/, /\bdarshan/, /\byatra/, /\bpooja/, /helicopter/, /\bski\b/],
  },
];

const FALLBACK: TourInclude[] = [
  { id: "hotel",       icon: Hotel,    label: "Hotel" },
  { id: "meals",       icon: Utensils, label: "Meals" },
  { id: "flight",      icon: Plane,    label: "Flight" },
  { id: "sightseeing", icon: Camera,   label: "Sightseeing" },
  { id: "transport",   icon: Bus,      label: "Transport" },
];

/**
 * Derive 3-5 tour-includes icon tiles from a package's inclusions[]. Each
 * Sanity inclusion string is scanned against keyword buckets; first match
 * per bucket wins. We cap at 5 tiles to keep the ribbon balanced. When
 * nothing matches (sparse Sanity content), return the conservative
 * 5-icon fallback so the section never reads empty.
 */
export function deriveTourIncludes(inclusions: string[]): TourInclude[] {
  if (!inclusions || inclusions.length === 0) return FALLBACK;

  const matched: TourInclude[] = [];
  const seen = new Set<string>();

  for (const bucket of BUCKETS) {
    if (matched.length >= 5) break;
    if (seen.has(bucket.id)) continue;
    const hit = inclusions.some((inc) => {
      const lower = inc.toLowerCase();
      return bucket.keywords.some((re) => re.test(lower));
    });
    if (hit) {
      matched.push({ id: bucket.id, icon: bucket.icon, label: bucket.label });
      seen.add(bucket.id);
    }
  }

  // Below 3 matches feels too sparse — pad with fallback tiles the user
  // would expect on any package (Hotel, Meals, Sightseeing, Transport)
  // without overriding what we did detect.
  if (matched.length < 3) {
    for (const fb of FALLBACK) {
      if (matched.length >= 5) break;
      if (!seen.has(fb.id)) {
        matched.push(fb);
        seen.add(fb.id);
      }
    }
  }

  return matched;
}

/** Re-export used by callers that want the Sparkles eyebrow icon. */
export { Sparkles };
