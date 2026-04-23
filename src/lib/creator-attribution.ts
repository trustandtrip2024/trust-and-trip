/**
 * Creator referral attribution.
 *
 * Tracking flow:
 *   1. Visitor lands with ?ref=CRTR-XXXX
 *   2. Middleware sets cookie tt_ref=CRTR-XXXX (30-day expiry)
 *   3. Lead form / booking submission picks up cookie via readRefCookie()
 *   4. /api/leads attaches ref_code to lead row + creates creator_attributions
 *   5. /api/payment/verify creates creator_earnings on booking confirmation
 *
 * Last-touch wins: if visitor clicks 2 different creator links, the latest
 * cookie overwrites the older one.
 */

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const REF_COOKIE = "tt_ref";
export const REF_PARAM = "ref";
export const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const REF_CODE_RE = /^CRTR-[A-Z0-9]{4,10}$/;

/** Generate a new creator code: CRTR- + 6 base32 chars (no I/O/0/1 ambiguity). */
export function generateRefCode(): string {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "CRTR-";
  for (let i = 0; i < 6; i++) {
    s += alpha[Math.floor(Math.random() * alpha.length)];
  }
  return s;
}

/** Validate a ref code shape (does not check existence in DB). */
export function isValidRefCode(s: unknown): s is string {
  return typeof s === "string" && REF_CODE_RE.test(s);
}

/**
 * Read tt_ref cookie inside a Server Component / Route Handler.
 * Returns null if absent or malformed.
 */
export function readRefCookie(): string | null {
  try {
    const c = cookies().get(REF_COOKIE)?.value;
    return isValidRefCode(c) ? c : null;
  } catch {
    return null;
  }
}

/**
 * Look up the active creator for a ref_code.
 * Returns null if not found or not active.
 */
export async function findActiveCreator(refCode: string) {
  if (!isValidRefCode(refCode)) return null;
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await admin
    .from("creators")
    .select("id, ref_code, commission_pct, status, full_name")
    .eq("ref_code", refCode)
    .single();
  if (!data || data.status !== "active") return null;
  return data;
}
