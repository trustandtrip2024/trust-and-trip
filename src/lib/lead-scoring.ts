// Deterministic lead scorer. Output 0-100 + tier A/B/C.
//
// Score components are independent so adding/removing factors is simple.
// Tune weights, not the structure. Re-runs idempotent — same input → same
// output, no time-of-day drift.

import type { Lead, LeadSource } from "./supabase";

export type LeadTier = "A" | "B" | "C";

export interface LeadScore {
  score: number;        // 0-100
  tier: LeadTier;
  reasons: string[];    // human-readable breakdown for debugging / Bitrix notes
}

// Source quality — hand-tuned. "Package enquiry from package detail page" is
// the strongest signal; raw newsletter has near-zero buying intent.
const SOURCE_WEIGHT: Record<LeadSource, number> = {
  package_enquiry:    18,
  trip_planner:       16,
  itinerary_generator:14,
  whatsapp:           14,   // user typed enough to start a WA conversation
  quiz:               12,   // self-segmented through 4 questions before submitting
  exit_intent:        10,
  contact_form:        8,
  newsletter:          2,
  // Click intents are downweighted: they're attribution markers, not lead intent.
  book_now_click:      6,
  enquire_click:       6,
  customize_click:     4,
  schedule_call_click: 4,
  call_click:          4,
  whatsapp_click:      4,
};

interface ScoreInput {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  destination?: string | null;
  travel_type?: string | null;
  travel_date?: string | null;
  num_travellers?: string | null;
  budget?: string | null;
  package_title?: string | null;
  package_slug?: string | null;
  source?: LeadSource | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  message?: string | null;
}

const has = (v?: string | null): boolean => !!v && String(v).trim().length > 0;

export function scoreLead(input: ScoreInput): LeadScore {
  const reasons: string[] = [];
  let score = 0;

  // ── Contact completeness (40 pts max) ────────────────────────────────────
  if (has(input.phone))   { score += 12; reasons.push("phone (+12)"); }
  if (has(input.email))   { score +=  8; reasons.push("email (+8)"); }
  if (has(input.name))    { score +=  4; reasons.push("name (+4)"); }

  // ── Buying intent (35 pts max) ───────────────────────────────────────────
  if (has(input.destination))     { score += 10; reasons.push("destination (+10)"); }
  if (has(input.travel_type))     { score +=  6; reasons.push("travel_type (+6)"); }
  if (has(input.travel_date))     { score +=  9; reasons.push("travel_date (+9)"); }
  if (has(input.budget))          { score +=  7; reasons.push("budget (+7)"); }
  if (has(input.num_travellers))  { score +=  3; reasons.push("travellers (+3)"); }

  // ── Package specificity (10 pts max) ─────────────────────────────────────
  if (has(input.package_slug))    { score +=  6; reasons.push("package_slug (+6)"); }
  else if (has(input.package_title)) { score += 3; reasons.push("package_title (+3)"); }

  // ── Source quality (max already capped via SOURCE_WEIGHT) ────────────────
  const src = input.source ?? "contact_form";
  const sw = SOURCE_WEIGHT[src as LeadSource] ?? 6;
  score += sw;
  reasons.push(`source=${src} (+${sw})`);

  // ── Paid traffic bump — paid clicks are higher-intent than organic ───────
  const paidMedium = (input.utm_medium ?? "").toLowerCase();
  if (paidMedium === "cpc" || paidMedium === "paid_social" || paidMedium === "paidsocial") {
    score += 5;
    reasons.push("paid traffic (+5)");
  }

  // ── Message effort signal (max 5 pts) ────────────────────────────────────
  const msgLen = (input.message ?? "").trim().length;
  if (msgLen >= 200)      { score += 5; reasons.push("message≥200ch (+5)"); }
  else if (msgLen >= 60)  { score += 3; reasons.push("message≥60ch (+3)"); }
  else if (msgLen >= 20)  { score += 1; reasons.push("message≥20ch (+1)"); }

  // Cap at 100.
  score = Math.max(0, Math.min(100, score));

  const tier: LeadTier = score >= 70 ? "A" : score >= 40 ? "B" : "C";

  return { score, tier, reasons };
}
