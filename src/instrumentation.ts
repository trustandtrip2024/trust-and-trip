// Sentry server-side registration hook.
//
// Without this file the sentry.server.config.ts and sentry.edge.config.ts
// files never load — Next.js only invokes Sentry.init when a registered
// instrumentation hook explicitly imports them at server start.
//
// Required pattern documented at:
//   https://docs.sentry.io/platforms/javascript/guides/nextjs/
//
// Stable in Next 14.0.4+; flagged behind experimental.instrumentationHook
// in earlier versions. We're on 14.2.x so no extra config flag is needed.

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Auto-captures all unhandled server-side request errors (App Router
// route handlers, server actions, server components). Requires
// @sentry/nextjs >= 8.28.0 — we're on ^10.50.
export const onRequestError = Sentry.captureRequestError;
