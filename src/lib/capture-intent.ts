import type { LeadSource } from "./supabase";

/**
 * Client-side helper: fire an anonymous "click intent" lead to Bitrix24
 * when a user taps a CTA that normally just opens WhatsApp / phone / modal
 * without collecting form data.
 *
 * Fire-and-forget — never blocks navigation. If the POST fails for any
 * reason (offline, CRM down), the user's click still opens WhatsApp /
 * phone immediately; we just lose the intent record.
 *
 * Usage:
 *   <a
 *     href={waUrl}
 *     onClick={() => captureIntent("book_now_click", {
 *       package_title: title,
 *       package_slug: slug,
 *       destination: "Goa",
 *     })}
 *   >Book Now</a>
 */

type IntentSource = Extract<
  LeadSource,
  | "book_now_click"
  | "call_click"
  | "whatsapp_click"
  | "customize_click"
  | "enquire_click"
  | "schedule_call_click"
>;

export interface IntentMetadata {
  package_title?: string;
  package_slug?: string;
  destination?: string;
  travel_type?: string;
  /** Free-text detail for Bitrix24 Comments. */
  note?: string;
}

/**
 * Fire-and-forget POST to /api/leads. Returns the (unawaited) promise for
 * callers that want to chain — but in 99% of cases you should just call
 * this and not await.
 */
export function captureIntent(
  source: IntentSource,
  metadata: IntentMetadata = {},
): Promise<void> {
  const payload = {
    source,
    name: "",   // intent-only; /api/leads will substitute "Website Visitor"
    email: "",
    phone: "",
    package_title: metadata.package_title,
    package_slug: metadata.package_slug,
    destination: metadata.destination,
    travel_type: metadata.travel_type,
    message: metadata.note,
    page_url: typeof window !== "undefined" ? window.location.href : undefined,
    utm_source:
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("utm_source") ?? undefined
        : undefined,
    utm_medium:
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("utm_medium") ?? undefined
        : undefined,
    utm_campaign:
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("utm_campaign") ?? undefined
        : undefined,
  };

  // Use keepalive so the request survives the page unload when the user
  // navigates to WhatsApp / calls a number. Works in modern Chrome/Safari/Firefox.
  return fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  })
    .then(() => undefined)
    .catch(() => undefined);
}
