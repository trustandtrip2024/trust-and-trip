import Image from "next/image";
import Link from "next/link";
import { experiences } from "@/lib/data";
import CTASection from "@/components/CTASection";
import { ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Experiences — Trust and Trip",
  description: "Travel styles designed around how you want to feel — not just where you want to go.",
};

export default function ExperiencesPage() {
  return (
    <>
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
          {experiences.map((exp) => (
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
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
}
