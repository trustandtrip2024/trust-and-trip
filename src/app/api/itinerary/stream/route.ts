// Streaming itinerary draft via Server-Sent Events.
//
// Sub-2s perceived latency: the client sees "Searching Bali packages…",
// then live text chunks as the planner drafts day-by-day, then the
// structured itinerary JSON. Same engine as /api/itinerary, just streamed.
//
// Wire format: each event is a JSON line prefixed with "data: " and
// terminated by "\n\n", standard SSE. Phase enum:
//   started · tool_use · tool_result · drafting · delta · done · error
//
// Client side: use new EventSource() against this URL after a POST that
// returns a stream token, OR use `fetch` + ReadableStream.getReader() on
// a POST directly (we accept POST and return the SSE stream).

import { NextRequest } from "next/server";
import { rateLimit, clientIp } from "@/lib/redis";
import {
  generateItineraryStreaming,
  type ItineraryIntent,
  type StreamEvent,
} from "@/lib/itinerary-engine";
import { deliverItinerary } from "@/lib/itinerary-deliver";
import { storeItinerary } from "@/lib/itinerary-store";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

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

  return {
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
}

function sse(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  const { allowed } = await rateLimit(`itinerary-stream:${clientIp(req)}`, {
    limit: 5,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return new Response(
      sse({ phase: "error", message: "Too many requests. Try again in an hour." }),
      { status: 429, headers: { "Content-Type": "text/event-stream; charset=utf-8" } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(
      sse({ phase: "error", message: "bad_json" }),
      { status: 400, headers: { "Content-Type": "text/event-stream; charset=utf-8" } }
    );
  }

  const parsed = coerceIntent(body);
  if ("error" in parsed) {
    return new Response(
      sse({ phase: "error", message: parsed.error }),
      { status: 400, headers: { "Content-Type": "text/event-stream; charset=utf-8" } }
    );
  }

  const contactEmail = body.email ? String(body.email).trim() : undefined;
  const contactPhone = body.phone ? String(body.phone).trim() : undefined;
  const contactName = body.name ? String(body.name).trim() : undefined;

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: StreamEvent) => {
        try {
          controller.enqueue(encoder.encode(sse(e)));
        } catch {
          // Client disconnected — swallow.
        }
      };

      // Heartbeat so proxies (Vercel, Cloudflare) keep the connection open
      // during long pauses between events.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15_000);

      try {
        await generateItineraryStreaming(parsed, async (e) => {
          send(e);

          // After "done" is sent, fire delivery + persist in the background.
          if (e.phase === "done") {
            if (contactEmail || contactPhone) {
              deliverItinerary({
                itinerary: e.itinerary,
                matchedPackages: e.matchedPackages,
                contact: { name: contactName, email: contactEmail, phone: contactPhone },
              }).catch((err) => console.error("[itinerary/stream] delivery failed", err));
            }
            void storeItinerary({
              intent: parsed,
              itinerary: e.itinerary,
              matchedPackages: e.matchedPackages,
              usage: e.usage,
              source: "stream",
              contactPhone,
              contactEmail,
            });
          }
        });
      } catch (err) {
        send({
          phase: "error",
          message: err instanceof Error ? err.message : "stream failed",
        });
      } finally {
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable Nginx buffering if behind one
    },
  });
}
