#!/usr/bin/env node
// Tag each imported-pdf-N package with its source-city pickup hint
// (ex-haridwar, ex-lucknow, ex-kanpur …). Tier-2/3 source-city
// pickups are a slot Veena/PYT don't compete on, and the imported
// PDFs already encode the data — we just need to surface it as a
// queryable tag.
//
// Default is dry-run. --commit pushes the patches.

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

const TOK = process.env.SANITY_API_WRITE_TOKEN;
const COMMIT = process.argv.includes("--commit");
if (COMMIT && !TOK) { console.error("Need SANITY_API_WRITE_TOKEN"); process.exit(1); }

const PDF_TXT = path.resolve(process.cwd(), ".tat-pdf-cache");

const CITIES = [
  ["haridwar",   /\bex\s+haridwar\b|from\s+haridwar/i],
  ["lucknow",    /\bex\s+lucknow\b|from\s+lucknow|via\s+lucknow|lucknow\s+(airport|railway)/i],
  ["kanpur",     /\bex\s+kanpur\b|from\s+kanpur|kanpur\s+(airport|railway)/i],
  ["delhi",      /\bex\s+delhi\b|from\s+delhi|new\s+delhi\s+(railway|airport)/i],
  ["mumbai",     /\bex\s+mumbai\b|from\s+mumbai|chhatrapati\s+shivaji/i],
  ["chandigarh", /\bex\s+chandigarh\b|from\s+chandigarh|chandigarh\s+(airport|railway)/i],
  ["indore",     /\bex\s+indore\b|from\s+indore/i],
  ["patna",      /\bex\s+patna\b|from\s+patna/i],
  ["bhopal",     /\bex\s+bhopal\b|from\s+bhopal/i],
  ["nagpur",     /\bex\s+nagpur\b|from\s+nagpur/i],
  ["pune",       /\bex\s+pune\b|from\s+pune/i],
  ["jaipur",     /\bex\s+jaipur\b|from\s+jaipur/i],
  ["bangalore",  /\bex\s+bangalore\b|from\s+bangalore|bengaluru\s+airport/i],
];

const txtFiles = fs.readdirSync(PDF_TXT)
  .filter((f) => f.endsWith(".txt"))
  .map((f) => ({ num: parseInt(f, 10), file: f }))
  .filter((x) => Number.isFinite(x.num))
  .sort((a, b) => a.num - b.num);

const patches = [];
const summary = [];
for (const { num, file } of txtFiles) {
  const txt = fs.readFileSync(path.join(PDF_TXT, file), "utf8");
  // Only inspect the doc head (title + summary block) so cancellation
  // boilerplate doesn't pollute the result.
  const head = txt.slice(0, 2000);
  const found = [];
  for (const [city, rx] of CITIES) {
    if (rx.test(head)) found.push(city);
  }
  if (!found.length) continue;
  const tags = found.map((c) => `ex-${c}`);
  patches.push({
    patch: {
      id: `imported-pdf-${num}`,
      setIfMissing: { tags: [] },
      // Append unique — Sanity dedupe via insert + after on tags array
      insert: { after: "tags[-1]", items: tags },
    },
  });
  summary.push(`imported-pdf-${num}\t${found.join(", ")}`);
}

console.log(`${summary.length} packages to tag:\n`);
console.log(summary.join("\n"));

if (!COMMIT) {
  console.log(`\nDry-run. Re-run with --commit to push patches.`);
  process.exit(0);
}

const res = await fetch(
  "https://ncxbf32w.api.sanity.io/v2024-01-01/data/mutate/production?returnIds=true&visibility=sync",
  {
    method: "POST",
    headers: { Authorization: `Bearer ${TOK}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations: patches }),
  },
);
const j = await res.json();
console.log(`\nstatus=${res.status} resultIds=${(j.results || []).length}`);
if (!res.ok) console.error(JSON.stringify(j, null, 2));
