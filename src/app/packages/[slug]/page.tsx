export const revalidate = 30;
export const dynamicParams = true;

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPackageBySlug, getAllPackageSlugs, getRelatedPackages } from "@/lib/sanity-queries";
import { getGalleryImages } from "@/lib/gallery-images";
import Accordion from "@/components/Accordion";
import PackageGallery from "@/components/PackageGallery";
import PackageSlider from "@/components/PackageSlider";
import PackageEnquiryCTA from "@/components/PackageEnquiryCTA";
import PackageSectionNav from "@/components/PackageSectionNav";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";
import BookingDeposit from "@/components/BookingDeposit";
import JsonLd from "@/components/JsonLd";
import Image2 from "next/image";
import {
  Clock, Star, MapPin, Check, X as XIcon, ChevronRight,
  Hotel, Sparkles, ShieldCheck, Zap, Users, ArrowRight,
  MessageCircle, Flame, IndianRupee, Info, Phone,
  Plane, Utensils, Car, Camera,
} from "lucide-react";
import SharePackage from "@/components/SharePackage";

interface Props { params: { slug: string } }

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
      title: p.title, description: p.description,
      images: [{ url: p.heroImage, width: 1200, height: 630, alt: p.title }],
    },
    twitter: { card: "summary_large_image", title: p.title, images: [p.heroImage] },
    alternates: { canonical: `https://trustandtrip.com/packages/${p.slug}` },
  };
}

const WA = "918115999588";

