#!/usr/bin/env node
// Submit a synthetic lead to prod /api/leads. If Resend is wired on Vercel,
// you'll receive 2 emails: business notify + applicant confirm.
//
// Usage: node scripts/test-lead-email.mjs <email-to-receive-confirm>

const email = process.argv[2] || "trustandtrip2023@gmail.com";

const res = await fetch("https://www.trustandtrip.com/api/leads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Resend Smoke Test",
    phone: "9999999999",
    email,
    destination: "Bali",
    travel_type: "Honeymoon",
    travel_date: "2026-06",
    num_travellers: 2,
    budget: "1L-2L",
    message: "This is an automated smoke test. Safe to delete.",
    source: "smoke_test",
  }),
});

const body = await res.json().catch(() => ({}));
console.log(`HTTP ${res.status}`, JSON.stringify(body, null, 2));
console.log(`\nCheck inbox at ${email} + your business email for two messages.`);
console.log("If lead landed in Supabase but no email arrived → Resend env on Vercel is wrong.");
