import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Protected by middleware Basic Auth (matcher covers /api/admin/*)
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function genTempPassword(): string {
  // 14-char random — copy/paste friendly, no ambiguous chars
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.randomBytes(14))
    .map((b) => alphabet[b % alphabet.length])
    .join("");
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: creator, error } = await admin
      .from("creators")
      .select("id, full_name, email, status, user_id, ref_code")
      .eq("id", params.id)
      .single();

    if (error || !creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    if (creator.status === "active" && creator.user_id) {
      return NextResponse.json({ already_active: true, ref_code: creator.ref_code });
    }

    let userId = creator.user_id;
    let tempPassword: string | null = null;

    if (!userId) {
      // Look up existing auth user by email
      const { data: { users } } = await admin.auth.admin.listUsers();
      const existing = users?.find((u) => u.email?.toLowerCase() === creator.email.toLowerCase());

      if (existing) {
        userId = existing.id;
        // Bump role on existing user
        await admin.auth.admin.updateUserById(existing.id, {
          user_metadata: { ...existing.user_metadata, role: "creator", full_name: creator.full_name },
        });
      } else {
        // Create new auth user with random password
        tempPassword = genTempPassword();
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email: creator.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { role: "creator", full_name: creator.full_name },
        });
        if (createErr || !created.user) {
          return NextResponse.json({ error: createErr?.message ?? "Failed to create user" }, { status: 500 });
        }
        userId = created.user.id;
      }
    }

    // Activate
    const { error: updErr } = await admin
      .from("creators")
      .update({ status: "active", user_id: userId })
      .eq("id", creator.id);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      ref_code: creator.ref_code,
      user_id: userId,
      temp_password: tempPassword, // null if user already existed
    });
  } catch (err) {
    console.error("Approve creator error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
