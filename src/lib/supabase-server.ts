import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase client bound to the current request's cookies. Use inside
 * Server Components and Route Handlers when you need to read the
 * authenticated session — never use this on the client.
 *
 * Reads only; cookie write/remove are no-ops because Server Components
 * cannot mutate cookies. For routes that need to refresh a session, use
 * a Route Handler with a separate writable client.
 */
export function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() { /* no-op in RSC */ },
        remove() { /* no-op in RSC */ },
      },
    },
  );
}

/**
 * Resolve the current user from the request cookies. Returns null when
 * unauthed (or when the session token is invalid).
 */
export async function getServerUser() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}
