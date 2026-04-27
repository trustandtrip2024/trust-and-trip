// Itinerary delivery — Resend email + WhatsApp message.
// Called after generateItinerary() to push the draft to the lead.
// Fire-and-forget. Failures logged, never thrown.

import type { GeneratedItinerary } from "./itinerary-engine";

interface DeliverOpts {
  itinerary: GeneratedItinerary;
  matchedPackages?: { slug: string; title: string; currentPrice: number; rating: number }[];
  contact: {
    name?: string;
    email?: string;
    phone?: string;       // E.164 or 10-digit IN; we normalise for WA
  };
  channels?: { email?: boolean; whatsapp?: boolean };
}

// 3 subject variants — rotated for A/B testing. Open rate is the proxy for
// "good subject" — higher OR → more itineraries get read → more conversions.
// Variant id is logged so /admin/ab-tests can rank them.
const SUBJECT_VARIANTS: { id: string; render: (title: string, name: string) => string }[] = [
  { id: "A", render: (title) => `Your draft itinerary — ${title}` },
  { id: "B", render: (title, name) => `${name.split(/\s+/)[0] || "Hi"}, your ${title} draft is ready` },
  { id: "C", render: (title) => `${title} · 60-second draft from your Trust and Trip planner` },
];

function pickSubjectVariant(seed: string): typeof SUBJECT_VARIANTS[number] {
  // Deterministic per email so the same recipient consistently sees the same
  // variant across resends — keeps the A/B test stat sane.
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  return SUBJECT_VARIANTS[Math.abs(h) % SUBJECT_VARIANTS.length];
}

const DEFAULT_NAME = "Traveler";
const HOST = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustandtrip.com";

export async function deliverItinerary(opts: DeliverOpts): Promise<{ email: boolean; whatsapp: boolean }> {
  const channels = { email: true, whatsapp: true, ...(opts.channels ?? {}) };
  const result = { email: false, whatsapp: false };

  if (channels.email && opts.contact.email) {
    try {
      result.email = await sendItineraryEmail(opts);
    } catch (e) {
      console.error("[itinerary-deliver] email failed", e);
    }
  }

  if (channels.whatsapp && opts.contact.phone) {
    try {
      result.whatsapp = await sendItineraryWhatsApp(opts);
    } catch (e) {
      console.error("[itinerary-deliver] whatsapp failed", e);
    }
  }

  return result;
}

// ─── Email ────────────────────────────────────────────────────────────────

async function sendItineraryEmail({ itinerary, matchedPackages, contact }: DeliverOpts): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  if (!contact.email) return false;

  const { Resend } = await import("resend");
  const { ItineraryDraftEmail } = await import("./emails/itinerary-draft");

  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.RESEND_FROM ?? "Trust and Trip <noreply@trustandtrip.com>";

  // A/B subject variant — deterministic per email so the same recipient
  // sees a consistent subject across resends.
  const variant = pickSubjectVariant(contact.email.toLowerCase());
  const subject = variant.render(itinerary.title, contact.name || DEFAULT_NAME);

  // Best-effort: log variant on the lead row so /admin/ab-tests can
  // measure CVR by subject. Soft failure — never blocks the send.
  void logSubjectVariant(contact.email, variant.id);

  await resend.emails.send({
    from: FROM,
    to: [contact.email],
    subject,
    react: ItineraryDraftEmail({
      name: contact.name || DEFAULT_NAME,
      itinerary,
      matchedPackages,
    }),
    headers: { "X-T-Subject-Variant": variant.id },
  });
  return true;
}

async function logSubjectVariant(email: string, variant: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    // Find the most recent lead with this email and stamp the variant.
    const { data: prior } = await sb
      .from("leads")
      .select("id")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);
    if (prior && prior.length > 0) {
      await sb.from("leads").update({ email_subject_variant: variant }).eq("id", prior[0].id);
    }
  } catch (e) {
    console.error("[itinerary-deliver] logSubjectVariant failed", e);
  }
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────

function normalisePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;     // assume IN
  return digits;
}

function buildWhatsAppMessage(it: GeneratedItinerary, name: string, matched: DeliverOpts["matchedPackages"] = []): string {
  const lines: string[] = [];
  lines.push(`Hi ${name}! 🌿 Your *${it.title}* draft is ready.`);
  lines.push("");
  lines.push(`_${it.tagline}_`);
  lines.push("");
  lines.push(`📅 Best time: ${it.bestTimeToVisit}`);
  lines.push(`💰 Estimated: ${it.estimatedCostRange}`);
  lines.push("");
  lines.push("*Highlights*");
  it.highlights.slice(0, 4).forEach((h) => lines.push(`• ${h}`));
  lines.push("");
  lines.push(`*Day-by-day* (${it.days.length} days)`);
  it.days.forEach((d) => {
    lines.push(`Day ${d.day} — ${d.title}`);
  });
  lines.push("");

  if (matched.length) {
    lines.push("*Or pick a ready-made trip:*");
    matched.slice(0, 3).forEach((p) => {
      lines.push(`• ${p.title} — ₹${p.currentPrice.toLocaleString("en-IN")}/person`);
      lines.push(`  ${HOST}/packages/${p.slug}`);
    });
    lines.push("");
  }

  lines.push("📧 We've also emailed the full itinerary with each day's morning/afternoon/evening plan.");
  lines.push("");
  lines.push("Reply with any changes — dates, hotels, vibe — and we'll fine-tune. 🙏");

  return lines.join("\n");
}

async function sendItineraryWhatsApp({ itinerary, matchedPackages, contact }: DeliverOpts): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return false;
  if (!contact.phone) return false;

  const to = normalisePhone(contact.phone);
  if (!to) return false;

  const text = buildWhatsAppMessage(itinerary, contact.name || DEFAULT_NAME, matchedPackages);

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
  if (!res.ok) {
    console.error("[itinerary-deliver] WA send failed", await res.text().catch(() => "(no body)"));
    return false;
  }
  return true;
}
