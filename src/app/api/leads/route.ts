import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { Lead } from "@/lib/supabase";
import { pushLead, createLeadTask } from "@/lib/bitrix24";
import { REF_COOKIE, isValidRefCode, findActiveCreator } from "@/lib/creator-attribution";
import { rateLimit, clientIp } from "@/lib/redis";
import { capiLead, ipFromRequest } from "@/lib/meta-capi";
import { alertLead, isHotLead } from "@/lib/lead-alerts";
import { scoreLead } from "@/lib/lead-scoring";
import { ga4Lead, clientIdFromCookie } from "@/lib/ga4-mp";

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
    const FROM = process.env.RESEND_FROM ?? "Trust and Trip <noreply@trustandtrip.com>";
    const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL ?? "hello@trustandtrip.com";

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

/** Click-intent sources don't require name/phone — they capture anonymous interest before a form is filled. */
const INTENT_SOURCES = new Set([
  "book_now_click",
  "call_click",
  "whatsapp_click",
  "customize_click",
  "enquire_click",
  "schedule_call_click",
]);

export async function POST(req: NextRequest) {
  // Rich error logging so 500s always tell us what broke (dev + prod).
  const debug: string[] = [];
  const mark = (s: string) => debug.push(`[${new Date().toISOString()}] ${s}`);

  try {
    mark("1. route entry");
    // Rate limit by IP — prevent flood of spam leads. 30 / minute per IP.
    const ip = clientIp(req);
    const { allowed } = await rateLimit(`leads:${ip}`, { limit: 30, windowSeconds: 60 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }
    const body: Lead = await req.json();
    mark(`2. body parsed (source=${body.source ?? "(none)"})`);
    const isIntent = INTENT_SOURCES.has(body.source ?? "");

    if (!isIntent) {
      // Newsletter sign-ups only need email. Every other form needs name + phone.
      if (body.source === "newsletter") {
        if (!body.email?.trim()) {
          return NextResponse.json({ error: "Email is required." }, { status: 400 });
        }
      } else {
        if (!body.name?.trim() || !body.phone?.trim()) {
          return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
        }
      }
    }

    // For intent-only submissions use a human-readable placeholder so the admin
    // panel and Bitrix24 both have sensible values (Supabase columns are NOT NULL).
    const safeName  = body.name?.trim()  || "Website Visitor";
    const safePhone = body.phone?.trim() || "";
    const safeEmail = body.email?.trim() || "";

    mark("3. validating env");
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: "Server misconfigured: Supabase env vars missing",
        debug,
      }, { status: 500 });
    }

    // Read referral cookie (set by middleware on ?ref= visits) — body.ref_code overrides
    const cookieRef = cookies().get(REF_COOKIE)?.value;
    const refCode = isValidRefCode((body as Lead & { ref_code?: string }).ref_code)
      ? (body as Lead & { ref_code?: string }).ref_code!
      : (isValidRefCode(cookieRef) ? cookieRef! : null);

    mark(`3b. ref_code=${refCode ?? "(none)"}`);

    // Score before insert so the row carries score + tier from day one.
    const { score, tier, reasons } = scoreLead({
      name: safeName,
      email: safeEmail,
      phone: safePhone,
      destination: body.destination,
      travel_type: body.travel_type,
      travel_date: body.travel_date,
      num_travellers: body.num_travellers,
      budget: body.budget,
      package_title: body.package_title,
      package_slug: body.package_slug,
      source: body.source ?? "contact_form",
      utm_source: body.utm_source,
      utm_medium: body.utm_medium,
      message: body.message,
    });
    mark(`3c. score=${score} tier=${tier}`);

    // Lead dedup: same phone (or email) + destination within the last 1h →
    // update the existing row in place instead of inserting a fresh one.
    // Stops accidental double-submits + form spammers from inflating the
    // Pixel Lead optimizer signal. Only applies to non-intent submissions
    // — click-intents already have a separate dedup story (1 row per click
    // is fine, they're attribution markers).
    let dedupedLeadId: string | null = null;
    if (!isIntent && (safePhone || safeEmail) && body.destination) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const filters: string[] = [];
      if (safePhone) filters.push(`phone.eq.${safePhone}`);
      if (safeEmail) filters.push(`email.eq.${safeEmail}`);
      const { data: prior } = await supabase
        .from("leads")
        .select("id")
        .eq("destination", body.destination)
        .gte("created_at", oneHourAgo)
        .or(filters.join(","))
        .order("created_at", { ascending: false })
        .limit(1);
      if (prior && prior.length > 0) {
        dedupedLeadId = prior[0].id as string;
        mark(`3d. dedup hit — reusing lead ${dedupedLeadId}`);
      }
    }

    mark("4. supabase write (insert or dedup-update)");

    let leadRow: { id: string } | null = null;
    let error: { message?: string; code?: string; details?: string; hint?: string } | null = null;

    if (dedupedLeadId) {
      // Update in place — refresh score/tier and any newer fields.
      const { error: upErr } = await supabase
        .from("leads")
        .update({
          name: safeName,
          email: safeEmail || undefined,
          phone: safePhone || undefined,
          message: body.message?.trim() || undefined,
          travel_date: body.travel_date,
          num_travellers: body.num_travellers,
          budget: body.budget,
          score,
          tier,
        })
        .eq("id", dedupedLeadId);
      error = upErr;
      leadRow = upErr ? null : { id: dedupedLeadId };
    } else {
      const ins = await supabase
        .from("leads")
        .insert({
          name: safeName,
          email: safeEmail,
          phone: safePhone,
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
          utm_content: body.utm_content,
          utm_term: body.utm_term,
          wa_variant: body.wa_variant,
          page_url: body.page_url,
          ref_code: refCode,
          score,
          tier,
          status: "new",
        })
        .select("id")
        .single();
      leadRow = (ins.data as { id: string } | null) ?? null;
      error = ins.error;
    }

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({
        error: "Failed to save enquiry.",
        supabase_error: {
          message: error.message,
          code: (error as { code?: string }).code,
          details: (error as { details?: string }).details,
          hint: (error as { hint?: string }).hint,
        },
        debug,
      }, { status: 500 });
    }

    mark("5. supabase insert OK");

    // Creator attribution: link this lead to the creator referenced by ref_code.
    // Fire-and-forget — never blocks lead capture.
    if (refCode && leadRow?.id) {
      (async () => {
        try {
          const creator = await findActiveCreator(refCode);
          if (!creator) return;
          await supabase.from("creator_attributions").insert({
            creator_id: creator.id,
            ref_code: refCode,
            lead_id: leadRow.id,
            source: "cookie",
            utm_campaign: body.utm_campaign ?? null,
            page_url: body.page_url ?? null,
          });
        } catch (e) {
          console.error("Creator attribution insert error:", e);
        }
      })();
    }
    mark("5b. creator attribution queued");

    // Fire-and-forget emails — skip for anonymous click intents (no one to confirm to)
    if (!isIntent) {
      sendEmails({ ...body, name: safeName, email: safeEmail, phone: safePhone });
    }
    mark("6. emails queued");

    // Fire-and-forget Bitrix24 sync — errors logged but never block response.
    // Always push, even intents, so sales sees every click in the CRM.
    // For tier=A leads, follow the Bitrix push with a 5-minute SLA Task so
    // a planner sees a hard deadline ticking in their dashboard.
    void (async () => {
      try {
        const bitrixLeadId = await pushLead({
          ...body,
          name: safeName,
          email: safeEmail,
          phone: safePhone,
          ref_code: refCode ?? undefined,
        });
        if (bitrixLeadId && tier === "A" && !isIntent) {
          await createLeadTask({
            leadId: bitrixLeadId,
            title: `🔥 HOT LEAD — call ${safeName} within 5 min (${body.destination ?? "no destination"})`,
            description: [
              `Phone: ${safePhone || "—"}`,
              `Email: ${safeEmail || "—"}`,
              `Destination: ${body.destination ?? "—"}`,
              `Travel type: ${body.travel_type ?? "—"}`,
              `Travel date: ${body.travel_date ?? "—"}`,
              `Budget: ${body.budget ?? "—"}`,
              `Score: ${score}/100`,
              `Source: ${body.source ?? "—"} · UTM: ${body.utm_source ?? "-"}/${body.utm_campaign ?? "-"}`,
              "",
              `Reasons: ${reasons.join(", ")}`,
            ].join("\n"),
            deadlineMinutes: 5,
          }).catch((e) => console.error("Bitrix24 createLeadTask error:", e));
        }
      } catch (e) {
        console.error("Bitrix24 pushLead error:", e);
      }
    })();
    mark("7. bitrix24 pushLead queued");

    // Meta CAPI — server-side Lead event with event_id for de-dup against browser Pixel.
    // Skip click intents (low signal, would inflate Lead count and confuse the optimizer).
    let eventId: string | undefined;
    if (!isIntent && body.source !== "newsletter") {
      const fbp = cookies().get("_fbp")?.value;
      const fbc = cookies().get("_fbc")?.value;
      const { eventId: id } = await capiLead({
        email: safeEmail || undefined,
        phone: safePhone || undefined,
        firstName: safeName?.split(/\s+/)[0],
        externalId: leadRow?.id ? String(leadRow.id) : undefined,
        contentName: body.package_title || body.destination,
        value: body.budget ? Number(body.budget) || 0 : 0,
        fbp,
        fbc,
        clientIp: ipFromRequest(req),
        clientUserAgent: req.headers.get("user-agent") ?? undefined,
        pageUrl: body.page_url,
      });
      eventId = id;
    }
    mark("8. meta capi fired");

    // GA4 Measurement Protocol — server-side mirror of the same Lead event
    // so GA4 sees the conversion even when the browser-side gtag fire is
    // blocked by tracking-prevention. Fire-and-forget.
    if (!isIntent && body.source !== "newsletter") {
      const gaClientId = clientIdFromCookie(cookies().get("_ga")?.value);
      if (gaClientId) {
        void ga4Lead({
          clientId: gaClientId,
          value: body.budget ? Number(body.budget) || 0 : 0,
          contentName: body.package_title || body.destination,
          ipOverride: ipFromRequest(req),
          userAgent: req.headers.get("user-agent") ?? undefined,
          externalId: leadRow?.id ? String(leadRow.id) : undefined,
        }).catch((e) => console.error("[ga4-mp] Lead failed", e));
      }
    }
    mark("8b. ga4 mp fired");

    // Real-time alert to planner. Fire-and-forget. Skip click intents.
    if (!isIntent) {
      const hydrated = { ...body, name: safeName, email: safeEmail, phone: safePhone, id: leadRow?.id };
      // Hot if scored tier A OR the structural heuristic says so — belt + braces.
      const hot = tier === "A" || isHotLead(hydrated);
      alertLead({ lead: hydrated, hot }).catch((e) =>
        console.error("Lead alert error:", e)
      );
    }
    mark(`9. lead alert fired (tier=${tier} reasons=${reasons.length})`);

    return NextResponse.json({ success: true, eventId, score, tier, debug });
  } catch (err) {
    const e = err as Error & { code?: string; digest?: string };
    console.error("Lead API error:", e);
    return NextResponse.json({
      error: "Route threw an exception",
      name: e?.name,
      message: e?.message,
      stack: e?.stack?.split("\n").slice(0, 8),
      code: e?.code,
      digest: e?.digest,
      debug,
    }, { status: 500 });
  }
}
