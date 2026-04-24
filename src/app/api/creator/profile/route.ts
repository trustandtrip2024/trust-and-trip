import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const allowed = {
      full_name: body.full_name,
      phone: body.phone,
      instagram_handle: body.instagram_handle,
      payout_method: body.payout_method,
      payout_details: body.payout_details ? { raw: body.payout_details } : null,
    };
    const update = Object.fromEntries(Object.entries(allowed).filter(([, v]) => v !== undefined));

    const { error } = await admin.from("creators").update(update).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[creator/profile] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
