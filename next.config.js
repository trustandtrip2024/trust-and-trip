// Bundle analyzer — opt-in via ANALYZE=true npm run build
const withBundleAnalyzer = process.env.ANALYZE === "true"
  ? require("@next/bundle-analyzer")({ enabled: true, openAnalyzer: false })
  : (cfg) => cfg;

// Sentry wrapper — only applied if SENTRY_DSN is set so local builds without
// Sentry credentials don't fail.
const sentryEnabled = !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
const { withSentryConfig } = sentryEnabled ? require("@sentry/nextjs") : { withSentryConfig: (cfg) => cfg };
const sentryWebpackPluginOptions = {
  silent: !process.env.CI,
  org: process.env.SENTRY_ORG || "trustandtrip",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",
  authToken: process.env.SENTRY_AUTH_TOKEN,
};
const sentryOptions = {
  hideSourceMaps: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  widenClientFileUpload: true,
  // Disable Sentry's server-component Proxy wrapper. Its
  // `requestAsyncStorage.getStore()` call inside the wrapper trips Next 14's
  // dynamic-rendering opt-in, which marks every page `ƒ` and emits
  // `Cache-Control: private, no-cache, no-store`. Server-component errors are
  // still captured via `onRequestError = Sentry.captureRequestError` in
  // src/instrumentation.ts, so we lose nothing operationally — but we
  // recover ISR + edge cache for Meta-ad cold clicks.
  autoInstrumentAppDirectory: false,
  automaticVercelMonitors: true,
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tree-shake unused exports from icon libs (lucide-react ships ~1k icons)
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "videos.pexels.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1200, 1920],
    minimumCacheTTL: 86400,
  },
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,

  async rewrites() {
    return [
      // Friendly aliases — serve existing pages under newer URLs without redirecting
      { source: "/journal", destination: "/blog" },
      { source: "/journal/:slug*", destination: "/blog/:slug*" },
      { source: "/plan-a-trip", destination: "/plan" },
      { source: "/sign-in", destination: "/login" },
    ];
  },

  async redirects() {
    return [
      // ─── Old site main pages ──────────────────────────────────────────────
      { source: "/about-travel-packages-trust-and-trip", destination: "/about", permanent: true },
      { source: "/about-travel-packages-trust-and-trip/", destination: "/about", permanent: true },
      { source: "/faqs", destination: "/contact", permanent: true },
      { source: "/faqs/", destination: "/contact", permanent: true },
      { source: "/tour", destination: "/packages", permanent: true },
      { source: "/tour/", destination: "/packages", permanent: true },
      { source: "/shop", destination: "/packages", permanent: true },
      { source: "/shop/", destination: "/packages", permanent: true },
      { source: "/cart", destination: "/packages", permanent: true },
      { source: "/cart/", destination: "/packages", permanent: true },
      { source: "/checkout", destination: "/packages", permanent: true },
      { source: "/checkout/", destination: "/packages", permanent: true },
      { source: "/my-account", destination: "/", permanent: true },
      { source: "/my-account/", destination: "/", permanent: true },
      { source: "/package-grid", destination: "/packages", permanent: true },
      { source: "/package-grid/", destination: "/packages", permanent: true },
      { source: "/package-category", destination: "/packages", permanent: true },
      { source: "/package-category/", destination: "/packages", permanent: true },
      { source: "/fix-departures", destination: "/packages", permanent: true },
      { source: "/fix-departures/", destination: "/packages", permanent: true },
      { source: "/kumbh-mela-tour-packages-2025", destination: "/packages", permanent: true },
      { source: "/kumbh-mela-tour-packages-2025/", destination: "/packages", permanent: true },
      { source: "/rx-schedule-email-unsubscribe", destination: "/", permanent: true },
      { source: "/rx-schedule-email-unsubscribe/", destination: "/", permanent: true },
      { source: "/rx-schedule-email-unsubscribe-2", destination: "/", permanent: true },
      { source: "/rx-schedule-email-unsubscribe-2/", destination: "/", permanent: true },

      // ─── Legal pages ──────────────────────────────────────────────────────
      { source: "/privacy-policy-2", destination: "/privacy-policy", permanent: true },
      { source: "/privacy-policy-2/", destination: "/privacy-policy", permanent: true },
      { source: "/terms-conditions", destination: "/terms-and-conditions", permanent: true },
      { source: "/terms-conditions/", destination: "/terms-and-conditions", permanent: true },
      { source: "/refund-returns", destination: "/cancellation-policy", permanent: true },
      { source: "/refund-returns/", destination: "/cancellation-policy", permanent: true },

      // ─── Shortlink landing pages ──────────────────────────────────────────
      { source: "/bali", destination: "/destinations/bali", permanent: true },
      { source: "/bali/", destination: "/destinations/bali", permanent: true },
      { source: "/uttarakhand", destination: "/destinations", permanent: true },
      { source: "/uttarakhand/", destination: "/destinations", permanent: true },

      // ─── Tour type category pages ─────────────────────────────────────────
      { source: "/tour-type/honey-moon-tour", destination: "/packages?travelType=Honeymoon", permanent: true },
      { source: "/tour-type/honey-moon-tour/", destination: "/packages?travelType=Honeymoon", permanent: true },
      { source: "/tour-type/family-friends", destination: "/packages?travelType=Family", permanent: true },
      { source: "/tour-type/family-friends/", destination: "/packages?travelType=Family", permanent: true },
      { source: "/tour-type/group-tour", destination: "/packages?travelType=Group", permanent: true },
      { source: "/tour-type/group-tour/", destination: "/packages?travelType=Group", permanent: true },
      { source: "/tour-type/adventure-tours", destination: "/packages?travelType=Adventure", permanent: true },
      { source: "/tour-type/adventure-tours/", destination: "/packages?travelType=Adventure", permanent: true },
      { source: "/tour-type/:slug*", destination: "/packages", permanent: true },

      // ─── Destination pages (slug mapping) ────────────────────────────────
      { source: "/destination/bali", destination: "/destinations/bali", permanent: true },
      { source: "/destination/bali/", destination: "/destinations/bali", permanent: true },
      { source: "/destination/dubai", destination: "/destinations/dubai", permanent: true },
      { source: "/destination/dubai/", destination: "/destinations/dubai", permanent: true },
      { source: "/destination/goa", destination: "/destinations/goa", permanent: true },
      { source: "/destination/goa/", destination: "/destinations/goa", permanent: true },
      { source: "/destination/kashmir", destination: "/destinations/kashmir", permanent: true },
      { source: "/destination/kashmir/", destination: "/destinations/kashmir", permanent: true },
      { source: "/destination/kerala", destination: "/destinations/kerala", permanent: true },
      { source: "/destination/kerala/", destination: "/destinations/kerala", permanent: true },
      { source: "/destination/ladakh", destination: "/destinations/ladakh", permanent: true },
      { source: "/destination/ladakh/", destination: "/destinations/ladakh", permanent: true },
      { source: "/destination/maldives", destination: "/destinations/maldives", permanent: true },
      { source: "/destination/maldives/", destination: "/destinations/maldives", permanent: true },
      { source: "/destination/rajasthan", destination: "/destinations/rajasthan", permanent: true },
      { source: "/destination/rajasthan/", destination: "/destinations/rajasthan", permanent: true },
      { source: "/destination/sri-lanka", destination: "/destinations/sri-lanka", permanent: true },
      { source: "/destination/sri-lanka/", destination: "/destinations/sri-lanka", permanent: true },
      { source: "/destination/thailand-2", destination: "/destinations/thailand", permanent: true },
      { source: "/destination/thailand-2/", destination: "/destinations/thailand", permanent: true },
      { source: "/destination/himachal-pradesh", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/destination/himachal-pradesh/", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/destination/andaman-and-nicobar", destination: "/destinations/andaman", permanent: true },
      { source: "/destination/andaman-and-nicobar/", destination: "/destinations/andaman", permanent: true },
      // Destinations not in new app → destinations listing
      { source: "/destination/:slug*", destination: "/destinations", permanent: true },

      // ─── Individual tour packages (high-traffic → most relevant page) ─────
      // Bali tours → Bali destination
      { source: "/tour/bali-:slug*", destination: "/destinations/bali", permanent: true },
      { source: "/tour/honeymoon-bali-:slug*", destination: "/destinations/bali", permanent: true },
      { source: "/tour/tranquil-bali-:slug*", destination: "/destinations/bali", permanent: true },
      { source: "/tour/discover-bali-:slug*", destination: "/destinations/bali", permanent: true },
      // Goa tours → Goa destination
      { source: "/tour/goa-:slug*", destination: "/destinations/goa", permanent: true },
      { source: "/tour/complete-goa-:slug*", destination: "/destinations/goa", permanent: true },
      { source: "/tour/romantic-goa-:slug*", destination: "/destinations/goa", permanent: true },
      { source: "/tour/north-goa-:slug*", destination: "/destinations/goa", permanent: true },
      { source: "/tour/north-and-:slug*", destination: "/destinations/goa", permanent: true },
      { source: "/tour/south-goa-:slug*", destination: "/destinations/goa", permanent: true },
      // Kashmir tours → Kashmir destination
      { source: "/tour/kashmir-:slug*", destination: "/destinations/kashmir", permanent: true },
      { source: "/tour/captivating-kashmir-:slug*", destination: "/destinations/kashmir", permanent: true },
      { source: "/tour/romantic-kashmir-:slug*", destination: "/destinations/kashmir", permanent: true },
      { source: "/tour/5-day-kashmir-:slug*", destination: "/destinations/kashmir", permanent: true },
      { source: "/tour/4-nights-5-days-kashmir-:slug*", destination: "/destinations/kashmir", permanent: true },
      // Kerala tours → Kerala destination
      { source: "/tour/kerala-:slug*", destination: "/destinations/kerala", permanent: true },
      { source: "/tour/scenic-south-india-:slug*", destination: "/destinations/kerala", permanent: true },
      { source: "/tour/south-india-:slug*", destination: "/destinations/kerala", permanent: true },
      { source: "/tour/bangalore-to-coorg-:slug*", destination: "/destinations/kerala", permanent: true },
      // Maldives tours → Maldives destination
      { source: "/tour/maldives-:slug*", destination: "/destinations/maldives", permanent: true },
      // Thailand/Phuket/Krabi/Pattaya tours → Thailand destination
      { source: "/tour/thailand-:slug*", destination: "/destinations/thailand", permanent: true },
      { source: "/tour/phuket-:slug*", destination: "/destinations/thailand", permanent: true },
      { source: "/tour/krabi-:slug*", destination: "/destinations/thailand", permanent: true },
      { source: "/tour/pattaya-:slug*", destination: "/destinations/thailand", permanent: true },
      // Rajasthan tours
      { source: "/tour/rajasthan-:slug*", destination: "/destinations/rajasthan", permanent: true },
      // Himachal/Manali/Spiti/Kasol tours
      { source: "/tour/himachal-:slug*", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/tour/himalayan-:slug*", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/tour/spiti-:slug*", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/tour/winter-spiti-:slug*", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/tour/kasol-:slug*", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/tour/girls-himachal-:slug*", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/tour/mcleodganj-:slug*", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/tour/hampta-:slug*", destination: "/destinations/himachal-pradesh", permanent: true },
      // Andaman tours
      { source: "/tour/andaman-:slug*", destination: "/destinations/andaman", permanent: true },
      { source: "/tour/discover-andaman-:slug*", destination: "/destinations/andaman", permanent: true },
      // Vietnam/Phu Quoc tours
      { source: "/tour/phu-quoc-:slug*", destination: "/destinations", permanent: true },
      // Rishikesh/Kedarnath/Valley of Flowers → packages
      { source: "/tour/rishikesh-:slug*", destination: "/packages", permanent: true },
      { source: "/tour/kedarnath-:slug*", destination: "/packages", permanent: true },
      { source: "/tour/valley-of-flowers-:slug*", destination: "/packages", permanent: true },
      { source: "/tour/dev-diwali-:slug*", destination: "/packages", permanent: true },
      // Catch-all for remaining tours
      { source: "/tour/:slug*", destination: "/packages", permanent: true },

      // ─── Location pages → closest destination ─────────────────────────────
      // Goa locations
      { source: "/location/baga-beach", destination: "/destinations/goa", permanent: true },
      { source: "/location/baga-beach/", destination: "/destinations/goa", permanent: true },
      { source: "/location/calangute-beach", destination: "/destinations/goa", permanent: true },
      { source: "/location/calangute-beach/", destination: "/destinations/goa", permanent: true },
      { source: "/location/chapora-fort", destination: "/destinations/goa", permanent: true },
      { source: "/location/chapora-fort/", destination: "/destinations/goa", permanent: true },
      { source: "/location/fort-aguada", destination: "/destinations/goa", permanent: true },
      { source: "/location/fort-aguada/", destination: "/destinations/goa", permanent: true },
      { source: "/location/north-goa", destination: "/destinations/goa", permanent: true },
      { source: "/location/north-goa/", destination: "/destinations/goa", permanent: true },
      { source: "/location/south-goa", destination: "/destinations/goa", permanent: true },
      { source: "/location/south-goa/", destination: "/destinations/goa", permanent: true },
      // Bali locations
      { source: "/location/kuta-beach", destination: "/destinations/bali", permanent: true },
      { source: "/location/kuta-beach/", destination: "/destinations/bali", permanent: true },
      { source: "/location/nusa-dua", destination: "/destinations/bali", permanent: true },
      { source: "/location/nusa-dua/", destination: "/destinations/bali", permanent: true },
      { source: "/location/seminyak", destination: "/destinations/bali", permanent: true },
      { source: "/location/seminyak/", destination: "/destinations/bali", permanent: true },
      { source: "/location/ubud", destination: "/destinations/bali", permanent: true },
      { source: "/location/ubud/", destination: "/destinations/bali", permanent: true },
      // Kerala locations
      { source: "/location/alleppey", destination: "/destinations/kerala", permanent: true },
      { source: "/location/alleppey/", destination: "/destinations/kerala", permanent: true },
      { source: "/location/kochi", destination: "/destinations/kerala", permanent: true },
      { source: "/location/kochi/", destination: "/destinations/kerala", permanent: true },
      { source: "/location/munnar", destination: "/destinations/kerala", permanent: true },
      { source: "/location/munnar/", destination: "/destinations/kerala", permanent: true },
      { source: "/location/thekkady", destination: "/destinations/kerala", permanent: true },
      { source: "/location/thekkady/", destination: "/destinations/kerala", permanent: true },
      { source: "/location/wayanad", destination: "/destinations/kerala", permanent: true },
      { source: "/location/wayanad/", destination: "/destinations/kerala", permanent: true },
      { source: "/location/kozhikode", destination: "/destinations/kerala", permanent: true },
      { source: "/location/kozhikode/", destination: "/destinations/kerala", permanent: true },
      // Himachal locations
      { source: "/location/manali", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/manali/", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/shimla", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/shimla/", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/kufri", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/kufri/", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/kasol", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/kasol/", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/solang", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/solang/", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/malana", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/malana/", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/tosh", destination: "/destinations/himachal-pradesh", permanent: true },
      { source: "/location/tosh/", destination: "/destinations/himachal-pradesh", permanent: true },
      // Kashmir locations
      { source: "/location/gulmarg", destination: "/destinations/kashmir", permanent: true },
      { source: "/location/gulmarg/", destination: "/destinations/kashmir", permanent: true },
      { source: "/location/pahalgam", destination: "/destinations/kashmir", permanent: true },
      { source: "/location/pahalgam/", destination: "/destinations/kashmir", permanent: true },
      { source: "/location/srinagar", destination: "/destinations/kashmir", permanent: true },
      { source: "/location/srinagar/", destination: "/destinations/kashmir", permanent: true },
      // Andaman locations
      { source: "/location/baratang-island", destination: "/destinations/andaman", permanent: true },
      { source: "/location/baratang-island/", destination: "/destinations/andaman", permanent: true },
      { source: "/location/havelock-island", destination: "/destinations/andaman", permanent: true },
      { source: "/location/havelock-island/", destination: "/destinations/andaman", permanent: true },
      { source: "/location/neil-island", destination: "/destinations/andaman", permanent: true },
      { source: "/location/neil-island/", destination: "/destinations/andaman", permanent: true },
      { source: "/location/port-blair", destination: "/destinations/andaman", permanent: true },
      { source: "/location/port-blair/", destination: "/destinations/andaman", permanent: true },
      // Catch-all locations
      { source: "/location/:slug*", destination: "/destinations", permanent: true },

      // ─── Activities → Experiences ─────────────────────────────────────────
      { source: "/activities", destination: "/experiences", permanent: true },
      { source: "/activities/", destination: "/experiences", permanent: true },
      { source: "/activities/:slug*", destination: "/experiences", permanent: true },

      // ─── Hotels → Packages ────────────────────────────────────────────────
      { source: "/hotel", destination: "/packages", permanent: true },
      { source: "/hotel/", destination: "/packages", permanent: true },
      { source: "/hotel/:slug*", destination: "/packages", permanent: true },

      // ─── Blog categories ──────────────────────────────────────────────────
      { source: "/category/:slug*", destination: "/blog", permanent: true },

      // ─── Blog posts published at root level ───────────────────────────────
      { source: "/phu-quoc-travel-guide", destination: "/blog", permanent: true },
      { source: "/phu-quoc-travel-guide/", destination: "/blog", permanent: true },
      { source: "/char-dham-yatra-2026-opening-dates-kedarnath-badrinath", destination: "/blog", permanent: true },
      { source: "/char-dham-yatra-2026-opening-dates-kedarnath-badrinath/", destination: "/blog", permanent: true },
      { source: "/chardham-yatra-2025-guide-route-map", destination: "/blog", permanent: true },
      { source: "/chardham-yatra-2025-guide-route-map/", destination: "/blog", permanent: true },
      {
        source: "/5-most-affordable-countries-to-travel-from-india-in-2026-budget-friendly-international-destinations",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/5-most-affordable-countries-to-travel-from-india-in-2026-budget-friendly-international-destinations/",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/how-e-gates-and-e-passports-will-transform-international-travel-for-indian-passport-holders",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/how-e-gates-and-e-passports-will-transform-international-travel-for-indian-passport-holders/",
        destination: "/blog",
        permanent: true,
      },
    ];
  },

  async headers() {
    // Content-Security-Policy is set per-request in src/middleware.ts so that
    // each response gets a fresh nonce and Sanity Studio (/studio) can fall
    // back to a looser policy. Static security headers stay here.
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/(.*)\\.(jpg|jpeg|png|webp|avif|ico|svg|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

module.exports = sentryEnabled
  ? withSentryConfig(withBundleAnalyzer(nextConfig), sentryWebpackPluginOptions, sentryOptions)
  : withBundleAnalyzer(nextConfig);
