import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit } from "@/lib/redis";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Aria, a friendly and knowledgeable travel assistant for Trust and Trip — a premium Indian travel agency.

Your role:
- Help users plan trips, suggest packages, answer travel questions
- Qualify leads by understanding their destination, budget, travel type, dates
- Be warm, concise, and enthusiastic — like a friend who knows travel
- Always respond in 2-4 sentences max unless the user asks for detail
- Use Indian context: mention prices in ₹, reference Indian holidays, direct flights from Indian metros

Trust and Trip offers:
- 130+ handcrafted packages across 23 destinations
- Domestic: Kerala, Goa, Manali, Rajasthan, Ladakh, Andaman, Shimla, Coorg, Varanasi, Agra
- International: Bali, Maldives, Dubai, Thailand, Switzerland, Paris, Japan, Singapore, Nepal, Turkey, Malaysia, Australia, Sri Lanka
- Travel types: Honeymoon/Couple, Family, Group, Solo
- Price range: ₹10,000 – ₹3,00,000 per person
- All packages include: transfers, hotel, breakfast, sightseeing
- 24/7 support, no hidden costs, free cancellation up to 30 days

When users ask about specific packages, suggest they visit the packages page or click "Talk to a planner".
When you have enough info (destination + budget + travel type), say: "I have everything I need! Let me connect you with a planner who will send a custom itinerary within 2 hours. Can I get your name and phone number?"

Never make up specific package prices — say "starting from" and give a range.
Keep responses conversational and helpful.`;

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 20 messages per IP per minute
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed, remaining } = await rateLimit(`chat:${ip}`, { limit: 20, windowSeconds: 60 });

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a moment before continuing." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      );
    }

    const { messages, quizContext } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI not configured." }, { status: 503 });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages." }, { status: 400 });
    }

    const recentMessages = messages.slice(-10);

    // Append quiz context to system prompt when the user reached Aria via the
    // /quiz handoff. Lets Aria reason against real answers instead of asking
    // them again. Validated minimally — bad shapes get ignored.
    let systemPrompt = SYSTEM_PROMPT;
    if (quizContext && typeof quizContext === "object") {
      const q = quizContext as Record<string, unknown>;
      const tt = typeof q.travelType === "string" ? q.travelType : null;
      const v = typeof q.vibe === "string" ? q.vibe : null;
      const d = typeof q.duration === "string" ? q.duration : null;
      const b = typeof q.budget === "string" ? q.budget : null;
      const matchTitle = typeof q.topMatchTitle === "string" ? q.topMatchTitle : null;
      const matchSlug = typeof q.topMatchSlug === "string" ? q.topMatchSlug : null;
      if (tt && v && d && b) {
        const dur = d === "10+" ? "10+ days" : `${d} days`;
        const bud = b === "lt50k" ? "under ₹50k" : b === "50-100k" ? "₹50k–₹1L" : "₹1L+";
        systemPrompt += `\n\nUSER QUIZ CONTEXT (already given — do NOT ask again):\n- Travelling: ${tt}\n- Vibe: ${v}\n- Duration: ${dur}\n- Budget: ${bud} per person\n${matchTitle ? `- Top match shown: ${matchTitle}${matchSlug ? ` (slug: ${matchSlug})` : ""}\n` : ""}\nReference these directly. Skip discovery questions about destination/budget/travel type/duration. Move straight to customisation, comparison, or qualification (name + phone).`;
      }
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: systemPrompt,
      messages: recentMessages,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock?.type === "text" ? textBlock.text : "";
    return NextResponse.json(
      { message: text },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Failed to get response." }, { status: 500 });
  }
}
