import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqualStrings } from "@/lib/timing-safe";

const REF_COOKIE = "tt_ref";
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const REF_CODE_RE = /^CRTR-[A-Z0-9]{4,10}$/;

/**
 * Build the Content-Security-Policy for a request. Generates a fresh nonce
 * on each call; the nonce is exposed to Server Components via the `x-nonce`
 * request header so layout/page code can stamp it onto every <Script> they
 * emit. Pairs with `'strict-dynamic'` so that a nonced loader script can
 * pull in transitive third-party scripts without them needing their own
 * nonce.
 *
 * Sanity Studio (/studio) is exempted — Studio injects many inline scripts
 * without nonce support and uses eval; we fall back to 'unsafe-inline' +
 * 'unsafe-eval' on that path only.
 */
function buildCsp(pathname: string, nonce: string): string {
  const isStudio = pathname.startsWith("/studio");

  const scriptSrc = isStudio
    ? "'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://checkout.razorpay.com https://*.razorpay.com https://va.vercel-scripts.com https://*.vercel-scripts.com"
    : `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https: http:`;

  // 'unsafe-inline' next to 'nonce-…' is a fallback for browsers that don't
  // grok 'strict-dynamic' — modern browsers ignore 'unsafe-inline' when a
  // nonce is present, older ones get a permissive policy. The `https: http:`
  // tail is also legacy fallback (ignored under strict-dynamic).

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://www.google.com https://www.google.co.in https://*.google.com https://*.gstatic.com https://www.facebook.com https://*.facebook.com https://lh3.googleusercontent.com https://cdn.sanity.io https://images.unsplash.com https://plus.unsplash.com https://cdn.pixabay.com https://videos.pexels.com https://*.supabase.co https://logo.clearbit.com https://i.ytimg.com https://i.vimeocdn.com`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.google.com https://*.google.com https://connect.facebook.net https://*.facebook.com https://graph.facebook.com https://px.ads.linkedin.com https://*.linkedin.com https://lekxoexyebfvngllpeqx.supabase.co https://*.supabase.co https://api.sanity.io https://*.api.sanity.io https://*.apicdn.sanity.io https://api.razorpay.com https://lumberjack.razorpay.com https://*.razorpay.com https://api.anthropic.com https://*.upstash.io https://*.vercel-insights.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://wa.me https://api.whatsapp.com`,
    `media-src 'self' https: blob:`,
    `frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.google.com https://*.google.com https://www.googletagmanager.com https://www.facebook.com https://*.facebook.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https://checkout.razorpay.com https://www.facebook.com https://*.facebook.com`,
    `frame-ancestors 'self'`,
    `upgrade-insecure-requests`,
  ];

  return directives.join("; ");
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // base64 — Edge runtime doesn't have Buffer
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const nonce = generateNonce();
  const csp = buildCsp(pathname, nonce);

  // Forward the nonce to Server Components so they can stamp <Script
  // nonce={…} /> tags. Reading from request headers in a Server Component
  // is supported via next/headers.
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-nonce", nonce);

  // ─── Geo-IP city forward ──────────────────────────────────────────────
  // Vercel auto-populates request.geo from edge IP geolocation. Mirror the
  // city + country into custom headers so server components can read them
  // via next/headers. Empty when geolocation is missing (e.g. local dev).
  const geoCity = (req as unknown as { geo?: { city?: string; country?: string } }).geo?.city ?? "";
  const geoCountry = (req as unknown as { geo?: { city?: string; country?: string } }).geo?.country ?? "";
  if (geoCity) reqHeaders.set("x-tt-geo-city", decodeURIComponent(geoCity));
  if (geoCountry) reqHeaders.set("x-tt-geo-country", geoCountry);

  function applyHeaders(res: NextResponse): NextResponse {
    res.headers.set("Content-Security-Policy", csp);
    res.headers.set("x-nonce", nonce);
    return res;
  }

  // ─── 1. Creator referral capture (any non-API page hit) ────────────────
  const ref = searchParams.get("ref");
  if (ref && REF_CODE_RE.test(ref) && !pathname.startsWith("/api/")) {
    const res = NextResponse.next({ request: { headers: reqHeaders } });
    res.cookies.set(REF_COOKIE, ref, {
      maxAge: REF_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/",
      httpOnly: false,   // need access from client for some flows
      secure: req.nextUrl.protocol === "https:",
    });
    // continue to admin check below for /admin paths
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
      return applyHeaders(res);
    }
  }

  // ─── 2. Admin Basic Auth ───────────────────────────────────────────────
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdminPath) {
    return applyHeaders(NextResponse.next({ request: { headers: reqHeaders } }));
  }

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    // Fail closed in production. Earlier the route fell through to
    // NextResponse.next(), which meant a botched env-var rollout (typo,
    // accidental delete in Vercel, missing in a preview deploy) would
    // expose the entire admin panel + every /api/admin/* route to the
    // public internet. Local dev keeps working without ADMIN_SECRET set.
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Admin not configured", {
        status: 503,
        headers: { "Content-Security-Policy": csp },
      });
    }
    return applyHeaders(NextResponse.next({ request: { headers: reqHeaders } }));
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      let decoded = "";
      try {
        decoded = atob(encoded);
      } catch {
        // Malformed base64 — fall through to 401.
      }
      const colon = decoded.indexOf(":");
      const pass = colon >= 0 ? decoded.slice(colon + 1) : "";
      // Constant-time compare so the response time doesn't leak password bytes
      // to a brute-forcer.
      if (timingSafeEqualStrings(pass, adminSecret)) {
        return applyHeaders(NextResponse.next({ request: { headers: reqHeaders } }));
      }
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Trust and Trip Admin"',
      "Content-Security-Policy": csp,
    },
  });
}

// Match admin routes AND every page (for ref capture). API routes excluded so
// they don't pay middleware cost on hot paths; ref is read from cookie there.
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    // Ref capture: every public page route, skip _next + static + api
    "/((?!_next/|api/|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest).*)",
  ],
};
