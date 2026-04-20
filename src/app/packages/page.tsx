export const revalidate = 30;

import { getPackages, getDestinations } from "@/lib/sanity-queries";
import PackagesClient from "./PackagesClient";
import CTASection from "@/components/CTASection";

export const metadata = {
  title: "Packages — Trust and Trip",
  description: "40+ handcrafted tour packages across India and the world — for couples, families, groups and solo travelers.",
};

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }> | { [key: string]: string | undefined };
}) {
  const [packages, destinations, params] = await Promise.all([
    getPackages(),
    getDestinations(),
    Promise.resolve(searchParams),
  ]);

  return (
    <>
      <section className="pt-28 md:pt-36 pb-12 md:pb-16 bg-cream border-b border-ink/5">
        <div className="container-custom">
          <span className="eyebrow">Our Packages</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] max-w-4xl text-balance">
            Signature journeys.
            <span className="italic text-gold font-light"> Ready to live.</span>
          </h1>
          <p className="mt-6 text-ink/60 max-w-xl leading-relaxed">
            Every package here was designed by a planner who&apos;s been there. Filter by what
            matters, or let us build one from scratch.
          </p>
        </div>
      </section>

      <PackagesClient
        packages={packages}
        destinations={destinations}
        initialDestination={params.destination ?? ""}
        initialTravelType={params.type ?? ""}
        initialDuration={params.duration ?? ""}
        initialBudget={params.budget ?? ""}
      />

      <CTASection />
    </>
  );
}
