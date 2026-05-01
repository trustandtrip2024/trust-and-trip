import type { ErrorEvent } from "@sentry/nextjs";

// Header names that can contain credentials or session info.
const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-razorpay-signature",
  "x-bitrix-token",
  "x-supabase-auth",
]);

// Query-param names whose values should be redacted before the URL is
// shipped to Sentry. `key`, `token`, `secret` cover most credential leaks
// (admin gates use ?key=, magic links use ?token=, etc).
const SENSITIVE_QUERY_KEYS = /^(key|token|secret|signature|access_token|refresh_token|jwt|otp|password|email|phone)$/i;

// Common PII field names that may end up on event.extra or event.contexts.
const PII_KEYS = /^(email|phone|customer_email|customer_phone|reviewer_email|password|name|customer_name|reviewer_name|access_token|refresh_token|jwt|authorization)$/i;

function sanitizeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    for (const key of Array.from(url.searchParams.keys())) {
      if (SENSITIVE_QUERY_KEYS.test(key)) {
        url.searchParams.set(key, "[redacted]");
      }
    }
    return url.toString();
  } catch {
    return raw;
  }
}

function scrubObject<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  for (const k of Object.keys(obj as Record<string, unknown>)) {
    if (PII_KEYS.test(k)) {
      (obj as Record<string, unknown>)[k] = "[redacted]";
    } else {
      const v = (obj as Record<string, unknown>)[k];
      if (v && typeof v === "object") scrubObject(v);
    }
  }
  return obj;
}

/**
 * Sentry beforeSend hook. Strips credential-bearing headers, sanitises
 * URL query strings, and redacts common PII keys on `extra` / `contexts`.
 *
 * Live with `sendDefaultPii: true`; the helper makes the trade-off
 * (more triage info) safe by stripping the bits that should never leave
 * the box (Authorization header, ?key=ADMIN_SECRET, raw email/phone).
 */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    if (event.request.headers) {
      for (const k of Object.keys(event.request.headers)) {
        if (SENSITIVE_HEADERS.has(k.toLowerCase())) {
          event.request.headers[k] = "[redacted]";
        }
      }
    }
    if (typeof event.request.url === "string") {
      event.request.url = sanitizeUrl(event.request.url);
    }
    if (event.request.query_string && typeof event.request.query_string === "string") {
      // Re-build a query string from the URLSearchParams view so sensitive
      // keys land on the same redacted treatment as the URL above.
      const params = new URLSearchParams(event.request.query_string);
      for (const k of Array.from(params.keys())) {
        if (SENSITIVE_QUERY_KEYS.test(k)) params.set(k, "[redacted]");
      }
      event.request.query_string = params.toString();
    }
    if (event.request.data && typeof event.request.data === "object") {
      scrubObject(event.request.data);
    }
  }
  if (event.extra) scrubObject(event.extra);
  if (event.contexts) scrubObject(event.contexts);
  if (event.tags) scrubObject(event.tags);
  if (event.user) {
    // Keep user.id (used for grouping) but never ship the email/IP/username
    // — Sentry's own UI surfaces those if sendDefaultPii is on.
    if (event.user.email) event.user.email = "[redacted]";
    if (event.user.username) event.user.username = "[redacted]";
    if (event.user.ip_address && event.user.ip_address !== "{{auto}}") {
      // Drop the literal IP — keep "{{auto}}" since that's just a placeholder
      // Sentry resolves server-side.
      event.user.ip_address = "[redacted]";
    }
  }
  return event;
}
