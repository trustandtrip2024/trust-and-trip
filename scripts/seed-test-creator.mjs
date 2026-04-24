// One-shot: seed a test creator (auth user + active creators row).
// Run: node scripts/seed-test-creator.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local
const env = {};
for (const rawLine of readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/)) {
  const line = rawLine.trim();
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, key);

const EMAIL = "testcreator@trustandtrip.test";
const PASSWORD = "TestCreator!2026";
const FULL_NAME = "Test Creator";

function generateRefCode() {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "CRTR-";
  for (let i = 0; i < 6; i++) s += alpha[Math.floor(Math.random() * alpha.length)];
  return s;
}

// 1. Auth user (create or fetch)
const { data: list } = await admin.auth.admin.listUsers();
let user = list?.users?.find((u) => u.email?.toLowerCase() === EMAIL);
if (user) {
  await admin.auth.admin.updateUserById(user.id, {
    password: PASSWORD,
    user_metadata: { ...user.user_metadata, role: "creator", full_name: FULL_NAME },
  });
  console.log("Auth user updated:", user.id);
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role: "creator", full_name: FULL_NAME },
  });
  if (error) { console.error(error); process.exit(1); }
  user = data.user;
  console.log("Auth user created:", user.id);
}

// 2. creators row (upsert by email)
const { data: existing } = await admin
  .from("creators")
  .select("id, ref_code, status, user_id")
  .eq("email", EMAIL)
  .maybeSingle();

let ref_code, creatorId;
if (existing) {
  const { error } = await admin
    .from("creators")
    .update({ status: "active", user_id: user.id, full_name: FULL_NAME })
    .eq("id", existing.id);
  if (error) { console.error(error); process.exit(1); }
  ref_code = existing.ref_code;
  creatorId = existing.id;
  console.log("Creator row updated:", creatorId);
} else {
  ref_code = generateRefCode();
  const { data, error } = await admin
    .from("creators")
    .insert({
      user_id: user.id,
      full_name: FULL_NAME,
      email: EMAIL,
      phone: "+910000000000",
      instagram_handle: "testcreator",
      audience_size: 10000,
      ref_code,
      status: "active",
      commission_pct: 5.0,
    })
    .select("id")
    .single();
  if (error) { console.error(error); process.exit(1); }
  creatorId = data.id;
  console.log("Creator row inserted:", creatorId);
}

console.log("\n=== TEST CREATOR READY ===");
console.log("Login URL: http://localhost:3000/login");
console.log("Email:     " + EMAIL);
console.log("Password:  " + PASSWORD);
console.log("Ref code:  " + ref_code);
console.log("Dashboard: http://localhost:3000/creators/dashboard");
console.log("Ref link:  http://localhost:3000/?ref=" + ref_code);
