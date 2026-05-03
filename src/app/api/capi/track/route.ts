// Generic CAPI passthrough — client-triggered server-side event mirror.

export const dynamic = "force-dynamic";
//
// Used to dedup browser Pixel events with server-side CAPI for events the
// client must trigger (ViewContent, Search, etc). Browser fires Pixel with
// eventID=X; here we POST CAPI with the same X. Meta dedups.
//
// We deliberately keep this thin and rate-limited — it is NOT a generic
// trust boundary. Don't accept arbitrary event names or values without
// further validation.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { rateLimit, clientIp } from "@/lib/redis";
import {
  sendCapiEvents,
  ipFromRequest,
  readMarketingConsentFromCookies,
  type CapiEventName,
} from "@/lib/meta-capi";

const ALLOWED_EVENTS: Set<CapiEventName> = new Set([
  "ViewContent",
  "Search",
  "Contact",
]);

export async function POST(req: NextRequest) {
  // Rate-limit aggressively — bots have no business hitting this.
  const { allowed } = await rateLimit(`capi-track:${clientIp(req)}`, {
    limit: 60,
    windowSeconds: 60,
  });
  if (!allowed) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const eventName = String(body.eventName ?? "") as CapiEventName;
  if (!ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ ok: false, error: "event_not_allowed" }, { status: 400 });
  }

  const eventId = String(body.eventId ?? "").trim();
  if (!eventId || eventId.length > 64) {
    return NextResponse.json({ ok: false, error: "bad_event_id" }, { status: 400 });
  }

  const fbp = cookies().get("_fbp")?.value;
  const fbc = cookies().get("_fbc")?.value;
  const consentAllowed = await readMarketingConsentFromCookies();

  // Fire-and-forget — never block the client beacon.
  sendCapiEvents(
    [
      {
        name: eventName,
        eventId,
        eventSourceUrl: typeof body.pageUrl === "string" ? body.pageUrl : undefined,
        actionSource: "website",
        user: {
          country: "in",
          fbp,
          fbc,
          clientIp: ipFromRequest(req),
          clientUserAgent: req.headers.get("user-agent") ?? undefined,
        },
        customData: {
          currency: "INR",
          value: typeof body.value === "number" ? body.value : undefined,
          contentName: typeof body.contentName === "string" ? body.contentName : undefined,
          contentIds: Array.isArray(body.contentIds)
            ? (body.contentIds as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 10)
            : undefined,
          contentCategory: typeof body.contentCategory === "string" ? body.contentCategory : undefined,
          contentType: body.contentType === "product_group" ? "product_group" : "product",
          searchString: typeof body.searchString === "string" ? body.searchString : undefined,
        },
      },
    ],
    consentAllowed,
  ).catch((e) => console.error("[capi-track] failed", e));

  return NextResponse.json({ ok: true });
}
