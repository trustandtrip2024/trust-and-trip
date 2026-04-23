import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: creator } = await admin.from("creators").select("id, ref_code").eq("user_id", user.id).single();
  if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

  // Pull all leads with this ref_code (we mask PII for the creator)
  const { data: leads, error } = await admin
    .from("leads")
    .select("id, name, source, destination, package_title, status, created_at")
    .eq("ref_code", creator.ref_code)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mask name to protect PII (creator sees first name + initial only)
  const masked = (leads ?? []).map((l) => ({
    ...l,
    name: maskName(l.name),
  }));

  return NextResponse.json({ leads: masked });
}

function maskName(name: string | null): string {
  if (!name) return "Visitor";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
}
