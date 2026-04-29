// ─── Admin / dashboard semantic status colors ────────────────────────
// One source for every status pill across leads, bookings, payouts,
// creators, payments. Maps a state name to the brand-aligned tat
// semantic tokens. Tables that previously hand-rolled bg-yellow-100,
// bg-purple-100, etc, should call statusBadgeClasses() instead so the
// admin surface speaks the same visual language as the marketing site.

export type StatusTone =
  | "neutral"   // lost / archived / unknown
  | "info"      // contacted / pending review
  | "warning"   // qualified / awaiting / needs-attention
  | "success"   // booked / paid / approved / verified
  | "danger"    // failed / refunded / rejected / cancelled
  | "accent";   // featured / VIP — uses gold

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-tat-charcoal/5 text-tat-slate",
  info:    "bg-tat-info-bg text-tat-info-fg",
  warning: "bg-tat-warning-bg text-tat-warning-fg",
  success: "bg-tat-success-bg text-tat-success-fg",
  danger:  "bg-tat-danger-bg text-tat-danger-fg",
  accent:  "bg-tat-gold/15 text-tat-charcoal",
};

const STATUS_TO_TONE: Record<string, StatusTone> = {
  // Leads
  new:        "warning",
  contacted:  "info",
  qualified:  "warning",
  booked:     "success",
  lost:       "neutral",
  // Bookings / payments
  created:    "warning",
  pending:    "warning",
  verified:   "success",
  paid:       "success",
  refunded:   "danger",
  failed:     "danger",
  cancelled:  "danger",
  // Creators
  active:     "success",
  approved:   "success",
  pending_review: "warning",
  rejected:   "danger",
  paused:     "neutral",
  // Generic
  draft:      "neutral",
  archived:   "neutral",
  vip:        "accent",
  featured:   "accent",
};

export function statusTone(status: string): StatusTone {
  return STATUS_TO_TONE[status.toLowerCase()] ?? "neutral";
}

export function statusBadgeClasses(status: string): string {
  return TONE_CLASSES[statusTone(status)];
}

export function toneClasses(tone: StatusTone): string {
  return TONE_CLASSES[tone];
}
