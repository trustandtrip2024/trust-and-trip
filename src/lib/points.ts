// Loyalty points engine for Trust and Trip
// 1 point = ₹100 of verified deposit (or manual admin adjust).
// Tiers derive from lifetime_points (never resets).

export type Tier = "silver" | "gold" | "platinum";

export const TIER_THRESHOLDS: Record<Tier, number> = {
  silver: 0,
  gold: 1000,
  platinum: 5000,
};

export const TIER_PERKS: Record<Tier, { label: string; discount: string; perks: string[]; color: string; accent: string }> = {
  silver: {
    label: "Silver",
    discount: "2% off every booking",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    accent: "text-slate-600",
    perks: [
      "2% loyalty discount on bookings",
      "Priority WhatsApp support 9am–9pm",
      "Early access to monthly deals",
    ],
  },
  gold: {
    label: "Gold",
    discount: "5% off every booking",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    accent: "text-amber-600",
    perks: [
      "5% loyalty discount on bookings",
      "Priority support 24/7",
      "Free room-category upgrade (subject to availability)",
      "Exclusive Gold-only departures",
    ],
  },
  platinum: {
    label: "Platinum",
    discount: "8% off + free perks",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    accent: "text-indigo-600",
    perks: [
      "8% loyalty discount on bookings",
      "Dedicated trip concierge",
      "Complimentary airport transfers",
      "Free room upgrade guarantee",
      "Anniversary surprise on every trip",
    ],
  },
};

const TIER_ORDER: Tier[] = ["silver", "gold", "platinum"];

export function computeTier(lifetimePoints: number): Tier {
  if (lifetimePoints >= TIER_THRESHOLDS.platinum) return "platinum";
  if (lifetimePoints >= TIER_THRESHOLDS.gold) return "gold";
  return "silver";
}

export function nextTier(current: Tier): Tier | null {
  const i = TIER_ORDER.indexOf(current);
  return i < TIER_ORDER.length - 1 ? TIER_ORDER[i + 1] : null;
}

export function pointsToNextTier(lifetimePoints: number): { next: Tier | null; needed: number } {
  const current = computeTier(lifetimePoints);
  const next = nextTier(current);
  if (!next) return { next: null, needed: 0 };
  return { next, needed: Math.max(0, TIER_THRESHOLDS[next] - lifetimePoints) };
}

export function pointsForRupees(rupees: number): number {
  return Math.floor(rupees / 100);
}
