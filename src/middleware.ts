import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
