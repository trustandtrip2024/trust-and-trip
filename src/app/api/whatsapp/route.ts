import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { pushLead } from "@/lib/bitrix24";
import { generateItinerary } from "@/lib/itinerary-engine";
import { deliverItinerary } from "@/lib/itinerary-deliver";
import {
  parseWhatsAppIntent,
  isIntentComplete,
  toItineraryIntent,
  nextClarifyingQuestion,
} from "@/lib/whatsapp-intent";

// WhatsApp Business Cloud API webhook handler
// Docs: developers.facebook.com/docs/whatsapp/cloud-api/webhooks

export const maxDuration = 60;

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "";
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
const PHONE_ID = process.env.WHATSAPP_PHONE_ID ?? "";
// App secret used to sign the X-Hub-Signature-256 header. Get this from the
// Meta app dashboard → App Settings → Basic → App Secret. Required for
// webhook signature verification.
const APP_SECRET = process.env.WHATSAPP_APP_SECRET ?? "";

/**
 * Verify the X-Hub-Signature-256 header against the raw request body using
 * the Meta app secret. Returns true when the request is authentic, false
 * otherwise. If APP_SECRET is unset we refuse all POSTs — fail closed.
 */
function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!APP_SECRET) return false;
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expected = crypto
    .createHmac("sha256", APP_SECRET)
    .update(rawBody)
    .digest("hex");
  const provided = signatureHeader.slice("sha256=".length);
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
}

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : null;

// Verify webhook (GET — Meta sends this once)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// Receive incoming WhatsApp messages (POST)
export async function POST(req: NextRequest) {
  // Read the raw body once — we need the exact bytes for HMAC verification,
  // and Next.js doesn't let us call req.text() AND req.json() on the same
  // request.
  const rawBody = await req.text();

  // Reject anything that fails the X-Hub-Signature-256 check. Stops attackers
  // from POSTing fake WhatsApp payloads to spam the leads pipeline.
  if (!verifySignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return new Response("invalid signature", { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const entry = (body?.entry as unknown[])?.[0] as Record<string, unknown> | undefined;
  const value = ((entry?.changes as unknown[])?.[0] as Record<string, unknown> | undefined)
    ?.value as Record<string, unknown> | undefined;
  const message = (value?.messages as unknown[])?.[0] as Record<string, unknown> | undefined;
  if (!message) return NextResponse.json({ ok: true });

  const from = message.from as string;
  const text = (((message.text as Record<string, unknown>) ?? {}).body as string) ?? "";
  const cleanText = text.trim();
  const profile = ((value?.contacts as unknown[])?.[0] as Record<string, unknown> | undefined)
    ?.profile as Record<string, unknown> | undefined;
  const senderName = ((profile?.name as string) ?? "there").trim();

  // CRM capture — fire-and-forget so we don't block the WA reply.
  void recordWhatsAppLead({ from, name: senderName, message: cleanText });

  // Parse intent → engine if complete, else clarifying question.
  const parsed = await parseWhatsAppIntent(cleanText);

  if (!parsed || parsed.isGreeting || !cleanText) {
    await sendWhatsAppMessage(from, greetingMessage(senderName));
    return NextResponse.json({ ok: true });
  }

  if (!isIntentComplete(parsed)) {
    const q = nextClarifyingQuestion(parsed);
    await sendWhatsAppMessage(from, q ? `${q}\n\n_Trust and Trip_ 🌿` : greetingMessage(senderName));
    return NextResponse.json({ ok: true });
  }

  const intent = toItineraryIntent(parsed);
  if (!intent) {
    await sendWhatsAppMessage(from, greetingMessage(senderName));
    return NextResponse.json({ ok: true });
  }

  await sendWhatsAppMessage(
    from,
    `Got it ${senderName}. Building your ${intent.days}-day ${intent.travelType.toLowerCase()} draft for ${intent.destination} — back in under a minute.`
  );

  // Engine + delivery in the background after the webhook ACK.
  (async () => {
    try {
      const result = await generateItinerary(intent);
      await deliverItinerary({
        itinerary: result.itinerary,
        matchedPackages: result.matchedPackages,
        contact: { name: senderName, phone: from },
        channels: { email: false, whatsapp: true },
      });
    } catch (err) {
      console.error("[whatsapp] engine/deliver failed", err);
      await sendWhatsAppMessage(
        from,
        `Sorry ${senderName} — our planner system hit a snag. A real planner will reach out shortly. 🙏`
      );
    }
  })();

  return NextResponse.json({ ok: true });
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function greetingMessage(name: string): string {
  return `Hi ${name}! 🙏 Welcome to *Trust and Trip*.

Tell us in one message:
1. *Destination* — Bali, Maldives, Switzerland, Kerala, Char Dham, etc.
2. *Days* — 5, 7, 10
3. *Type* — Honeymoon, Family, Solo, Group, Pilgrim, Adventure
(Optional: budget per person, travel month, departing city)

We'll build your draft itinerary in under a minute.`;
}

async function recordWhatsAppLead({
  from,
  name,
  message,
}: {
  from: string;
  name: string;
  message: string;
}) {
  try {
    if (supabase) {
      await supabase
        .from("leads")
        .insert({
          name: name || "WhatsApp Visitor",
          phone: from,
          email: "",
          message: message.slice(0, 2000),
          source: "whatsapp",
          status: "new",
        });
    }
  } catch (e) {
    console.error("[whatsapp] supabase insert failed", e);
  }

  try {
    await pushLead({
      name: name || "WhatsApp Visitor",
      phone: from,
      email: "",
      message: message.slice(0, 2000),
      source: "whatsapp",
    });
  } catch (e) {
    console.error("[whatsapp] bitrix push failed", e);
  }
}

async function sendWhatsAppMessage(to: string, text: string) {
  if (!WA_TOKEN || !PHONE_ID) return;
  try {
    await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WA_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });
  } catch (err) {
    console.error("[whatsapp] sendWhatsAppMessage failed:", err);
  }
}
