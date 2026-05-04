#!/usr/bin/env node
// One-shot: send `hello_world` template via WhatsApp Cloud API.
// Bypasses the 24h customer-service window — templates always deliverable.
//
// Usage: node scripts/wa-template.mjs <to-phone-e164>

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

const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const to = process.argv[2];

if (!to) { console.error("Usage: node scripts/wa-template.mjs <to-phone-e164>"); process.exit(2); }
if (!TOKEN || !PHONE_ID) { console.error("Missing token or phone id."); process.exit(1); }

const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
  body: JSON.stringify({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: { name: "hello_world", language: { code: "en_US" } },
  }),
});
const body = await res.json().catch(() => ({}));
console.log(res.status, JSON.stringify(body, null, 2));
process.exit(res.ok ? 0 : 1);
