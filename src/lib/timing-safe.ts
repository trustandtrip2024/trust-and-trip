/**
 * Constant-time string equality.
 *
 * `===` short-circuits on the first mismatched byte, so an attacker who can
 * measure response time can recover a secret one character at a time. This
 * helper compares every byte regardless and only returns once the full input
 * is processed.
 *
 * Pure JS so it works in both the Node and Edge runtimes (middleware runs on
 * Edge, where `node:crypto.timingSafeEqual` is unavailable).
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  // Length itself is not constant-time leakable for credentials of fixed
  // length, but if the two are different lengths we fail safely. A length
  // mismatch is itself a mismatch — no extra info revealed.
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
