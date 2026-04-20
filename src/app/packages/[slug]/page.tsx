export const revalidate = 30;
export const dynamicParams = true;

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPackageBySlug, getAllPackageSlugs } from "@/lib/sanity-queries";
import { testimonials } from "@/lib/data";
import Accordion from "@/components/Accordion";
import TestimonialCard from "@/components/TestimonialCard";
import CTASection from "@/components/CTASection";
import PackageEnquiryCTA from "@/components/PackageEnquiryCTA";
import JsonLd from "@/components/JsonLd";
import {
  Clock,
  Star,
  MapPin,
  Check,
  X as XIcon,
  ChevronRight,
  Hotel,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getAllPackageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const p = await getPackageBySlug(params.slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    openGraph: {
      title: p.title,
      description: p.description,
      images: [{ url: p.heroImage, width: 1200, height: 630, alt: p.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.description,
      images: [p.heroImage],
    },
    alternates: { canonical: `https://trustandtrip.com/packages/${p.slug}` },
  };
}

export default async function PackageDetail({ params }: Props) {
  const pkg = await getPackageBySlug(params.slug);
  if (!pkg) return notFound();

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: pkg.title,
        description: pkg.description,
        image: pkg.heroImage,
        brand: { "@type": "Brand", name: "Trust and Trip" },
        offers: {
          "@type": "Offer",
          url: `https://trustandtrip.com/packages/${pkg.slug}`,
          priceCurrency: "INR",
          price: pkg.price,
          priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          availability: pkg.limitedSlots
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/InStock",
          seller: { "@type": "TravelAgency", name: "Trust and Trip" },
        },
        ...(pkg.rating && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: pkg.rating,
            reviewCount: pkg.reviews,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      }} />

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[560px] w-full overflow-hidden bg-ink">
        <Image
          src={pkg.heroImage}
          alt={pkg.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/70" />

        <div className="absolute top-24 md:top-28 inset-x-0 z-10">
          <div className="container-custom flex items-center gap-2 text-xs text-cream/70">
            <Link href="/" className="hover:text-gold">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/packages" className="hover:text-gold">Packages</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gold truncate">{pkg.destinationName}</span>
          </div>
        </div>

        <div className="relative h-full flex items-end pb-16 md:pb-20 container-custom text-cream">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <span className="inline-flex items-center gap-1 bg-cream/10 backdrop-blur-md border border-cream/20 text-cream/90 text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-full">
                <MapPin className="h-3 w-3 text-gold" />
                {pkg.destinationName}
              </span>
              <span className="inline-flex items-center gap-1 bg-cream/10 backdrop-blur-md border border-cream/20 text-cream/90 text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-full">
                <Clock className="h-3 w-3 text-gold" />
                {pkg.duration}
              </span>
              <span className="inline-flex items-center gap-1 bg-gold/20 backdrop-blur-md border border-gold/30 text-gold text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-full">
                <Star className="h-3 w-3 fill-gold" />
                {pkg.rating} · {pkg.reviews} reviews
              </span>
            </div>
            <h1 className="font-display text-display-lg font-medium leading-[0.98] text-balance">
              {pkg.title}
            </h1>
            <p className="mt-5 text-cream/70 text-lg max-w-2xl leading-relaxed">
              {pkg.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 md:py-20">
        <div className="container-custom grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">
          <div className="min-w-0">
            {/* Highlights */}
            <div className="mb-16">
              <span className="eyebrow">Highlights</span>
              <h2 className="heading-section mt-3 mb-8 text-balance">
                What makes this journey
                <span className="italic text-gold font-light"> unforgettable.</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {pkg.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 bg-cream rounded-2xl p-5 border border-ink/5">
                    <span className="shrink-0 h-7 w-7 rounded-full bg-gold/20 text-gold flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-sm text-ink/80 leading-relaxed pt-0.5">{h}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div className="mb-16">
              <span className="eyebrow">Day-by-day itinerary</span>
              <h2 className="heading-section mt-3 mb-8 text-balance">
                Your journey,
                <span className="italic text-gold font-light"> unfolded.</span>
              </h2>
              <Accordion
                items={pkg.itinerary.map((day) => ({
                  subtitle: `Day ${day.day}`,
                  title: day.title,
                  content: day.description,
                }))}
              />
            </div>

            {/* Hotel */}
            <div className="mb-16 bg-sand/40 rounded-3xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-6 right-6 text-gold opacity-40">
                <Hotel className="h-16 w-16" />
              </div>
              <span className="eyebrow">Where you'll stay</span>
              <h3 className="font-display text-3xl md:text-4xl font-medium mt-3 text-balance max-w-lg">
                {pkg.hotel.name}
              </h3>
              <p className="text-xs uppercase tracking-wider text-gold mt-2">{pkg.hotel.category}</p>
              <p className="mt-5 text-ink/70 leading-relaxed max-w-xl">{pkg.hotel.description}</p>
            </div>

            {/* Activities */}
            <div className="mb-16">
              <span className="eyebrow">Signature activities</span>
              <h2 className="heading-section mt-3 mb-8 text-balance">Built in, not bolted on.</h2>
              <div className="flex flex-wrap gap-2">
                {pkg.activities.map((a) => (
                  <span key={a} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-cream text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="mb-16 grid md:grid-cols-2 gap-6">
              <div className="bg-cream rounded-3xl p-8 border border-ink/5">
                <div className="flex items-center gap-2 text-gold mb-4">
                  <Check className="h-5 w-5" />
                  <span className="eyebrow">What's included</span>
                </div>
                <ul className="space-y-3">
                  {pkg.inclusions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-ink/80">
                      <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-cream rounded-3xl p-8 border border-ink/5">
                <div className="flex items-center gap-2 text-ink/50 mb-4">
                  <XIcon className="h-5 w-5" />
                  <span className="eyebrow-ink">What's not included</span>
                </div>
                <ul className="space-y-3">
                  {pkg.exclusions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-ink/60">
                      <XIcon className="h-4 w-4 text-ink/30 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Testimonials */}
            <div>
              <span className="eyebrow">From travelers who've been</span>
              <h2 className="heading-section mt-3 mb-8 text-balance">
                You'll be in
                <span className="italic text-gold font-light"> excellent company.</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {testimonials.slice(0, 2).map((t, i) => (
                  <TestimonialCard key={i} testimonial={t} index={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Sticky sidebar */}
          <aside className="lg:sticky lg:top-28 bg-white rounded-3xl p-7 border border-ink/5 shadow-soft-lg">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-ink/50">From</span>
              {pkg.limitedSlots && (
                <span className="text-[10px] uppercase tracking-wider text-gold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                  Limited Slots
                </span>
              )}
            </div>
            <p className="font-display text-5xl font-medium text-ink leading-none">
              ₹{pkg.price.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-ink/50 mt-1">per person, ex. flights</p>

            <div className="mt-6 pt-6 border-t border-ink/10 space-y-3 text-sm">
              <SidebarRow label="Duration" value={pkg.duration} />
              <SidebarRow label="Travelers" value={pkg.travelType} />
              <SidebarRow label="Rating" value={`${pkg.rating} / 5 · ${pkg.reviews} reviews`} />
              <SidebarRow label="Destination" value={pkg.destinationName} />
            </div>

            <div className="mt-6 space-y-2.5">
              <a
                href={`https://wa.me/918115999588?text=${encodeURIComponent(`Hi Trust and Trip! 🙏\n\nI'd like to book the *${pkg.title}* package (₹${pkg.price.toLocaleString("en-IN")}/person · ${pkg.duration}).\n\nPlease help me proceed.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full justify-center"
              >
                Book This Journey
              </a>
              <Link href={`/customize-trip`} className="btn-outline w-full justify-center">
                Customize
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-ink/10 flex items-start gap-2.5 text-xs text-ink/60">
              <ShieldCheck className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <p>
                <span className="font-medium text-ink">Free cancellation</span> up to 30 days before departure. No payment required to hold.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <CTASection
        title="Not quite what you had in mind?"
        subtitle="We'll swap, tweak, add, or rebuild this entirely — until it feels like yours."
        primaryLabel="Customize this trip"
      />

      {/* Mobile sticky enquiry bar */}
      <PackageEnquiryCTA
        packageTitle={pkg.title}
        price={pkg.price}
        duration={pkg.duration}
      />
    </>
  );
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink/50">{label}</span>
      <span className="text-ink font-medium text-right">{value}</span>
    </div>
  );
}
