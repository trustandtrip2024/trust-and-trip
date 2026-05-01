/**
 * Daily mandatory checks for the founder/ops. Source of truth for the
 * checklist that drives `/admin/daily`. Each item must be reviewable in
 * under 30 seconds; if it requires a long action, link out to the
 * relevant tool. The list is intentionally small — five items so the
 * habit sticks.
 */

export type DailyCheckItem = {
  key: string;
  label: string;
  description: string;
  /** Optional href the founder hits to perform the check. */
  cta?: { href: string; label: string };
  /** Why this matters — shown as a tooltip / hover note. */
  why: string;
};

export const DAILY_CHECK_ITEMS: DailyCheckItem[] = [
  {
    key: "leads-cleared",
    label: "Yesterday's leads cleared",
    description: "Every lead older than 24h is assigned, contacted, or marked junk.",
    cta: { href: "/admin/leads", label: "Open leads" },
    why: "Lead-to-contact lag is the single biggest conversion killer. Aim < 30 min during work hours.",
  },
  {
    key: "reviews-pending",
    label: "Pending reviews moderated",
    description: "Approve or reject every review submitted in the last 24h.",
    cta: { href: "/admin/reviews", label: "Open reviews" },
    why: "Review backlog erodes trust on package pages and dampens new submissions.",
  },
  {
    key: "payments-stuck",
    label: "Stuck bookings flagged",
    description: "Any booking on status `created` for > 30 min is flagged or cancelled.",
    cta: { href: "/admin/bookings", label: "Open bookings" },
    why: "Stuck bookings hold seats and skew Bitrix24 deal pipeline counts.",
  },
  {
    key: "bitrix-sync",
    label: "Bitrix24 sync verified",
    description: "Yesterday's deals in Bitrix match yesterday's verified bookings.",
    cta: { href: "/admin/bookings", label: "Cross-check" },
    why: "Bitrix is fire-and-forget. Silent CRM gaps make the pipeline lie.",
  },
  {
    key: "health-probe",
    label: "Health probe green",
    description: "GET /api/health returns ok across Supabase, Razorpay, Bitrix, Sanity.",
    cta: { href: "/api/health", label: "Run probe" },
    why: "First sign of an env-var rotation or upstream outage.",
  },
];

/**
 * Today's IST date in YYYY-MM-DD form. The check window is the calendar
 * day in Asia/Kolkata so the founder gets a clean slate at local midnight
 * regardless of where the server is.
 */
export function todayIST(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // en-CA gives YYYY-MM-DD
}
