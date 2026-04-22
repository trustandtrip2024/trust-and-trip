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
