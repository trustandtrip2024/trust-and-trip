#!/usr/bin/env node
// Instagram Graph API smoke test.
// Reads INSTAGRAM_ACCESS_TOKEN from .env.local and fetches recent media.

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

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
if (!TOKEN) { console.error("INSTAGRAM_ACCESS_TOKEN missing in .env.local"); process.exit(1); }

console.log(`Token length=${TOKEN.length} first10=${TOKEN.slice(0,10)} last5=${TOKEN.slice(-5)}`);
console.log(`Has CR: ${TOKEN.includes("\r")} Has LF: ${TOKEN.includes("\n")} Has space: ${TOKEN.includes(" ")}`);

const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=5&access_token=${TOKEN}`;
const res = await fetch(url);
const body = await res.json();

console.log("HTTP", res.status);
if (!res.ok) {
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}
console.log(`Posts: ${body.data?.length ?? 0}`);
for (const p of body.data ?? []) {
  console.log(`  [${p.media_type}] ${p.id} ${(p.caption ?? "").slice(0, 50)} -> ${p.permalink}`);
}
