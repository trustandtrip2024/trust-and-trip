/**
 * Bitrix24 CRM integration.
 *
 * Pushes Leads and Deals from the Trust and Trip website into Bitrix24 using
 * an incoming webhook (no OAuth). Follows the same fire-and-forget pattern as
 * the Resend integration — if the webhook is not configured, or a call fails,
 * the primary user flow (Supabase insert, Razorpay order) still succeeds.
 *
 * Setup:
 *   1. In Bitrix24, create an Inbound webhook with scope: crm, user
 *   2. Copy the URL (https://<portal>.bitrix24.in/rest/1/<token>/)
 *   3. Set env var BITRIX24_WEBHOOK_URL to that value
 *
 * The custom-field codes below must match the custom fields created inside
 * Bitrix24 (see TAT bitrix/trustandtrip-bitrix-integration/01-setup-webhook.md).
 * If a custom field does not exist in Bitrix24, it is silently ignored — the
 * lead/deal is still created with the standard fields.
 */

import type { Lead, LeadSource } from "./supabase";

// ---- Config ---------------------------------------------------------------

/** Pre-trimmed webhook base URL, or null if not configured. */
function webhookBase(): string | null {
  const url = process.env.BITRIX24_WEBHOOK_URL?.trim();
  if (!url) return null;
  return url.replace(/\/$/, "");
}

/** Bitrix24 default source IDs. Custom sources added inside Bitrix24 can be mapped here. */
const SOURCE_MAP: Record<LeadSource, string> = {
  contact_form: "WEB",
  package_enquiry: "WEB",
  trip_planner: "WEB",
  exit_intent: "WEB",
  newsletter: "WEB",
  itinerary_generator: "WEB",
  // Click intents — map to WEB for now; if you've added "Website" / "WhatsApp" /
  // "Phone (Inbound)" as custom sources in Bitrix24 (see 08-setup-custom-fields.ps1),
  // switch these to the real STATUS_IDs.
  book_now_click: "WEB",
  call_click: "CALL",
  whatsapp_click: "WEB",
  customize_click: "WEB",
  enquire_click: "WEB",
  schedule_call_click: "CALL",
};

/** Human-readable source labels — shown in Bitrix24 under SOURCE_DESCRIPTION. */
const SOURCE_LABEL: Record<LeadSource, string> = {
  contact_form: "Contact form",
  package_enquiry: "Package enquiry",
  trip_planner: "Trip planner",
  exit_intent: "Exit intent popup",
  newsletter: "Newsletter signup",
  itinerary_generator: "Itinerary generator",
  book_now_click: "Book Now button (click intent)",
  call_click: "Phone button (click intent)",
  whatsapp_click: "WhatsApp button (click intent)",
  customize_click: "Customize button (click intent)",
  enquire_click: "Enquire button (click intent)",
  schedule_call_click: "Schedule Call button (click intent)",
};

/** Which sources are intent-only clicks (no contact info expected yet). */
const INTENT_ONLY_SOURCES = new Set<LeadSource>([
  "book_now_click",
  "call_click",
  "whatsapp_click",
  "customize_click",
  "enquire_click",
  "schedule_call_click",
]);

/** Custom field codes — update if your Bitrix24 codes differ. */
const UF = {
  destination: "UF_CRM_DESTINATION",
  travelDate: "UF_CRM_TRAVEL_START",
  travelType: "UF_CRM_TRAVEL_TYPE",
  numTravellers: "UF_CRM_NUM_TRAVELLERS",
  budget: "UF_CRM_BUDGET",
  packageSlug: "UF_CRM_PACKAGE_SLUG",
  pageUrl: "UF_CRM_PAGE_URL",
  utmSource: "UF_CRM_UTM_SOURCE",
  utmMedium: "UF_CRM_UTM_MEDIUM",
  utmCampaign: "UF_CRM_UTM_CAMPAIGN",
  refCode: "UF_CRM_REF_CODE",
  commissionAmount: "UF_CRM_COMMISSION_AMOUNT",
  commissionPaid: "UF_CRM_COMMISSION_PAID",
} as const;

// ---- Types ----------------------------------------------------------------

export type Bitrix24LeadPayload = Omit<Lead, "status" | "id" | "created_at">;

export interface Bitrix24DealPayload {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  packageTitle?: string;
  packageSlug?: string;
  packagePrice?: number;
  depositAmount: number;
  travelDate?: string;
  numTravellers?: number | string;
  specialRequests?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  isGroup?: boolean;
  refCode?: string;
  commissionAmount?: number;
}

interface BitrixResponse {
  result?: number | string;
  error?: string;
  error_description?: string;
}

// ---- Low-level call -------------------------------------------------------

