// Sentry — browser. Replaces legacy sentry.client.config.ts.
//
// Next 15+ / @sentry/nextjs >= 9 expects client init in src/instrumentation-client.ts
// and exports `onRouterTransitionStart` so App Router navigation transactions
// finish cleanly. Without that export, client-side route changes show up as
// dangling pending transactions in Sentry.

import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    release:
      process.env.NEXT_PUBLIC_SENTRY_RELEASE ??
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
      undefined,
    // Sample 5% of normal sessions and 100% of sessions where an error occurs.
    // Defaults are conservative — bump via NEXT_PUBLIC_SENTRY_REPLAY_RATE /
    // NEXT_PUBLIC_SENTRY_TRACE_RATE without redeploying when extra signal
    // is needed. Lowered from 20%/10% in 2026-04 to cut Replay upload size
    // and trace volume on every page; 100% error sampling is preserved so
    // every real bug still ships full context.
    replaysSessionSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAY_RATE ?? 0.05),
    replaysOnErrorSampleRate: 1.0,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACE_RATE ?? 0.05),
    // Send headers + IP so user-tied breadcrumbs are useful in Sentry.
    // We still strip cookies in beforeSend below.
    sendDefaultPii: true,
    enableLogs: true,
    integrations: [
      Sentry.replayIntegration({
        // Privacy by default — payment/booking forms collect name, phone,
        // email, travel dates, special requests. Replay should never ship
        // any of that off-box. Engineers who need to read a specific input
        // value during incident triage can opt-in per element with the
        // `data-sentry-unmask` attribute.
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Ignore noise from extensions / 3rd-party scripts
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      "Network request failed",
    ],
    beforeSend(event) {
      return scrubEvent(event);
    },
  });
}

// App Router navigation hook — required by @sentry/nextjs to attach
// pageload + navigation spans to client transitions.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
