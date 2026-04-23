"use client";

import { Analytics } from "@vercel/analytics/next";
import { useCookieConsent } from "@/context/CookieConsentContext";

export default function VercelAnalytics() {
  const { consent } = useCookieConsent();
  if (!consent?.analytics) return null;
  return <Analytics />;
}
