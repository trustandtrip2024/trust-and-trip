"use client";

import { useEffect, useState } from "react";
import { CURRENCIES, type CurrencyCode, FALLBACK_RATES } from "@/lib/currency";

const STORAGE_KEY = "tt_currency";

// Locale → suggested currency on first visit. INR for Indian visitors stays
// the canonical default since the business sells/charges in INR.
const LOCALE_HINTS: Array<[RegExp, CurrencyCode]> = [
  [/^en-IN$|^hi/i, "INR"],
  [/^en-GB$/i, "GBP"],
  [/^en-AE$|ar-AE$|^ar/i, "AED"],
  [/^en-SG$|^zh-SG$/i, "SGD"],
  [/^en-AU$/i, "AUD"],
  [/^en-CA$|^fr-CA$/i, "CAD"],
  [/de|fr|es|it|pt|nl/i, "EUR"],
  [/en-US$|^en$/i, "USD"],
];

function suggestFromBrowser(): CurrencyCode {
  if (typeof navigator === "undefined") return "INR";
  const lang = navigator.language ?? "en-IN";
  for (const [re, code] of LOCALE_HINTS) {
    if (re.test(lang)) return code;
  }
  return "INR";
}

interface State {
  currency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  ready: boolean;
}

export function useCurrency() {
  const [state, setState] = useState<State>({
    currency: "INR",
    rates: FALLBACK_RATES,
    ready: false,
  });

  useEffect(() => {
    const stored = (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null) as CurrencyCode | null;
    const initial: CurrencyCode = stored && stored in CURRENCIES ? stored : suggestFromBrowser();

    // Pull live rates from our server-cached endpoint
    fetch("/api/currency/rates")
      .then((r) => r.ok ? r.json() : null)
      .then((data: { rates?: Record<CurrencyCode, number> } | null) => {
        setState({
          currency: initial,
          rates: data?.rates ?? FALLBACK_RATES,
          ready: true,
        });
      })
      .catch(() => setState({ currency: initial, rates: FALLBACK_RATES, ready: true }));
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setState((s) => ({ ...s, currency: code }));
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* private mode */ }
    // Broadcast so any <Price> on the page re-renders immediately.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent<CurrencyCode>("tt:currency", { detail: code }));
    }
  };

  return { ...state, setCurrency };
}
