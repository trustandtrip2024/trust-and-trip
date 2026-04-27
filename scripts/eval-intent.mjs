#!/usr/bin/env node
//
// LLM eval suite for the WhatsApp intent parser.
//
// Runs a golden dataset of real-shape WhatsApp messages through
// /api/admin/agents/parse-intent and asserts the parsed fields match
// expected values. Run before pushing prompt changes to whatsapp-intent.ts.
//
// Pass rate goal: ≥ 28/30. Below that, the prompt regressed.
//
// Usage:
//   ADMIN_PASSWORD=$ADMIN_SECRET BASE_URL=http://localhost:3002 \
//     node scripts/eval-intent.mjs
//   (CI / staging) BASE_URL=https://staging.trustandtrip.com node scripts/eval-intent.mjs

const BASE = process.env.BASE_URL ?? "http://localhost:3002";
const USER = process.env.ADMIN_USER ?? "admin";
const PASS = process.env.ADMIN_PASSWORD ?? "";

if (!PASS) {
  console.error("Missing ADMIN_PASSWORD env.");
  process.exit(1);
}

const auth = "Basic " + Buffer.from(`${USER}:${PASS}`).toString("base64");

// Golden dataset — keep balanced across the 8 travel types + a few junky inputs.
// Each item: { msg, expect: { field: predicate } }. Predicate can be a string
// (case-insensitive contains) or a function (parsed) → bool.
const TESTS = [
  {
    msg: "Hi planning honeymoon to Maldives in december, 5 days, ~85k budget",
    expect: {
      destination: "maldives",
      travelType: "couple",
      days: (p) => p.days === 5,
      isGreeting: (p) => p.isGreeting === false,
    },
  },
  {
    msg: "char dham yatra 7 days, mom and dad",
    expect: {
      destination: "uttarakhand|char dham|kedarnath",
      travelType: "pilgrim",
      days: (p) => p.days === 7,
    },
  },
  {
    msg: "Bali honeymoon 5N flexible dates couple",
    expect: { destination: "bali", travelType: "couple", days: (p) => p.days === 5 },
  },
  {
    msg: "Switzerland 8 days for our anniversary",
    expect: { destination: "switzerland", travelType: "couple", days: (p) => p.days === 8 },
  },
  {
    msg: "Kerala family trip 6 nights with 2 kids 4 adults",
    expect: { destination: "kerala", travelType: "family", days: (p) => p.days === 6 },
  },
  {
    msg: "Spiti Valley solo bike trip 9 days",
    expect: {
      destination: "spiti",
      travelType: "solo|adventure",
      days: (p) => p.days === 9,
    },
  },
  {
    msg: "Group of 12 friends to Thailand 7 nights",
    expect: { destination: "thailand", travelType: "group", days: (p) => p.days === 7 },
  },
  {
    msg: "Dubai luxury family 5 nights",
    expect: { destination: "dubai", travelType: "luxury|family", days: (p) => p.days === 5 },
  },
  {
    msg: "Wellness retreat in Kerala for 4 nights",
    expect: { destination: "kerala", travelType: "wellness", days: (p) => p.days === 4 },
  },
  {
    msg: "Hello",
    expect: { isGreeting: (p) => p.isGreeting === true },
  },
  {
    msg: "namaste",
    expect: { isGreeting: (p) => p.isGreeting === true },
  },
  {
    msg: "Kedarnath helicopter 2N",
    expect: {
      destination: "kedarnath|uttarakhand",
      travelType: "pilgrim",
      days: (p) => p.days === 2,
    },
  },
  {
    msg: "Maldives overwater villa 7 nights from Mumbai, 1.5L pp",
    expect: {
      destination: "maldives",
      days: (p) => p.days === 7,
      fromCity: "mumbai",
    },
  },
  {
    msg: "char dham road trip 10 days",
    expect: {
      destination: "uttarakhand|char dham",
      travelType: "pilgrim",
      days: (p) => p.days === 10,
    },
  },
  {
    msg: "Andaman 5N honeymoon scuba diving",
    expect: {
      destination: "andaman|india",
      travelType: "couple|adventure",
      days: (p) => p.days === 5,
    },
  },
  {
    msg: "Rajasthan family 8 days palaces",
    expect: { destination: "rajasthan|india", travelType: "family", days: (p) => p.days === 8 },
  },
  {
    msg: "Singapore 4 days family with toddler",
    expect: { destination: "singapore", travelType: "family", days: (p) => p.days === 4 },
  },
  {
    msg: "Vietnam ha long bay 6 nights",
    expect: { destination: "vietnam", days: (p) => p.days === 6 },
  },
  {
    msg: "Sri Lanka cultural trip 7N solo",
    expect: { destination: "sri lanka|srilanka", travelType: "solo", days: (p) => p.days === 7 },
  },
  {
    msg: "Bhutan 5 nights family from Delhi",
    expect: { destination: "bhutan", travelType: "family", days: (p) => p.days === 5 },
  },
  {
    msg: "Nepal Annapurna trek 10 days adventure",
    expect: { destination: "nepal", travelType: "adventure", days: (p) => p.days === 10 },
  },
  {
    msg: "Ladakh honeymoon 7 days",
    expect: {
      destination: "ladakh|india",
      travelType: "couple",
      days: (p) => p.days === 7,
    },
  },
  {
    msg: "Goa group of 8 friends 4 nights",
    expect: { destination: "goa", travelType: "group", days: (p) => p.days === 4 },
  },
  {
    msg: "Mauritius honeymoon 6N from Bangalore, 1.2L pp",
    expect: { destination: "mauritius", travelType: "couple", days: (p) => p.days === 6 },
  },
  {
    msg: "Need a luxury 5N stay anywhere with mountains",
    expect: { travelType: "luxury", days: (p) => p.days === 5 },
  },
  {
    msg: "Honeymoon trip pls share details",
    expect: { travelType: "couple", isGreeting: (p) => p.isGreeting === false },
  },
  {
    msg: "When are good dates for char dham?",
    expect: { destination: "char dham|uttarakhand|kedarnath", travelType: "pilgrim" },
  },
  {
    msg: "Kasol 3N trekking solo",
    expect: { travelType: "solo|adventure", days: (p) => p.days === 3 },
  },
  {
    msg: "Bali couples retreat 7 nights wellness yoga",
    expect: {
      destination: "bali",
      travelType: "wellness|couple",
      days: (p) => p.days === 7,
    },
  },
  {
    msg: "asdfgh",
    expect: { isGreeting: (p) => p.isGreeting === true || p.destination === null },
  },
];

