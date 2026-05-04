#!/usr/bin/env node
// Probe Bitrix24 webhook directly. Prints profile + last 5 leads + tries to
// add a synthetic lead. Surfaces any error_description from Bitrix.

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

const URL = process.env.BITRIX24_WEBHOOK_URL?.replace(/\/$/, "");
if (!URL) { console.error("BITRIX24_WEBHOOK_URL missing"); process.exit(1); }

console.log(`Webhook host: ${new URL(URL).host}`);
console.log(`Path segments: ${new URL(URL).pathname.split("/").length}`);

async function call(method, body) {
  const res = await fetch(`${URL}/${method}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

console.log("\n1. profile.json (auth check)...");
const profile = await call("profile");
console.log(`   ${profile.status}`, profile.data.result ? `OK user=${profile.data.result.NAME ?? ""} ${profile.data.result.LAST_NAME ?? ""}` : `FAIL ${profile.data.error_description ?? profile.data.error ?? "unknown"}`);

console.log("\n2. crm.lead.list — last 3 leads...");
const list = await call("crm.lead.list", { order: { ID: "DESC" }, select: ["ID", "TITLE", "DATE_CREATE", "SOURCE_ID"], filter: {} });
if (list.data.result) {
  for (const l of (list.data.result || []).slice(0, 3)) console.log(`   #${l.ID}  ${l.TITLE}  (${l.SOURCE_ID})  ${l.DATE_CREATE}`);
} else {
  console.log(`   FAIL ${list.data.error_description ?? list.data.error}`);
}

console.log("\n3. crm.lead.add — synthetic test...");
const add = await call("crm.lead.add", {
  fields: {
    TITLE: "Bitrix smoke test " + new Date().toISOString().slice(11, 19),
    NAME: "Bitrix",
    LAST_NAME: "Smoke",
    STATUS_ID: "NEW",
    SOURCE_ID: "WEB",
    SOURCE_DESCRIPTION: "Smoke test from bitrix-test.mjs",
    PHONE: [{ VALUE: "9999911111", VALUE_TYPE: "WORK" }],
    EMAIL: [{ VALUE: "smoke@trustandtrip.com", VALUE_TYPE: "WORK" }],
    UF_CRM_DESTINATION: "Bali",
    UF_CRM_TRAVEL_TYPE: "Honeymoon",
  },
});
console.log(`   ${add.status}`, add.data.result ? `OK created lead ID ${add.data.result}` : `FAIL ${add.data.error_description ?? JSON.stringify(add.data).slice(0, 300)}`);
