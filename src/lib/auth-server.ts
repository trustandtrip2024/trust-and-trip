import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Single shared service-role client for server-only use. Created lazily so
// build-time module loading doesn't crash when SUPABASE_SERVICE_ROLE_KEY is
// missing (e.g. local dev with placeholder).
let _admin: ReturnType<typeof createClient> | null = null;
function adminClient() {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase service role not configured");
  }
  _admin = createClient(url, key);
  return _admin;
}

/**
 * Constant-time HTTP Basic Auth check against ADMIN_SECRET. Used both by
 * middleware AND by every /api/admin/* route as defence-in-depth — never
 * trust the middleware alone, since a misconfigured matcher silently
 * skips the check.
 *
 * Returns null on success, or a 401 NextResponse on failure.
 */
export function requireAdmin(req: NextRequest): NextResponse | null {
  const adminSecret = process.env.ADMIN_SECRET;
  // Production fail-closed: refuse to authenticate when no secret is set.
  // (In development we still fail closed; misconfiguration shouldn't
  // silently open admin.)
  if (!adminSecret) {
    return NextResponse.json(
      { error: "Admin auth not configured" },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return basicAuthChallenge();

  const [scheme, encoded] = authHeader.split(" ");
  if (scheme !== "Basic" || !encoded) return basicAuthChallenge();

  let decoded: string;
  try { decoded = atob(encoded); } catch { return basicAuthChallenge(); }
  const [, pass] = decoded.split(":");
  if (!pass) return basicAuthChallenge();

  if (!safeEqual(pass, adminSecret)) return basicAuthChallenge();
  return null;
}

function basicAuthChallenge() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Trust and Trip Admin"' },
  });
}

/**
 * Timing-safe string compare. Returns false for length mismatch without
 * leaking the length difference via early return timing.
 */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    // Compare same-length zero buffers so we still spend the cycles.
    crypto.timingSafeEqual(ab, ab);
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Resolve the Supabase user from a Bearer token in the Authorization
 * header. Returns the user, or a 401 NextResponse to short-circuit the
 * route.
 */
export async function requireUser(req: NextRequest): Promise<
  | { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } }
  | { error: NextResponse }
> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data, error } = await adminClient().auth.getUser(token);
  if (error || !data?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user: data.user };
}

/**
 * Like requireUser, but additionally enforces user_metadata.role === "creator"
 * and (optionally) that the URL's :id param matches the user. Returns the
 * authenticated creator's user object, or a 401/403 NextResponse.
 */
export async function requireCreator(
  req: NextRequest,
  opts: { creatorIdInUrl?: string } = {},
): Promise<
  | { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } }
  | { error: NextResponse }
> {
  const u = await requireUser(req);
  if ("error" in u) return u;

  const role = (u.user.user_metadata as Record<string, unknown> | undefined)?.role;
  if (role !== "creator") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  if (opts.creatorIdInUrl) {
    // Look up the creator row to confirm the URL :id belongs to this user.
    const { data, error } = await adminClient()
      .from("creators")
      .select("id, user_id")
      .eq("id", opts.creatorIdInUrl)
      .single<{ id: string; user_id: string | null }>();
    if (error || !data || data.user_id !== u.user.id) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
  }
  return u;
}

export { adminClient as supabaseAdmin };
