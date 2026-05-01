import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (_admin) return _admin;
  _admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  return _admin;
}

/**
 * Validate the `Authorization: Bearer <jwt>` header against Supabase Auth.
 *
 * Returns either a denial NextResponse (401) the caller should return as-is,
 * or a `{ user }` payload to use for ownership checks downstream.
 *
 * Centralised so every Bearer-gated route handles malformed/missing/expired
 * tokens the same way and never accidentally short-circuits past the auth
 * check on an unexpected error shape.
 */
export async function requireUser(
  req: NextRequest,
): Promise<{ user: User; denial?: never } | { user?: never; denial: NextResponse }> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return { denial: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  try {
    const { data, error } = await admin().auth.getUser(token);
    if (error || !data?.user) {
      return { denial: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    return { user: data.user };
  } catch {
    return { denial: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
}
