#!/usr/bin/env node
// WhatsApp Cloud API smoke test.
//
// Usage:
//   node scripts/wa-test.mjs <to-phone-e164>
//   npm run wa:test -- 919XXXXXXXXX
//
// Loads env from .env.local. Runs three checks:
//   1. Phone-ID metadata read    (auth + phone-id valid?)
//   2. Send a plain text message (full send pipeline)
//   3. Webhook verify token sanity (printed only)

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
const VERIFY = process.env.WHATSAPP_VERIFY_TOKEN;

const to = process.argv[2];
if (!to) {
  console.error("Usage: npm run wa:test -- <to-phone-e164>  (e.g. 919XXXXXXXXX)");
  process.exit(2);
}

function fmt(label, ok, detail) {
  const tag = ok ? "OK   " : "FAIL ";
  console.log(`${tag} ${label.padEnd(28)} ${detail ?? ""}`);
}

const env = {
  WHATSAPP_ACCESS_TOKEN: !!TOKEN,
  WHATSAPP_PHONE_ID: !!PHONE_ID,
  WHATSAPP_VERIFY_TOKEN: !!VERIFY,
};
console.log("Env keys:");
for (const [k, v] of Object.entries(env)) fmt(k, v, v ? "set" : "missing");
console.log("");

if (!TOKEN || !PHONE_ID) {
  console.error("Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_ID — abort.");
  process.exit(1);
}

const GRAPH = "https://graph.facebook.com/v21.0";

async function readPhone() {
  const res = await fetch(`${GRAPH}/${PHONE_ID}?fields=display_phone_number,verified_name`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    fmt("Phone-ID metadata", false, `${res.status} ${JSON.stringify(body).slice(0, 200)}`);
    return false;
  }
  fmt("Phone-ID metadata", true, `${body.verified_name ?? "?"} <${body.display_phone_number ?? "?"}>`);
  return true;
}

async function sendTest() {
  const res = await fetch(`${GRAPH}/${PHONE_ID}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: "Trust and Trip WA smoke test ✅ — if you got this, the API works." },
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    fmt("Send test message", false, `${res.status} ${JSON.stringify(body).slice(0, 300)}`);
    return false;
  }
  const msgId = body.messages?.[0]?.id;
  fmt("Send test message", true, `id=${msgId}`);
  return true;
}

const phoneOk = await readPhone();
const sendOk = phoneOk ? await sendTest() : false;

console.log("");
fmt("Webhook verify token", !!VERIFY, VERIFY ? "set (value not printed)" : "missing — webhook GET will 403");

console.log("");
console.log(phoneOk && sendOk ? "RESULT: WhatsApp API working." : "RESULT: WhatsApp API NOT working — see failures above.");
process.exit(phoneOk && sendOk ? 0 : 1);
