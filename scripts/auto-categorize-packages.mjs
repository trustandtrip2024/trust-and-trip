#!/usr/bin/env node
// Bulk-categorize Sanity package docs:
//   - sets category[] from travelType + title + destination heuristics
//   - appends region tag (Domestic / International)
//   - drops noise tags (lowercase destination dupes, meal codes, imported-from-pdf)
//   - patches published doc directly via mutate API (no drafts)
// Idempotent. Safe to re-run.

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

if (!TOKEN) {
  console.error("Missing SANITY_API_WRITE_TOKEN");
  process.exit(1);
}

const NOISE_TAGS = new Set([
  "imported-from-pdf",
  "meal-mapai", "meal-breakfast", "meal-ep", "meal-cp", "meal-bb",
  "char-dham", "varanasi", "vietnam", "bali", "uttarakhand", "north-east",
  "kashmir", "thailand", "manali", "nepal", "kerala", "goa", "andaman",
  "sikkim", "puri", "seychelles", "singapore", "sri-lanka", "shimla",
  "rajasthan", "dubai", "maldives", "switzerland", "japan", "europe",
  "ladakh", "spiti-valley", "char dham", "kashmir-valley", "coorg",
  "ooty", "munnar", "darjeeling", "tirupati", "lakshadweep", "pondicherry",
  "mahabaleshwar", "lonavala", "mount-abu", "kanha", "ranthambore", "pushkar",
  "cambodia", "russia", "uk", "italy", "kenya", "australia", "south-korea",
  "hong-kong", "malaysia", "turkey", "france", "paris", "indonesia",
]);

function deriveCategories(p) {
  const t = (p.title || "").toLowerCase();
  const dest = (p.destSlug || "").toLowerCase();
  const country = (p.destCountry || "").toLowerCase();
  const days = p.days || 0;
  const tt = p.travelType || "";
  const cats = new Set();

  if (tt === "Couple") cats.add("Honeymoon");
  if (tt === "Family") cats.add("Family");
  if (tt === "Solo") cats.add("Solo");
  if (tt === "Group") cats.add("Groups");

  const pilgrimRx = /yatra|pilgrim|spiritual|kedarnath|char\s*dham|sacred|vaishno|tirupati|tirumala|temple|hindu heritage|ganga aarti/i;
  if (pilgrimRx.test(t)) { cats.add("Pilgrim"); cats.add("Spiritual"); }
  if (dest === "varanasi") cats.add("Spiritual");
  if (dest === "char-dham" || dest === "tirupati" || dest === "vaishno-devi" || dest === "pushkar") {
    cats.add("Pilgrim"); cats.add("Spiritual");
  }
  if (dest === "uttarakhand" && /kedarnath|char\s*dham|haridwar|rishikesh/i.test(t)) {
    cats.add("Pilgrim"); cats.add("Spiritual");
  }

  if (/trek|adventure|bike|rafting|diver|royal enfield|backpacker|expedition|motorbike/i.test(t)) {
    cats.add("Adventure");
  }

  const beachDestRx = /^(andaman|maldives|goa|bali|phuket|lakshadweep|seychelles|pondicherry|mauritius|krabi)$/;
  if (/beach|island|coral|diver/i.test(t) || beachDestRx.test(dest)) cats.add("Beach");

  const mountainDestRx = /^(manali|shimla|spiti-valley|zanskar-valley|ladakh|switzerland|nepal|coorg|darjeeling|mahabaleshwar|lonavala|mount-abu|mussoorie|kashmir|sikkim|himachal-pradesh)$/;
  if (/snow|hill|himalayan|mountain|valley|alpine|trek/i.test(t) || mountainDestRx.test(dest)) cats.add("Mountain");

  if (/wildlife|safari|tiger|reserve|national park/i.test(t) || /^(kanha|ranthambore|jim-corbett|bandhavgarh)$/.test(dest)) {
    cats.add("Wildlife");
  }

  if (/premium|luxury|royal|overwater|signature|private/i.test(t)) cats.add("Luxury");
  if (/cultural|heritage|art|odyssey/i.test(t)) cats.add("Cultural");
  if (/wellness|ayurveda|retreat|yoga|spa/i.test(t)) cats.add("Wellness");

  if (days > 0 && days <= 3) { cats.add("Quick Trips"); cats.add("Weekend"); }

  if (cats.size === 0) cats.add(country === "india" ? "Domestic" : "International");

  return Array.from(cats);
}

function deriveTags(p, existing) {
  const country = (p.destCountry || "").toLowerCase();
  const region = country === "india" ? "Domestic" : "International";
  const cleaned = (existing || []).filter((tag) => {
    if (!tag || typeof tag !== "string") return false;
    const k = tag.trim().toLowerCase();
    if (NOISE_TAGS.has(k)) return false;
    if (k === "domestic" || k === "international") return false;
    return true;
  });
  cleaned.push(region);
  return Array.from(new Set(cleaned));
}

async function fetchAll() {
  const query = encodeURIComponent(
    `*[_type=="package"]{_id,title,"destSlug":destination->slug.current,"destCountry":destination->country,days,travelType,categories,tags}`
  );
  const url = `${API_HOST}/data/query/${DATASET}?query=${query}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`fetch failed ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.result || [];
}

async function mutate(mutations) {
  const url = `${API_HOST}/data/mutate/${DATASET}?returnIds=true`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) throw new Error(`mutate failed ${res.status}: ${await res.text()}`);
  return res.json();
}

const all = await fetchAll();
console.log(`Fetched ${all.length} package docs`);

const mutations = [];
let touchedCats = 0;
let touchedTags = 0;

for (const p of all) {
  const id = p._id.replace(/^drafts\./, "");
  const set = {};

  // categories (schema field — plural)
  const hasCats = Array.isArray(p.categories) && p.categories.length > 0;
  if (!hasCats) {
    const cats = deriveCategories(p);
    if (cats.length) {
      set.categories = cats;
      touchedCats++;
    }
  }

  // tags — always normalize (strip noise + ensure region tag present)
  const newTags = deriveTags(p, p.tags);
  const oldTags = p.tags || [];
  const same =
    newTags.length === oldTags.length &&
    newTags.every((t, i) => t === oldTags[i]);
  if (!same) {
    set.tags = newTags;
    touchedTags++;
  }

  // Always strip stray `category` (singular) field from earlier broken run
  const unset = ["category"];

  if (Object.keys(set).length > 0 || unset.length > 0) {
    const patch = { id };
    if (Object.keys(set).length > 0) patch.set = set;
    if (unset.length > 0) patch.unset = unset;
    mutations.push({ patch });
  }
}

console.log(`Patches: ${mutations.length} (cats=${touchedCats}, tags=${touchedTags})`);

if (mutations.length === 0) {
  console.log("Nothing to do.");
  process.exit(0);
}

// Send in chunks of 50 to keep payloads reasonable
for (let i = 0; i < mutations.length; i += 50) {
  const chunk = mutations.slice(i, i + 50);
  const r = await mutate(chunk);
  console.log(`Chunk ${i / 50 + 1}: ${r.results?.length || 0} ops`);
}

console.log("Done.");
