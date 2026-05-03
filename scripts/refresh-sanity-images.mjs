#!/usr/bin/env node
// Forces image URLs everywhere to regenerate.
//
// How it works: every destination + package in Sanity gets a no-op patch
// that bumps `_updatedAt`. The cache-buster appended to image URLs
// (?v=<digits-of-updatedAt>) then changes for every doc, which busts
// Vercel image-optimizer cache, browser cache, and any CDN in front.
// Combined with revalidate=60 on the home, fresh images appear within
// one minute on next page load.
//
// Idempotent — re-runs are safe.

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

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "ncxbf32w";
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    || "production";
const TOKEN      = process.env.SANITY_API_WRITE_TOKEN;
const API_HOST   = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01`;
if (!TOKEN) { console.error("missing SANITY_API_WRITE_TOKEN"); process.exit(1); }

const TARGET_TYPES = ["destination", "package", "homepageContent", "blogPost"];

async function fetchIds() {
  const q = encodeURIComponent(
    `*[_type in ["destination","package","homepageContent","blogPost"] && !(_id in path("drafts.**"))]{_id, _type}`
  );
  const r = await fetch(`${API_HOST}/data/query/${DATASET}?query=${q}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!r.ok) throw new Error(`fetch failed: ${await r.text()}`);
  return (await r.json()).result || [];
}

async function mutate(mutations) {
  const r = await fetch(`${API_HOST}/data/mutate/${DATASET}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!r.ok) throw new Error(`mutate failed: ${await r.text()}`);
  return r.json();
}

const docs = await fetchIds();
const counts = docs.reduce((acc, d) => { acc[d._type] = (acc[d._type] || 0) + 1; return acc; }, {});
console.log(`Touching ${docs.length} docs:`, counts);

// No-op patch — set _refreshTick to current millis. Adds an ignorable
// field but bumps _updatedAt, which is the cache-buster source.
const tick = String(Date.now());
const mutations = docs.map((d) => ({
  patch: { id: d._id, set: { _refreshTick: tick } },
}));

for (let i = 0; i < mutations.length; i += 50) {
  const chunk = mutations.slice(i, i + 50);
  const r = await mutate(chunk);
  console.log(`Chunk ${i / 50 + 1}: ${r.results?.length || 0} ops`);
}

console.log("Done. Image URLs will regenerate on next ISR cycle (≤60s).");

// Try local /api/revalidate too — non-fatal if dev server is not up.
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SECRET = process.env.SANITY_REVALIDATE_SECRET || "";
for (const t of TARGET_TYPES) {
  const url = `${SITE}/api/revalidate${SECRET ? `?token=${encodeURIComponent(SECRET)}` : ""}`;
  try {
    const rv = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _type: t }),
      signal: AbortSignal.timeout(3000),
    });
    console.log(`revalidate ${t} → ${rv.status}`);
  } catch {
    console.log(`revalidate ${t} → skipped (no local server)`);
  }
}
