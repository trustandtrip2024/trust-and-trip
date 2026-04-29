// Sentry — browser. Replaces legacy sentry.client.config.ts.
//
// Next 15+ / @sentry/nextjs >= 9 expects client init in src/instrumentation-client.ts
// and exports `onRouterTransitionStart` so App Router navigation transactions
// finish cleanly. Without that export, client-side route changes show up as
// dangling pending transactions in Sentry.

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
    // Send headers + IP so user-tied breadcrumbs are useful in Sentry.
    // We still strip cookies in beforeSend below.
    sendDefaultPii: true,
    enableLogs: true,
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
      if (event.request?.headers) delete event.request.headers["cookie"];
      return event;
    },
  });
}

// App Router navigation hook — required by @sentry/nextjs to attach
// pageload + navigation spans to client transitions.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
