import CreativesClient from "./CreativesClient";

export const metadata = { title: "Creatives Generator · Admin" };

export default function CreativesPage() {
  return (
    <main className="container-custom py-10 max-w-5xl">
      <header>
        <p className="text-[12px] tracking-[0.15em] uppercase font-semibold text-tat-gold">
          Admin · Creatives
        </p>
        <h1 className="mt-2 font-display text-display-md text-tat-charcoal">
          Generate ad copy on demand
        </h1>
        <p className="mt-1 text-meta text-tat-slate max-w-2xl">
          Sonnet 4.6 + brand-voice guardrails. 5 headlines, 5 primary texts, 3 CTA buttons,
          3 WhatsApp prefill messages. Cached 24h per (lp · destination · audience). Cost ~₹2 / generation.
        </p>
      </header>

      <CreativesClient />
    </main>
  );
}
