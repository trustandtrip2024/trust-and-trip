/* Global gtag type */
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

type EventParams = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
};

/** Fire a GA4 custom event. Safe to call anywhere — no-ops if GA not loaded. */
export function trackEvent({ action, category, label, value, ...rest }: EventParams) {
  if (typeof window === "undefined" || !window.gtag || !GA_ID) return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
    ...rest,
  });
}

// ─── Named event helpers ───────────────────────────────────────────────────

export const analytics = {
  whatsappClick: (context: string) =>
    trackEvent({ action: "whatsapp_click", category: "engagement", label: context }),

  formSubmit: (destination?: string) =>
    trackEvent({ action: "lead_form_submit", category: "lead", label: destination }),

  plannerOpen: () =>
    trackEvent({ action: "planner_open", category: "engagement" }),

  plannerSearch: (destination: string, travelType: string, budget: string) =>
    trackEvent({ action: "planner_search", category: "search", label: `${destination}|${travelType}|${budget}` }),

  newsletterSubscribe: () =>
    trackEvent({ action: "newsletter_subscribe", category: "lead" }),

  packageView: (packageTitle: string, price: number) =>
    trackEvent({ action: "package_view", category: "content", label: packageTitle, value: price }),

  filterApplied: (filterType: string, value: string) =>
    trackEvent({ action: "filter_applied", category: "packages", label: `${filterType}:${value}` }),

  exitIntentDismiss: () =>
    trackEvent({ action: "exit_intent_dismiss", category: "engagement" }),

  exitIntentConvert: () =>
    trackEvent({ action: "exit_intent_convert", category: "lead" }),
};
