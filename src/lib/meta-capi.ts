// Meta Conversions API — server-side event ingestion.
// Recovers events lost to iOS 14.5+ tracking restrictions and ad-blockers.
// Pairs with browser-side Pixel via shared event_id for de-duplication.
//
// Setup:
// • Set META_PIXEL_ID + META_CAPI_ACCESS_TOKEN in env
// • Optional META_TEST_EVENT_CODE for staging verification (Events Manager → Test Events)
//
// Reference: developers.facebook.com/docs/marketing-api/conversions-api

import crypto from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID ?? "1712300429671832";
const TOKEN = process.env.META_CAPI_ACCESS_TOKEN ?? "";
const TEST_CODE = process.env.META_TEST_EVENT_CODE; // optional

const API_VERSION = "v21.0";
const ENDPOINT = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

// ─── Public event names (Meta Standard Events) ────────────────────────────

export type CapiEventName =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "Search"
  | "InitiateCheckout"
  | "Purchase"
  | "Contact"
  | "Subscribe"
  | "CompleteRegistration";

// ─── Hashing — Meta requires SHA-256 hashing for PII ──────────────────────

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(email?: string | null): string | undefined {
  if (!email) return undefined;
  const e = email.trim().toLowerCase();
  return e ? sha256(e) : undefined;
}

function normalizePhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  // Strip everything except digits, ensure country code present (default IN +91).
  const digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  const withCc = digits.length === 10 ? `91${digits}` : digits;
  return sha256(withCc);
}

function normalizeName(name?: string | null): string | undefined {
  if (!name) return undefined;
  const n = name.trim().toLowerCase();
  return n ? sha256(n) : undefined;
}

// ─── User data + event payloads ───────────────────────────────────────────

export interface CapiUserContext {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;       // ISO 3166-1 alpha-2 lowercase ("in")
  fbp?: string;           // _fbp browser cookie
  fbc?: string;           // _fbc browser cookie
  clientIp?: string;
  clientUserAgent?: string;
  externalId?: string;    // your internal user/lead id (hashed)
}

export interface CapiEvent {
  name: CapiEventName;
  eventId: string;        // shared with browser Pixel for de-dup
  eventTime?: number;     // unix seconds; defaults to now
  eventSourceUrl?: string;
  actionSource?:
    | "website"
    | "app"
    | "chat"
    | "email"
    | "phone_call"
    | "physical_store"
    | "system_generated"
    | "other";
  user: CapiUserContext;
  customData?: {
    currency?: string;       // "INR"
    value?: number;
    contentName?: string;
    contentCategory?: string;
    contentIds?: string[];
    contentType?: "product" | "product_group";
    searchString?: string;
    numItems?: number;
    [key: string]: unknown;
  };
}

// ─── Helpers (use from anywhere) ──────────────────────────────────────────

/** Generate a stable event_id to share with browser Pixel for de-duplication. */
export function newEventId(): string {
  return crypto.randomUUID();
}

/** Extract IP from a Next.js Request (works behind Vercel proxy). */
export function ipFromRequest(req: Request | { headers: Headers }): string | undefined {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim();
  return req.headers.get("x-real-ip") ?? undefined;
}

// ─── Send ─────────────────────────────────────────────────────────────────

interface CapiResponse {
  ok: boolean;
  events_received?: number;
  fbtrace_id?: string;
  error?: string;
}

/**
 * Send one or more events to Meta CAPI. Fire-and-forget — never throws.
 * Silently no-ops if META_CAPI_ACCESS_TOKEN is missing.
 */
