import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateRefCode } from "@/lib/creator-attribution";
import { pushLead } from "@/lib/bitrix24";
import { rateLimit, clientIp } from "@/lib/redis";
import { encryptPayout } from "@/lib/payout-crypto";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Body {
  full_name: string;
  email: string;
  phone: string;
  instagram_handle: string;
  audience_size?: string;
  primary_content?: string;
  why?: string;
  payout_method?: string;
  payout_details?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { allowed } = await rateLimit(`creatorapply:${clientIp(req)}`, { limit: 5, windowSeconds: 3600 });
    if (!allowed) return NextResponse.json({ error: "Too many applications from this network. Try again later." }, { status: 429 });
    const body = (await req.json()) as Body;

    if (!body.full_name?.trim() || !body.email?.trim() || !body.phone?.trim() || !body.instagram_handle?.trim()) {
      return NextResponse.json({ error: "Name, email, phone and Instagram handle are required." }, { status: 400 });
    }

    // Already applied? (by email)
    const { data: existing } = await admin
      .from("creators")
      .select("id, status, ref_code")
      .eq("email", body.email.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        already: true,
        status: existing.status,
        ref_code: existing.ref_code,
      });
    }

    // Generate unique ref_code (retry on collision)
    let ref_code = generateRefCode();
    for (let i = 0; i < 5; i++) {
      const { data: clash } = await admin.from("creators").select("id").eq("ref_code", ref_code).maybeSingle();
      if (!clash) break;
      ref_code = generateRefCode();
    }

    const audienceN = body.audience_size ? parseAudienceBucket(body.audience_size) : null;

    const { data: created, error } = await admin
      .from("creators")
      .insert({
        full_name: body.full_name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.trim(),
        instagram_handle: body.instagram_handle.trim().replace(/^@/, ""),
        audience_size: audienceN,
        ref_code,
        status: "pending",
        payout_method: body.payout_method || null,
        payout_details: body.payout_details ? encryptPayout(body.payout_details) : null,
        notes: [
          body.primary_content ? `Content: ${body.primary_content}` : null,
          body.why ? `Why: ${body.why}` : null,
        ].filter(Boolean).join("\n") || null,
      })
      .select("id, ref_code")
      .single();

    if (error) {
      console.error("Creator insert error:", error);
      return NextResponse.json({ error: "Failed to save application." }, { status: 500 });
    }

    // Drop into Bitrix as a Lead so the team sees it in CRM
    pushLead({
      name: body.full_name,
      email: body.email,
      phone: body.phone,
      message: [
        `Creator application — Instagram @${body.instagram_handle}`,
        body.audience_size ? `Audience: ${body.audience_size}` : null,
        body.primary_content ? `Content: ${body.primary_content}` : null,
        body.why ? `Why: ${body.why}` : null,
        `Payout: ${body.payout_method ?? "—"} ${body.payout_details ?? ""}`,
        `Ref code: ${created.ref_code}`,
      ].filter(Boolean).join("\n"),
      source: "contact_form",
      page_url: "https://trustandtrip.com/creators/apply",
    }).catch((e) => console.error("Bitrix24 creator pushLead error:", e));

    return NextResponse.json({ success: true, ref_code: created.ref_code });
  } catch (err) {
    console.error("Creator apply error:", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

function parseAudienceBucket(bucket: string): number | null {
  // "10k – 50k" → 10000 (lower bound, used for sorting)
  const m = bucket.match(/(\d+(?:\.\d+)?)\s*(k|K|m|M)?/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const mult = m[2]?.toLowerCase() === "m" ? 1_000_000 : 1000;
  return Math.round(n * mult);
}
