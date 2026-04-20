import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Lead } from "@/lib/supabase";

// Use service role key on server — never exposed to client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body: Lead = await req.json();

    // Basic validation
    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
    }

    const { error } = await supabase.from("leads").insert({
      name: body.name.trim(),
      email: body.email?.trim() ?? "",
      phone: body.phone.trim(),
      message: body.message?.trim(),
      package_title: body.package_title,
      package_slug: body.package_slug,
      destination: body.destination,
      travel_type: body.travel_type,
      travel_date: body.travel_date,
      num_travellers: body.num_travellers,
      budget: body.budget,
      source: body.source ?? "contact_form",
      utm_source: body.utm_source,
      utm_medium: body.utm_medium,
      utm_campaign: body.utm_campaign,
      page_url: body.page_url,
      status: "new",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save enquiry." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
