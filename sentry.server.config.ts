// Sentry — Node runtime. Fires for API routes / Server Components.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    release:
      process.env.SENTRY_RELEASE ??
      process.env.VERCEL_GIT_COMMIT_SHA ??
      undefined,
    tracesSampleRate: 0.1,
    // Don't include request bodies — they often contain PII / secrets
    sendDefaultPii: false,
  });
}
