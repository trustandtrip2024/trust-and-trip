export const revalidate = 30;
export const dynamicParams = true;

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDestinationBySlug, getAllDestinationSlugs, getPackagesByDestination } from "@/lib/sanity-queries";
import { DESTINATION_GALLERY } from "@/lib/gallery-images";
import DestinationGallery from "@/components/DestinationGallery";
import PackageSlider from "@/components/PackageSlider";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { Calendar, Clock, MapPin, ChevronRight, ArrowRight, Sun, IndianRupee, Users, Check } from "lucide-react";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  const slugs = await getAllDestinationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const d = await getDestinationBySlug(params.slug);
  if (!d) return {};
  return {
    title: `${d.name} Tour Packages — ${d.tagline}`,
    description: `Explore ${d.name}, ${d.country}. ${d.overview?.slice(0, 155)}…`,
    openGraph: {
      title: `${d.name} — ${d.tagline}`,
      description: d.overview?.slice(0, 200),
      images: [{ url: d.heroImage, width: 1200, height: 630, alt: d.name }],
    },
    alternates: { canonical: `https://trustandtrip.com/destinations/${d.slug}` },
  };
}

export default async function DestinationDetail({ params }: Props) {
  const destination = await getDestinationBySlug(params.slug);
  if (!destination) return notFound();

  const packages = await getPackagesByDestination(destination.slug);
  const gallery = DESTINATION_GALLERY[destination.slug] ?? [];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "TouristDestination",
        name: destination.name, description: destination.overview,
        url: `https://trustandtrip.com/destinations/${destination.slug}`,
        image: destination.heroImage,
        touristType: ["Couple", "Family", "Group", "Solo"],
        includesAttraction: (destination.thingsToDo || []).map((t) => ({ "@type": "TouristAttraction", name: t })),
      }} />

      {/* Hero */}
      <section className="relative h-[75vh] min-h-[500px] w-full overflow-hidden bg-ink">
        <Image src={destination.heroImage} alt={destination.name} fill priority className="object-cover animate-slow-zoom" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/30 to-ink/40" />

        <div className="absolute top-24 inset-x-0 z-10 container-custom flex items-center gap-2 text-xs text-cream/60">
          <Link href="/" className="hover:text-gold">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/destinations" className="hover:text-gold">Destinations</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gold">{destination.name}</span>
        </div>

        <div className="relative h-full flex items-end pb-12 md:pb-16 container-custom text-cream z-10">
          <div className="max-w-3xl">
            <span className="eyebrow text-gold mb-3 block">{destination.country} · {destination.region}</span>
            <h1 className="font-display text-display-xl font-medium leading-[0.95] text-balance">
              {destination.name}
            </h1>
            <p className="mt-3 text-xl italic font-display text-gold font-light">{destination.tagline}</p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Pill icon={IndianRupee} label={`From ₹${destination.priceFrom.toLocaleString("en-IN")}`} />
              <Pill icon={Calendar} label={destination.bestTimeToVisit || "Year-round"} />
              <Pill icon={Clock} label={destination.idealDuration || "5–7 days"} />
              <Pill icon={Users} label="Couples · Families · Groups" />
            </div>
          </div>
        </div>
      </section>

      {/* Photo gallery strip — clickable with lightbox */}
      {gallery.length > 0 && (
        <DestinationGallery images={gallery} name={destination.name} />
      )}

      {/* Overview + quick facts */}
      <section className="py-14 md:py-18">
        <div className="container-custom grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-16 items-start">
          <div>
            <span className="eyebrow">About {destination.name}</span>
            <h2 className="heading-section mt-3 mb-5 text-balance">
              The soul of <span className="italic text-gold font-light">{destination.name}.</span>
            </h2>
            <p className="text-ink/70 leading-relaxed mb-6">{destination.overview}</p>

            {/* Highlight tags */}
            <div className="flex flex-wrap gap-2">
              {(destination.highlights || []).map((h) => (
                <span key={h} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-ink/80">
                  <Check className="h-3 w-3 text-gold" />{h}
                </span>
              ))}
            </div>
          </div>

          {/* Quick facts card */}
          <div className="bg-cream rounded-2xl border border-ink/8 p-6 space-y-4">
            <h3 className="font-display text-lg font-medium">Quick facts</h3>
            {[
              { icon: IndianRupee, label: "Starting price", value: `₹${destination.priceFrom.toLocaleString("en-IN")} / person` },
              { icon: Calendar, label: "Best time to visit", value: destination.bestTimeToVisit || "Year-round" },
              { icon: Clock, label: "Ideal duration", value: destination.idealDuration || "5–7 days" },
              { icon: MapPin, label: "Region", value: `${destination.country} · ${destination.region}` },
              { icon: Sun, label: "Best for", value: "Couples, Families, Groups" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 py-3 border-b border-ink/6 last:border-0 last:pb-0">
                <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-ink/40 font-medium">{label}</p>
                  <p className="text-sm font-medium text-ink mt-0.5">{value}</p>
                </div>
              </div>
            ))}

            <Link href={`/packages?destination=${destination.slug}`}
              className="flex items-center justify-center gap-2 w-full bg-ink text-cream py-3 rounded-xl text-sm font-medium hover:bg-gold hover:text-ink transition-colors mt-2">
              View all packages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Things to do */}
      {(destination.thingsToDo || []).length > 0 && (
        <section className="py-14 bg-sand/40">
          <div className="container-custom">
            <span className="eyebrow">Experiences</span>
            <h2 className="heading-section mt-2 mb-8 text-balance">
              Moments to collect in
              <span className="italic text-gold font-light"> {destination.name}.</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(destination.thingsToDo || []).map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 flex items-start gap-4 border border-ink/5">
                  <span className="shrink-0 h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-sm font-display text-gold font-medium">
                    {i + 1}
                  </span>
                  <p className="text-ink/80 leading-relaxed text-sm">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Packages slider */}
      {packages.length > 0 && (
        <section className="py-14 md:py-16">
          <div className="container-custom">
            <PackageSlider
              id={`dest-${destination.slug}`}
              eyebrow="Curated journeys"
              heading={`Packages built for <span class="italic text-gold font-light">${destination.name}.</span>`}
              packages={packages}
              viewAllHref={`/packages?destination=${destination.slug}`}
              viewAllLabel="All packages"
            />
          </div>
        </section>
      )}

      <CTASection
        title={`Dreaming of ${destination.name}?`}
        subtitle="Talk to a planner who knows this destination inside-out. We'll craft it just for you."
      />
    </>
  );
}

function Pill({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-cream/15 backdrop-blur-sm border border-cream/20 text-cream/80 text-[11px] px-3 py-1.5 rounded-full">
      <Icon className="h-3 w-3 text-gold" />{label}
    </span>
  );
}
