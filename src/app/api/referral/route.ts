import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, clientIp } from "@/lib/redis";
import { requireUser } from "@/lib/require-user";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateCode(name: string): string {
  const base = name.split(" ")[0].toUpperCase().slice(0, 5).replace(/[^A-Z]/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}${rand}`;
}

/**
 * GET /api/referral — return the signed-in user's referral row.
 *
 * Earlier this accepted `?email=` from any caller and returned the matching
 * referral, exposing referrer_email/phone enumeration. Now the email is
 * derived from the JWT, never from the query string.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (auth.denial) return auth.denial;
    const email = auth.user.email?.toLowerCase();
    if (!email) return NextResponse.json({ referral: null });

    const { data } = await supabase
      .from("referrals")
      .select("code, clicks, conversions, reward_amount, status, created_at")
      .eq("referrer_email", email)
      .maybeSingle();
    return NextResponse.json({ referral: data ?? null });
  } catch (err) {
    console.error("[referral GET] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/referral — create the signed-in user's referral code.
 *
 * Earlier the body's name/email/phone were trusted, so anyone could create
 * a referral attributed to a victim's email. Now the email is forced to
 * the JWT's email; the body only supplies name + phone.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (auth.denial) return auth.denial;
    const email = auth.user.email?.toLowerCase();
    if (!email) return NextResponse.json({ error: "Email required on account." }, { status: 400 });

    const { name, phone } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required." }, { status: 400 });

    const { data: existing } = await supabase
      .from("referrals").select("code").eq("referrer_email", email).maybeSingle();
    if (existing) return NextResponse.json({ code: existing.code });

    const code = generateCode(name);
    const { error } = await supabase.from("referrals").insert({
      referrer_name: name, referrer_email: email,
      referrer_phone: phone, code,
    });
    if (error) return NextResponse.json({ error: "Could not save referral." }, { status: 500 });
    return NextResponse.json({ code });
  } catch (err) {
    console.error("[referral POST] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH /api/referral — bump click counter for a referral code.
 *
 * Stays unauth (it's fired from the public landing page redirect on a
 * `?ref=…` visit) but is now rate-limited per IP+code so an attacker can't
 * inflate click counts without bound.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Code required." }, { status: 400 });

    const ip = clientIp(req);
    const { allowed } = await rateLimit(`refclick:${ip}:${code}`, { limit: 10, windowSeconds: 3600 });
    if (!allowed) {
      // Silent allow at API contract level — caller is the public landing
      // redirect, no need to surface 429 to a real user.
      return NextResponse.json({ ok: true, throttled: true });
    }

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
