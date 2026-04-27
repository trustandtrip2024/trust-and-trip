// Signed cart-resume tokens.
//
// Used by the abandoned-cart email + WA reminder so a logged-out customer
// can re-open their cart from the link without us building auth or a
// magic-link flow. Token = HMAC(user_id, CART_RESUME_SECRET) — same secret
// across all envs, so changing it invalidates all outstanding links.

import crypto from "crypto";

export function cartResumeToken(userId: string): string {
  const secret = process.env.CART_RESUME_SECRET ?? process.env.ADMIN_SECRET ?? "dev";
  return crypto.createHmac("sha256", secret).update(userId).digest("hex").slice(0, 32);
}

export function buildCartResumeUrl(userId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustandtrip.com";
  return `${base}/cart/resume?u=${encodeURIComponent(userId)}&t=${cartResumeToken(userId)}`;
}

export function verifyCartResumeToken(userId: string, token: string): boolean {
  if (!userId || !token) return false;
  try {
    const expected = cartResumeToken(userId);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}
