// Symmetric encryption for creators.payout_details (UPI / IFSC / bank
// account numbers).
//
// Storage shape on the JSONB column:
//   v1: { v: 1, enc: "<iv>:<ciphertext>:<authTag>" }   (AES-256-GCM, hex)
//   v0: { raw: "<plaintext>" }                          (legacy — pre-2026-05)
//
// Read path tolerates both shapes so the rollout doesn't break the admin
// payouts dashboard mid-migration. Once `scripts/encrypt-existing-payouts.mjs`
// runs once against prod, every row is v1 and the v0 branch becomes dead
// code (kept as defensive fallback only).
//
// Key: 32-byte hex string in PAYOUT_ENCRYPTION_KEY env var. Generate with:
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
//
// IMPORTANT: rotating the key requires re-encrypting all existing rows.
// Do not lose the key — without it, payout_details is unrecoverable. Treat
// it like a database password.

import crypto from "node:crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.PAYOUT_ENCRYPTION_KEY;
  if (!hex) throw new Error("PAYOUT_ENCRYPTION_KEY not set");
  if (hex.length !== 64) throw new Error("PAYOUT_ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
  return Buffer.from(hex, "hex");
}

export function encryptPayout(plaintext: string): { v: 1; enc: string } {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { v: 1, enc: `${iv.toString("hex")}:${ct.toString("hex")}:${tag.toString("hex")}` };
}

export function decryptPayout(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;

  // v1 — encrypted
  if (obj.v === 1 && typeof obj.enc === "string") {
    const [ivHex, ctHex, tagHex] = obj.enc.split(":");
    if (!ivHex || !ctHex || !tagHex) return null;
    try {
      const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, "hex"));
      decipher.setAuthTag(Buffer.from(tagHex, "hex"));
      const pt = Buffer.concat([decipher.update(Buffer.from(ctHex, "hex")), decipher.final()]);
      return pt.toString("utf8");
    } catch {
      // Bad key, tampered data, wrong row — don't crash the admin page.
      return null;
    }
  }

  // v0 legacy — plaintext under .raw. Still readable so admin keeps working
  // until the one-shot migration runs.
  if (typeof obj.raw === "string") return obj.raw;

  return null;
}
