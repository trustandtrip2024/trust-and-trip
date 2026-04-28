/**
 * Single source of truth for brand-level constants. Every component that
 * needs the WhatsApp number, support email, or a vendor brand colour should
 * import from here instead of hardcoding the value inline.
 */

/** Trust and Trip WhatsApp number, E.164 with no `+` (Meta wa.me format). */
export const WA_NUMBER = "918115999588";

/** Pretty form for tel: links and on-page copy. */
export const WA_NUMBER_DISPLAY = "+91 81159 99588";

/** Business email shown on the site and used as Resend reply-to. */
export const BUSINESS_EMAIL = "hello@trustandtrip.com";

/** Internal alert mailbox (Vercel env BUSINESS_EMAIL overrides this). */
export const BUSINESS_NOTIFY_EMAIL = "trustandtrip2023@gmail.com";

/** Brand site URL — used in emails, OG tags, schema.org JSON-LD. */
export const SITE_URL = "https://trustandtrip.com";

/** Vendor brand colours (kept here so we don't repeat hex values). */
export const BRAND_COLORS = {
  whatsapp: "#25D366",
  facebook: "#1877F2",
  instagram: "#E4405F",
  razorpay: "#3395FF",
} as const;
