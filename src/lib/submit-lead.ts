import type { Lead } from "./supabase";

export interface SubmitLeadResult {
  ok: boolean;
  error?: string;
  /** Server-issued event ID for Pixel/CAPI deduplication. */
  eventId?: string;
  /** Lead score the server computed — surface as Pixel `value` for ad optimizer. */
  score?: number;
  /** Lead tier (A/B/C) for downstream analytics. */
  tier?: string;
  /** Supabase leads.id — used by quiz to link quiz_responses → lead. */
  leadId?: string;
}

export async function submitLead(
  lead: Omit<Lead, "id" | "created_at" | "updated_at" | "status">
): Promise<SubmitLeadResult> {
  try {
    const params = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...lead,
        page_url: typeof window !== "undefined" ? window.location.href : undefined,
        utm_source: params?.get("utm_source") ?? undefined,
        utm_medium: params?.get("utm_medium") ?? undefined,
        utm_campaign: params?.get("utm_campaign") ?? undefined,
        utm_content: params?.get("utm_content") ?? undefined,
        utm_term: params?.get("utm_term") ?? undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    return {
      ok: true,
      eventId: data.eventId,
      score: typeof data.score === "number" ? data.score : undefined,
      tier: typeof data.tier === "string" ? data.tier : undefined,
      leadId: typeof data.leadId === "string" ? data.leadId : undefined,
    };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
