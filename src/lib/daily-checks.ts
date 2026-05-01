/**
 * Daily / weekly mandatory checks for the founder/ops. Source of truth
 * for the checklist that drives `/admin/daily`. Each item must be
 * reviewable in under 60 seconds; if it requires a long action, link
 * out to the relevant tool. Categories:
 *   - "daily"  → reset every IST midnight, must clear before EOD
 *   - "weekly" → reset every Monday IST, weekly review cadence
 */

export type DailyCheckCategory = "daily" | "weekly";

export type DailyCheckItem = {
  key: string;
  category: DailyCheckCategory;
  label: string;
  description: string;
  cta?: { href: string; label: string };
  why: string;
};

export const DAILY_CHECK_ITEMS: DailyCheckItem[] = [
  // ─── DAILY ──────────────────────────────────────────────────────────
  {
    key: "leads-cleared",
    category: "daily",
    label: "Yesterday's leads cleared",
    description: "Every lead older than 24h is assigned, contacted, or marked junk.",
    cta: { href: "/admin/leads", label: "Open leads" },
    why: "Lead-to-contact lag is the single biggest conversion killer. Aim < 30 min during work hours.",
  },
  {
    key: "reviews-pending",
    category: "daily",
    label: "Pending reviews moderated",
    description: "Approve or reject every review submitted in the last 24h.",
    cta: { href: "/admin/reviews", label: "Open reviews" },
    why: "Review backlog erodes trust on package pages and dampens new submissions.",
  },
  {
    key: "payments-stuck",
    category: "daily",
    label: "Stuck bookings flagged",
    description: "Any booking on status `created` for > 30 min is flagged or cancelled.",
    cta: { href: "/admin/bookings", label: "Open bookings" },
    why: "Stuck bookings hold seats and skew Bitrix24 deal pipeline counts.",
  },
  {
    key: "bitrix-sync",
    category: "daily",
    label: "Bitrix24 sync verified",
    description: "Yesterday's deals in Bitrix match yesterday's verified bookings.",
    cta: { href: "/admin/bookings", label: "Cross-check" },
    why: "Bitrix is fire-and-forget. Silent CRM gaps make the pipeline lie.",
  },
  {
    key: "health-probe",
    category: "daily",
    label: "Health probe green",
    description: "GET /api/health returns ok across Supabase, Razorpay, Bitrix, Sanity.",
    cta: { href: "/admin/health", label: "Open health" },
    why: "First sign of an env-var rotation or upstream outage.",
  },
  {
    key: "sentry-glance",
    category: "daily",
    label: "Sentry top error reviewed",
    description: "Open Sentry. Triage the most-frequent error of the last 24h — fix or silence.",
    cta: { href: "https://sentry.io/", label: "Open Sentry" },
    why: "One unwatched error trends into a Pareto problem within a week.",
  },
  {
    key: "anthropic-spend",
    category: "daily",
    label: "Anthropic spend on track",
    description: "Glance at Anthropic console — yesterday's spend ≤ ₹70 (~$0.85). Over = audit Aria chat / itinerary endpoints.",
    cta: { href: "https://console.anthropic.com/usage", label: "Open Anthropic" },
    why: "Aria + itinerary streaming + lead intent parsing all hit Claude Haiku. Runaway cost = a loop or a leak.",
  },
  {
    key: "vercel-deploys",
    category: "daily",
    label: "Vercel deploys clean",
    description: "Last production deploy is green. No queued/failed builds.",
    cta: { href: "https://vercel.com/dashboard", label: "Open Vercel" },
    why: "Failed deploy on main = stale prod served from cache. Catch within hours, not days.",
  },

  // ─── WEEKLY (resets every Monday IST) ───────────────────────────────
  {
    key: "upstash-token",
    category: "weekly",
    label: "Upstash token still valid",
    description: "Fire a single rate-limited request; expect non-429 unless you flooded. Token rotation = silent fail-open.",
    cta: { href: "https://console.upstash.com/", label: "Open Upstash" },
    why: "Documented incident 2026-05-01: production rate limits silently fail-open when Upstash token in Vercel goes stale.",
  },
  {
    key: "supabase-backup",
    category: "weekly",
    label: "Supabase backup verified",
    description: "Confirm PITR is on. Manual export to GDrive backups folder if monthly.",
    cta: { href: "https://supabase.com/dashboard", label: "Open Supabase" },
    why: "No restore plan = no business plan. Monthly export covers Supabase tier downgrades.",
  },
  {
    key: "speed-insights",
    category: "weekly",
    label: "Speed Insights checked",
    description: "Vercel Speed Insights — LCP, INP, CLS in the green band. Investigate any p75 regression > 10%.",
    cta: { href: "https://vercel.com/dashboard/analytics", label: "Open Speed Insights" },
    why: "Core Web Vitals are a soft Google ranking factor and a hard conversion factor.",
  },
  {
    key: "sanity-export",
    category: "weekly",
    label: "Sanity dataset snapshot",
    description: "Run `npx sanity dataset export production sanity-backup-YYYY-MM-DD.tar.gz`.",
    cta: { href: "https://www.sanity.io/manage", label: "Open Sanity" },
    why: "Sanity has no PITR. Weekly export = at-most-7-days data loss on full-account compromise.",
  },
  {
    key: "security-pulse",
    category: "weekly",
    label: "Security pulse",
    description:
      "Confirm: ADMIN_SECRET unrotated only if < 90 days old · no new package-lock from `npm audit` high+ · no service-role key in client bundle.",
    cta: { href: "/admin/health", label: "Open health" },
    why: "Dependency drift + stale secrets are the two most-cited startup compromise vectors.",
  },
];

export function todayIST(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

/**
 * Monday-anchored ISO week label for weekly checks. Returns YYYY-Www.
 * Resets every Monday 00:00 IST.
 */
export function weekKeyIST(): string {
  // Get current IST date as Date.
  const istNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  // Anchor to Monday.
  const day = istNow.getDay() || 7; // Mon=1 … Sun=7
  istNow.setDate(istNow.getDate() - (day - 1));
  istNow.setHours(0, 0, 0, 0);
  // ISO week number.
  const target = new Date(istNow);
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const week1 = new Date(target.getFullYear(), 0, 4);
  const weekNum =
    1 + Math.round(((target.getTime() - week1.getTime()) / 86_400_000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${target.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function dailyItems() { return DAILY_CHECK_ITEMS.filter((i) => i.category === "daily"); }
export function weeklyItems() { return DAILY_CHECK_ITEMS.filter((i) => i.category === "weekly"); }
