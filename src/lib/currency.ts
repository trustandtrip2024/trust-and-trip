// Multi-currency support — primary currency stays INR (we sell in INR and
// charge via Razorpay in INR), but visitors from outside India can see prices
// in their local currency as a secondary readout.
//
// Rates are fetched once per day from open.er-api.com (free, no auth) and
// cached via Next's fetch cache + Upstash Redis. Hardcoded fallback ensures
// we never block rendering on rate fetch failure.

import { cacheGet, cacheSet } from "./redis";

export type CurrencyCode = "INR" | "USD" | "GBP" | "EUR" | "AED" | "SGD" | "AUD" | "CAD";

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  INR: { code: "INR", symbol: "₹",  label: "Indian Rupee",     locale: "en-IN" },
  USD: { code: "USD", symbol: "$",  label: "US Dollar",         locale: "en-US" },
  GBP: { code: "GBP", symbol: "£",  label: "British Pound",     locale: "en-GB" },
  EUR: { code: "EUR", symbol: "€",  label: "Euro",              locale: "en-IE" },
  AED: { code: "AED", symbol: "د.إ", label: "UAE Dirham",       locale: "en-AE" },
  SGD: { code: "SGD", symbol: "S$", label: "Singapore Dollar",  locale: "en-SG" },
  AUD: { code: "AUD", symbol: "A$", label: "Australian Dollar", locale: "en-AU" },
  CAD: { code: "CAD", symbol: "C$", label: "Canadian Dollar",   locale: "en-CA" },
};

// Conservative fallback rates (1 INR -> X). Periodically refreshed by the
// public rate-fetcher. Used until the live fetch resolves on first request.
export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0094,
  EUR: 0.011,
  AED: 0.044,
  SGD: 0.016,
  AUD: 0.018,
  CAD: 0.016,
};

const CACHE_KEY = "currency:rates:inr";
const CACHE_TTL = 24 * 60 * 60; // 24h

interface RatesPayload {
  rates: Record<CurrencyCode, number>;
  fetched_at: string;
}

/** Fetch live rates with INR as base. Cached server-side for 24h. */
export async function getRates(): Promise<Record<CurrencyCode, number>> {
  const cached = await cacheGet<RatesPayload>(CACHE_KEY);
  if (cached?.rates) return cached.rates;

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/INR", {
      next: { revalidate: CACHE_TTL },
    });
    if (!res.ok) throw new Error("rate fetch non-ok");
    const json = (await res.json()) as { rates?: Record<string, number> };
    if (!json.rates) throw new Error("no rates field");

    const filtered: Record<CurrencyCode, number> = { ...FALLBACK_RATES };
    for (const code of Object.keys(CURRENCIES) as CurrencyCode[]) {
      const rate = json.rates[code];
      if (typeof rate === "number" && rate > 0) filtered[code] = rate;
    }

    await cacheSet(CACHE_KEY, { rates: filtered, fetched_at: new Date().toISOString() }, CACHE_TTL);
    return filtered;
  } catch (e) {
    console.error("[currency] rate fetch failed, using fallback:", e);
    return FALLBACK_RATES;
  }
}

/** Convert INR amount to target currency. */
export function convert(amountInr: number, target: CurrencyCode, rates: Record<CurrencyCode, number>): number {
  const rate = rates[target] ?? FALLBACK_RATES[target] ?? 1;
  return amountInr * rate;
}

/** Format using locale-correct currency string. INR drops decimals; others round to nearest unit. */
export function format(amount: number, code: CurrencyCode): string {
  const meta = CURRENCIES[code];
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: code === "INR" ? 0 : 0,
    }).format(amount);
  } catch {
    return `${meta.symbol}${Math.round(amount).toLocaleString("en-US")}`;
  }
}
