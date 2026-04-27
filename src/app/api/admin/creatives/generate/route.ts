// AI-generated ad creative variations.
//
// Hits the existing `docs/ads/creative-templates.json` style — 5 headlines,
// 5 primary texts, 3 CTA labels, 3 WhatsApp prefill messages — but generated
// fresh for any LP / audience combination.
//
// Auth: protected by middleware (matches /api/admin/*).
// Model: Sonnet 4.6 (mid-cost, brand-voice quality matters here).
// Cost: ~$0.02 per generation. Cache for 24h via Redis.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit, clientIp, cacheGet, cacheSet } from "@/lib/redis";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6";

interface GeneratedCreative {
  headlines: string[];           // 5 headlines, ≤40 char each
  primary_texts: string[];       // 5 primary texts, ≤125 char each (Meta limit)
  cta_buttons: string[];         // 3 CTAs from Meta's allow-list
  wa_messages: string[];         // 3 WhatsApp prefill messages
  notes: string;                 // 1-2 line strategy explanation
}

const SYSTEM = `You generate Meta Ads + Google Ads creative copy for Trust and Trip — an Indian travel agency.

VOICE
• Calm, considered, never hype-y. Brand line: "Crafting Reliable Travel".
• No clickbait, no all-caps, no exclamation marks, no banned superlatives ("amazing", "stunning", "breathtaking", "ultimate", "epic").
• Indian context first: assume the buyer is flying from an Indian metro, prices in ₹, vegetarian options matter.
• Borrow from the brand's actual differentiators: real planner (not chatbot), free first draft, ₹0 to start, pay only when sure, 4.9 ★ Google, 8,000+ travellers since 2019, INR pricing with no hidden TCS/GST.

CONSTRAINTS
• Headlines: ≤ 40 characters. Punchy. Numbers/prices welcome.
• Primary texts: ≤ 125 characters (Meta primary-text mobile cap). Hook in the first 6 words — "See more" hides the rest.
• CTA buttons: pick 3 from Meta's allow-list: "Get Quote", "Send Message", "Learn More", "Book Now", "Sign Up", "Get Offer".
• WhatsApp messages: write as the user would, first person, no marketing voice. e.g. "Hi Trust and Trip — I'd like a Maldives quote. My dates are flexible."
• Diverse angles across the 5 variants — price, social proof, planner-not-chatbot, urgency, lifestyle.

OUTPUT
Return ONE JSON object only, no markdown:
{
  "headlines": [string, string, string, string, string],
  "primary_texts": [string, string, string, string, string],
  "cta_buttons": [string, string, string],
  "wa_messages": [string, string, string],
  "notes": "1-2 lines explaining the angles you picked"
}`;

export async function POST(req: NextRequest) {
  const { allowed } = await rateLimit(`creative-gen:${clientIp(req)}`, {
    limit: 30,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY missing" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const lp = String(body.lp ?? "").trim();
  const destination = String(body.destination ?? "").trim();
  const audience = String(body.audience ?? "").trim();
  const angle = body.angle ? String(body.angle).trim() : undefined;
  const priceFrom = body.priceFrom ? Number(body.priceFrom) : undefined;
  const refresh = Boolean(body.refresh);

  if (!lp || !destination || !audience) {
    return NextResponse.json(
      { error: "lp, destination and audience are required" },
      { status: 400 }
    );
  }

  // Cache key — same inputs return same creatives unless ?refresh=true.
  const cacheKey = `creative-gen:${lp}:${destination}:${audience}:${angle ?? ""}:${priceFrom ?? ""}`;
  if (!refresh) {
    const hit = await cacheGet<GeneratedCreative>(cacheKey);
    if (hit) {
      return NextResponse.json({ creative: hit, cached: true });
    }
  }

  const userMsg = [
    `Generate creative for landing page: ${lp}`,
    `Destination: ${destination}`,
    `Audience: ${audience}`,
    angle ? `Angle / hook to lean into: ${angle}` : null,
    priceFrom ? `Lowest price to feature: ₹${priceFrom.toLocaleString("en-IN")} per person` : null,
    "",
    "Return the JSON only — no preamble.",
  ]
    .filter(Boolean)
    .join("\n");

  let creative: GeneratedCreative;
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userMsg }],
    });
    const txt = res.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text"
    );
    if (!txt) throw new Error("no text in response");
    const cleaned = txt.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    creative = JSON.parse(cleaned) as GeneratedCreative;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "generation failed" },
      { status: 500 }
    );
  }

  // Validate shape — fail fast if Claude went off-piste.
  const shapeOk =
    Array.isArray(creative.headlines) && creative.headlines.length === 5 &&
    Array.isArray(creative.primary_texts) && creative.primary_texts.length === 5 &&
    Array.isArray(creative.cta_buttons) && creative.cta_buttons.length === 3 &&
    Array.isArray(creative.wa_messages) && creative.wa_messages.length === 3;

  if (!shapeOk) {
    return NextResponse.json(
      { error: "model returned invalid shape", got: creative },
      { status: 502 }
    );
  }

  await cacheSet(cacheKey, creative, 24 * 3600).catch(() => undefined);

  return NextResponse.json({ creative, cached: false });
}
