import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await adminClient
      .from("bookings")
      .select("*")
      .eq("id", params.id)
      .eq("customer_email", user.email)
      .single();

    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error("[user/bookings/[id]] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