export async function sendCapiEvents(events: CapiEvent[]): Promise<CapiResponse> {
  if (!TOKEN) {
    return { ok: false, error: "META_CAPI_ACCESS_TOKEN not set" };
  }
  if (!events.length) return { ok: true, events_received: 0 };

  const payload = {
    data: events.map((e) => ({
      event_name: e.name,
      event_id: e.eventId,
      event_time: e.eventTime ?? Math.floor(Date.now() / 1000),
      event_source_url: e.eventSourceUrl,
      action_source: e.actionSource ?? "website",
      user_data: {
        em: e.user.email ? [normalizeEmail(e.user.email)!] : undefined,
        ph: e.user.phone ? [normalizePhone(e.user.phone)!] : undefined,
        fn: normalizeName(e.user.firstName) ? [normalizeName(e.user.firstName)] : undefined,
        ln: normalizeName(e.user.lastName) ? [normalizeName(e.user.lastName)] : undefined,
        ct: normalizeName(e.user.city) ? [normalizeName(e.user.city)] : undefined,
        country: e.user.country ? [sha256(e.user.country.toLowerCase())] : undefined,
        external_id: e.user.externalId ? [sha256(e.user.externalId)] : undefined,
        fbp: e.user.fbp,
        fbc: e.user.fbc,
        client_ip_address: e.user.clientIp,
        client_user_agent: e.user.clientUserAgent,
      },
      custom_data: e.customData
        ? {
            currency: e.customData.currency ?? "INR",
            value: e.customData.value,
            content_name: e.customData.contentName,
            content_category: e.customData.contentCategory,
            content_ids: e.customData.contentIds,
            content_type: e.customData.contentType,
            search_string: e.customData.searchString,
            num_items: e.customData.numItems,
            ...Object.fromEntries(
              Object.entries(e.customData).filter(
                ([k]) =>
                  ![
                    "currency",
                    "value",
                    "contentName",
                    "contentCategory",
                    "contentIds",
                    "contentType",
                    "searchString",
                    "numItems",
                  ].includes(k)
              )
            ),
          }
        : undefined,
    })),
    ...(TEST_CODE ? { test_event_code: TEST_CODE } : {}),
    access_token: TOKEN,
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      console.error("[meta-capi] error", data);
      return { ok: false, error: JSON.stringify(data) };
    }
    return {
      ok: true,
      events_received: data.events_received as number,
      fbtrace_id: data.fbtrace_id as string,
    };
  } catch (err) {
    console.error("[meta-capi] fetch failed", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

/**
 * Server-side ViewContent. Pair with the client-side `pixel.viewContent()`
 * call by passing the same eventId so Meta de-duplicates the two events.
 */
export async function capiViewContent(opts: {
  eventId: string;
  packageTitle?: string;
  packageSlug?: string;
  value?: number;
  email?: string;
  phone?: string;
  externalId?: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  clientUserAgent?: string;
  pageUrl?: string;
}): Promise<void> {
  await sendCapiEvents([
    {
      name: "ViewContent",
      eventId: opts.eventId,
      eventSourceUrl: opts.pageUrl,
      user: {
        email: opts.email,
        phone: opts.phone,
        country: "in",
        externalId: opts.externalId,
        fbp: opts.fbp,
        fbc: opts.fbc,
        clientIp: opts.clientIp,
        clientUserAgent: opts.clientUserAgent,
      },
      customData: {
        currency: "INR",
        value: opts.value ?? 0,
        contentName: opts.packageTitle,
        contentIds: opts.packageSlug ? [opts.packageSlug] : undefined,
        contentType: "product",
      },
    },
  ]).catch((e) => console.error("[meta-capi] capiViewContent failed", e));
}

/**
 * Convenience: capture a Lead event from a server route.
 * Returns the event_id so the browser-side Pixel can fire with the same id.
 */
export async function capiLead(opts: {
  email?: string;
  phone?: string;
  firstName?: string;
  city?: string;
  externalId?: string;
  value?: number;
  contentName?: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  clientUserAgent?: string;
  pageUrl?: string;
}): Promise<{ eventId: string }> {
  const eventId = newEventId();
  // Fire-and-forget — never block the response.
  sendCapiEvents([
    {
      name: "Lead",
      eventId,
      eventSourceUrl: opts.pageUrl,
      user: {
        email: opts.email,
        phone: opts.phone,
        firstName: opts.firstName,
        city: opts.city,
        country: "in",
        externalId: opts.externalId,
        fbp: opts.fbp,
        fbc: opts.fbc,
        clientIp: opts.clientIp,
        clientUserAgent: opts.clientUserAgent,
      },
      customData: {
        currency: "INR",
        value: opts.value ?? 0,
        contentName: opts.contentName,
      },
    },
  ]).catch((e) => console.error("[meta-capi] capiLead failed", e));
  return { eventId };
}
