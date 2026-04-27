// WhatsApp message → itinerary intent parser.
// Uses Claude Haiku 4.5 (cheapest tier) to extract structured intent from
// free-form WA messages. Returns { intent, missing, ack } so the webhook
// can decide whether to fire the engine or ask one clarifying question.

import Anthropic from "@anthropic-ai/sdk";
import type { ItineraryIntent } from "./itinerary-engine";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM = `You parse a WhatsApp message from a prospect of Trust and Trip (an Indian travel agency) into a structured travel intent.

Extract any of: destination (free text → match to known slugs if you can: bali, maldives, thailand, switzerland, kerala, uttarakhand, dubai, singapore, bhutan, nepal, vietnam, srilanka, japan, mauritius), days (number 2-21), travelType (Couple|Family|Solo|Group|Pilgrim|Luxury|Adventure|Wellness), travelers (number), budgetPerPerson (INR), fromCity, travelMonth, interests (free text).

Map common phrases:
- "honeymoon" → travelType=Couple
- "family trip" / "with kids" → travelType=Family
- "solo trip" / "alone" → travelType=Solo
- "group of N" → travelType=Group, travelers=N
- "yatra" / "char dham" / "kedarnath" / "badrinath" → travelType=Pilgrim
- "luxury" / "5 star" → travelType=Luxury
- "trek" / "rafting" / "adventure" → travelType=Adventure
- "wellness" / "yoga" / "ayurveda" → travelType=Wellness

Return JSON ONLY, this exact shape (any field may be null if not stated):

{
  "destination": string|null,
  "days": number|null,
  "travelType": string|null,
  "travelers": number|null,
  "budgetPerPerson": number|null,
  "fromCity": string|null,
  "travelMonth": string|null,
  "interests": string|null,
  "isGreeting": boolean
}

isGreeting=true if the user only said hi/hello/namaste/etc with no real intent.`;

export interface ParsedWhatsAppIntent {
  destination: string | null;
  days: number | null;
  travelType: string | null;
  travelers: number | null;
  budgetPerPerson: number | null;
  fromCity: string | null;
  travelMonth: string | null;
  interests: string | null;
  isGreeting: boolean;
}

export async function parseWhatsAppIntent(text: string): Promise<ParsedWhatsAppIntent | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: text.slice(0, 800) }],
    });

    const textBlock = res.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text"
    );
    if (!textBlock) return null;
    const cleaned = textBlock.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as ParsedWhatsAppIntent;
  } catch (err) {
    console.error("[wa-intent] parse failed", err);
    return null;
  }
}

/**
 * Decide whether the parsed intent has enough to fire the itinerary engine.
 * Minimum: destination + days + travelType.
 */
export function isIntentComplete(p: ParsedWhatsAppIntent | null): p is ParsedWhatsAppIntent & { destination: string; days: number; travelType: string } {
  return !!p && !!p.destination && !!p.days && !!p.travelType;
}

/** Convert parsed intent to engine intent (filling defaults where safe). */
export function toItineraryIntent(p: ParsedWhatsAppIntent): ItineraryIntent | null {
  if (!isIntentComplete(p)) return null;
  const allowed = ["Couple", "Family", "Solo", "Group", "Pilgrim", "Luxury", "Adventure", "Wellness"] as const;
  const t = allowed.find((a) => a.toLowerCase() === p.travelType!.toLowerCase());
  if (!t) return null;
  return {
    destination: p.destination!,
    days: Math.min(21, Math.max(2, p.days!)),
    travelType: t,
    travelers: p.travelers ?? undefined,
    budgetPerPerson: p.budgetPerPerson ?? undefined,
    fromCity: p.fromCity ?? undefined,
    travelMonth: p.travelMonth ?? undefined,
    interests: p.interests ?? undefined,
  };
}

/** Build a follow-up question for the missing field (one at a time). */
export function nextClarifyingQuestion(p: ParsedWhatsAppIntent): string | null {
  if (!p.destination)  return "Where would you like to travel? (e.g. Bali, Maldives, Switzerland, Kerala)";
  if (!p.days)         return "How many days are you planning? (e.g. 5, 7, 10)";
  if (!p.travelType)   return "Is this a honeymoon, family, solo, group, or pilgrim trip?";
  return null;
}
