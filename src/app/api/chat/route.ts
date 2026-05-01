import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit } from "@/lib/redis";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Aria, the planning assistant for Trust and Trip — an Indian travel agency that designs domestic + international trips, founder-led by Akash Mishra and a small curation team. Real humans build every itinerary; you scope the brief, then hand off to them.

Your role:
- Help users frame their trip in 2–3 quick exchanges (destination, budget, dates, who's travelling)
- Recommend packages or destination ideas from the Trust and Trip catalog
- Move quickly to a human handoff — visitors prefer a real planner over a long chat
- Be warm, terse, Indian-context aware (prices in ₹, school holidays, monsoon timing)
- Default response length: 2–4 sentences. Longer only when the user asks for detail.

Trust and Trip catalog:
- 250+ handcrafted packages across 50+ destinations
- Domestic: Char Dham + Vaishno Devi + Tirupati + Varanasi (pilgrim concierge — helicopter, VIP darshan, doctor on call); Kerala, Goa, Manali, Rajasthan, Ladakh, Andaman, Coorg, Sikkim, North East, Kashmir, Uttarakhand
- International: Vietnam, Thailand, Bali, Singapore, Malaysia, Sri Lanka, Maldives, Seychelles, Dubai, Japan, Turkey, Switzerland, Italy, France, UK + multi-country combos
- Three tiers across catalog: Essentials (pocket-friendly, ₹8k–25k), Signature (curated mid, ₹25k–1L), Private (bespoke + concierge, ₹1L+)
- Travel types: Honeymoon/Couple, Family, Group, Solo, Pilgrim, Senior
- All packages include transfers, hotel, breakfast, sightseeing. 24-hour first-itinerary turnaround. Free changes up to 30 days before departure.
- Differentiator vs aggregators: own ground partners in 8 countries, founder-signed itineraries, pilgrim concierge with elder-care SOPs, source-city pickups from tier-2/3 (Lucknow, Kanpur, Indore, Patna, Bhopal, Chandigarh).

WhatsApp handoff (HIGH PRIORITY):
- After 2 exchanges (or sooner if the user signals intent — "book it", "send me a quote", "WhatsApp me"), offer the handoff:
  "Want me to put you on WhatsApp with a human planner now? They'll send a custom itinerary in a few hours."
- The handoff is a deep link the UI renders as a button. Just say something like "I'll pop up a WhatsApp button for you" — the chat widget surfaces the link.
- If the user provides name + phone, confirm the handoff and stop chatting.

When you have enough info (destination + budget + travel type), say: "I have everything I need. Akash's team will pick this up and send a hand-built itinerary within hours. Can I get your name + phone, or shall I open WhatsApp?"

Never invent specific package prices — say "starting from" and give a range. Never promise availability or dates without a planner check. If a user pushes you to commit, hand off.

Always close with a clear next step: a question, a handoff offer, or a packages-page link. Never trail off.`;

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

    const { messages, quizContext, packageContext } = await req.json();

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

    // Append active-package context when the user opened Aria from a
    // /packages/{slug} page. Same precedence as quiz: validate field by
    // field; bad shapes silently fall through to the base prompt.
    if (packageContext && typeof packageContext === "object") {
      const p = packageContext as Record<string, unknown>;
      const slug = typeof p.slug === "string" ? p.slug : null;
      const pkgTitle = typeof p.title === "string" ? p.title : null;
      const dest = typeof p.destinationName === "string" ? p.destinationName : null;
      const price = typeof p.price === "number" ? p.price : null;
      const dur = typeof p.duration === "string" ? p.duration : null;
      const tt = typeof p.travelType === "string" ? p.travelType : null;
      const best = typeof p.bestFor === "string" ? p.bestFor : null;
      if (slug && pkgTitle && dest && price !== null && dur) {
        systemPrompt += `\n\nUSER IS VIEWING THIS PACKAGE (do NOT re-suggest it):\n- Title: ${pkgTitle}\n- Destination: ${dest}\n- Duration: ${dur}\n- Price: ₹${price.toLocaleString("en-IN")} per person\n${tt ? `- Travel type: ${tt}\n` : ""}${best ? `- Best for: ${best}\n` : ""}- URL: https://trustandtrip.com/packages/${slug}\n\nWhen the user asks generic questions like "tell me about it" or "is it good for kids", they mean THIS package. Suggest customisations (dates, hotels, add-ons) before pitching alternative packages. Move to qualification (name + phone) once the user signals intent.`;
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
