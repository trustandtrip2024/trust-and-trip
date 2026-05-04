#!/usr/bin/env node
// Exchange a short-lived (1h) Instagram access token for a long-lived (60d)
// token. Then optionally write the long-lived token back into .env.local in
// place of the short one.
//
// Usage:
//   node scripts/ig-exchange-token.mjs <ig_app_secret>
//
// Reads INSTAGRAM_ACCESS_TOKEN (the short-lived one) from .env.local.
// IG App Secret is from developers.facebook.com → Trust and Trip Platform →
// Instagram product → API setup with Instagram login → "Instagram app secret"
// (next to "Instagram app ID 992727917039760").

import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(ENV_PATH)) { console.error(".env.local missing"); process.exit(1); }

const raw = fs.readFileSync(ENV_PATH, "utf8");
for (const line of raw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  let [, k, v] = m;
  v = v.trim().replace(/^"|"$/g, "");
  if (!process.env[k]) process.env[k] = v;
}

const SHORT_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const SECRET = process.argv[2];
if (!SHORT_TOKEN) { console.error("INSTAGRAM_ACCESS_TOKEN missing in .env.local"); process.exit(1); }
if (!SECRET) { console.error("Usage: node scripts/ig-exchange-token.mjs <ig_app_secret>"); process.exit(2); }

const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${SECRET}&access_token=${SHORT_TOKEN}`;
const res = await fetch(url);
const body = await res.json();

if (!res.ok || !body.access_token) {
  console.error("FAIL", res.status, JSON.stringify(body, null, 2));
  process.exit(1);
}

const long = body.access_token;
const expires = body.expires_in;
console.log(`OK long-lived token: length=${long.length} first10=${long.slice(0,10)} expires_in=${expires}s (~${Math.round(expires/86400)}d)`);

// Rewrite .env.local
const updated = raw.replace(
  /^INSTAGRAM_ACCESS_TOKEN=.*$/m,
  `INSTAGRAM_ACCESS_TOKEN="${long}"`
);
fs.writeFileSync(ENV_PATH, updated);
console.log(".env.local updated. Now copy the new token to Vercel:");
console.log("  Settings → Environment Variables → INSTAGRAM_ACCESS_TOKEN → Edit → paste → Save → Redeploy.");
console.log(`Token (also in .env.local): ${long}`);
