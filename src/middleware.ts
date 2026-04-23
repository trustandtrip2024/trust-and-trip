import { NextRequest, NextResponse } from "next/server";

const REF_COOKIE = "tt_ref";
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const REF_CODE_RE = /^CRTR-[A-Z0-9]{4,10}$/;

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
    // continue to admin check below for /admin paths
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
      return res;
    }
  }

  // ─── 2. Admin Basic Auth ───────────────────────────────────────────────
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdminPath) return NextResponse.next();

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return NextResponse.next(); // no secret set → open (dev only)

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [, pass] = decoded.split(":");
      if (pass === adminSecret) return NextResponse.next();
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Trust and Trip Admin"' },
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
