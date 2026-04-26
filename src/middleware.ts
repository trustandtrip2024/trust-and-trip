import { NextRequest, NextResponse } from "next/server";

const REF_COOKIE = "tt_ref";
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const REF_CODE_RE = /^CRTR-[A-Z0-9]{4,10}$/;

// Constant-time string compare — middleware runs in the Edge runtime which
// doesn't expose `crypto.timingSafeEqual`, so we fold to a length-equal
// boolean and run the loop in full both ways.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    let _bogus = 0;
    for (let i = 0; i < a.length; i++) _bogus |= a.charCodeAt(i) ^ a.charCodeAt(i);
    void _bogus;
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

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
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
      return res;
    }
  }

  // ─── 2. Admin Basic Auth ───────────────────────────────────────────────
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdminPath) return NextResponse.next();

  const adminSecret = process.env.ADMIN_SECRET;
  // Fail-closed: never let admin pass when ADMIN_SECRET is missing.
  // Local dev should set ADMIN_SECRET in .env.local.
  if (!adminSecret) {
    return new NextResponse("Admin auth not configured", { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      try {
        const decoded = atob(encoded);
        const [, pass] = decoded.split(":");
        if (pass && safeEqual(pass, adminSecret)) return NextResponse.next();
      } catch { /* malformed header → fall through to challenge */ }
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Trust and Trip Admin"' },
  });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    // Ref capture: every public page route, skip _next + static + api
    "/((?!_next/|api/|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest).*)",
  ],
};
