// Lightweight cookie-based A/B testing.
//
// Each experiment is a key + array of variants. The first time a visitor
// hits a variant, they're bucketed deterministically based on a hash of
// (visitor_id + experiment_key) so the assignment is sticky across reloads
// and devices that share the cookie. We track exposure in GA4 the first
// time the variant is read on a render, so events are clean and not
// double-counted across re-renders.
//
// No backend dependency — runs purely client-side. Works without Vercel
// Edge Config / Statsig / etc. When you want to graduate to a real
// experimentation platform, the API surface is the same: useABTest(key, variants).

const COOKIE_PREFIX = "tt_ab_";
const COOKIE_TTL_DAYS = 90;

export type Experiment<V extends string> = {
  key: string;
  variants: readonly V[];
  // Optional weights — must sum to 1.0. If omitted, equal split.
  weights?: readonly number[];
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}

function writeCookie(name: string, value: string, days = COOKIE_TTL_DAYS) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 86400 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// FNV-1a 32-bit — fast, deterministic, no dependency
function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Stable visitor id (created on demand)
function visitorId(): string {
  const KEY = "tt_visitor";
  let id = readCookie(KEY);
  if (!id) {
    id = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    writeCookie(KEY, id, 365);
  }
  return id;
}

export function bucketFor<V extends string>(exp: Experiment<V>): V {
  // Sticky read first
  const cookieName = `${COOKIE_PREFIX}${exp.key}`;
  const stored = readCookie(cookieName);
  if (stored && exp.variants.includes(stored as V)) return stored as V;

  // Deterministic bucket from visitor + key
  const v = visitorId();
  const r = (hash(`${v}|${exp.key}`) % 10000) / 10000;

  // Default to equal weights
  const weights = exp.weights && exp.weights.length === exp.variants.length
    ? exp.weights
    : exp.variants.map(() => 1 / exp.variants.length);

  let acc = 0;
  for (let i = 0; i < exp.variants.length; i++) {
    acc += weights[i];
    if (r < acc) {
      writeCookie(cookieName, exp.variants[i]);
      return exp.variants[i];
    }
  }
  // Fallback: last variant
  const last = exp.variants[exp.variants.length - 1];
  writeCookie(cookieName, last);
  return last;
}

export function trackExposure(experimentKey: string, variant: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "experiment_view", {
    experiment_id: experimentKey,
    variant_id: variant,
    non_interaction: true,
  });
}
