#!/usr/bin/env node
// One-shot migration: re-encrypt every plaintext creators.payout_details
// row to the v1 AES-256-GCM shape.
//
// Reads every creator with a payout_details.raw string, encrypts it via the
// same envelope used by src/lib/payout-crypto.ts, writes back the v1
// envelope. Skips rows that are already v1, so re-runs are safe.
//
// Required env: PAYOUT_ENCRYPTION_KEY, NEXT_PUBLIC_SUPABASE_URL,
//               SUPABASE_SERVICE_ROLE_KEY.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ENV_PATH = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(ENV_PATH)) {
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let [, k, v] = m;
    v = v.trim().replace(/^"|"$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const HEX  = process.env.PAYOUT_ENCRYPTION_KEY;

if (!URL || !KEY) { console.error("missing Supabase URL / service-role key"); process.exit(1); }
if (!HEX) { console.error("missing PAYOUT_ENCRYPTION_KEY"); process.exit(1); }
if (HEX.length !== 64) { console.error("PAYOUT_ENCRYPTION_KEY must be 32 bytes (64 hex chars)"); process.exit(1); }

const ALGO = "aes-256-gcm";
const KEY_BUF = Buffer.from(HEX, "hex");

function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY_BUF, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { v: 1, enc: `${iv.toString("hex")}:${ct.toString("hex")}:${tag.toString("hex")}` };
}

async function call(pathname, opts = {}) {
  const r = await fetch(`${URL}/rest/v1/${pathname}`, {
    ...opts,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(opts.headers || {}),
    },
  });
  if (!r.ok) throw new Error(`${r.status}: ${await r.text()}`);
  return r.json();
}

const rows = await call("creators?select=id,payout_details&payout_details=not.is.null");
console.log(`creators with payout_details: ${rows.length}`);

let migrated = 0;
let skipped = 0;
let bad = 0;

for (const row of rows) {
  const pd = row.payout_details;
  if (!pd || typeof pd !== "object") { bad++; continue; }
  if (pd.v === 1 && typeof pd.enc === "string") { skipped++; continue; }
  if (typeof pd.raw !== "string" || !pd.raw.trim()) { bad++; continue; }

  const enc = encrypt(pd.raw);
  await call(`creators?id=eq.${row.id}`, {
    method: "PATCH",
    body: JSON.stringify({ payout_details: enc }),
  });
  migrated++;
}

console.log(`Done. migrated=${migrated} already-v1=${skipped} bad-shape=${bad}`);
