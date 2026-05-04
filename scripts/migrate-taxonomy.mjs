#!/usr/bin/env node
// Migrate Sanity taxonomy from string-enum fields to referenced docs.
//
// What it does (idempotent — safe to re-run):
//   1. Reads every published `package` doc → collects unique values from
//      `categories[]` and `tags[]` (string arrays).
//   2. Reads every published `destination` doc → collects unique values
//      from `country` (string).
//   3. Creates `category`, `tag`, and `country` documents in Sanity using
//      deterministic IDs (`category-<slug>`, `tag-<slug>`, `country-<slug>`)
//      via createOrReplace, so re-running never duplicates.
//   4. Patches each package: sets `categoryRefs` and `tagRefs` arrays
//      pointing at the new docs. Skips docs that already have refs.
//   5. Patches each destination: sets `countryRef` to the new country doc.
//      Skips docs that already have a ref.
//
// Schema is dual-field (legacy `categories`/`tags`/`country` strings still
// present alongside `categoryRefs`/`tagRefs`/`countryRef`), so this is a
// non-destructive backfill. After verifying in Studio + updating the query
// layer, the legacy string fields can be dropped in a follow-up.
//
// Run: node scripts/migrate-taxonomy.mjs
//      node scripts/migrate-taxonomy.mjs --dry-run

import fs from "node:fs";
import path from "node:path";

// ─── env loader ────────────────────────────────────────────────────────────
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
const API_VERSION = "v2024-01-01";
const API_HOST = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}`;
const QUERY_HOST = `https://${PROJECT_ID}.apicdn.sanity.io/${API_VERSION}`;

const DRY_RUN = process.argv.includes("--dry-run");

if (!PROJECT_ID || !TOKEN) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

// ─── helpers ───────────────────────────────────────────────────────────────
function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

const TAG_KIND_MAP = {
  trekking: "activity", trek: "activity", hiking: "activity", surfing: "activity",
  diving: "activity", snorkeling: "activity", safari: "activity", spa: "activity",
  yoga: "activity", houseboat: "activity", cruise: "activity", rafting: "activity",
  skiing: "activity", paragliding: "activity",
  beach: "landscape", mountain: "landscape", desert: "landscape", jungle: "landscape",
  snow: "landscape", backwaters: "landscape", island: "landscape", lake: "landscape",
  glacier: "landscape", waterfall: "landscape", forest: "landscape",
  monsoon: "season", summer: "season", winter: "season", spring: "season",
  honeymoon: "audience", family: "audience", solo: "audience", group: "audience",
  couple: "audience", senior: "audience",
  romantic: "vibe", luxury: "vibe", adventure: "vibe", peaceful: "vibe",
  spiritual: "vibe", cultural: "vibe", offbeat: "vibe",
};

