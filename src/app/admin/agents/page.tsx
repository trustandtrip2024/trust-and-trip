import AgentsClient from "./AgentsClient";

export const metadata = { title: "Agents · Test · Admin" };

export default function AgentsPage() {
  return (
    <main className="container-custom py-10 max-w-6xl">
      <header>
        <p className="text-[12px] tracking-[0.15em] uppercase font-semibold text-tat-gold">
          Admin · Agents
        </p>
        <h1 className="mt-2 font-display text-display-md text-tat-charcoal">
          Internal agents tester
        </h1>
        <p className="mt-1 text-meta text-tat-slate max-w-2xl">
          Fire the itinerary engine + WhatsApp intent parser with arbitrary
          inputs. Use it to debug prompt regressions before the real funnel
          hits them. Outputs are NOT stored, NOT delivered to anyone.
        </p>
      </header>
      <AgentsClient />
    </main>
  );
}
