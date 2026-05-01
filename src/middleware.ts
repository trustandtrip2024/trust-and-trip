import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqualStrings } from "@/lib/timing-safe";

const REF_COOKIE = "tt_ref";
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const REF_CODE_RE = /^CRTR-[A-Z0-9]{4,10}$/;

// Pre-launch gate: when COMING_SOON_MODE=1, every public page is rewritten
// to /coming-soon. Owner can preview the real site by hitting any URL with
// `?preview=<ADMIN_SECRET>`, which sets a `tt_preview` cookie that bypasses
// the gate. Admin, Studio, API, and the coming-soon page itself stay open
// so the team can still finish content updates.
const COMING_SOON_PATH = "/coming-soon";
const PREVIEW_COOKIE = "tt_preview";
const PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Build the Content-Security-Policy for a request.
 *
 * Switched from per-request-nonce + strict-dynamic to allowlist + unsafe-inline
 * on 2026-05-01. Reason: reading the nonce in `src/app/layout.tsx` via
 * `headers()` forced Next.js into dynamic rendering on every page, which
 * emitted `Cache-Control: private, no-cache, no-store` and turned every Meta
 * ad click into a cold function invocation. The previous CSP already carried
 * `'unsafe-inline' https: http:` as a fallback for browsers without
 * strict-dynamic support, so most of the protective benefit was already
 * watered down. Allowlist + script-source isolation gets us back ISR with
 * minimal real-world security loss.
 *
 * Sanity Studio (/studio) keeps its more-permissive CSP because Studio
 * injects many inline scripts and uses eval.
 */
function buildCsp(pathname: string): string {
  const isStudio = pathname.startsWith("/studio");

  const scriptSrc = isStudio
    ? "'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://checkout.razorpay.com https://*.razorpay.com https://va.vercel-scripts.com https://*.vercel-scripts.com"
    : "'self' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://connect.facebook.net https://*.facebook.com https://www.facebook.com https://checkout.razorpay.com https://*.razorpay.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://vercel.live https://*.vercel.live";

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

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const csp = buildCsp(pathname);

  // CRITICAL: do NOT pass `request: { headers: ... }` into NextResponse.next().
  // That call pattern is what tells Next.js the route consumes a request-scoped
  // header and the route gets marked dynamic, which kills ISR and forces
  // Cache-Control: no-store. Pass-through pages must stay static so the
  // edge cache can serve Meta-ad cold-clicks. Geo header forwarding +
  // x-nonce header forwarding were both dropped on 2026-05-01 for this
  // reason — geo headers had no consumer and nonce is gone with the CSP
  // refactor.

  // Public marketing/content paths that are safe to cache at the Vercel
  // edge. Pages here render the same HTML for every visitor (no auth, no
  // per-user data) so a shared 5-min cache is fine. Calling `headers()` in
  // the root layout to read the CSP nonce forces Next.js into dynamic
  // rendering, which would otherwise emit `Cache-Control: no-store` and
  // turn every Meta-ad click into a cold function invocation. Setting
  // `s-maxage` from middleware overrides that — the edge serves the cached
  // HTML, the browser still revalidates after the window. The nonce gets
  // cached alongside the HTML, which is acceptable: strict-dynamic only
  // requires nonce-in-header matches nonce-in-DOM, both come from the
  // same cached response.
  const isPublicCacheable =
    req.method === "GET" &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/studio") &&
    !pathname.startsWith("/book/") &&
    !pathname.startsWith("/refer/dashboard") &&
    !pathname.startsWith("/creators/dashboard") &&
    !req.headers.get("authorization") &&
    !req.cookies.has("sb-access-token") &&
    !req.cookies.has("sb-refresh-token");

  function applyHeaders(res: NextResponse): NextResponse {
    res.headers.set("Content-Security-Policy", csp);
    if (isPublicCacheable) {
      // Edge cache: 5 min fresh, 24 h stale-while-revalidate. Belt to the
      // suspenders of `revalidate = 300` exports on the page modules — Next
      // already respects those for static/ISR rendering, this just makes
      // the intent explicit at the edge.
      res.headers.set(
        "Cache-Control",
        "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
      );
    }
    return res;
  }

  // ─── 0. Pre-launch coming-soon gate ────────────────────────────────────
  // Toggled by COMING_SOON_MODE env. When on, public pages rewrite to
  // /coming-soon. Admin/Studio/API stay live so the team can finish
  // pre-launch content. Preview cookie (set via ?preview=<ADMIN_SECRET>)
  // lets the owner walk through the real site while the gate is active.
  if (process.env.COMING_SOON_MODE === "1") {
    const adminSecret = process.env.ADMIN_SECRET;
    const previewParam = searchParams.get("preview");

    // Set/refresh preview cookie when the owner passes the secret in the URL.
    // Set CSP but NOT Cache-Control — caching a Set-Cookie response would let
    // the edge strip the cookie before serving subsequent visitors.
    if (adminSecret && previewParam && previewParam === adminSecret) {
      const res = NextResponse.redirect(
        new URL(pathname, req.nextUrl.origin),
      );
      res.cookies.set(PREVIEW_COOKIE, adminSecret, {
        maxAge: PREVIEW_COOKIE_MAX_AGE,
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secure: req.nextUrl.protocol === "https:",
      });
      res.headers.set("Content-Security-Policy", csp);
      return res;
    }

    const hasPreview =
      adminSecret !== undefined &&
      req.cookies.get(PREVIEW_COOKIE)?.value === adminSecret;

    const isExempt =
      pathname === COMING_SOON_PATH ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/studio") ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      pathname === "/manifest.webmanifest" ||
      pathname === "/sw.js" ||
      pathname === "/icon.svg" ||
      pathname === "/favicon.ico";

    if (!hasPreview && !isExempt) {
      const url = req.nextUrl.clone();
      url.pathname = COMING_SOON_PATH;
      url.search = "";
      return applyHeaders(NextResponse.rewrite(url));
    }
  }

  // ─── 1. Creator referral capture (any non-API page hit) ────────────────
  const ref = searchParams.get("ref");
  if (ref && REF_CODE_RE.test(ref) && !pathname.startsWith("/api/")) {
    const res = NextResponse.next();
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
    return applyHeaders(NextResponse.next());
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
    return applyHeaders(NextResponse.next());
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
        return applyHeaders(NextResponse.next());
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

// generateNonce removed 2026-05-01 — see buildCsp() doc comment.

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