// Country → ISO2 + region + currency + tz lookup. Add as needed.
const COUNTRY_META = {
  "India": { iso2: "IN", region: "Asia", currency: "INR", timezone: "Asia/Kolkata", flag: "🇮🇳" },
  "Indonesia": { iso2: "ID", region: "Asia", currency: "IDR", timezone: "Asia/Jakarta", flag: "🇮🇩" },
  "Thailand": { iso2: "TH", region: "Asia", currency: "THB", timezone: "Asia/Bangkok", flag: "🇹🇭" },
  "Vietnam": { iso2: "VN", region: "Asia", currency: "VND", timezone: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
  "Malaysia": { iso2: "MY", region: "Asia", currency: "MYR", timezone: "Asia/Kuala_Lumpur", flag: "🇲🇾" },
  "Singapore": { iso2: "SG", region: "Asia", currency: "SGD", timezone: "Asia/Singapore", flag: "🇸🇬" },
  "Maldives": { iso2: "MV", region: "Asia", currency: "MVR", timezone: "Indian/Maldives", flag: "🇲🇻" },
  "Sri Lanka": { iso2: "LK", region: "Asia", currency: "LKR", timezone: "Asia/Colombo", flag: "🇱🇰" },
  "Nepal": { iso2: "NP", region: "Asia", currency: "NPR", timezone: "Asia/Kathmandu", flag: "🇳🇵" },
  "Bhutan": { iso2: "BT", region: "Asia", currency: "BTN", timezone: "Asia/Thimphu", flag: "🇧🇹" },
  "Japan": { iso2: "JP", region: "Asia", currency: "JPY", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  "South Korea": { iso2: "KR", region: "Asia", currency: "KRW", timezone: "Asia/Seoul", flag: "🇰🇷" },
  "Philippines": { iso2: "PH", region: "Asia", currency: "PHP", timezone: "Asia/Manila", flag: "🇵🇭" },
  "Cambodia": { iso2: "KH", region: "Asia", currency: "KHR", timezone: "Asia/Phnom_Penh", flag: "🇰🇭" },
  "United Arab Emirates": { iso2: "AE", region: "Middle East", currency: "AED", timezone: "Asia/Dubai", flag: "🇦🇪" },
  "Turkey": { iso2: "TR", region: "Middle East", currency: "TRY", timezone: "Europe/Istanbul", flag: "🇹🇷" },
  "Switzerland": { iso2: "CH", region: "Europe", currency: "CHF", timezone: "Europe/Zurich", flag: "🇨🇭" },
  "Greece": { iso2: "GR", region: "Europe", currency: "EUR", timezone: "Europe/Athens", flag: "🇬🇷" },
  "France": { iso2: "FR", region: "Europe", currency: "EUR", timezone: "Europe/Paris", flag: "🇫🇷" },
  "Italy": { iso2: "IT", region: "Europe", currency: "EUR", timezone: "Europe/Rome", flag: "🇮🇹" },
  "Spain": { iso2: "ES", region: "Europe", currency: "EUR", timezone: "Europe/Madrid", flag: "🇪🇸" },
  "United Kingdom": { iso2: "GB", region: "Europe", currency: "GBP", timezone: "Europe/London", flag: "🇬🇧" },
  "Iceland": { iso2: "IS", region: "Europe", currency: "ISK", timezone: "Atlantic/Reykjavik", flag: "🇮🇸" },
  "United States": { iso2: "US", region: "Americas", currency: "USD", timezone: "America/New_York", flag: "🇺🇸" },
  "Australia": { iso2: "AU", region: "Oceania", currency: "AUD", timezone: "Australia/Sydney", flag: "🇦🇺" },
  "New Zealand": { iso2: "NZ", region: "Oceania", currency: "NZD", timezone: "Pacific/Auckland", flag: "🇳🇿" },
  "Egypt": { iso2: "EG", region: "Africa", currency: "EGP", timezone: "Africa/Cairo", flag: "🇪🇬" },
  "Kenya": { iso2: "KE", region: "Africa", currency: "KES", timezone: "Africa/Nairobi", flag: "🇰🇪" },
  "South Africa": { iso2: "ZA", region: "Africa", currency: "ZAR", timezone: "Africa/Johannesburg", flag: "🇿🇦" },
  "Mauritius": { iso2: "MU", region: "Africa", currency: "MUR", timezone: "Indian/Mauritius", flag: "🇲🇺" },
  "Seychelles": { iso2: "SC", region: "Africa", currency: "SCR", timezone: "Indian/Mahe", flag: "🇸🇨" },
  "Hong Kong SAR": { iso2: "HK", region: "Asia", currency: "HKD", timezone: "Asia/Hong_Kong", flag: "🇭🇰" },
  "Russia": { iso2: "RU", region: "Europe", currency: "RUB", timezone: "Europe/Moscow", flag: "🇷🇺" },
};

async function fetchQuery(query, params = {}) {
  const url = `${QUERY_HOST}/data/query/${DATASET}?query=${encodeURIComponent(query)}` +
    Object.entries(params).map(([k, v]) => `&%24${k}=${encodeURIComponent(JSON.stringify(v))}`).join("");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Query failed ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.result;
}

async function mutate(mutations) {
  if (DRY_RUN) {
    console.log(`  [dry-run] would send ${mutations.length} mutation(s)`);
    return { results: mutations.map(() => ({})) };
  }
  const url = `${API_HOST}/data/mutate/${DATASET}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
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

// ─── main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Migration starting on ${PROJECT_ID}/${DATASET}${DRY_RUN ? " (DRY RUN)" : ""}`);

  // 1. Read all packages + destinations
  console.log("\n[1/5] Reading packages and destinations...");
  const packages = await fetchQuery(`*[_type == "package"]{
    _id, _rev, "slug": slug.current, categories, tags, categoryRefs, tagRefs
  }`);
  const destinations = await fetchQuery(`*[_type == "destination"]{
    _id, _rev, "slug": slug.current, country, countryRef
  }`);
  console.log(`  ${packages.length} packages, ${destinations.length} destinations`);

  // 2. Collect unique values
  const categoryLabels = new Set();
  const tagLabels = new Set();
  const countryLabels = new Set();

  for (const pkg of packages) {
    for (const c of pkg.categories || []) if (c) categoryLabels.add(String(c).trim());
    for (const t of pkg.tags || []) if (t) tagLabels.add(String(t).trim());
  }
  for (const d of destinations) if (d.country) countryLabels.add(String(d.country).trim());

  console.log(`\n[2/5] Unique values found:`);
  console.log(`  categories: ${categoryLabels.size} → ${[...categoryLabels].join(", ")}`);
  console.log(`  tags:       ${tagLabels.size}`);
  console.log(`  countries:  ${countryLabels.size} → ${[...countryLabels].join(", ")}`);

  // 3. Create category/tag/country docs
  console.log("\n[3/5] Creating taxonomy documents...");
  const categoryMutations = [...categoryLabels].map((label) => {
    const slug = slugify(label);
    return {
      createOrReplace: {
        _id: `category-${slug}`,
        _type: "category",
        label,
        slug: { _type: "slug", current: slug },
        sortOrder: 100,
        showInNav: false,
      },
    };
  });
  const tagMutations = [...tagLabels].map((label) => {
    const slug = slugify(label);
    return {
      createOrReplace: {
        _id: `tag-${slug}`,
        _type: "tag",
        label,
        slug: { _type: "slug", current: slug },
        kind: TAG_KIND_MAP[label.toLowerCase()] || "other",
      },
    };
  });
  const countryMutations = [...countryLabels].map((label) => {
    const slug = slugify(label);
    const meta = COUNTRY_META[label] || {};
    return {
      createOrReplace: {
        _id: `country-${slug}`,
        _type: "country",
        name: label,
        slug: { _type: "slug", current: slug },
        ...(meta.iso2 ? { iso2: meta.iso2 } : {}),
        region: meta.region || "Asia",
        ...(meta.currency ? { currency: meta.currency } : {}),
        ...(meta.timezone ? { timezone: meta.timezone } : {}),
        ...(meta.flag ? { flagEmoji: meta.flag } : {}),
      },
    };
  });

  for (const batch of chunk([...categoryMutations, ...tagMutations, ...countryMutations], 50)) {
    await mutate(batch);
  }
  console.log(`  created/replaced: ${categoryMutations.length} categories, ${tagMutations.length} tags, ${countryMutations.length} countries`);

  // 4. Patch packages
  console.log("\n[4/5] Patching packages with refs...");
  let pkgPatched = 0, pkgSkipped = 0;
  const pkgPatches = [];
  for (const pkg of packages) {
    const hasCatRefs = Array.isArray(pkg.categoryRefs) && pkg.categoryRefs.length > 0;
    const hasTagRefs = Array.isArray(pkg.tagRefs) && pkg.tagRefs.length > 0;
    if (hasCatRefs && hasTagRefs) { pkgSkipped++; continue; }

    const set = {};
    if (!hasCatRefs && (pkg.categories || []).length > 0) {
      set.categoryRefs = pkg.categories.map((label) => ({
        _key: `cref-${slugify(label)}`,
        _type: "reference",
        _ref: `category-${slugify(label)}`,
      }));
    }
    if (!hasTagRefs && (pkg.tags || []).length > 0) {
      set.tagRefs = pkg.tags.map((label) => ({
        _key: `tref-${slugify(label)}`,
        _type: "reference",
        _ref: `tag-${slugify(label)}`,
      }));
    }
    if (Object.keys(set).length === 0) { pkgSkipped++; continue; }

    pkgPatches.push({ patch: { id: pkg._id, set } });
    pkgPatched++;
  }
  for (const batch of chunk(pkgPatches, 50)) await mutate(batch);
  console.log(`  patched ${pkgPatched}, skipped ${pkgSkipped}`);

  // 5. Patch destinations
  console.log("\n[5/5] Patching destinations with country ref...");
  let destPatched = 0, destSkipped = 0;
  const destPatches = [];
  for (const d of destinations) {
    if (d.countryRef) { destSkipped++; continue; }
    if (!d.country) { destSkipped++; continue; }
    destPatches.push({
      patch: {
        id: d._id,
        set: {
          countryRef: {
            _type: "reference",
            _ref: `country-${slugify(d.country)}`,
          },
        },
      },
    });
    destPatched++;
  }
  for (const batch of chunk(destPatches, 50)) await mutate(batch);
  console.log(`  patched ${destPatched}, skipped ${destSkipped}`);

  console.log(`\nDone${DRY_RUN ? " (dry run — no writes performed)" : ""}.`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
