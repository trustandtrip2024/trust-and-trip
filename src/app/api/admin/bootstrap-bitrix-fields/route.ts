// Admin-only bootstrap that provisions the Bitrix24 custom fields (UF_CRM_*)
// the lead + deal payloads in src/lib/bitrix24.ts depend on. Until each UF
// exists in the Bitrix portal, the data we send is silently dropped by
// Bitrix. Run this once after the integration is wired:
//
//   curl -sX POST "https://trustandtrip.com/api/admin/bootstrap-bitrix-fields" \
//     -u admin:$ADMIN_SECRET | jq
//
// Behaviour:
// - For each field we declare below, call crm.{lead|deal}.userfield.add.
// - Bitrix returns error 'ERROR_CORE: Field already exists' when the UF
//   is already present; we treat that as "already-ok" and continue.
// - The route returns a per-field status report so the operator sees
//   which fields were created vs. already-there vs. errored.
//
// Idempotent — safe to re-run.

import { NextRequest, NextResponse } from "next/server";

interface BitrixResponse {
  result?: number | string | Record<string, unknown>;
  error?: string;
  error_description?: string;
}

interface FieldDecl {
  /** Entity the UF belongs to. */
  entity: "lead" | "deal";
  /** UF code, must start with UF_CRM_ — Bitrix prefixes anyway but be explicit. */
  field: string;
  /** Bitrix USER_TYPE_ID — string / integer / double / etc. */
  type: "string" | "integer" | "double";
  /** Human label shown in the Bitrix UI. */
  label: string;
}

// The five UFs introduced in the 2026-04-28 audit pass — none of these
// existed in the portal yet, so the lead/deal payload was dropping
// utm_content, utm_term, razorpay_order, lead_score, lead_tier.
//
// Adding lead_score / lead_tier on the deal entity too so when a deal is
// pushed (markDealPaid + create-order), Bitrix can route + report on it.
const FIELDS: FieldDecl[] = [
  { entity: "lead", field: "UF_CRM_UTM_CONTENT",   type: "string",  label: "UTM content" },
  { entity: "lead", field: "UF_CRM_UTM_TERM",      type: "string",  label: "UTM term" },
  { entity: "lead", field: "UF_CRM_LEAD_SCORE",    type: "integer", label: "Lead score (0-100)" },
  { entity: "lead", field: "UF_CRM_LEAD_TIER",     type: "string",  label: "Lead tier (A/B/C)" },
  { entity: "deal", field: "UF_CRM_RAZORPAY_ORDER", type: "string",  label: "Razorpay order ID" },
  { entity: "deal", field: "UF_CRM_LEAD_SCORE",    type: "integer", label: "Lead score (0-100)" },
  { entity: "deal", field: "UF_CRM_LEAD_TIER",     type: "string",  label: "Lead tier (A/B/C)" },
];

function webhookBase(): string | null {
  const url = process.env.BITRIX24_WEBHOOK_URL?.trim();
  if (!url) return null;
  return url.replace(/\/$/, "");
}

async function callBitrix(method: string, body: unknown): Promise<BitrixResponse> {
  const base = webhookBase();
  if (!base) return { error: "missing_webhook" };
  try {
    const res = await fetch(`${base}/${method}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    return (await res.json()) as BitrixResponse;
  } catch (err) {
    return { error: "network", error_description: err instanceof Error ? err.message : "unknown" };
  }
}

interface FieldResult {
  entity: string;
  field: string;
  status: "created" | "already_exists" | "error" | "skipped";
  detail?: string;
}

async function provision(field: FieldDecl): Promise<FieldResult> {
  const method = field.entity === "lead"
    ? "crm.lead.userfield.add"
    : "crm.deal.userfield.add";

  const res = await callBitrix(method, {
    fields: {
      FIELD_NAME:    field.field,
      USER_TYPE_ID:  field.type,
      EDIT_FORM_LABEL: { en: field.label, in: field.label },
      LIST_COLUMN_LABEL: { en: field.label, in: field.label },
      LIST_FILTER_LABEL: { en: field.label, in: field.label },
      ERROR_MESSAGE:    { en: field.label, in: field.label },
      HELP_MESSAGE:     { en: field.label, in: field.label },
      MULTIPLE: "N",
      MANDATORY: "N",
      SHOW_FILTER: "Y",
      SHOW_IN_LIST: "Y",
      EDIT_IN_LIST: "Y",
      IS_SEARCHABLE: "Y",
    },
  });

  if (res.error === "missing_webhook") {
    return { entity: field.entity, field: field.field, status: "skipped", detail: "BITRIX24_WEBHOOK_URL not set" };
  }

  if (res.error) {
    const msg = (res.error_description ?? res.error ?? "").toString().toLowerCase();
    // Bitrix variants: 'already exists', 'has already been added',
    // 'duplicate', 'already used by another field'.
    if (msg.includes("already") || msg.includes("duplicate")) {
      return { entity: field.entity, field: field.field, status: "already_exists" };
    }
    return { entity: field.entity, field: field.field, status: "error", detail: res.error_description ?? res.error };
  }

  return { entity: field.entity, field: field.field, status: "created" };
}

export async function POST(_req: NextRequest) {
  if (!webhookBase()) {
    return NextResponse.json(
      { error: "BITRIX24_WEBHOOK_URL not configured." },
      { status: 503 }
    );
  }

  const results: FieldResult[] = [];
  for (const f of FIELDS) {
    // Sequential — Bitrix webhooks rate-limit on burst.
    results.push(await provision(f));
  }

  const summary = {
    total:           results.length,
    created:         results.filter((r) => r.status === "created").length,
    already_exists:  results.filter((r) => r.status === "already_exists").length,
    error:           results.filter((r) => r.status === "error").length,
    skipped:         results.filter((r) => r.status === "skipped").length,
  };

  return NextResponse.json({ summary, results }, { status: summary.error > 0 ? 500 : 200 });
}

export async function GET() {
  return NextResponse.json({
    note: "POST with admin Basic-Auth to provision Bitrix24 UF custom fields.",
    fields: FIELDS,
  });
}
