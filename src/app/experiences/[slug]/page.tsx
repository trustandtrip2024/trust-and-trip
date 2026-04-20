export const revalidate = 60;

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { experiences } from "@/lib/data";
import { getPackages } from "@/lib/sanity-queries";
import PackageCard from "@/components/PackageCard";
import CTASection from "@/components/CTASection";
import { ChevronRight, Check, ArrowRight } from "lucide-react";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return experiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props) {
  const exp = experiences.find((e) => e.slug === params.slug);
  if (!exp) return {};
  return {
    title: `${exp.title} — Trust and Trip`,
    description: exp.description,
    alternates: { canonical: `https://trustandtrip.com/experiences/${exp.slug}` },
  };
}

export default async function ExperienceDetailPage({ params }: Props) {
  const exp = experiences.find((e) => e.slug === params.slug);
  if (!exp) return notFound();

  const allPackages = await getPackages();

  // Filter packages by travelType — fallback to trending/all if < 4 results
  const byType = exp.travelType
    ? allPackages.filter((p) => p.travelType === exp.travelType)
    : [];
  const packages = byType.length >= 3 ? byType : allPackages.filter((p) => p.trending).slice(0, 8);

  const otherExperiences = experiences.filter((e) => e.slug !== exp.slug);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden bg-ink">
        <Image
          src={exp.image}
          alt={exp.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />

        {/* Breadcrumb */}
        <div className="absolute top-24 md:top-28 inset-x-0 container-custom flex items-center gap-2 text-xs text-cream/60 z-10">
          <Link href="/" className="hover:text-gold">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/experiences" className="hover:text-gold">Experiences</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gold">{exp.title}</span>
        </div>

        <div className="relative h-full flex items-end pb-16 md:pb-20 container-custom text-cream">
          <div className="max-w-3xl">
            <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-gold bg-gold/15 border border-gold/30 px-3 py-1.5 rounded-full mb-5">
              {exp.category}
            </span>
            <h1 className="font-display text-display-lg font-medium leading-[0.98] text-balance">
              {exp.title}
            </h1>
            {exp.tagline && (
              <p className="mt-5 text-cream/70 text-xl font-display font-light italic">
                {exp.tagline}
              </p>
            )}
            <p className="mt-4 text-cream/60 max-w-xl leading-relaxed">{exp.description}</p>
          </div>
        </div>
      </section>

      {/* Highlights strip */}
      {exp.highlights && exp.highlights.length > 0 && (
        <section className="bg-ink text-cream py-6 border-t border-cream/10">
          <div className="container-custom flex flex-wrap gap-x-8 gap-y-2">
            {exp.highlights.map((h) => (
              <div key={h} className="flex items-center gap-2 text-sm text-cream/70">
                <Check className="h-3.5 w-3.5 text-gold shrink-0" />
                {h}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Packages */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="mb-10 md:mb-12">
            <span className="eyebrow">Curated for you</span>
            <h2 className="heading-section mt-2 text-balance">
              {exp.title} packages
              <span className="italic text-gold font-light"> worth every moment.</span>
            </h2>
            <p className="mt-4 text-ink/60 max-w-xl leading-relaxed">
              Every package below is handpicked for {exp.category.toLowerCase()} travelers.
              Not sure? We'll build one just for you.
            </p>
          </div>

          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {packages.map((p, i) => (
                <PackageCard
                  key={p.slug}
                  title={p.title}
                  slug={p.slug}
                  image={p.image}
                  duration={p.duration}
                  price={p.price}
                  rating={p.rating}
                  reviews={p.reviews}
                  destinationName={p.destinationName}
                  travelType={p.travelType}
                  trending={p.trending}
                  limitedSlots={p.limitedSlots}
                  highlights={p.highlights}
                  inclusions={p.inclusions}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-cream rounded-3xl border border-ink/5">
              <p className="font-display text-2xl mb-3">Coming soon</p>
              <p className="text-ink/60 mb-6">We're curating the perfect packages for this experience.</p>
              <Link href="/customize-trip" className="btn-primary inline-flex">
                Build a custom trip <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href={`/packages?type=${exp.travelType ?? ""}`} className="btn-outline inline-flex">
              See all {exp.category} packages
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Other experiences */}
      <section className="py-14 bg-sand/30">
        <div className="container-custom">
          <h2 className="heading-section mb-8 text-balance">
            Other ways to
            <span className="italic text-gold font-light"> travel.</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {otherExperiences.map((e) => (
              <Link
                key={e.slug}
                href={`/experiences/${e.slug}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink"
              >
                <Image
                  src={e.image}
                  alt={e.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gold mb-0.5">{e.category}</p>
                  <p className="font-display text-sm font-medium leading-tight">{e.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
