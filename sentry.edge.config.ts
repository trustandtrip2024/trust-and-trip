// Sentry — Edge runtime (middleware, edge route handlers).
//
// Loaded by src/instrumentation.ts when NEXT_RUNTIME === "edge".
// Edge runtime can't use the Node integrations (no fs, no inspector),
// so includeLocalVariables is intentionally absent here.

import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    release:
      process.env.SENTRY_RELEASE ??
      process.env.VERCEL_GIT_COMMIT_SHA ??
      undefined,
    tracesSampleRate: Number(process.env.SENTRY_TRACE_RATE ?? 0.05),
    sendDefaultPii: true,
    enableLogs: true,
    beforeSend(event) {
      return scrubEvent(event);
    },
  });
}
