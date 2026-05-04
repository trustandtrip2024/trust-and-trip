export const revalidate = 300;
export const dynamicParams = true;

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  getCategoryBySlug,
  getAllCategorySlugs,
  getPackagesByCategory,
} from "@/lib/sanity-queries";
import PackageCard from "@/components/PackageCard";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const c = await getCategoryBySlug(params.slug);
  if (!c) return {};
  return {
    title: `${c.label} Packages — Trust and Trip`,
    description: c.intro?.slice(0, 155) || c.tagline || `Browse handpicked ${c.label.toLowerCase()} travel packages by Trust and Trip.`,
    alternates: { canonical: `https://trustandtrip.com/categories/${c.slug}` },
    openGraph: {
      title: `${c.label} — Trust and Trip`,
      description: c.tagline || c.intro?.slice(0, 200),
      type: "website",
      url: `https://trustandtrip.com/categories/${c.slug}`,
      ...(c.heroImage ? { images: [{ url: c.heroImage, width: 1200, height: 630, alt: c.label }] } : {}),
    },
  };
}

export default async function CategoryDetail({ params }: Props) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return notFound();

  const packages = await getPackagesByCategory(category.slug);

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Trust and Trip — ${category.label} packages`,
    numberOfItems: packages.length,
    itemListElement: packages.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://trustandtrip.com/packages/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <main className="bg-cream min-h-screen">
      <JsonLd data={ld} />

      <section className="relative h-[42vh] min-h-[280px] md:h-[55vh]">
        {category.heroImage ? (
          <Image
            src={category.heroImage}
            alt={category.label}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gold/40 via-sand to-cream" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-custom pb-10 text-white">
            <nav className="text-xs md:text-sm text-white/80 mb-3 flex items-center gap-1.5">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/categories" className="hover:text-white">Categories</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>{category.label}</span>
            </nav>
            {category.tagline && (
              <p className="eyebrow text-gold mb-2">{category.tagline}</p>
            )}
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight">
              {category.label}
            </h1>
            {category.intro && (
              <p className="mt-4 max-w-2xl text-white/90 text-base md:text-lg">
                {category.intro}
              </p>
            )}
          </div>
        </div>
      </section>

      {category.highlights && category.highlights.length > 0 && (
        <section className="bg-white border-b border-sand/60">
          <div className="container-custom py-6 md:py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {category.highlights.map((h) => (
                <div
                  key={h}
                  className="text-sm md:text-base text-ink/80 bg-cream rounded-lg px-3 py-2 text-center"
                >
                  {h}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-custom py-10 md:py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="eyebrow">Packages</p>
            <h2 className="heading-section mt-1">
              {packages.length} {packages.length === 1 ? "trip" : "trips"} in {category.label}
            </h2>
          </div>
        </div>

        {packages.length === 0 ? (
          <p className="text-ink/70">
            No packages tagged in this category yet — check back soon, or{" "}
            <Link href="/packages" className="underline">browse all packages</Link>.
          </p>
        ) : (
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
                limitedSlots={p.limitedSlots}
                trending={p.trending}
                highlights={p.highlights}
                inclusions={p.inclusions}
                categories={p.categories}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      <CTASection />
    </main>
  );
}
