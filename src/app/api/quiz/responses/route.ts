import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, clientIp } from "@/lib/redis";

// Service-role client — quiz_responses RLS denies anon.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const TRAVEL_TYPES = ["Couple", "Family", "Solo", "Group", "Pilgrim"] as const;
const VIBES = ["Beach", "Mountain", "Culture", "Spiritual", "City"] as const;
const DURATIONS = ["3-5", "6-9", "10+"] as const;
const BUDGETS = ["lt50k", "50-100k", "100k+"] as const;

type TravelType = (typeof TRAVEL_TYPES)[number];
type Vibe = (typeof VIBES)[number];
type Duration = (typeof DURATIONS)[number];
type Budget = (typeof BUDGETS)[number];

interface PostBody {
  travel_type: TravelType;
  vibe: Vibe;
  duration: Duration;
  budget: Budget;
  top_match_slug?: string;
  top_match_score?: number;
  top3_slugs?: string[];
}

function isValid(b: unknown): b is PostBody {
  if (!b || typeof b !== "object") return false;
  const x = b as Record<string, unknown>;
  return (
    TRAVEL_TYPES.includes(x.travel_type as TravelType) &&
    VIBES.includes(x.vibe as Vibe) &&
    DURATIONS.includes(x.duration as Duration) &&
    BUDGETS.includes(x.budget as Budget)
  );
}

export async function POST(req: NextRequest) {
  // Rate-limit by IP — quiz completion is a low-frequency event per user.
  const ip = clientIp(req);
  const { allowed } = await rateLimit(`quiz:${ip}`, { limit: 10, windowSeconds: 60 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!isValid(body)) {
    return NextResponse.json({ error: "Invalid quiz payload" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("quiz_responses")
    .insert({
      travel_type: body.travel_type,
      vibe: body.vibe,
      duration: body.duration,
      budget: body.budget,
      top_match_slug: body.top_match_slug ?? null,
      top_match_score: body.top_match_score ?? null,
      top3_slugs: body.top3_slugs ?? [],
      user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
      referrer: req.headers.get("referer")?.slice(0, 500) ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[quiz] insert failed:", error);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

interface PatchBody {
  id: string;
  lead_id: string;
}

function isPatchValid(b: unknown): b is PatchBody {
  if (!b || typeof b !== "object") return false;
  const x = b as Record<string, unknown>;
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof x.id === "string" && uuidRe.test(x.id) && typeof x.lead_id === "string" && uuidRe.test(x.lead_id);
}

export async function PATCH(req: NextRequest) {
  // Per-IP rate limit + freshness guard so a stranger can't sweep the
  // quiz_response UUID space and re-attribute responses to arbitrary leads.
  // Real callers PATCH within seconds of the POST that returned the id, so
  // the 5-minute freshness window is comfortable for the legit flow and
  // shuts the IDOR enumeration window.
  const ip = clientIp(req);
  const { allowed } = await rateLimit(`quiz-patch:${ip}`, { limit: 20, windowSeconds: 60 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!isPatchValid(body)) {
    return NextResponse.json({ error: "Invalid patch payload" }, { status: 400 });
  }

  // Only allow PATCH when (a) the row is < 5 min old and (b) lead_id is not
  // already set. Stops a future replay from rewriting historical attribution.
  const { data: row } = await supabase
    .from("quiz_responses")
    .select("id, lead_id, created_at")
    .eq("id", body.id)
    .maybeSingle();
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (row.lead_id) {
    return NextResponse.json({ error: "Already attributed" }, { status: 409 });
  }
  const ageMs = Date.now() - new Date(row.created_at as string).getTime();
  if (ageMs > 5 * 60 * 1000) {
    return NextResponse.json({ error: "Window expired" }, { status: 410 });
  }

  const { error } = await supabase
    .from("quiz_responses")
    .update({ lead_id: body.lead_id })
    .eq("id", body.id)
    .is("lead_id", null);

  if (error) {
    console.error("[quiz] patch failed:", error);
    return NextResponse.json({ error: "Could not update" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
