import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateCode(name: string): string {
  const base = name.split(" ")[0].toUpperCase().slice(0, 5).replace(/[^A-Z]/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}${rand}`;
}

// POST — create referral link
export async function POST(req: NextRequest) {
  const { name, email, phone } = await req.json();
  if (!name || !email) return NextResponse.json({ error: "Name and email required." }, { status: 400 });

  // Check if already has a code
  const { data: existing } = await supabase
    .from("referrals").select("code").eq("referrer_email", email.toLowerCase()).maybeSingle();
  if (existing) return NextResponse.json({ code: existing.code });

  const code = generateCode(name);
  const { error } = await supabase.from("referrals").insert({
    referrer_name: name, referrer_email: email.toLowerCase(),
    referrer_phone: phone, code,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code });
}

// PATCH — track click
export async function PATCH(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Code required." }, { status: 400 });
  await supabase.rpc("increment_referral_clicks", { ref_code: code }).catch(() =>
    supabase.from("referrals").update({ clicks: supabase.rpc("clicks") }).eq("code", code)
  );
  return NextResponse.json({ ok: true });
}
