"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

type CookieConsentContextValue = {
  consent: ConsentState | null; // null = not yet decided
  acceptAll: () => void;
  rejectAll: () => void;
  hasDecided: boolean;
};

const STORAGE_KEY = "trustandtrip_cookie_consent";

const CookieConsentContext = createContext<CookieConsentContextValue>({
  consent: null,
  acceptAll: () => {},
  rejectAll: () => {},
  hasDecided: false,
});

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [hasDecided, setHasDecided] = useState(false);

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
  }, []);

  const save = (state: ConsentState) => {
    setConsent(state);
    setHasDecided(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  };

  const acceptAll = () => save({ analytics: true, marketing: true });
  const rejectAll = () => save({ analytics: false, marketing: false });

  return (
    <CookieConsentContext.Provider value={{ consent, acceptAll, rejectAll, hasDecided }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export const useCookieConsent = () => useContext(CookieConsentContext);
