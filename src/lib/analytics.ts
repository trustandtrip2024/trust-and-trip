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

  // ── GA4 standard conversion events (required for Google Ads import) ─────
  // Use the GA4 reserved names (`generate_lead`, `view_item`, `begin_checkout`,
  // `purchase`, `search`) so Google's recommended-events reports populate and
  // these events can be marked as conversions in GA4 with one click.

  /** GA4 `generate_lead` — value = lead score (Meta optimizer also uses this). */
  lead: (value?: number, destination?: string) =>
    trackEvent({
      action: "generate_lead",
      category: "lead",
      label: destination,
      value,
      currency: "INR",
    }),

  /** GA4 `view_item` — fire on package detail page. */
  viewItem: (packageTitle: string, packageSlug: string, price: number) =>
    trackEvent({
      action: "view_item",
      category: "ecommerce",
      label: packageTitle,
      value: price,
      currency: "INR",
      items: [{ item_id: packageSlug, item_name: packageTitle, price }] as unknown as undefined,
    }),

  /** GA4 `begin_checkout` — fire when Razorpay opens (deposit modal submit). */
  beginCheckout: (packageTitle: string, packageSlug: string, value: number) =>
    trackEvent({
      action: "begin_checkout",
      category: "ecommerce",
      label: packageTitle,
      value,
      currency: "INR",
      items: [{ item_id: packageSlug, item_name: packageTitle, price: value }] as unknown as undefined,
    }),

  /** GA4 `purchase` — fire on successful payment verification. */
  purchase: (packageTitle: string, packageSlug: string, value: number, transactionId: string) =>
    trackEvent({
      action: "purchase",
      category: "ecommerce",
      label: packageTitle,
      value,
      currency: "INR",
      transaction_id: transactionId,
      items: [{ item_id: packageSlug, item_name: packageTitle, price: value }] as unknown as undefined,
    }),

  /** GA4 `search` — fire on planner search submit. */
  search: (term: string) =>
    trackEvent({ action: "search", category: "search", search_term: term }),

  // ── Homepage tier-1 polish events ──────────────────────────────────────
  heroGoogleClick: () =>
    trackEvent({ action: "hero_google_pill_click", category: "engagement" }),

  brandReelPlay: () =>
    trackEvent({ action: "brand_reel_play", category: "engagement" }),

  faqQuestionOpen: (question: string) =>
    trackEvent({ action: "faq_question_open", category: "engagement", label: question }),

  dealRibbonDismiss: () =>
    trackEvent({ action: "deal_ribbon_dismiss", category: "engagement" }),

  howItWorksCta: () =>
    trackEvent({ action: "how_it_works_cta_click", category: "engagement" }),

  // ── Trip-finder quiz funnel ─────────────────────────────────────────────
  quizStart: () =>
    trackEvent({ action: "quiz_start", category: "quiz" }),

  quizStep: (step: string, value: string) =>
    trackEvent({ action: "quiz_step", category: "quiz", label: `${step}:${value}` }),

  quizComplete: (a: { travelType: string; vibe: string; duration: string; budget: string; topMatchSlug?: string }) =>
    trackEvent({
      action: "quiz_complete",
      category: "quiz",
      label: `${a.travelType}|${a.vibe}|${a.duration}|${a.budget}`,
      top_match: a.topMatchSlug,
    }),

  quizMatchClick: (slug: string, score: number) =>
    trackEvent({ action: "quiz_match_click", category: "quiz", label: slug, value: score }),

  quizLeadSubmit: () =>
    trackEvent({ action: "quiz_lead_submit", category: "lead" }),
};
