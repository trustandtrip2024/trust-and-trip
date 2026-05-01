#!/usr/bin/env node
// Editorial flagger — scan every Sanity `package` doc for shippable
// quality issues and emit a CSV the content team can work through.
//
// Flags raised (each becomes a column with 1/0 + a short reason):
//   - customer_name_leak  : title/description contains a guest name
//                            ("Mr Sharma", "Mehta family", first-person
//                            "we", customer slug like "for-rajiv-ji")
//   - vague_title         : title too short (<20), no destination word,
//                            generic ("Tour package", "Holiday plan"),
//                            still has "imported-pdf-N" placeholder
//   - missing_description : null/empty/<60 chars
//   - missing_highlights  : 0 highlights
//   - missing_inclusions  : 0 inclusions
//   - missing_hero        : no heroImage
//   - placeholder_price   : price <= 0 or = 99999 sentinel
//
// Output: editorial-flags.csv at repo root, sorted by total_flags desc.

import fs from "node:fs";
import path from "node:path";

const ENV = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(ENV)) {
  for (const line of fs.readFileSync(ENV, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let [, k, v] = m;
    v = v.trim().replace(/^"|"$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
if (!PROJECT) { console.error("Need NEXT_PUBLIC_SANITY_PROJECT_ID"); process.exit(1); }

const QUERY = encodeURIComponent(`*[_type == "package" && !(_id in path("drafts.**"))] {
  _id,
  "slug": slug.current,
  title,
  description,
  price,
  "destinationName": destination->name,
  "highlightsCount": count(highlights),
  "inclusionsCount": count(inclusions),
  "hasImage": defined(image) || defined(heroImage),
  categories
}`);

const url = `https://${PROJECT}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${QUERY}`;
console.log("Fetching packages from Sanity...");
const res = await fetch(url);
if (!res.ok) { console.error("Sanity query failed:", res.status, await res.text()); process.exit(1); }
const { result: packages = [] } = await res.json();
console.log(`Got ${packages.length} packages.`);

// ── Detection rules ────────────────────────────────────────────────

// Require a capitalised name after the honorific so "Sri Lanka", "Mr."
// at sentence-start with a verb, etc. don't false-positive. Case-sensitive
// on the honorific itself for the same reason.
const HONORIFICS = /\b(Mr|Mrs|Ms|Dr|Smt|Shri|Miss|Mister)\.?\s+[A-Z][a-z]+/;
// Honorific + name patterns ("Sharma ji", "Mehta sahab", "Rao garu") —
// require a capitalised surname so "5n6d-family" doesn't trip.
const HONORIFIC_SUFFIX = /\b[A-Z][a-z]{2,}\s+(ji|sahab|saheb|garu)\b/;
const FIRST_PERSON = /\b(my|our|we are|i am|i have|hubby|wifey|honeymoon for)\b/i;
const FOR_NAMED = /\bfor\s+(mr|mrs|ms|dr|smt|shri|sri)\.?\s+[a-z]/i;
const POSSESSIVE_NAME = /\b[A-Z][a-z]{2,}'s\s+(trip|tour|holiday|vacation|honeymoon|yatra|getaway|package)\b/;
const PLACEHOLDER_TITLE = /imported[-\s]?pdf[-\s]?\d+|untitled|test\s*package|^sample\b/i;

const GENERIC_TITLES = [
  /^tour package$/i,
  /^holiday package$/i,
  /^travel plan$/i,
  /^trip plan$/i,
  /^itinerary$/i,
  /^package\b/i,
];

function flagPackage(p) {
  const title = (p.title || "").trim();
  const desc = (p.description || "").trim();
  const dest = (p.destinationName || "").toLowerCase();

  const flags = {
    customer_name_leak: 0,
    vague_title: 0,
    missing_description: 0,
    missing_highlights: 0,
    missing_inclusions: 0,
    missing_hero: 0,
    placeholder_price: 0,
  };
  const reasons = [];

  // Customer-name leakage
  if (HONORIFICS.test(title) || HONORIFICS.test(desc)) {
    flags.customer_name_leak = 1;
    reasons.push("honorific (Mr/Mrs/Smt) in title or desc");
  } else if (FOR_NAMED.test(title)) {
    flags.customer_name_leak = 1;
    reasons.push("'for Mr/Mrs ...' in title");
  } else if (HONORIFIC_SUFFIX.test(title)) {
    flags.customer_name_leak = 1;
    reasons.push("'<Surname> ji/sahab/garu' in title");
  } else if (POSSESSIVE_NAME.test(title)) {
    flags.customer_name_leak = 1;
    reasons.push("'<Name>'s trip/tour/honeymoon' in title");
  } else if (FIRST_PERSON.test(title)) {
    flags.customer_name_leak = 1;
    reasons.push("first-person language in title");
  }

  // Vague / placeholder title
  if (!title) {
    flags.vague_title = 1;
    reasons.push("empty title");
  } else if (PLACEHOLDER_TITLE.test(title)) {
    flags.vague_title = 1;
    reasons.push("placeholder title (imported-pdf-N / untitled)");
  } else if (GENERIC_TITLES.some((re) => re.test(title))) {
    flags.vague_title = 1;
    reasons.push("generic title");
  } else if (title.length < 20) {
    flags.vague_title = 1;
    reasons.push("title <20 chars");
  } else if (!/[a-zA-Z]{4,}/.test(title)) {
    // Title is mostly numbers/codes (e.g. "5N6D 12345") — no real place
    // word. Skip the destination-name check entirely; sub-city titles
    // like "Rishikesh Mussoorie" are valid for region destinations.
    flags.vague_title = 1;
    reasons.push("title has no recognisable place word");
  }
  void dest;

  // Missing/short description
  if (!desc) {
    flags.missing_description = 1;
    reasons.push("no description");
  } else if (desc.length < 60) {
    flags.missing_description = 1;
    reasons.push(`description ${desc.length} chars`);
  }

  if ((p.highlightsCount ?? 0) === 0) {
    flags.missing_highlights = 1;
    reasons.push("0 highlights");
  }
  if ((p.inclusionsCount ?? 0) === 0) {
    flags.missing_inclusions = 1;
    reasons.push("0 inclusions");
  }
  if (!p.hasImage) {
    flags.missing_hero = 1;
    reasons.push("no image set");
  }
  if (!p.price || p.price <= 0 || p.price === 99999) {
    flags.placeholder_price = 1;
    reasons.push(`price=${p.price ?? "null"}`);
  }

  const total = Object.values(flags).reduce((s, n) => s + n, 0);
  return { ...flags, total_flags: total, reasons: reasons.join(" | ") };
}

const rows = packages.map((p) => {
  const f = flagPackage(p);
  return {
    slug: p.slug || "",
    title: (p.title || "").replace(/"/g, "'"),
    destination: p.destinationName || "",
    price: p.price ?? "",
    ...f,
  };
});

rows.sort((a, b) => b.total_flags - a.total_flags);

// ── CSV emit ───────────────────────────────────────────────────────

const HEADERS = [
  "slug", "title", "destination", "price", "total_flags",
  "customer_name_leak", "vague_title", "missing_description",
  "missing_highlights", "missing_inclusions", "missing_hero",
  "placeholder_price", "reasons",
];

const csv = [
  HEADERS.join(","),
  ...rows.map((r) => HEADERS.map((h) => {
    const v = r[h];
    if (v === undefined || v === null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")),
].join("\n");

const OUT = path.resolve(process.cwd(), "editorial-flags.csv");
fs.writeFileSync(OUT, csv, "utf8");

const flagged = rows.filter((r) => r.total_flags > 0);
console.log(`\nWrote ${OUT}`);
console.log(`Total: ${rows.length} packages | Flagged: ${flagged.length} (${Math.round(flagged.length / rows.length * 100)}%)`);

const breakdown = HEADERS.filter((h) => h.startsWith("customer_") || h.startsWith("vague_") || h.startsWith("missing_") || h.startsWith("placeholder_"));
console.log("\nFlag breakdown:");
for (const h of breakdown) {
  const n = rows.filter((r) => r[h] === 1).length;
  if (n > 0) console.log(`  ${h.padEnd(22)} ${n}`);
}

console.log("\nTop 10 most-flagged:");
for (const r of rows.slice(0, 10)) {
  if (r.total_flags === 0) break;
  console.log(`  [${r.total_flags}] ${r.slug.padEnd(40)} — ${r.reasons}`);
}
