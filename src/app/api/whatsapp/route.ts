import { NextRequest, NextResponse } from "next/server";

// WhatsApp Business Cloud API webhook handler
// Docs: developers.facebook.com/docs/whatsapp/cloud-api/webhooks

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "";
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
const PHONE_ID = process.env.WHATSAPP_PHONE_ID ?? "";

// Verify webhook (GET — Meta sends this to validate your endpoint)
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
  // Safely parse body — malformed JSON should not crash the handler
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Safely navigate the WhatsApp webhook payload
  const entry = (body?.entry as unknown[])?.[0] as Record<string, unknown> | undefined;
  const value = ((entry?.changes as unknown[])?.[0] as Record<string, unknown> | undefined)?.value as Record<string, unknown> | undefined;
  const message = (value?.messages as unknown[])?.[0] as Record<string, unknown> | undefined;

  if (!message) return NextResponse.json({ ok: true });

  const from = message.from as string;
  const text = ((message.text as Record<string, unknown>)?.body as string ?? "").toLowerCase().trim();
  const name = ((value?.contacts as unknown[])?.[0] as Record<string, unknown> | undefined)
    ?.profile as Record<string, unknown> | undefined;
  const senderName = (name?.name as string) ?? "there";

  // Auto-reply logic based on message content
  let reply = "";

  if (text.includes("honeymoon") || text.includes("couple")) {
    reply = `Hi ${senderName}! 💑 We specialise in handcrafted honeymoon packages to Bali, Maldives, Switzerland, Paris and more.\n\n✨ Starting from ₹45,000/person\n📅 Customised to your dates\n\nReply with your *destination* and *travel dates* and we'll send you a personalised itinerary within 2 hours! 🙏`;
  } else if (text.includes("family")) {
    reply = `Hi ${senderName}! 👨‍👩‍👧‍👦 Our family packages are designed for all ages — from toddlers to grandparents!\n\n🏖️ Popular: Dubai, Bali, Kerala, Rajasthan\n💰 Starting from ₹30,000/person\n\nHow many family members and which month are you planning? We'll send you perfect options!`;
  } else if (text.includes("price") || text.includes("cost") || text.includes("budget")) {
    reply = `Hi ${senderName}! 💰 Our packages start from just ₹10,000/person for domestic and ₹35,000/person for international.\n\n📋 We have options for every budget:\n• Budget: under ₹35K/person\n• Standard: ₹35K–₹1L/person\n• Premium: ₹1L+/person\n\nWhich destination interests you? We'll find the best option in your budget!`;
  } else if (text.includes("bali")) {
    reply = `🌴 Bali is one of our most popular destinations!\n\n✈️ *Our Bali Packages:*\n• 4N/5D Honeymoon Escape — ₹55,000/person\n• 5N/6D Wellness Retreat — ₹42,000/person\n• 6N/7D Family Adventure — ₹72,000/person\n\nAll include transfers, hotel, breakfast & sightseeing.\n\nWhich package interests you, ${senderName}? 😊`;
  } else if (text.includes("maldives")) {
    reply = `🏝️ The Maldives — where every moment feels like a dream!\n\n✈️ *Our Maldives Packages:*\n• 5N/6D Overwater Villa Retreat — ₹95,000/person\n• 4N/5D Budget Beach Escape — ₹68,000/person\n\nBeach villas, snorkelling, sunset cruises — all included.\n\nWhen are you planning to travel, ${senderName}? 🌅`;
  } else if (text.includes("hi") || text.includes("hello") || text.includes("namaste") || text === "") {
    reply = `Hello ${senderName}! 🙏 Welcome to *Trust and Trip*!\n\nWe craft personalised travel experiences across 23+ destinations.\n\nHow can we help you today? Just reply with:\n• A *destination* (e.g. Bali, Kerala, Dubai)\n• A *travel type* (Honeymoon, Family, Solo, Group)\n• Your *budget* range\n\nOr visit us at trustandtrip.com 🌍`;
  } else {
    reply = `Hi ${senderName}! 🙏 Thanks for reaching out to *Trust and Trip*!\n\nWe design handcrafted travel packages across 23+ destinations — honeymoons, family holidays, solo adventures and group tours.\n\n👉 Tell us:\n1. Where do you want to go?\n2. When are you planning to travel?\n3. How many people?\n\nA dedicated planner will reply within 2 hours! 😊`;
  }

  if (reply && WA_TOKEN && PHONE_ID) {
    await sendWhatsAppMessage(from, reply);
  }

  return NextResponse.json({ ok: true });
}

async function sendWhatsAppMessage(to: string, text: string) {
  try {
    await fetch(`https://graph.facebook.com/v19.0/${PHONE_ID}/messages`, {
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
