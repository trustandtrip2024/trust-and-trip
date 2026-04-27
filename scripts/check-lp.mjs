#!/usr/bin/env node
//
// Landing-page performance gate.
// Runs Google PageSpeed Insights on every LP under /lp/* and fails if any
// metric exceeds the budget. Use locally before launching ads, or wire into
// CI to block regressions.
//
// Usage:
//   PAGESPEED_API_KEY=xxx npm run check:lp
//   PAGESPEED_API_KEY=xxx BASE_URL=https://staging.trustandtrip.com npm run check:lp
//   STRATEGY=desktop npm run check:lp
//
// PSI API key is free: https://developers.google.com/speed/docs/insights/v5/get-started
// Without a key the API still works but at ~1 req/sec/IP — fine for 3 URLs.

import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.env.BASE_URL ?? "https://trustandtrip.com";
const STRATEGY = process.env.STRATEGY ?? "mobile"; // "mobile" | "desktop"
const KEY = process.env.PAGESPEED_API_KEY ?? "";

// Google's recommended Core Web Vitals thresholds (mobile, "good" tier).
// Tighten or relax via env: BUDGET_LCP_MS, BUDGET_CLS, BUDGET_INP_MS.
const BUDGET = {
  LCP_MS: Number(process.env.BUDGET_LCP_MS ?? 2500),
  CLS:    Number(process.env.BUDGET_CLS    ?? 0.10),
  INP_MS: Number(process.env.BUDGET_INP_MS ?? 200),
  PERF:   Number(process.env.BUDGET_PERF   ?? 0.85),  // 0-1
};

const URLS = [
  `${BASE}/`,
  `${BASE}/lp/maldives-honeymoon`,
  `${BASE}/lp/bali-honeymoon`,
  `${BASE}/lp/char-dham-yatra`,
];

async function audit(target) {
  const params = new URLSearchParams({
    url: target,
    strategy: STRATEGY,
    category: "performance",
  });
  if (KEY) params.set("key", KEY);

  const res = await fetch(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
    { signal: AbortSignal.timeout(120_000) }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`PSI ${res.status} for ${target}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();

  const audits = data?.lighthouseResult?.audits ?? {};
  const perf = data?.lighthouseResult?.categories?.performance?.score ?? null;
  const lcpMs = audits["largest-contentful-paint"]?.numericValue ?? null;
  const cls = audits["cumulative-layout-shift"]?.numericValue ?? null;
  const inpMs =
    audits["experimental-interaction-to-next-paint"]?.numericValue ??
    audits["max-potential-fid"]?.numericValue ??
    null;

  return { url: target, perf, lcpMs, cls, inpMs };
}

function fmt(label, value, budget, kind) {
  if (value == null) return `  ${label}: —`;
  const ok =
    kind === "lower-is-better" ? value <= budget : value >= budget;
  const num =
    kind === "score" ? `${(value * 100).toFixed(0)}` :
    kind === "ms"    ? `${Math.round(value)}ms` :
                       `${value.toFixed(3)}`;
  const lim =
    kind === "score" ? `${(budget * 100).toFixed(0)}` :
    kind === "ms"    ? `${budget}ms` :
                       `${budget}`;
  return `  ${ok ? "✅" : "❌"} ${label.padEnd(14)} ${num.padStart(8)} (budget ${lim})`;
}

async function main() {
  console.log(`\n  Running PageSpeed Insights — strategy=${STRATEGY}\n  Base: ${BASE}\n`);
  const failures = [];

  for (const url of URLS) {
    process.stdout.write(`  → ${url}  `);
    try {
      const r = await audit(url);
      const lcpFail = r.lcpMs != null && r.lcpMs > BUDGET.LCP_MS;
      const clsFail = r.cls   != null && r.cls   > BUDGET.CLS;
      const inpFail = r.inpMs != null && r.inpMs > BUDGET.INP_MS;
      const perfFail = r.perf != null && r.perf < BUDGET.PERF;

      console.log("\n");
      console.log(fmt("Performance", r.perf,  BUDGET.PERF,  "score"));
      console.log(fmt("LCP",         r.lcpMs, BUDGET.LCP_MS, "ms"));
      console.log(fmt("CLS",         r.cls,   BUDGET.CLS,    "lower-is-better"));
      console.log(fmt("INP",         r.inpMs, BUDGET.INP_MS, "ms"));
      console.log("");

      if (lcpFail || clsFail || inpFail || perfFail) {
        failures.push({ url, perf: r.perf, lcpMs: r.lcpMs, cls: r.cls, inpMs: r.inpMs });
      }
    } catch (e) {
      console.error(`\n  ⨯ ${e.message}\n`);
      failures.push({ url, error: e.message });
    }

    // Be nice to the API.
    await sleep(1500);
  }

  if (failures.length) {
    console.error(`\n  ${failures.length} URL(s) failed budget:\n`);
    for (const f of failures) console.error("  -", f.url);
    process.exit(1);
  }

  console.log("\n  All URLs within performance budget. 🎉\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
