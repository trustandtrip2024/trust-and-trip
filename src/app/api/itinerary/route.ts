import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit } from "@/lib/redis";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed } = await rateLimit(`itinerary:${ip}`, { limit: 5, windowSeconds: 3600 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again in an hour." }, { status: 429 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI not configured." }, { status: 503 });
    }

    const { destination, days, travelType, budget, fromCity, interests } = await req.json();

    if (!destination || !days || !travelType) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const prompt = `Generate a detailed ${days}-day travel itinerary for ${destination}, India/abroad.

Trip details:
- Destination: ${destination}
- Duration: ${days} days
- Travel type: ${travelType}
- Budget: ${budget || "moderate"} (Indian rupees)
- Departing from: ${fromCity || "Delhi"}
- Special interests: ${interests || "general sightseeing and local experiences"}

Return ONLY valid JSON in this exact structure (no markdown, no explanation):
{
  "title": "Trip title (evocative, 6-8 words)",
  "tagline": "One compelling sentence about this journey",
  "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4"],
  "bestTimeToVisit": "e.g. October to March",
  "estimatedCost": "e.g. ₹45,000 – ₹65,000 per person",
  "days": [
    {
      "day": 1,
      "title": "Arrival & First Impressions",
      "morning": "Detailed morning activity with specific places and tips",
      "afternoon": "Detailed afternoon activity",
      "evening": "Detailed evening activity with restaurant/experience suggestion",
      "stay": "Hotel/accommodation type recommendation",
      "tip": "One practical local tip for this day"
    }
  ],
  "packingTips": ["tip 1", "tip 2", "tip 3"],
  "visaInfo": "Brief visa/travel document info for Indians"
}

Rules:
- Be specific: use real place names, actual restaurants, actual attractions
- Indian context: mention distances from Indian metros, Indian vegetarian food options
- Each day's morning/afternoon/evening should be 2-3 sentences
- Generate exactly ${days} day objects
- Keep estimatedCost realistic for Indian travellers`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON — strip any accidental markdown fences
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const itinerary = JSON.parse(cleaned);

    return NextResponse.json({ itinerary });
  } catch (err) {
    console.error("Itinerary generation error:", err);
    return NextResponse.json({ error: "Failed to generate itinerary. Please try again." }, { status: 500 });
  }
}
