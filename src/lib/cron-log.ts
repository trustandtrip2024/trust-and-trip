import { createClient } from "@supabase/supabase-js";

/**
 * Cron run logger. Wrap a cron handler with `withCronLog(jobPath, handler)`
 * to upsert into cron_runs on every tick. /admin/health reads this table
 * to surface "last successful run" without trawling Vercel logs.
 *
 * Errors thrown inside the handler still bubble up — but a row is written
 * with status=error first so the dashboard sees the failure.
 *
 * Skips silently if Supabase env is missing — cron handlers shouldn't
 * fail just because logging is unavailable.
 */
export async function logCronRun(
  jobPath: string,
  status: "ok" | "error",
  durationMs: number,
  detail?: string,
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    await sb
      .from("cron_runs")
      .upsert(
        {
          job_path: jobPath,
          last_run_at: new Date().toISOString(),
          status,
          duration_ms: durationMs,
          detail: detail ?? null,
        },
        { onConflict: "job_path" },
      );
  } catch (e) {
    console.error("[cron-log] write failed", jobPath, e);
  }
}

export async function withCronLog<T>(
  jobPath: string,
  handler: () => Promise<T>,
): Promise<T> {
  const t0 = Date.now();
  try {
    const out = await handler();
    void logCronRun(jobPath, "ok", Date.now() - t0);
    return out;
  } catch (e) {
    void logCronRun(jobPath, "error", Date.now() - t0, (e as Error).message);
    throw e;
  }
}
