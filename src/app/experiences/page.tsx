import Image from "next/image";
import Link from "next/link";
import { experiences } from "@/lib/data";
import { getPackages } from "@/lib/sanity-queries";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { ArrowUpRight, Compass } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Experiences — Trust and Trip",
  description: "Travel styles designed around how you want to feel — not just where you want to go.",
  alternates: { canonical: "https://trustandtrip.com/experiences" },
};

export default async function ExperiencesPage() {
  // Pull all packages once to surface a per-experience trip count badge.
  // Failure falls back to an empty map (badges silently disappear).
  const packages = await getPackages().catch(() => []);
  const countByType = new Map<string, number>();
  for (const p of packages) {
    countByType.set(p.travelType, (countByType.get(p.travelType) ?? 0) + 1);
  }

  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trust and Trip — Travel Experiences",
    numberOfItems: experiences.length,
    itemListElement: experiences.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://trustandtrip.com/experiences/${e.slug}`,
      name: e.title,
    })),
  };

  return (
    <>
      <JsonLd data={listLd} />
      <section className="pt-28 md:pt-36 pb-16 bg-tat-paper">
        <div className="container-custom">
          <span className="eyebrow">Experiences</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] max-w-4xl text-balance">
            Pick a feeling.
            <span className="italic text-tat-gold font-light"> The destination can wait.</span>
          </h1>
          <p className="mt-6 text-tat-charcoal/60 max-w-xl leading-relaxed">
            We group trips by how they'll make you feel — romantic, adventurous, restorative, or
            curious — because that's how memories actually form.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-custom grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {experiences.map((exp) => {
            const count = exp.travelType ? countByType.get(exp.travelType) ?? 0 : 0;
            return (
              <Link
                key={exp.slug}
                id={exp.slug}
                href={`/experiences/${exp.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-tat-charcoal"
              >
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/95 via-tat-charcoal/30 to-transparent" />

                <div className="absolute top-6 right-6 h-11 w-11 rounded-full bg-tat-paper/20 backdrop-blur-md border border-tat-paper/20 flex items-center justify-center group-hover:bg-tat-gold group-hover:border-tat-gold transition-all duration-500">
                  <ArrowUpRight className="h-4 w-4 text-tat-paper group-hover:text-tat-charcoal" />
                </div>

                {count > 0 && (
                  <span className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tat-paper/15 backdrop-blur-md text-tat-paper text-[11px] font-medium ring-1 ring-tat-paper/20">
                    <Compass className="h-3 w-3 text-tat-gold" />
                    {count} {count === 1 ? "trip" : "trips"}
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-7 text-tat-paper">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-tat-gold mb-2">
                    {exp.category}
                  </p>
                  <h3 className="font-display text-3xl font-medium leading-tight mb-3">
                    {exp.title}
                  </h3>
                  <p className="text-sm text-tat-paper/70 leading-relaxed max-w-sm">
                    {exp.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <CTASection />
    </>
  );
}
