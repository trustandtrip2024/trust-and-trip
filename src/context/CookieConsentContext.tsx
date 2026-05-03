"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

type CookieConsentContextValue = {
  consent: ConsentState | null;
  acceptAll: () => void;
  rejectAll: () => void;
  hasDecided: boolean;
  initialized: boolean; // false until localStorage has been checked
};

const STORAGE_KEY = "trustandtrip_cookie_consent";

// Server-side mirror of the marketing-consent flag. Server routes read this
// cookie to gate Meta CAPI dispatch (Path A — DPDPA-conservative legal
// basis decided 2026-05-03 in /admin/decisions). Non-httpOnly so the
// browser can write it; non-sensitive (single bit). 1y TTL — refreshed on
// every accept/reject.
const CONSENT_MARKETING_COOKIE = "tt_consent_m";

function writeMarketingCookie(value: boolean) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_MARKETING_COOKIE}=${value ? "1" : "0"}; max-age=${oneYear}; path=/; SameSite=Lax`;
}

const CookieConsentContext = createContext<CookieConsentContextValue>({
  consent: null,
  acceptAll: () => {},
  rejectAll: () => {},
  hasDecided: false,
  initialized: false,
});

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [hasDecided, setHasDecided] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setConsent(JSON.parse(stored));
        setHasDecided(true);
      }
    } catch {
      // ignore
    }
    setInitialized(true);
  }, []);

  const save = (state: ConsentState) => {
    setConsent(state);
    setHasDecided(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
    writeMarketingCookie(state.marketing);
  };

  const acceptAll = () => save({ analytics: true, marketing: true });
  const rejectAll = () => save({ analytics: false, marketing: false });

  return (
    <CookieConsentContext.Provider value={{ consent, acceptAll, rejectAll, hasDecided, initialized }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export const useCookieConsent = () => useContext(CookieConsentContext);
