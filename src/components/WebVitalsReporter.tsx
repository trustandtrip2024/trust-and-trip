"use client";

import { useEffect } from "react";

// Reports Core Web Vitals (LCP, FID, INP, CLS, FCP, TTFB) to GA4 if loaded.
// Loads web-vitals lazily — runs after first paint, never blocks hydration.
// Window.gtag type is declared in src/lib/analytics.ts — we just consume it here.

export default function WebVitalsReporter() {
  useEffect(() => {
    let cancelled = false;

    import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      if (cancelled) return;

      const send = (metric: { name: string; value: number; id: string; rating: string }) => {
        if (typeof window === "undefined" || !window.gtag) return;
        window.gtag("event", metric.name, {
          event_category: "web_vitals",
          event_label: metric.id,
          value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
          metric_rating: metric.rating,
          non_interaction: true,
        });
      };

      onCLS(send);
      onINP(send);
      onLCP(send);
      onFCP(send);
      onTTFB(send);
    }).catch(() => { /* ignore — analytics-only path */ });

    return () => { cancelled = true; };
  }, []);

  return null;
}