export default async function PackageDetail({ params }: Props) {
  const pkg = await getPackageBySlug(params.slug);
  if (!pkg) return notFound();

  const relatedPackages = await getRelatedPackages(pkg.destinationSlug, pkg.slug, pkg.travelType).catch(() => []);
  const galleryImages = getGalleryImages(pkg.destinationSlug, pkg.heroImage);

  const originalPrice = Math.round(pkg.price * 1.22);
  const discount = Math.round(((originalPrice - pkg.price) / originalPrice) * 100);
  const viewedCount = Math.max(20, (pkg.reviews * 3 + pkg.slug.length * 7) % 120 + 15);

  const waBook = `https://wa.me/${WA}?text=${encodeURIComponent(`Hi Trust and Trip! 🙏\n\nI'd like to book the *${pkg.title}* package (₹${pkg.price.toLocaleString("en-IN")}/person · ${pkg.duration}).\n\nPlease help me proceed.`)}`;

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Product",
        name: pkg.title, description: pkg.description, image: pkg.heroImage,
        brand: { "@type": "Brand", name: "Trust and Trip" },
        offers: {
          "@type": "Offer", url: `https://trustandtrip.com/packages/${pkg.slug}`,
          priceCurrency: "INR", price: pkg.price,
          availability: pkg.limitedSlots ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
          seller: { "@type": "TravelAgency", name: "Trust and Trip" },
        },
        ...(pkg.rating && {
          aggregateRating: {
            "@type": "AggregateRating", ratingValue: pkg.rating,
            reviewCount: pkg.reviews, bestRating: 5, worstRating: 1,
          },
        }),
      }} />

      {/* ── Compact Hero ───────────────────────────────────────── */}
      <section className="relative h-[55vh] min-h-[380px] w-full overflow-hidden bg-ink">
        <Image src={pkg.heroImage} alt={pkg.title} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-ink/20" />

        {/* Breadcrumb */}
        <div className="absolute top-20 md:top-24 inset-x-0 container-custom flex items-center gap-2 text-xs text-cream/60 z-10">
          <Link href="/" className="hover:text-gold">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/packages" className="hover:text-gold">Packages</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/destinations/${pkg.destinationSlug}`} className="hover:text-gold">{pkg.destinationName}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gold truncate max-w-[120px]">{pkg.title}</span>
        </div>

        {/* Hero content */}
        <div className="relative h-full flex items-end pb-8 md:pb-10 container-custom text-cream z-10">
          <div className="max-w-3xl">
            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="inline-flex items-center gap-1.5 bg-gold/20 border border-gold/30 text-gold text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                <MapPin className="h-3 w-3" />{pkg.destinationName}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-cream/10 border border-cream/20 text-cream/80 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                <Clock className="h-3 w-3 text-gold" />{pkg.duration}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-cream/10 border border-cream/20 text-cream/80 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                <Users className="h-3 w-3 text-gold" />{pkg.travelType}
              </span>
              {pkg.limitedSlots && (
                <span className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 text-red-300 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                  <Zap className="h-3 w-3" />Limited Slots
                </span>
              )}
              {pkg.trending && (
                <span className="inline-flex items-center gap-1.5 bg-cream/10 border border-cream/20 text-cream/80 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                  <Flame className="h-3 w-3 text-gold" />Trending
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-medium leading-tight text-balance text-cream">
              {pkg.title}
            </h1>
            {/* Rating row */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(pkg.rating ?? 0) ? "fill-gold text-gold" : "text-cream/30"}`} />
                ))}
                <span className="text-sm font-medium text-cream ml-1">{pkg.rating}</span>
                <span className="text-cream/50 text-xs">({pkg.reviews} reviews)</span>
              </div>
              <span className="text-cream/40 text-xs">{viewedCount} people viewed this month</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section Nav ────────────────────────────────────────── */}
      <PackageSectionNav />

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="container-custom py-8 md:py-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">

          {/* ── Left column ────────────────────────────────────── */}
          <div className="min-w-0 space-y-0">

            {/* Gallery */}
            <div className="mb-10">
              <PackageGallery images={galleryImages} title={pkg.title} />
            </div>

            {/* What's included badges */}
            <div className="flex flex-wrap gap-2 mb-10 pb-10 border-b border-ink/8">
              {[
                { icon: Car, label: "Transfers" },
                { icon: Hotel, label: "Stay" },
                { icon: Utensils, label: "Breakfast" },
                { icon: Camera, label: "Sightseeing" },
                { icon: Plane, label: "No Flights" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-gold/8 border border-gold/20 text-ink text-xs font-medium px-3 py-2 rounded-xl">
                  <Icon className="h-3.5 w-3.5 text-gold" />
                  {label} {label === "No Flights" ? "" : "Included"}
                </div>
              ))}
            </div>

            {/* OVERVIEW */}
            <section id="overview" className="mb-12 scroll-mt-32">
              <span className="eyebrow">Overview</span>
              <h2 className="heading-section mt-2 mb-5 text-balance">
                What makes this journey
                <span className="italic text-gold font-light"> unforgettable.</span>
              </h2>
              <p className="text-ink/70 leading-relaxed mb-8">{pkg.description}</p>

              {/* Highlights grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                {pkg.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 bg-cream rounded-2xl p-4 border border-ink/5">
                    <span className="shrink-0 h-6 w-6 rounded-full bg-gold/20 text-gold flex items-center justify-center mt-0.5">
                      <Sparkles className="h-3 w-3" />
                    </span>
                    <p className="text-sm text-ink/80 leading-relaxed">{h}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ITINERARY */}
            <section id="itinerary" className="mb-12 scroll-mt-32 pt-10 border-t border-ink/8">
              <span className="eyebrow">Day-by-day Itinerary</span>
              <h2 className="heading-section mt-2 mb-6 text-balance">
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
            </section>

            {/* INCLUSIONS */}
            <section id="inclusions" className="mb-12 scroll-mt-32 pt-10 border-t border-ink/8">
              <span className="eyebrow">Inclusions & Exclusions</span>
              <h2 className="heading-section mt-2 mb-6 text-balance">
                What's in — and
                <span className="italic text-gold font-light"> what's not.</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-cream rounded-2xl p-6 border border-ink/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-full bg-gold/15 flex items-center justify-center">
                      <Check className="h-4 w-4 text-gold" />
                    </div>
                    <h3 className="font-medium text-ink">What's included</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {pkg.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-ink/70">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-cream rounded-2xl p-6 border border-ink/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-full bg-ink/8 flex items-center justify-center">
                      <XIcon className="h-4 w-4 text-ink/50" />
                    </div>
                    <h3 className="font-medium text-ink/60">Not included</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {pkg.exclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-ink/50">
                        <XIcon className="h-4 w-4 text-ink/30 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* HOTEL */}
            <section id="hotel" className="mb-12 scroll-mt-32 pt-10 border-t border-ink/8">
              <span className="eyebrow">Where you'll stay</span>
              <h2 className="heading-section mt-2 mb-6 text-balance">
                Comfort you'll
                <span className="italic text-gold font-light"> remember.</span>
              </h2>
              <div className="bg-sand/40 rounded-2xl p-6 md:p-8 relative overflow-hidden flex items-start gap-5">
                <div className="h-14 w-14 rounded-2xl bg-gold/15 flex items-center justify-center shrink-0">
                  <Hotel className="h-7 w-7 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-medium">{pkg.hotel.name}</h3>
                  <p className="text-xs uppercase tracking-wider text-gold mt-1">{pkg.hotel.category}</p>
                  <p className="mt-3 text-ink/70 leading-relaxed text-sm max-w-xl">{pkg.hotel.description}</p>
                </div>
              </div>

              {/* Activities */}
              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/50 mb-3 font-medium">Signature activities</p>
                <div className="flex flex-wrap gap-2">
                  {pkg.activities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink text-cream text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" />{a}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* REVIEWS */}
            <section id="reviews" className="mb-12 scroll-mt-32 pt-10 border-t border-ink/8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <span className="eyebrow">Traveler Reviews</span>
                  <h2 className="heading-section mt-2 text-balance">
                    Travelers who've
                    <span className="italic text-gold font-light"> been there.</span>
                  </h2>
                </div>
              </div>
              <ReviewsList packageSlug={pkg.slug} initialRating={pkg.rating} />
              <div className="mt-6">
                <ReviewForm packageSlug={pkg.slug} packageTitle={pkg.title} />
              </div>
            </section>

            {/* KNOW BEFORE YOU GO */}
            <section className="mb-4 scroll-mt-32 pt-10 border-t border-ink/8">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-8 w-8 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                  <Info className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <span className="eyebrow">Know before you go</span>
                </div>
              </div>
              <div className="bg-sand/50 rounded-2xl p-5 space-y-3 border border-ink/5">
                {[
                  "Valid government-issued ID required for check-in at all hotels.",
                  "Package price is per person based on double/twin sharing occupancy.",
                  "International airfare is not included unless explicitly stated.",
                  "Room upgrades, mini-bar, and personal expenses are not covered.",
                  "Travel insurance is strongly recommended for all international packages.",
                  "Itinerary is subject to change due to weather or local conditions.",
                  "Visa assistance is available — contact your planner for guidance.",
                ].map((note, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-ink/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2 shrink-0" />
                    {note}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Sticky Sidebar ─────────────────────────────────── */}
          <aside className="lg:sticky lg:top-28 space-y-4">

            {/* Price card */}
            <div className="bg-white rounded-2xl p-6 border border-ink/8 shadow-soft-lg">
              {/* Discount badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-gold/15 text-gold text-xs font-semibold px-3 py-1 rounded-full">
                  {discount}% OFF
                </span>
                <div className="flex items-center gap-2">
                  {pkg.limitedSlots && (
                    <span className="flex items-center gap-1 bg-red-50 text-red-600 text-xs font-medium px-3 py-1 rounded-full">
                      <Zap className="h-3 w-3" /> Limited seats
                    </span>
                  )}
                  <SharePackage title={pkg.title} slug={pkg.slug} price={pkg.price} destination={pkg.destinationName} />
                </div>
              </div>

              {/* Price */}
              <div className="mb-1">
                <p className="text-xs text-ink/40 line-through">₹{originalPrice.toLocaleString("en-IN")}</p>
                <div className="flex items-end gap-2">
                  <p className="font-display text-4xl font-medium text-ink leading-none">
                    ₹{pkg.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-ink/50 mb-1">per person</p>
                </div>
                <p className="text-xs text-ink/40 mt-1">Excluding flights · Taxes included</p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 my-4 pt-4 border-t border-ink/6">
                <div className="text-center">
                  <p className="text-[10px] text-ink/40 uppercase tracking-wider">Duration</p>
                  <p className="text-xs font-semibold text-ink mt-0.5">{pkg.duration}</p>
                </div>
                <div className="text-center border-x border-ink/6">
                  <p className="text-[10px] text-ink/40 uppercase tracking-wider">Type</p>
                  <p className="text-xs font-semibold text-ink mt-0.5">{pkg.travelType}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-ink/40 uppercase tracking-wider">Rating</p>
                  <p className="text-xs font-semibold text-ink mt-0.5">{pkg.rating} ★</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5">
                <a href={waBook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold/90 text-ink font-semibold py-3.5 rounded-xl transition-colors text-sm">
                  <MessageCircle className="h-4 w-4" />
                  Book This Journey
                </a>
                <BookingDeposit
                  packageSlug={pkg.slug}
                  packageTitle={pkg.title}
                  packagePrice={pkg.price}
                />
                <Link href="/customize-trip"
                  className="flex items-center justify-center gap-2 w-full bg-ink/5 hover:bg-ink/10 text-ink font-medium py-3.5 rounded-xl transition-colors text-sm border border-ink/10">
                  <Sparkles className="h-4 w-4 text-gold" />
                  Customize This Trip
                </Link>
                <a href={`tel:+918115999588`}
                  className="flex items-center justify-center gap-2 w-full border border-ink/10 hover:border-ink/25 text-ink/60 hover:text-ink font-medium py-3 rounded-xl transition-colors text-sm">
                  <Phone className="h-4 w-4" />
                  Call a Planner
                </a>
              </div>

              {/* Social proof */}
              <p className="text-center text-[11px] text-ink/40 mt-3">
                {viewedCount} people viewed this week
              </p>
            </div>

            {/* Trust badges */}
            <div className="bg-cream rounded-2xl p-5 border border-ink/5 space-y-3">
              {[
                { icon: ShieldCheck, text: "Free cancellation up to 30 days prior" },
                { icon: IndianRupee, text: "No booking fee — pay only on confirmation" },
                { icon: Star, text: "Best price guarantee on all packages" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 text-xs text-ink/60">
                  <Icon className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  {text}
                </div>
              ))}
            </div>

            {/* Quick questions */}
            <div className="bg-cream rounded-2xl p-5 border border-ink/5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink/40 font-medium mb-3">Quick questions</p>
              <div className="flex flex-wrap gap-2">
                {["What's included?", "Can I customise?", "Check availability", "Best price?"].map((q) => (
                  <a key={q}
                    href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hi! Regarding *${pkg.title}* — ${q}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full border border-ink/12 text-ink/60 hover:border-[#25D366] hover:text-[#25D366] transition-colors">
                    <MessageCircle className="h-3 w-3" />{q}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── You'll Also Like ───────────────────────────────────── */}
      {relatedPackages.length > 0 && (
        <section className="py-12 md:py-16 bg-sand/30">
          <div className="container-custom">
            <PackageSlider
              id="related-slider"
              eyebrow="You'll also like"
              heading={`More journeys from <span class="italic text-gold font-light"> ${pkg.destinationName}.</span>`}
              packages={relatedPackages}
              viewAllHref={`/destinations/${pkg.destinationSlug}`}
              viewAllLabel={`All ${pkg.destinationName}`}
            />
          </div>
        </section>
      )}

      <PackageEnquiryCTA packageTitle={pkg.title} price={pkg.price} duration={pkg.duration} />
    </>
  );
}
