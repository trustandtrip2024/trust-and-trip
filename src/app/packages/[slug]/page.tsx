export const revalidate = 30;
export const dynamicParams = true;

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPackageBySlug, getAllPackageSlugs, getRelatedPackages, getUgcPostsForDestination } from "@/lib/sanity-queries";
import { getPackageStats } from "@/lib/package-stats";
import { getGalleryImages } from "@/lib/gallery-images";
import PackageItinerary from "@/components/PackageItinerary";
import PackageGallery from "@/components/PackageGallery";
import PackageSlider from "@/components/PackageSlider";
import PackageSectionNav from "@/components/PackageSectionNav";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";
import BookingAside from "@/components/BookingAside";
import JsonLd from "@/components/JsonLd";
import {
  Clock, Star, MapPin, Check, X as XIcon, ChevronRight,
  Hotel, Sparkles, Zap, Users, Flame,
} from "lucide-react";
import SharePackage from "@/components/SharePackage";
import PackagePixelEvent from "@/components/PackagePixelEvent";
import PackageStickyBar from "@/components/PackageStickyBar";
import PackageViewTracker from "@/components/PackageViewTracker";
import TourIncludesRibbon from "@/components/package-detail/TourIncludesRibbon";
import QuickActionRow from "@/components/package-detail/QuickActionRow";
import CallbackForm from "@/components/package-detail/CallbackForm";
import CancellationLadder from "@/components/package-detail/CancellationLadder";
import UpgradesTabs from "@/components/package-detail/UpgradesTabs";
import NeedToKnowGrid from "@/components/package-detail/NeedToKnowGrid";
import PackageWhyThis from "@/components/package-detail/PackageWhyThis";
import PackageVsAggregator from "@/components/package-detail/PackageVsAggregator";
import PackageHotels from "@/components/package-detail/PackageHotels";
import PackageFaqs from "@/components/package-detail/PackageFaqs";
import PackageVideo from "@/components/package-detail/PackageVideo";
import DeparturesGrid from "@/components/package-detail/DeparturesGrid";
import PriceBreakdown from "@/components/package-detail/PriceBreakdown";
import BestMonthsStrip from "@/components/package-detail/BestMonthsStrip";
import PackageQuickFacts from "@/components/package-detail/PackageQuickFacts";
import PackingList from "@/components/package-detail/PackingList";
import PackageGuestPhotos from "@/components/package-detail/PackageGuestPhotos";

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

  const [relatedPackages, stats, guestPhotos] = await Promise.all([
    getRelatedPackages(pkg.destinationSlug, pkg.slug, pkg.travelType).catch(() => []),
    getPackageStats(pkg.slug),
    getUgcPostsForDestination(pkg.destinationName).catch(() => []),
  ]);
  const galleryImages = getGalleryImages(pkg.destinationSlug, pkg.heroImage);

  const originalPrice = Math.round(pkg.price * 1.22);
  const discount = Math.round(((originalPrice - pkg.price) / originalPrice) * 100);
  // Real Supabase numbers (with a deterministic floor for brand-new
  // packages). Editor-supplied bookedThisMonth still wins when set so the
  // content team can override for marketing campaigns.
  const viewedCount = stats.viewedCount;
  const enquiredCount = pkg.bookedThisMonth ?? stats.enquiredCount;
  const hotelStars = pkg.hotel?.stars ?? 3;

  const waBook = `https://wa.me/${WA}?text=${encodeURIComponent(`Hi Trust and Trip! 🙏\n\nI'd like to book the *${pkg.title}* package (₹${pkg.price.toLocaleString("en-IN")}/person · ${pkg.duration}).\n\nPlease help me proceed.`)}`;

  return (
    <>
      <PackageViewTracker slug={pkg.slug} />
      <PackagePixelEvent
        title={pkg.title}
        price={pkg.price}
        slug={pkg.slug}
        category={pkg.travelType}
      />
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
      <section className="relative h-[55vh] min-h-[380px] w-full overflow-hidden bg-tat-charcoal">
        <Image src={pkg.heroImage} alt={pkg.title} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/95 via-tat-charcoal/40 to-tat-charcoal/20" />

        {/* Breadcrumb */}
        <div className="absolute top-20 md:top-24 inset-x-0 container-custom flex items-center gap-2 text-xs text-tat-paper/60 z-10">
          <Link href="/" className="hover:text-tat-gold">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/packages" className="hover:text-tat-gold">Packages</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/destinations/${pkg.destinationSlug}`} className="hover:text-tat-gold">{pkg.destinationName}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-tat-gold truncate max-w-[120px]">{pkg.title}</span>
        </div>

        {/* Hero content */}
        <div className="relative h-full flex items-end pb-8 md:pb-10 container-custom text-tat-paper z-10">
          <div className="max-w-3xl">
            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="inline-flex items-center gap-1.5 bg-tat-gold/20 border border-tat-gold/30 text-tat-gold text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                <MapPin className="h-3 w-3" />{pkg.destinationName}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-tat-paper/10 border border-tat-paper/20 text-tat-paper/80 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                <Clock className="h-3 w-3 text-tat-gold" />{pkg.duration}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-tat-paper/10 border border-tat-paper/20 text-tat-paper/80 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                <Users className="h-3 w-3 text-tat-gold" />{pkg.travelType}
              </span>
              {pkg.limitedSlots && (
                <span className="inline-flex items-center gap-1.5 bg-tat-orange/20 border border-tat-orange/40 text-tat-orange-soft text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                  <Zap className="h-3 w-3" />Limited Slots
                </span>
              )}
              {pkg.trending && (
                <span className="inline-flex items-center gap-1.5 bg-tat-paper/10 border border-tat-paper/20 text-tat-paper/80 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                  <Flame className="h-3 w-3 text-tat-gold" />Trending
                </span>
              )}
              {pkg.categories?.map((c) => (
                <Link
                  key={c}
                  href={`/packages?category=${encodeURIComponent(c)}`}
                  className="inline-flex items-center gap-1.5 bg-tat-paper/10 border border-tat-paper/20 text-tat-paper/80 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full hover:bg-tat-gold/30 hover:text-tat-paper transition-colors"
                >
                  {c}
                </Link>
              ))}
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-medium leading-tight text-balance text-tat-paper">
              {pkg.title}
            </h1>
            {/* Rating row */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(pkg.rating ?? 0) ? "fill-tat-gold text-tat-gold" : "text-tat-paper/30"}`} />
                ))}
                <span className="text-sm font-medium text-tat-paper ml-1">{pkg.rating}</span>
                <span className="text-tat-paper/50 text-xs">({pkg.reviews} reviews)</span>
              </div>
              <span className="text-tat-paper/40 text-xs">{viewedCount} people viewed this month</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section Nav ────────────────────────────────────────── */}
      <PackageSectionNav packageTitle={pkg.title} />

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="container-custom py-8 md:py-12 pb-24 lg:pb-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">

          {/* ── Left column ────────────────────────────────────── */}
          <div className="min-w-0 space-y-0">

            {/* Gallery */}
            <div className="mb-10">
              <PackageGallery images={galleryImages} title={pkg.title} />
            </div>

            {/* Why this package — 3-bullet elevator pitch + best-for tag */}
            <div className="mb-8">
              <PackageWhyThis bullets={pkg.whyThisPackage} bestFor={pkg.bestFor} />
            </div>

            {/* Tour includes ribbon + tour highlights — replaces the legacy
                inline badge row. */}
            <div className="mb-8">
              <TourIncludesRibbon highlights={pkg.highlights} inclusions={pkg.inclusions} />
            </div>

            {/* Quick facts — group size, difficulty, visa. Returns null
                when none of the Sanity fields are populated. */}
            <div className="mb-8">
              <PackageQuickFacts
                groupSize={pkg.groupSize}
                difficulty={pkg.difficulty}
                visaInfo={pkg.visaInfo}
                destinationName={pkg.destinationName}
                isInternational={pkg.categories?.includes("International")}
              />
            </div>

            {/* vs Aggregator — only renders when comparePrice is set in Sanity. */}
            {pkg.comparePrice && pkg.comparePrice > pkg.price && (
              <div className="mb-8">
                <PackageVsAggregator
                  ourPrice={pkg.price}
                  theirPrice={pkg.comparePrice}
                  packageTitle={pkg.title}
                />
              </div>
            )}

            {/* Quick actions — Send Itinerary / Download Brochure / Email Itinerary */}
            <div className="mb-10">
              <QuickActionRow
                packageTitle={pkg.title}
                packageSlug={pkg.slug}
                packagePrice={pkg.price}
                duration={pkg.duration}
              />
            </div>

            {/* OVERVIEW */}
            <section id="overview" className="mb-12 scroll-mt-32">
              <span className="eyebrow">Overview</span>
              <h2 className="heading-section mt-2 mb-5 text-balance">
                What makes this journey
                <span className="italic text-tat-gold font-light"> unforgettable.</span>
              </h2>
              <p className="text-tat-charcoal/70 leading-relaxed mb-8">{pkg.description}</p>

              {/* Highlights grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                {pkg.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 bg-tat-paper rounded-2xl p-4 border border-tat-charcoal/5">
                    <span className="shrink-0 h-6 w-6 rounded-full bg-tat-gold/20 text-tat-gold flex items-center justify-center mt-0.5">
                      <Sparkles className="h-3 w-3" />
                    </span>
                    <p className="text-sm text-tat-charcoal/80 leading-relaxed">{h}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ITINERARY */}
            <section id="itinerary" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <PackageItinerary
                days={pkg.itinerary.map((day, idx) => ({
                  day: day.day ?? idx + 1,
                  title: day.title,
                  description: day.description,
                  meals: day.meals,
                  highlights: day.images && day.images.length > 0
                    ? { value: "Photos from this day", images: day.images }
                    : undefined,
                }))}
              />
            </section>

            {/* INCLUSIONS */}
            <section id="inclusions" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <span className="eyebrow">Inclusions & Exclusions</span>
              <h2 className="heading-section mt-2 mb-6 text-balance">
                What's in — and
                <span className="italic text-tat-gold font-light"> what's not.</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-tat-paper rounded-2xl p-6 border border-tat-charcoal/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-full bg-tat-gold/15 flex items-center justify-center">
                      <Check className="h-4 w-4 text-tat-gold" />
                    </div>
                    <h3 className="font-medium text-tat-charcoal">What's included</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {pkg.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-tat-charcoal/70">
                        <Check className="h-4 w-4 text-tat-gold shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-tat-paper rounded-2xl p-6 border border-tat-charcoal/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-full bg-tat-charcoal/8 flex items-center justify-center">
                      <XIcon className="h-4 w-4 text-tat-charcoal/50" />
                    </div>
                    <h3 className="font-medium text-tat-charcoal/60">Not included</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {pkg.exclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-tat-charcoal/50">
                        <XIcon className="h-4 w-4 text-tat-charcoal/30 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* DEPARTURES — fixed batches with slot urgency. Renders only
                when Sanity has upcoming dates set. */}
            {pkg.departures && pkg.departures.length > 0 && (
              <DeparturesGrid
                departures={pkg.departures}
                packageTitle={pkg.title}
                packageSlug={pkg.slug}
                basePrice={pkg.price}
                waNumber={WA}
              />
            )}

            {/* PRICE BREAKDOWN — per-occupancy rates. Returns null when
                fewer than 2 fields populated. */}
            {pkg.priceBreakdown && (
              <PriceBreakdown breakdown={pkg.priceBreakdown} basePrice={pkg.price} />
            )}

            {/* HOTEL — multi-city array when set, single-hotel fallback. */}
            {pkg.hotels && pkg.hotels.length > 0 ? (
              <PackageHotels hotels={pkg.hotels} activities={pkg.activities} />
            ) : (
              <section id="hotel" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
                <span className="eyebrow">Where you&rsquo;ll stay</span>
                <h2 className="heading-section mt-2 mb-6 text-balance">
                  Comfort you&rsquo;ll
                  <span className="italic text-tat-gold font-light"> remember.</span>
                </h2>
                <div className="bg-tat-cream/40 rounded-2xl p-6 md:p-8 flex items-start gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-tat-gold/15 flex items-center justify-center shrink-0">
                    <Hotel className="h-7 w-7 text-tat-gold" />
                  </div>
                  <div>
                    <h3 className="font-display text-h2 font-medium">{pkg.hotel.name}</h3>
                    <div className="flex items-center gap-1 mt-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < hotelStars ? "fill-tat-gold text-tat-gold" : "text-tat-charcoal/15"}`} />
                      ))}
                      <span className="text-xs text-tat-charcoal/50 ml-1">{hotelStars}-star accommodation</span>
                    </div>
                    <p className="mt-3 text-tat-charcoal/70 leading-relaxed text-sm max-w-xl">{pkg.hotel.description}</p>
                  </div>
                </div>

                {/* Activities */}
                {pkg.activities.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-tat-charcoal/50 mb-3 font-medium">Signature activities</p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.activities.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tat-charcoal text-tat-paper text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-tat-gold" />{a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* VIDEO — only when Sanity has youtubeUrl set. */}
            {pkg.youtubeUrl && (
              <PackageVideo
                url={pkg.youtubeUrl}
                poster={pkg.heroImage}
                title={pkg.title}
              />
            )}

            {/* REVIEWS */}
            <section id="reviews" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <span className="eyebrow">Traveler Reviews</span>
                  <h2 className="heading-section mt-2 text-balance">
                    Travelers who've
                    <span className="italic text-tat-gold font-light"> been there.</span>
                  </h2>
                </div>
              </div>
              <ReviewsList packageSlug={pkg.slug} initialRating={pkg.rating} />
              <div className="mt-6">
                <ReviewForm packageSlug={pkg.slug} packageTitle={pkg.title} />
              </div>
            </section>

            {/* GUEST PHOTOS — Sanity UGC filtered by destination match. */}
            <PackageGuestPhotos posts={guestPhotos} destinationName={pkg.destinationName} />

            {/* CALLBACK FORM */}
            <section className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <CallbackForm packageTitle={pkg.title} packageSlug={pkg.slug} />
            </section>

            {/* UPGRADES AVAILABLE */}
            <section className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <UpgradesTabs />
            </section>

            {/* CANCELLATION POLICY & PAYMENT TERMS */}
            <section className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <CancellationLadder price={pkg.price} />
            </section>

            {/* FAQS — Sanity-driven, FAQPage JSON-LD inside the component. */}
            <PackageFaqs
              faqs={pkg.faqs ?? []}
              pageUrl={`https://trustandtrip.com/packages/${pkg.slug}`}
            />

            {/* BEST MONTHS — 12-tile climate strip. Null when not set. */}
            {pkg.bestMonths && pkg.bestMonths.length > 0 && (
              <BestMonthsStrip months={pkg.bestMonths} destinationName={pkg.destinationName} />
            )}

            {/* PACKING LIST — collapsible categories. Null when not set. */}
            {pkg.packingList && pkg.packingList.length > 0 && (
              <PackingList list={pkg.packingList} />
            )}

            {/* NEED TO KNOW */}
            <section className="mb-4 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <NeedToKnowGrid destinationName={pkg.destinationName} />
            </section>
          </div>

          {/* ── Sticky Sidebar ─────────────────────────────────── */}
          <BookingAside
            title={pkg.title}
            slug={pkg.slug}
            price={pkg.price}
            originalPrice={originalPrice}
            duration={pkg.duration}
            travelType={pkg.travelType}
            rating={pkg.rating}
            reviews={pkg.reviews}
            destinationName={pkg.destinationName}
            viewedCount={viewedCount}
            enquiredCount={enquiredCount}
            waNumber={WA}
          />
        </div>
      </div>

      {/* ── You'll Also Like ───────────────────────────────────── */}
      {relatedPackages.length > 0 && (
        <section className="py-12 md:py-16 bg-tat-cream/30">
          <div className="container-custom">
            <PackageSlider
              id="related-slider"
              eyebrow="You'll also like"
              heading={`More journeys from <span class="italic text-tat-gold font-light"> ${pkg.destinationName}.</span>`}
              packages={relatedPackages}
              viewAllHref={`/destinations/${pkg.destinationSlug}`}
              viewAllLabel={`All ${pkg.destinationName}`}
            />
          </div>
        </section>
      )}

      {/* Sticky mobile bottom bar */}
      <PackageStickyBar
        price={pkg.price}
        title={pkg.title}
        slug={pkg.slug}
        duration={pkg.duration}
        originalPrice={originalPrice}
      />
    </>
  );
}
