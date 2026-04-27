"use client";

import { useEffect, useState } from "react";
import { CURRENCIES, FALLBACK_RATES, format, type CurrencyCode } from "@/lib/currency";

interface Props {
  /** Amount in INR (canonical). All package prices are stored in INR. */
  inr: number;
  /** Override active currency (e.g. force INR for invoices). */
  forceCurrency?: CurrencyCode;
  /** Optional className passthrough. */
  className?: string;
  /** Show INR alongside in parentheses when active currency is non-INR. */
  showInrSecondary?: boolean;
  /** Force-skip rate fetch — use fallback rates only. Speeds first paint. */
  staticRates?: boolean;
}

const STORAGE_KEY = "tt_currency";
const RATES_CACHE_KEY = "tt_currency_rates_v1";

interface CachedRates {
  rates: Record<CurrencyCode, number>;
  fetchedAt: number;
}

/**
 * Reads the same localStorage key as the global useCurrency hook so any
 * widget on the page (switcher, Price components) stays in sync without a
 * Provider — first paint matches SSR (INR), hydrates active currency on
 * mount.
 */
export default function Price({
  inr,
  forceCurrency,
  className,
  showInrSecondary = false,
  staticRates = false,
}: Props) {
  const [currency, setCurrency] = useState<CurrencyCode>(forceCurrency ?? "INR");
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (forceCurrency) {
      setHydrated(true);
      return;
    }

    // Pick currency from localStorage.
    const stored = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (stored && stored in CURRENCIES) setCurrency(stored);
    setHydrated(true);

    if (staticRates) return;

    // Use cached rates if fresh (24h), else refresh.
    try {
      const raw = window.localStorage.getItem(RATES_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as CachedRates;
        if (cached.rates && Date.now() - cached.fetchedAt < 24 * 3600 * 1000) {
          setRates(cached.rates);
          return;
        }
      }
    } catch {
      // ignore parse errors
    }

    fetch("/api/currency/rates")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { rates?: Record<CurrencyCode, number> } | null) => {
        if (data?.rates) {
          setRates(data.rates);
          try {
            window.localStorage.setItem(
              RATES_CACHE_KEY,
              JSON.stringify({ rates: data.rates, fetchedAt: Date.now() })
            );
          } catch { /* quota or disabled */ }
        }
      })
      .catch(() => undefined);

    // React to switcher updates fired in other tabs / by useCurrency hook.
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue in CURRENCIES) {
        setCurrency(e.newValue as CurrencyCode);
      }
    }
    window.addEventListener("storage", onStorage);

    // Same-tab updates: useCurrency hook dispatches a custom event.
    function onChange(e: Event) {
      const next = (e as CustomEvent<CurrencyCode>).detail;
      if (next && next in CURRENCIES) setCurrency(next);
    }
    window.addEventListener("tt:currency", onChange as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("tt:currency", onChange as EventListener);
    };
  }, [forceCurrency, staticRates]);

  // Render INR on the server + first client paint to avoid hydration jank.
  // Swap to active currency after hydration.
  const active: CurrencyCode = hydrated ? currency : "INR";
  const rate = rates[active] ?? FALLBACK_RATES[active] ?? 1;
  const converted = active === "INR" ? inr : Math.round(inr * rate);
  const text = format(converted, active);

  return (
    <span className={className}>
      {text}
      {showInrSecondary && active !== "INR" && (
        <span className="opacity-60 ml-1.5 text-[0.85em] tabular-nums">
          (₹{Math.round(inr).toLocaleString("en-IN")})
        </span>
      )}
    </span>
  );
}
