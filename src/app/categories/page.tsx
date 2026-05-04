export const revalidate = 600;

import Image from "next/image";
import Link from "next/link";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { getCategories } from "@/lib/sanity-queries";

export const metadata = {
  title: "Travel Categories — Honeymoon, Family, Adventure & More",
  description:
    "Browse Trust and Trip's travel categories — honeymoon escapes, family holidays, adventure expeditions, wellness retreats, pilgrim yatras, luxury journeys.",
  alternates: { canonical: "https://trustandtrip.com/categories" },
};

export default async function CategoriesIndex() {
  const categories = await getCategories();

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trust and Trip — Travel Categories",
    numberOfItems: categories.length,
    itemListElement: categories.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://trustandtrip.com/categories/${c.slug}`,
      name: c.label,
    })),
  };

  return (
    <main className="bg-cream min-h-screen">
      <JsonLd data={ld} />

      <section className="bg-gradient-to-b from-sand to-cream py-16 md:py-24">
        <div className="container-custom text-center">
          <p className="eyebrow">Browse by experience</p>
          <h1 className="heading-section mt-3">Travel Categories</h1>
          <p className="mt-4 text-ink/70 max-w-2xl mx-auto">
            From honeymoons to high-altitude treks — pick the kind of journey that calls you.
          </p>
        </div>
      </section>

      <section className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((c) => (
            <Link
              key={c._id}
              href={`/categories/${c.slug}`}
              className="group relative overflow-hidden rounded-2xl shadow-soft bg-white aspect-[4/5] block"
            >
              {c.heroImage ? (
                <Image
                  src={c.heroImage}
                  alt={c.label}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-sand" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-serif text-lg md:text-xl leading-tight">{c.label}</h3>
                {c.tagline && (
                  <p className="text-xs md:text-sm text-white/85 mt-1 line-clamp-2">{c.tagline}</p>
                )}
                {typeof c.packageCount === "number" && c.packageCount > 0 && (
                  <p className="text-[11px] text-white/75 mt-2 uppercase tracking-wide">
                    {c.packageCount} {c.packageCount === 1 ? "trip" : "trips"}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <CTASection />
    </main>
  );
}
