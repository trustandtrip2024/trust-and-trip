// Env loader shared by:
//  • Next.js app (embedded Studio at /studio + server-side queries) —
//    needs NEXT_PUBLIC_* prefix to be exposed to the browser bundle.
//  • Hosted Sanity Studio (`npx sanity deploy`) — Sanity's CLI bundler
//    only inlines vars prefixed with SANITY_STUDIO_*. NEXT_PUBLIC_*
//    are not substituted, so the hosted bundle would crash with
//    "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET".
//
// Read both prefixes, NEXT_PUBLIC_* first (truthy in the Next.js
// runtime), then SANITY_STUDIO_* (truthy in the hosted Studio bundle).
// Both surfaces resolve to the same project + dataset.

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  process.env.SANITY_STUDIO_API_VERSION ||
  '2026-04-22'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.SANITY_STUDIO_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET / SANITY_STUDIO_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.SANITY_STUDIO_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID / SANITY_STUDIO_PROJECT_ID'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
