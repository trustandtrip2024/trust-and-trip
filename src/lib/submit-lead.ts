import type { Lead } from "./supabase";

export async function submitLead(lead: Omit<Lead, "id" | "created_at" | "updated_at" | "status">): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...lead,
        page_url: typeof window !== "undefined" ? window.location.href : undefined,
        utm_source: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("utm_source") ?? undefined : undefined,
        utm_medium: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("utm_medium") ?? undefined : undefined,
        utm_campaign: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("utm_campaign") ?? undefined : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
