// Customer-facing itinerary list — only returns drafts that match the
// signed-in user's email or phone. Auth-gated via the SSR Supabase client.

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }

  // Read the current user via SSR cookies — anonymous callers get nothing.
  const cookieStore = cookies();
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => undefined,
        remove: () => undefined,
      },
    }
  );
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Service-role for the actual fetch — itineraries table doesn't have
  // per-user RLS yet (it's tied to lead_id, not user_id).
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const email = user.email?.toLowerCase() ?? null;
  const phoneRaw = (user.user_metadata?.phone as string | undefined) ?? "";
  const phone = phoneRaw.replace(/\D/g, "");
  const phoneTail = phone.length >= 10 ? phone.slice(-10) : null;

  // Find this user's lead row(s).
  const filters: string[] = [];
  if (email) filters.push(`email.eq.${email}`);
  if (phoneTail) filters.push(`phone.ilike.%${phoneTail}`);
  if (!filters.length) return NextResponse.json({ itineraries: [] });

  const { data: leads } = await admin
    .from("leads")
    .select("id")
    .or(filters.join(","))
    .limit(50);
  const leadIds = (leads ?? []).map((l) => l.id);
  if (!leadIds.length) return NextResponse.json({ itineraries: [] });

  const { data: rows, error } = await admin
    .from("itineraries")
    .select("id, created_at, destination, travel_type, days, source, itinerary, matched_packages")
    .in("lead_id", leadIds)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ itineraries: rows ?? [] });
}
