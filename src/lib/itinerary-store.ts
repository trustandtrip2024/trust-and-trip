// Persists generated itineraries for history / cost tracking.
//
// Fire-and-forget — never blocks engine response. Silently no-ops if
// Supabase env vars aren't configured (dev / test).

import type { GeneratedItinerary, GenerateResult, ItineraryIntent } from "./itinerary-engine";

interface StoreOpts {
  intent: ItineraryIntent;
  itinerary: GeneratedItinerary;
  matchedPackages: GenerateResult["matchedPackages"];
  usage: GenerateResult["usage"];
  source: "api" | "stream" | "whatsapp" | "regenerate";
  /** Best-effort lead match by phone or email. Optional — ops can backfill later. */
  contactPhone?: string;
  contactEmail?: string;
}

export async function storeItinerary(opts: StoreOpts): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let leadId: string | null = null;
    if (opts.contactPhone || opts.contactEmail) {
      const phone = (opts.contactPhone ?? "").replace(/\D/g, "");
      const phoneTail = phone.length >= 10 ? phone.slice(-10) : null;
      const email = (opts.contactEmail ?? "").trim().toLowerCase();
      const filters: string[] = [];
      if (phoneTail) filters.push(`phone.ilike.%${phoneTail}`);
      if (email) filters.push(`email.eq.${email}`);
      if (filters.length) {
        const { data } = await sb
          .from("leads")
          .select("id")
          .or(filters.join(","))
          .order("created_at", { ascending: false })
          .limit(1);
        leadId = (data?.[0]?.id as string) ?? null;
      }
    }

    await sb.from("itineraries").insert({
      lead_id: leadId,
      destination: opts.intent.destination,
      travel_type: opts.intent.travelType,
      days: opts.intent.days,
      source: opts.source,
      itinerary: opts.itinerary as unknown as Record<string, unknown>,
      matched_packages: opts.matchedPackages as unknown as Record<string, unknown>[],
      input_tokens: opts.usage.inputTokens,
      output_tokens: opts.usage.outputTokens,
      cache_read_tokens: opts.usage.cacheReadInputTokens,
      duration_ms: opts.usage.durationMs,
      tool_calls: opts.usage.toolCalls,
    });
  } catch (e) {
    console.error("[itinerary-store] insert failed", e);
  }
}
