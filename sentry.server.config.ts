// Sentry — Node runtime. Fires for API routes / Server Components.
//
// Loaded by src/instrumentation.ts when NEXT_RUNTIME === "nodejs".

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
    // Skill recommends sendDefaultPii: true so request URLs, headers, and
    // user IPs land on the event — much easier to triage. We still strip
    // cookies in beforeSend.
    sendDefaultPii: true,
    // Ship console.log / structured logs to Sentry Logs
    enableLogs: true,
    // Capture local variable state on uncaught exceptions — invaluable for
    // production stack traces but adds a small perf cost on each throw.
    includeLocalVariables: true,
    beforeSend(event) {
      if (event.request?.headers) delete event.request.headers["cookie"];
      return event;
    },
  });
}
