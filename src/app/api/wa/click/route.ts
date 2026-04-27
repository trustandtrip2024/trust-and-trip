// WhatsApp click tracker.
//
// Wraps wa.me deeplinks behind a server redirect so every click is captured:
// • Inserts a "whatsapp_click" lead row with UTM + page_url
// • Fires Meta CAPI Contact event for ad-optimizer signal
// • 302 redirects to https://wa.me/<num>?text=<message>
//
// Usage:
//   /api/wa/click?phone=918115999588&msg=Hi%20...&src=lp_maldives
//
// Phone, msg, and src are all optional but `phone` defaults to the brand
// number. We never echo the phone in the response — Meta CAPI handles
// hashing for the user_data block.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { sendCapiEvents, ipFromRequest } from "@/lib/meta-capi";
import crypto from "crypto";

const DEFAULT_PHONE = "918115999588";

// 3 message variants — A/B/C rotated server-side. Caller can override
// with ?msg=… (deeplinks from email/CRM keep their canned message).
// Track wa_variant in the lead row → /admin/attribution/creatives shows
// CVR per variant so you know which copy converts.
const MESSAGE_VARIANTS: Record<string, (dest?: string) => string> = {
  A: (d = "a trip") =>
    `Hi Trust and Trip — I'd like a free draft itinerary for ${d}. My dates are flexible.`,
  B: (d = "a trip") =>
    `Hi! Saw your ${d} package. Can you send a sample itinerary + price?`,
  C: (d = "a trip") =>
    `Hi Trust and Trip — quick question about ${d}. When are the best dates this year?`,
};

function pickVariant(): "A" | "B" | "C" {
  const r = Math.random();
  return r < 1 / 3 ? "A" : r < 2 / 3 ? "B" : "C";
}

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : null;

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const phoneRaw = url.searchParams.get("phone")?.replace(/\D/g, "") || DEFAULT_PHONE;
  const callerMsg = url.searchParams.get("msg");
  const dest = url.searchParams.get("dest") || undefined; // optional, used by variant template
  const src = url.searchParams.get("src") || "site"; // e.g. lp_maldives, header, footer
  const utmSource = url.searchParams.get("utm_source") || undefined;
  const utmMedium = url.searchParams.get("utm_medium") || undefined;
  const utmCampaign = url.searchParams.get("utm_campaign") || undefined;
  const utmContent = url.searchParams.get("utm_content") || undefined;
  const utmTerm = url.searchParams.get("utm_term") || undefined;
  const referer = req.headers.get("referer") || undefined;

  // Caller-provided ?msg= takes priority. Otherwise rotate A/B/C.
  let variant: string | undefined = url.searchParams.get("variant") ?? undefined;
  let msg = callerMsg ?? "";
  if (!msg) {
    const v = (variant && MESSAGE_VARIANTS[variant.toUpperCase()] ? variant.toUpperCase() : pickVariant());
    variant = v;
    msg = MESSAGE_VARIANTS[v](dest);
  }

  // Build the canonical wa.me target.
  const phone = phoneRaw.length === 10 ? `91${phoneRaw}` : phoneRaw;
  const target = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

  // Fire-and-forget capture so the redirect is sub-50ms.
  void recordClick({
    phone,
    msg,
    src,
    variant,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    referer,
    fbp: cookies().get("_fbp")?.value,
    fbc: cookies().get("_fbc")?.value,
    clientIp: ipFromRequest(req),
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.redirect(target, { status: 302 });
}

interface CaptureInput {
  phone: string;
  msg: string;
  src: string;
  variant?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referer?: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
}

async function recordClick(input: CaptureInput) {
  // Supabase row — uses the existing whatsapp_click intent source.
  try {
    if (supabase) {
      await supabase.from("leads").insert({
        name: "WhatsApp click",
        email: "",
        phone: "", // we're tracking the brand's number, not the user's
        message: input.msg.slice(0, 500),
        source: "whatsapp_click",
        utm_source: input.utmSource,
        utm_medium: input.utmMedium,
        utm_campaign: input.utmCampaign,
        utm_content: input.utmContent,
        utm_term: input.utmTerm,
        wa_variant: input.variant,
        page_url: input.referer,
        status: "new",
      });
    }
  } catch (e) {
    console.error("[wa-click] supabase insert failed", e);
  }

  // CAPI Contact — small but useful optimizer signal.
  const eventId = crypto.randomUUID();
  sendCapiEvents([
    {
      name: "Contact",
      eventId,
      eventSourceUrl: input.referer,
      actionSource: "website",
      user: {
        country: "in",
        fbp: input.fbp,
        fbc: input.fbc,
        clientIp: input.clientIp,
        clientUserAgent: input.userAgent,
      },
      customData: {
        currency: "INR",
        contentName: `whatsapp_click:${input.src}`,
      },
    },
  ]).catch((e) => console.error("[wa-click] capi failed", e));
}
