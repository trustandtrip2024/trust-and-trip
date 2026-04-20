import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import type { Lead } from "@/lib/supabase";
import { LeadNotifyEmail } from "@/lib/emails/lead-notify";
import { LeadConfirmEmail } from "@/lib/emails/lead-confirm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const body: Lead = await req.json();

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
    }

    // 1. Save to Supabase
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

    // 2. Send emails via Resend (fire-and-forget)
    if (resend) {
      const BUSINESS_EMAIL = "hello@trustandtrip.com";
      const FROM = "Trust and Trip <noreply@trustandtrip.com>";

      // Notify business
      resend.emails.send({
        from: FROM,
        to: [BUSINESS_EMAIL],
        subject: `New enquiry from ${body.name.trim()} — ${body.package_title ?? body.destination ?? "General"}`,
        react: LeadNotifyEmail({
          name: body.name.trim(),
          phone: body.phone.trim(),
          email: body.email?.trim() ?? "",
          destination: body.destination,
          travelType: body.travel_type,
          travelDate: body.travel_date,
          numTravellers: body.num_travellers,
          budget: body.budget,
          message: body.message?.trim(),
          packageTitle: body.package_title,
          source: body.source ?? "contact_form",
          pageUrl: body.page_url,
        }),
      }).catch((e: unknown) => console.error("Notify email error:", e));

      // Confirm to customer (only if email provided)
      if (body.email?.trim()) {
        resend.emails.send({
          from: FROM,
          to: [body.email.trim()],
          subject: "We've received your enquiry — Trust and Trip",
          react: LeadConfirmEmail({
            name: body.name.trim(),
            packageTitle: body.package_title,
            destination: body.destination,
          }),
        }).catch((e: unknown) => console.error("Confirm email error:", e));
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
