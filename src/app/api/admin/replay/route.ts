// /api/admin/replay — re-run the itinerary engine on a past intent.
//
// Useful for prompt-eval workflows: edit the system prompt in
// itinerary-engine.ts, hit /api/admin/replay?id=<old-itineraries.id>, compare
// new output to the stored one. Pair with /admin/agents to test ad-hoc
// inputs.
//
// Body / query: { id: <itinerary uuid> }  →  re-runs engine with the same
// destination/days/travelType/etc. Returns the new result alongside the
// stored "original" so you can diff side by side.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateItinerary, type ItineraryIntent } from "@/lib/itinerary-engine";
import { storeItinerary } from "@/lib/itinerary-store";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StoredRow {
  id: string;
  destination: string;
  travel_type: string;
  days: number;
  itinerary: Record<string, unknown>;
  matched_packages: Record<string, unknown>[] | null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const id = String(body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  // Optional overrides — bump days, swap travel type, etc, while keeping
  // the same destination + intent for fair comparison.
  const overrides: Partial<ItineraryIntent> = {
    days: body.days ? Number(body.days) : undefined,
    travelType: body.travelType as ItineraryIntent["travelType"] | undefined,
    interests: body.interests ? String(body.interests) : undefined,
    budgetPerPerson: body.budgetPerPerson ? Number(body.budgetPerPerson) : undefined,
  };

  const { data, error } = await supabase
    .from("itineraries")
    .select("id, destination, travel_type, days, itinerary, matched_packages")
    .eq("id", id)
    .single();
  if (error || !data) return NextResponse.json({ error: error?.message ?? "not_found" }, { status: 404 });

  const original = data as StoredRow;
  const intent: ItineraryIntent = {
    destination: original.destination,
    travelType: (overrides.travelType ?? (original.travel_type as ItineraryIntent["travelType"])),
    days: overrides.days ?? original.days,
    interests: overrides.interests,
    budgetPerPerson: overrides.budgetPerPerson,
  };

  const result = await generateItinerary(intent);

  // Persist the replay output too — tagged source=regenerate so /admin/agents
  // can filter it out of customer-facing views.
  void storeItinerary({
    intent,
    itinerary: result.itinerary,
    matchedPackages: result.matchedPackages,
    usage: result.usage,
    source: "regenerate",
  });

  return NextResponse.json({
    original: {
      id: original.id,
      itinerary: original.itinerary,
      matchedPackages: original.matched_packages,
    },
    replay: {
      itinerary: result.itinerary,
      matchedPackages: result.matchedPackages,
      usage: result.usage,
    },
    intent,
  });
}
