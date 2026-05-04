#!/usr/bin/env node
// Phase-2 finalizer for the taxonomy migration.
//
// After migrate-taxonomy.mjs + cleanup-redundant-categories.mjs have run
// successfully and the new ref-backed fields (categoryRefs, tagRefs,
// countryRef) drive the live site, this script deletes the legacy string
// fields from every doc:
//   - package.categories (string array)
//   - package.tags       (string array)
//   - destination.country (string)
//
// SAFETY:
//   - Only unsets a legacy field on a doc that has a non-empty replacement.
//     A package without categoryRefs keeps its categories[] strings.
//     A destination without countryRef keeps its country string.
//   - Idempotent: re-runs unset already-missing fields, which Sanity
//     accepts as no-ops.
//
// Schema follow-up (manual):
//   After this runs cleanly, remove the `categories`, `tags` field defs
//   from src/sanity/schemaTypes/packageType.ts and the `country` string
//   field from destinationType.ts. Then drop the coalesce() fallbacks in
//   src/lib/sanity-queries.ts.

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

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const API_HOST = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01`;
const QUERY_HOST = `https://${PROJECT_ID}.apicdn.sanity.io/v2024-01-01`;
const DRY_RUN = process.argv.includes("--dry-run");

if (!PROJECT_ID || !TOKEN) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

async function fetchQuery(query) {
  const url = `${QUERY_HOST}/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Query failed ${res.status}: ${await res.text()}`);
  return (await res.json()).result;
}

async function mutate(mutations) {
  if (DRY_RUN) {
    console.log(`  [dry-run] would send ${mutations.length} mutation(s)`);
    return;
  }
  const url = `${API_HOST}/data/mutate/${DATASET}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) throw new Error(`Mutate failed ${res.status}: ${await res.text()}`);
  return res.json();
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  console.log(`Drop-legacy starting on ${PROJECT_ID}/${DATASET}${DRY_RUN ? " (DRY RUN)" : ""}`);

  // 1. Packages — only unset categories/tags strings on docs that already
  //    have the corresponding refs filled in.
  const packages = await fetchQuery(`*[_type == "package"]{
    _id, "slug": slug.current, categories, tags, categoryRefs, tagRefs
  }`);

  let unsetCats = 0, unsetTags = 0, untouched = 0;
  const pkgPatches = [];
  for (const pkg of packages) {
    const hasCatRefs = Array.isArray(pkg.categoryRefs) && pkg.categoryRefs.length > 0;
    const hasTagRefs = Array.isArray(pkg.tagRefs) && pkg.tagRefs.length > 0;
    const hasLegacyCats = Array.isArray(pkg.categories) && pkg.categories.length > 0;
    const hasLegacyTags = Array.isArray(pkg.tags) && pkg.tags.length > 0;

    const unset = [];
    if (hasCatRefs && hasLegacyCats) { unset.push("categories"); unsetCats++; }
    if (hasTagRefs && hasLegacyTags) { unset.push("tags"); unsetTags++; }

    if (unset.length === 0) { untouched++; continue; }
    pkgPatches.push({ patch: { id: pkg._id, unset } });
  }

  console.log(`\n[1/2] Packages — unset ${unsetCats} categories[], ${unsetTags} tags[] (${untouched} skipped)`);
  for (const batch of chunk(pkgPatches, 50)) await mutate(batch);

  // 2. Destinations — only unset country string on docs that have countryRef.
  const destinations = await fetchQuery(`*[_type == "destination"]{
    _id, "slug": slug.current, country, countryRef
  }`);

  let unsetCountries = 0, destSkipped = 0;
  const destPatches = [];
  for (const d of destinations) {
    if (!d.countryRef || !d.country) { destSkipped++; continue; }
    destPatches.push({ patch: { id: d._id, unset: ["country"] } });
    unsetCountries++;
  }

  console.log(`\n[2/2] Destinations — unset ${unsetCountries} country strings (${destSkipped} skipped)`);
  for (const batch of chunk(destPatches, 50)) await mutate(batch);

  console.log(`\nDone${DRY_RUN ? " (dry run)" : ""}.`);
  console.log(`\nFollow-up:`);
  console.log(`  1. Remove the legacy field defs from sanity/schemaTypes/packageType.ts and destinationType.ts.`);
  console.log(`  2. Drop the coalesce() fallbacks from src/lib/sanity-queries.ts.`);
}

main().catch((err) => { console.error("Drop-legacy failed:", err); process.exit(1); });
