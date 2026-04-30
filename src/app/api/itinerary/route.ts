import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { rateLimit } from "@/lib/redis";
import {
  generateItinerary,
  type ItineraryIntent,
} from "@/lib/itinerary-engine";
import { deliverItinerary } from "@/lib/itinerary-deliver";
import { storeItinerary } from "@/lib/itinerary-store";

export const maxDuration = 60;

const TRAVEL_TYPES = [
  "Couple",
  "Family",
  "Solo",
  "Group",
  "Pilgrim",
  "Luxury",
  "Adventure",
  "Wellness",
] as const;

function coerceIntent(body: Record<string, unknown>): ItineraryIntent | { error: string } {
  const destination = String(body.destination ?? "").trim();
  const days = Number(body.days);
  const travelType = String(body.travelType ?? body.travel_type ?? "").trim();

  if (!destination) return { error: "Missing destination." };
  if (!Number.isInteger(days) || days < 1 || days > 21)
    return { error: "Days must be an integer between 1 and 21." };
  if (!TRAVEL_TYPES.includes(travelType as (typeof TRAVEL_TYPES)[number]))
    return { error: `travelType must be one of: ${TRAVEL_TYPES.join(", ")}` };

  const intent: ItineraryIntent = {
    destination,
    days,
    travelType: travelType as ItineraryIntent["travelType"],
    budgetPerPerson: body.budgetPerPerson ? Number(body.budgetPerPerson) : undefined,
    fromCity: body.fromCity ? String(body.fromCity) : undefined,
    travelers: body.travelers ? Number(body.travelers) : undefined,
    interests: body.interests ? String(body.interests) : undefined,
    travelMonth: body.travelMonth ? String(body.travelMonth) : undefined,
    flexibility:
      body.flexibility === "exact" || body.flexibility === "flexible"
        ? body.flexibility
        : undefined,
  };
  return intent;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed } = await rateLimit(`itinerary:${ip}`, { limit: 5, windowSeconds: 3600 });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in an hour." },
        { status: 429 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI not configured." }, { status: 503 });
    }

    const body = await req.json();
    const parsed = coerceIntent(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const result = await generateItinerary(parsed);

    // Optional delivery — fire-and-forget, never blocks response.
    const contactEmail = body.email ? String(body.email).trim() : undefined;
    const contactPhone = body.phone ? String(body.phone).trim() : undefined;
    const contactName = body.name ? String(body.name).trim() : undefined;
    if (contactEmail || contactPhone) {
      deliverItinerary({
        itinerary: result.itinerary,
        matchedPackages: result.matchedPackages,
        contact: { name: contactName, email: contactEmail, phone: contactPhone },
      }).catch((e) => console.error("[itinerary] delivery failed", e));
    }

    // Persist for history / cost tracking — fire-and-forget.
    void storeItinerary({
      intent: parsed,
      itinerary: result.itinerary,
      matchedPackages: result.matchedPackages,
      usage: result.usage,
      source: "api",
      contactPhone,
      contactEmail,
    });

    return NextResponse.json({
      itinerary: result.itinerary,
      matchedPackages: result.matchedPackages,
      usage: result.usage,
      delivered: Boolean(contactEmail || contactPhone),
    });
  } catch (err) {
    console.error("Itinerary generation error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate itinerary.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
