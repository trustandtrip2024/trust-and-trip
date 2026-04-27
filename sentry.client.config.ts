// Sentry — browser. Fires when client-side code throws.
// DSN is the only required env var; everything else is opinionated defaults.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    release:
      process.env.NEXT_PUBLIC_SENTRY_RELEASE ??
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
      undefined,
    // Sample 20% of normal sessions and 100% of sessions where an error occurs
    replaysSessionSampleRate: 0.2,
    replaysOnErrorSampleRate: 1.0,
    // 10% of transactions are traced — keeps quota usage sane
    tracesSampleRate: 0.1,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Ignore noise from extensions / 3rd-party scripts
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      "Network request failed",
    ],
    beforeSend(event) {
      // Strip PII fields if a form bubbled a sensitive value into the
      // breadcrumb stack. Email/phone in URL is also scrubbed automatically
      // by sendDefaultPii=false (the SDK default).
      if (event.request?.headers) delete event.request.headers["cookie"];
      return event;
    },
  });
}
