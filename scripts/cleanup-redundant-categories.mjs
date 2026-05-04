#!/usr/bin/env node
// Cleanup phase after migrate-taxonomy.mjs.
//
// Some category labels are redundant with other facets:
//   - "Domestic" / "International" → derivable from country.region (India = Domestic, else International)
//   - "Solo" / "Groups"            → overlap with travelType enum
//   - "Weekend"                    → overlap with "Quick Trips"
//
// This script:
//   1. Strips the redundant categoryRefs (and matching legacy string entries)
//      from every package.
//   2. Deletes the redundant category documents themselves.
//
// Idempotent — safe to re-run.

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

// Slug → label pairs for the redundant categories.
const REDUNDANT = [
  { slug: "domestic",      labels: ["Domestic"] },
  { slug: "international", labels: ["International"] },
  { slug: "solo",          labels: ["Solo"] },
  { slug: "groups",        labels: ["Groups", "Group"] },
  { slug: "weekend",       labels: ["Weekend"] },
];

const REDUNDANT_SLUGS = new Set(REDUNDANT.map((r) => r.slug));
const REDUNDANT_LABELS = new Set(REDUNDANT.flatMap((r) => r.labels.map((l) => l.toLowerCase())));
const REDUNDANT_DOC_IDS = REDUNDANT.map((r) => `category-${r.slug}`);

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
  console.log(`Cleanup starting on ${PROJECT_ID}/${DATASET}${DRY_RUN ? " (DRY RUN)" : ""}`);
  console.log(`  removing: ${REDUNDANT.map((r) => r.slug).join(", ")}`);

  // 1. Patch packages
  const packages = await fetchQuery(`*[_type == "package" && (
    count(categoryRefs[_ref in [${REDUNDANT_DOC_IDS.map((id) => `"${id}"`).join(",")}]]) > 0 ||
    count(categories[lower(@) in [${[...REDUNDANT_LABELS].map((l) => `"${l}"`).join(",")}]]) > 0
  )]{ _id, "slug": slug.current, categories, categoryRefs[]{ _key, _type, _ref } }`);

  console.log(`\n[1/2] ${packages.length} packages need cleanup`);

  const patches = packages.map((pkg) => {
    // Preserve `_type` when re-writing the array — Sanity strips items
    // that lack the discriminator, breaking ref rendering in Studio.
    const newCatRefs = (pkg.categoryRefs || [])
      .filter((r) => !REDUNDANT_DOC_IDS.includes(r._ref))
      .map((r) => ({ _key: r._key, _type: r._type || "reference", _ref: r._ref }));
    const newCats = (pkg.categories || []).filter(
      (c) => !REDUNDANT_LABELS.has(String(c).toLowerCase()),
    );
    const set = { categoryRefs: newCatRefs };
    const unset = [];
    if (newCats.length > 0) set.categories = newCats;
    else unset.push("categories");
    return { patch: { id: pkg._id, set, unset } };
  });

  for (const batch of chunk(patches, 50)) await mutate(batch);
  console.log(`  patched ${patches.length} packages`);

  // 2. Delete the category docs themselves
  console.log(`\n[2/2] Deleting redundant category documents`);
  const deletes = REDUNDANT_DOC_IDS.map((id) => ({ delete: { id } }));
  await mutate(deletes);
  console.log(`  deleted ${deletes.length} docs`);

  console.log(`\nDone${DRY_RUN ? " (dry run)" : ""}.`);
}

main().catch((err) => { console.error("Cleanup failed:", err); process.exit(1); });