let pass = 0;
let fail = 0;
const failures = [];

for (const t of TESTS) {
  const res = await fetch(`${BASE}/api/admin/agents/parse-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({ text: t.msg }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    failures.push({ msg: t.msg, error: `HTTP ${res.status}: ${txt.slice(0, 150)}` });
    fail++;
    process.stdout.write("E");
    continue;
  }
  const { parsed } = await res.json();

  const errors = [];
  for (const [field, predicate] of Object.entries(t.expect)) {
    const got = parsed?.[field];
    let ok;
    if (typeof predicate === "function") {
      ok = predicate(parsed ?? {});
    } else {
      const want = String(predicate).toLowerCase();
      const haystack = String(got ?? "").toLowerCase();
      ok = want.split("|").some((alt) => haystack.includes(alt));
    }
    if (!ok) errors.push(`${field}: expected ${typeof predicate === "function" ? "<fn>" : predicate}, got ${JSON.stringify(got)}`);
  }

  if (errors.length === 0) {
    pass++;
    process.stdout.write(".");
  } else {
    fail++;
    process.stdout.write("F");
    failures.push({ msg: t.msg, errors, parsed });
  }
}

console.log("\n");
console.log(`  ${pass} / ${TESTS.length} passed (${((pass / TESTS.length) * 100).toFixed(0)}%)`);

if (failures.length) {
  console.log("\n  Failures:\n");
  for (const f of failures) {
    console.log(`  • "${f.msg}"`);
    if (f.error) console.log(`    err: ${f.error}`);
    if (f.errors) {
      for (const e of f.errors) console.log(`    ✗ ${e}`);
    }
    if (f.parsed) console.log(`    parsed: ${JSON.stringify(f.parsed)}`);
  }
}

const passRate = pass / TESTS.length;
const threshold = Number(process.env.PASS_THRESHOLD ?? 0.9);
if (passRate < threshold) {
  console.error(`\n  Below threshold (${(passRate * 100).toFixed(0)}% < ${(threshold * 100).toFixed(0)}%) — fail.\n`);
  process.exit(1);
}
console.log("\n  ✓ within threshold.\n");
