export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { todayIST } from "@/lib/daily-checks";
import DecisionsClient from "./DecisionsClient";

export const metadata = { title: "Decisions · Trust and Trip Admin" };

type DecisionRow = {
  id: number;
  decided_at: string;
  area: string;
  decision: string;
  rationale: string | null;
  expected: string | null;
  review_on: string | null;
  outcome: string | null;
  outcome_at: string | null;
};

async function loadDecisions(): Promise<DecisionRow[]> {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await sb
      .from("decisions")
      .select("id, decided_at, area, decision, rationale, expected, review_on, outcome, outcome_at")
      .order("decided_at", { ascending: false })
      .limit(200);
    return (data ?? []) as DecisionRow[];
  } catch {
    return [];
  }
}

export default async function DecisionsPage() {
  const rows = await loadDecisions();
  const today = todayIST();
  const dueForReview = rows.filter((r) => r.review_on && r.review_on <= today && !r.outcome);

  return (
    <div className="min-h-screen bg-tat-paper">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-slate">
            Founder decision journal
          </p>
          <h1 className="font-display text-3xl text-tat-charcoal mt-1">Decisions</h1>
          <p className="text-sm text-tat-slate mt-1">
            Log each non-trivial decision with rationale. Revisit on review date and write the outcome — that's the loop.
            Solo-founder memory aid; not a Jira.
          </p>
        </header>

        <DecisionsClient initial={rows} dueForReview={dueForReview} />
      </div>
    </div>
  );
}
