// GA4 Measurement Protocol — server-side event mirror.
//
// Pairs with the browser-side GA4 tag (via gtag) the same way Meta CAPI
// pairs with Pixel: shared event_id for de-duplication. Without server-side
// MP, GA4 misses ~30% of events on iOS just like Meta does.
//
// Setup:
//   1. GA4 Admin → Data Streams → Web → "Measurement Protocol API secrets"
//   2. Create a secret. Copy it.
//   3. Set GA4_MEASUREMENT_ID + GA4_API_SECRET on Vercel.
//
// Reference: developers.google.com/analytics/devguides/collection/protocol/ga4

const MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;
const API_SECRET = process.env.GA4_API_SECRET;
const ENDPOINT = "https://www.google-analytics.com/mp/collect";
const DEBUG_ENDPOINT = "https://www.google-analytics.com/debug/mp/collect";

export interface Ga4EventParams {
  /** Anonymised client id — match the browser-side GA cookie. Required. */
  clientId: string;
  /** Optional logged-in user id (Supabase auth uid etc). */
  userId?: string;
  /** Set to override default IP. Vercel passes this through automatically. */
  ipOverride?: string;
  /** Browser UA so GA4 attributes the event to the right device. */
  userAgent?: string;
  /** Set true to use the debug endpoint (validates payload, doesn't store). */
  debug?: boolean;
}

interface Ga4Event {
  name: string;                // e.g. "lead_submit", "purchase"
  params?: Record<string, unknown>;
}

/**
 * Send one or more events to GA4 Measurement Protocol.
 * Fire-and-forget — never throws. Silent no-op if env vars are missing.
 */
export async function sendGa4Events(
  events: Ga4Event[],
  opts: Ga4EventParams
): Promise<{ ok: boolean; error?: string }> {
  if (!MEASUREMENT_ID || !API_SECRET) {
    return { ok: false, error: "GA4_MEASUREMENT_ID / GA4_API_SECRET missing" };
  }
  if (!opts.clientId) return { ok: false, error: "clientId required" };
  if (!events.length) return { ok: true };

  const body: Record<string, unknown> = {
    client_id: opts.clientId,
    events: events.map((e) => ({
      name: e.name,
      params: e.params ?? {},
    })),
    non_personalized_ads: false,
  };
  if (opts.userId) body.user_id = opts.userId;
  if (opts.ipOverride) body.ip_override = opts.ipOverride;
  if (opts.userAgent) body.user_agent = opts.userAgent;

  const url =
    `${opts.debug ? DEBUG_ENDPOINT : ENDPOINT}?measurement_id=${encodeURIComponent(MEASUREMENT_ID)}` +
    `&api_secret=${encodeURIComponent(API_SECRET)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (opts.debug) {
      const txt = await res.text();
      console.log("[ga4-mp debug]", res.status, txt.slice(0, 500));
    }
    return { ok: res.ok };
  } catch (err) {
    console.error("[ga4-mp] fetch failed", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

/** Standard GA4 ecommerce currency code. */
const INR = "INR";

/** Convenience: GA4 generate_lead event (Lead). */
export async function ga4Lead(opts: {
  clientId: string;
  value?: number;
  contentName?: string;
  ipOverride?: string;
  userAgent?: string;
  externalId?: string;
}) {
  return sendGa4Events(
    [
      {
        name: "generate_lead",
        params: {
          currency: INR,
          value: opts.value ?? 0,
          content_name: opts.contentName,
        },
      },
    ],
    { clientId: opts.clientId, userId: opts.externalId, ipOverride: opts.ipOverride, userAgent: opts.userAgent }
  );
}

/** Convenience: GA4 begin_checkout. */
export async function ga4InitiateCheckout(opts: {
  clientId: string;
  value: number;
  packageSlug?: string;
  packageTitle?: string;
  ipOverride?: string;
  userAgent?: string;
  externalId?: string;
}) {
  return sendGa4Events(
    [
      {
        name: "begin_checkout",
        params: {
          currency: INR,
          value: opts.value,
          items: [
            {
              item_id: opts.packageSlug,
              item_name: opts.packageTitle,
              price: opts.value,
              quantity: 1,
            },
          ],
        },
      },
    ],
    { clientId: opts.clientId, userId: opts.externalId, ipOverride: opts.ipOverride, userAgent: opts.userAgent }
  );
}

/** Convenience: GA4 purchase. */
export async function ga4Purchase(opts: {
  clientId: string;
  value: number;
  transactionId: string;
  packageSlugs: string[];
  packageTitle?: string;
  ipOverride?: string;
  userAgent?: string;
  externalId?: string;
}) {
  return sendGa4Events(
    [
      {
        name: "purchase",
        params: {
          currency: INR,
          value: opts.value,
          transaction_id: opts.transactionId,
          items: opts.packageSlugs.map((slug, i) => ({
            item_id: slug,
            item_name: i === 0 ? opts.packageTitle : slug,
            price: 0, // we don't have per-item price split here
            quantity: 1,
          })),
        },
      },
    ],
    { clientId: opts.clientId, userId: opts.externalId, ipOverride: opts.ipOverride, userAgent: opts.userAgent }
  );
}

/**
 * Browser-side `_ga` cookie value looks like `GA1.1.<client_id>.<timestamp>`.
 * Pull the client_id portion so server events tie to the same GA user.
 * Pass null/undefined when you don't have it (server falls back to a hash).
 */
export function clientIdFromCookie(gaCookie?: string | null): string | null {
  if (!gaCookie) return null;
  const parts = gaCookie.split(".");
  if (parts.length < 4) return null;
  return `${parts[2]}.${parts[3]}`;
}
