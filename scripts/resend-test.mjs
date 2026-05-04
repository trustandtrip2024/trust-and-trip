#!/usr/bin/env node
// Resend smoke test — sends a plain email to BUSINESS_EMAIL using
// RESEND_API_KEY + RESEND_FROM from .env.local.
//
// Usage:
//   node scripts/resend-test.mjs                 # sends to BUSINESS_EMAIL
//   node scripts/resend-test.mjs other@addr.com  # override recipient

import fs from "node:fs";
import path from "node:path";

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

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || "Trust and Trip <onboarding@resend.dev>";
const TO = process.argv[2] || process.env.BUSINESS_EMAIL || "trustandtrip2023@gmail.com";

if (!KEY) { console.error("RESEND_API_KEY missing"); process.exit(1); }
if (!KEY.startsWith("re_")) {
  console.error(`RESEND_API_KEY format invalid (expected 're_...', got '${KEY.slice(0,5)}...')`);
  process.exit(1);
}

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    from: FROM,
    to: [TO],
    subject: "Trust and Trip — Resend smoke test",
    text: "If you got this, Resend pipeline is wired correctly.",
  }),
});
const body = await res.json();
console.log("HTTP", res.status, JSON.stringify(body, null, 2));
process.exit(res.ok ? 0 : 1);
