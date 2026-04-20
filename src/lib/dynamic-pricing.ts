// Dynamic pricing tiers based on date proximity and demand signals

export type PriceTier = {
  label: string;
  badge: string;
  multiplier: number;
  color: string;
  urgency: string;
};

const TIERS: PriceTier[] = [
  { label: "Early Bird",  badge: "🐦 Early Bird",  multiplier: 0.90, color: "text-green-600 bg-green-50",  urgency: "Save 10% — limited slots" },
  { label: "Standard",   badge: "✅ Standard",     multiplier: 1.00, color: "text-blue-600 bg-blue-50",    urgency: "Good availability" },
  { label: "Peak",       badge: "🔥 Peak Season", multiplier: 1.12, color: "text-orange-600 bg-orange-50", urgency: "High demand period" },
  { label: "Last Minute",badge: "⚡ Last Minute", multiplier: 1.05, color: "text-red-600 bg-red-50",       urgency: "Only a few slots left" },
];

// Deterministic tier per package (based on slug hash + current month)
export function getPriceTier(slug: string): PriceTier {
  const month = new Date().getMonth(); // 0-11
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  // Peak months: May(4), Jun(5), Oct(9), Nov(10), Dec(11)
  const isPeak = [4, 5, 9, 10, 11].includes(month);
  // Early bird: first 2 weeks of non-peak month (simulated via hash)
  const isEarlyBird = !isPeak && hash % 3 === 0;
  const isLastMinute = !isPeak && !isEarlyBird && hash % 7 === 1;

  if (isPeak) return TIERS[2];
  if (isEarlyBird) return TIERS[0];
  if (isLastMinute) return TIERS[3];
  return TIERS[1];
}

export function getDynamicPrice(basePrice: number, slug: string): {
  price: number;
  originalPrice: number;
  tier: PriceTier;
  savings: number;
} {
  const tier = getPriceTier(slug);
  const price = Math.round(basePrice * tier.multiplier);
  const originalPrice = tier.multiplier < 1 ? basePrice : Math.round(basePrice * 1.15);
  const savings = originalPrice - price;
  return { price, originalPrice, tier, savings };
}