async function callBitrix(method: string, body: unknown): Promise<BitrixResponse | null> {
  const base = webhookBase();
  if (!base) return null;

  try {
    const res = await fetch(`${base}/${method}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json()) as BitrixResponse;

    if (!res.ok || data.error) {
      console.error(`[bitrix24] ${method} failed:`, data.error_description || data.error);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`[bitrix24] ${method} network error:`, err);
    return null;
  }
}

// ---- Builders -------------------------------------------------------------

function splitName(fullName: string): { first: string; last: string } {
  const [first, ...rest] = fullName.trim().split(/\s+/);
  return { first: first || "-", last: rest.join(" ") || "-" };
}

function buildLeadTitle(lead: Bitrix24LeadPayload): string {
  const isIntent = INTENT_ONLY_SOURCES.has(lead.source);
  const prefix = isIntent ? `🖱️ Intent [${SOURCE_LABEL[lead.source] ?? lead.source}]` : lead.name;
  const parts = [
    prefix,
    lead.package_title ? `— ${lead.package_title}` : lead.destination ? `— ${lead.destination}` : null,
    lead.num_travellers ? `· ${lead.num_travellers} pax` : null,
  ].filter(Boolean);
  return parts.join(" ");
}

function buildLeadFields(lead: Bitrix24LeadPayload): Record<string, unknown> {
  const { first, last } = splitName(lead.name || "Website Visitor");
  const fields: Record<string, unknown> = {
    TITLE: buildLeadTitle(lead),
    NAME: first,
    LAST_NAME: last,
    STATUS_ID: "NEW",
    OPENED: "Y",
    SOURCE_ID: SOURCE_MAP[lead.source] ?? "WEB",
    SOURCE_DESCRIPTION: SOURCE_LABEL[lead.source] ?? "Website",
    COMMENTS: lead.message?.trim() || "",
  };

  // Only attach PHONE / EMAIL when we actually have them — intent clicks won't.
  if (lead.phone?.trim()) {
    fields.PHONE = [{ VALUE: lead.phone.trim(), VALUE_TYPE: "WORK" }];
  }
  if (lead.email?.trim()) {
    fields.EMAIL = [{ VALUE: lead.email.trim(), VALUE_TYPE: "WORK" }];
  }

  // Custom fields — silently ignored by Bitrix24 if they don't exist
  if (lead.destination)     fields[UF.destination]   = lead.destination;
  if (lead.travel_date)     fields[UF.travelDate]    = lead.travel_date;
  if (lead.travel_type)     fields[UF.travelType]    = lead.travel_type;
  if (lead.num_travellers)  fields[UF.numTravellers] = String(lead.num_travellers);
  if (lead.budget)          fields[UF.budget]        = lead.budget;
  if (lead.package_slug)    fields[UF.packageSlug]   = lead.package_slug;
  if (lead.page_url)        fields[UF.pageUrl]       = lead.page_url;
  if (lead.utm_source)      fields[UF.utmSource]     = lead.utm_source;
  if (lead.utm_medium)      fields[UF.utmMedium]     = lead.utm_medium;
  if (lead.utm_campaign)    fields[UF.utmCampaign]   = lead.utm_campaign;
  if ((lead as Bitrix24LeadPayload & { ref_code?: string }).ref_code) {
    fields[UF.refCode] = (lead as Bitrix24LeadPayload & { ref_code?: string }).ref_code;
  }

  return fields;
}

function buildDealFields(deal: Bitrix24DealPayload): Record<string, unknown> {
  const title = [
    deal.customerName,
    deal.packageTitle ? `— ${deal.packageTitle}` : null,
    deal.isGroup ? "[cart]" : null,
  ].filter(Boolean).join(" ");

  const fields: Record<string, unknown> = {
    TITLE: title,
    STAGE_ID: "NEW",           // Sales pipeline entry stage; auto-advance via Bitrix24 automation rules
    CATEGORY_ID: 0,            // 0 = default (Sales) pipeline; Operations is a separate CATEGORY_ID
    OPENED: "Y",
    CURRENCY_ID: "INR",
    OPPORTUNITY: deal.packagePrice ?? deal.depositAmount,
    COMMENTS: [
      deal.specialRequests ? `Special requests: ${deal.specialRequests}` : null,
      `Deposit paid: ₹${deal.depositAmount.toLocaleString("en-IN")}`,
      `Razorpay order: ${deal.razorpayOrderId}`,
      deal.razorpayPaymentId ? `Razorpay payment: ${deal.razorpayPaymentId}` : null,
      deal.isGroup ? "(Part of a cart checkout — multiple bookings)" : null,
    ].filter(Boolean).join("\n"),
  };

  if (deal.packageSlug)   fields[UF.packageSlug] = deal.packageSlug;
  if (deal.travelDate)    fields[UF.travelDate]  = deal.travelDate;
  if (deal.numTravellers) fields[UF.numTravellers] = String(deal.numTravellers);
  if (deal.refCode)       fields[UF.refCode] = deal.refCode;
  if (deal.commissionAmount !== undefined) fields[UF.commissionAmount] = deal.commissionAmount;

  return fields;
}

// ---- Contact lookup / creation --------------------------------------------
// Before creating a Deal, we look up or create a Contact so the Deal is
// attached to a real customer record in Bitrix24's Contact database.

async function findOrCreateContact(
  name: string,
  phone: string,
  email?: string,
): Promise<number | null> {
  if (!webhookBase()) return null;

  // 1) Try to find by phone
  const byPhone = await callBitrix("crm.contact.list", {
    filter: { PHONE: phone.trim() },
    select: ["ID"],
  });
  const phoneHit = (byPhone as any)?.result?.[0]?.ID;
  if (phoneHit) return Number(phoneHit);

  // 2) Try by email
  if (email?.trim()) {
    const byEmail = await callBitrix("crm.contact.list", {
      filter: { EMAIL: email.trim() },
      select: ["ID"],
    });
    const emailHit = (byEmail as any)?.result?.[0]?.ID;
    if (emailHit) return Number(emailHit);
  }

  // 3) Create new
  const { first, last } = splitName(name);
  const created = await callBitrix("crm.contact.add", {
    fields: {
      NAME: first,
      LAST_NAME: last,
      OPENED: "Y",
      TYPE_ID: "CLIENT",
      PHONE: [{ VALUE: phone.trim(), VALUE_TYPE: "WORK" }],
      ...(email?.trim() ? { EMAIL: [{ VALUE: email.trim(), VALUE_TYPE: "WORK" }] } : {}),
    },
    params: { REGISTER_SONET_EVENT: "N" },
  });
  return created?.result ? Number(created.result) : null;
}

// ---- Public API -----------------------------------------------------------

/**
 * Push a website lead into Bitrix24 as a Lead record.
 * Non-blocking — logs errors but never throws.
 */
export async function pushLead(lead: Bitrix24LeadPayload): Promise<void> {
  if (!webhookBase()) return;

  await callBitrix("crm.lead.add", {
    fields: buildLeadFields(lead),
    params: { REGISTER_SONET_EVENT: "Y" },
  });
}

/**
 * Push a paid booking into Bitrix24 as a Deal.
 * Creates or reuses a Contact, then opens a Deal in the Sales pipeline.
 */
export async function pushBookingAsDeal(deal: Bitrix24DealPayload): Promise<void> {
  if (!webhookBase()) return;

  const contactId = await findOrCreateContact(deal.customerName, deal.customerPhone, deal.customerEmail);
  const fields = buildDealFields(deal);
  if (contactId) {
    fields.CONTACT_ID = contactId;
  }

  await callBitrix("crm.deal.add", {
    fields,
    params: { REGISTER_SONET_EVENT: "Y" },
  });
}

/**
 * Push a newsletter subscriber as a low-priority Lead.
 */
export async function pushNewsletterSubscriber(email: string): Promise<void> {
  if (!webhookBase()) return;

  await callBitrix("crm.lead.add", {
    fields: {
      TITLE: `Newsletter — ${email}`,
      NAME: email.split("@")[0],
      LAST_NAME: "-",
      STATUS_ID: "NEW",
      OPENED: "Y",
      SOURCE_ID: "WEB",
      SOURCE_DESCRIPTION: "Newsletter signup",
      EMAIL: [{ VALUE: email.trim(), VALUE_TYPE: "WORK" }],
      COMMENTS: "Subscribed to the Trust and Trip newsletter.",
    },
    params: { REGISTER_SONET_EVENT: "N" },
  });
}

/**
 * Mark a deal as won after Razorpay payment is verified.
 * Finds the deal by Razorpay order ID (stored in COMMENTS during create-order),
 * and moves it to the WON stage with the verified payment ID attached.
 *
 * If the deal cannot be found (e.g. create-order didn't push to Bitrix24),
 * this is a no-op — the verify flow will still succeed.
 */
export async function markDealPaid(razorpayOrderId: string, razorpayPaymentId: string): Promise<void> {
  if (!webhookBase()) return;

  // Bitrix24 doesn't let us filter on COMMENTS directly in crm.deal.list without
  // full-text search, so we rely on the razorpay_order_id being unique and searchable
  // via a custom field instead. For simplicity we add a comment + update STAGE.
  // The recommended long-term fix is to add a UF_CRM_RAZORPAY_ORDER custom field.

  // Fire-and-forget: update last matching open deal's stage via a search by comment substring
  const found = await callBitrix("crm.deal.list", {
    filter: { "%COMMENTS": razorpayOrderId, "CLOSED": "N" },
    select: ["ID"],
    order: { ID: "DESC" },
  });

  const dealId = (found as any)?.result?.[0]?.ID;
  if (!dealId) return;

  await callBitrix("crm.deal.update", {
    id: Number(dealId),
    fields: {
      STAGE_ID: "WON",
      CLOSEDATE: new Date().toISOString().slice(0, 10),
      COMMENTS: `Payment verified · Razorpay payment ID: ${razorpayPaymentId}`,
    },
  });
}

// ---- Diagnostics ----------------------------------------------------------

/**
 * Returns true if the webhook is configured. Useful for health checks.
 */
export function isBitrix24Configured(): boolean {
  return webhookBase() !== null;
}
