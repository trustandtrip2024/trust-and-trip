// ─── Third-party brand colors ────────────────────────────────────────
// Hex values that ARE intentionally off the tat palette because they
// represent another brand (WhatsApp green, Facebook blue, Google green,
// Instagram gradient, etc.). Centralising them here so component code
// imports a named constant instead of literal hex strings — easier to
// audit, rebrand, or swap later.
//
// Use the *_GLOW variants in box-shadow contexts. Use the gradient
// constants for Instagram and any other multi-stop external brand.

export const WHATSAPP_GREEN       = "#25D366";
export const WHATSAPP_GREEN_HOVER = "#20ba5a";
export const WHATSAPP_GREEN_DEEP  = "#1a9e4e";

export const FACEBOOK_BLUE        = "#1877F2";

export const LINKEDIN_BLUE        = "#0A66C2";

export const GOOGLE_GREEN         = "#34E0A1";

export const TWITTER_X_BLACK      = "#000000";

export const YOUTUBE_RED          = "#FF0000";

// Instagram official multi-stop gradient. Use for the IG-style strip
// in LoveFromTheGramStrip, share buttons, etc. Components that need
// just one color should fall back to a tat token.
export const INSTAGRAM_GRADIENT_STOPS = ["#fdf497", "#fdf497", "#fd5949", "#d6249f"] as const;
export const INSTAGRAM_GRADIENT_CSS =
  "linear-gradient(135deg, #fdf497 0%, #fdf497 35%, #fd5949 60%, #d6249f 100%)";

// CSS-ready Tailwind arbitrary value strings — for places where we
// want `bg-whatsapp` style syntax but referenced by name.
export const WHATSAPP_BG_CLASS       = `bg-[${WHATSAPP_GREEN}]`;
export const WHATSAPP_HOVER_BG_CLASS = `hover:bg-[${WHATSAPP_GREEN_HOVER}]`;
export const FACEBOOK_BG_CLASS       = `bg-[${FACEBOOK_BLUE}]`;
export const LINKEDIN_BG_CLASS       = `bg-[${LINKEDIN_BLUE}]`;
