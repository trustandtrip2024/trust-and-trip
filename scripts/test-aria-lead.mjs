#!/usr/bin/env node
// Mimic Aria-shaped lead payload to /api/leads.
// If Bitrix24 envs on Vercel are wired, lead lands in Bitrix CRM with
// source=aria_chat. If pushLead silently fails, server logs the error.

const res = await fetch("https://www.trustandtrip.com/api/leads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Aria Smoke Test " + new Date().toISOString().slice(11, 19),
    phone: "9999988887",
    email: "trustandtrip2023@gmail.com",
    source: "aria_chat",
    message: "Aria transcript: User asked about Bali honeymoon, 5 nights, June 2026, budget 1.5L. Planner handoff requested.",
    destination: "Bali",
    travel_type: "Honeymoon",
    budget: "1L-2L",
  }),
});
const body = await res.json();
console.log(`HTTP ${res.status}`);
console.log(JSON.stringify(body, null, 2));
console.log("\nNow check:");
console.log("  Supabase: leads table → look for 'Aria Smoke Test ...'");
console.log("  Bitrix24: CRM → Leads → look for same name (source=aria_chat, UF_CRM_TAT_SOURCE)");
console.log("  Vercel logs: search 'Bitrix24 pushLead error' if missing in Bitrix");
