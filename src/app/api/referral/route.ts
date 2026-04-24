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

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) return NextResponse.json({ referral: null });
    const { data } = await supabase
      .from("referrals")
      .select("code, clicks, conversions, reward_amount, status, created_at")
      .eq("referrer_email", email.toLowerCase())
      .maybeSingle();
    return NextResponse.json({ referral: data ?? null });
  } catch (err) {
    console.error("[referral GET] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone } = await req.json();
    if (!name || !email) return NextResponse.json({ error: "Name and email required." }, { status: 400 });

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
  } catch (err) {
    console.error("[referral POST] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Code required." }, { status: 400 });
    const { data } = await supabase.from("referrals").select("clicks").eq("code", code).maybeSingle();
    if (data) {
      await supabase.from("referrals").update({ clicks: data.clicks + 1 }).eq("code", code);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[referral PATCH] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
