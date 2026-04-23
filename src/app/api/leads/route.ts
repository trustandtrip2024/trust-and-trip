import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Lead } from "@/lib/supabase";
import { pushLead } from "@/lib/bitrix24";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendEmails(body: Lead) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    // Dynamically import to avoid build-time issues with Resend v6
    const { Resend } = await import("resend");
    const { LeadNotifyEmail } = await import("@/lib/emails/lead-notify");
    const { LeadConfirmEmail } = await import("@/lib/emails/lead-confirm");

    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM = "Trust and Trip <noreply@trustandtrip.com>";
    const BUSINESS_EMAIL = "hello@trustandtrip.com";

    resend.emails.send({
      from: FROM,
      to: [BUSINESS_EMAIL],
      subject: `New enquiry from ${body.name} — ${body.package_title ?? body.destination ?? "General"}`,
      react: LeadNotifyEmail({
        name: body.name,
        phone: body.phone,
        email: body.email ?? "",
        destination: body.destination,
        travelType: body.travel_type,
        travelDate: body.travel_date,
        numTravellers: body.num_travellers,
        budget: body.budget,
        message: body.message,
        packageTitle: body.package_title,
        source: body.source ?? "contact_form",
        pageUrl: body.page_url,
      }),
    }).catch((e: unknown) => console.error("Notify email error:", e));

    if (body.email?.trim()) {
      resend.emails.send({
        from: FROM,
        to: [body.email.trim()],
        subject: "We've received your enquiry — Trust and Trip",
        react: LeadConfirmEmail({
          name: body.name,
          packageTitle: body.package_title,
          destination: body.destination,
        }),
      }).catch((e: unknown) => console.error("Confirm email error:", e));
    }
  } catch (e) {
    console.error("Email send error:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Lead = await req.json();

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

    // Fire-and-forget emails
    sendEmails(body);

    // Fire-and-forget Bitrix24 sync — errors logged but never block response
    pushLead(body).catch((e) => console.error("Bitrix24 pushLead error:", e));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
