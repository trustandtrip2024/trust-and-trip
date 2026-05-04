#!/usr/bin/env node
// Hit /api/health/launch on prod with ADMIN_SECRET to see verbose env+live status.

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

const SECRET = process.env.ADMIN_SECRET;
const BASE = process.argv[2] || "https://www.trustandtrip.com";
if (!SECRET) { console.error("ADMIN_SECRET missing"); process.exit(1); }

const res = await fetch(`${BASE}/api/health/launch?key=${encodeURIComponent(SECRET)}`);
const body = await res.json();
console.log(`HTTP ${res.status} launchReady=${body.launchReady}`);
console.log("Blockers:", body.blockers ?? []);
if (body.env) {
  console.log("\nEnv presence:");
  for (const [k, v] of Object.entries(body.env)) console.log(`  ${k.padEnd(12)} ${v.status}${v.detail ? "  ("+v.detail+")" : ""}`);
}
if (body.live) {
  console.log("\nLive pings:");
  for (const [k, v] of Object.entries(body.live)) console.log(`  ${k.padEnd(12)} ${v.status}${v.detail ? "  ("+v.detail+")" : ""}`);
}
