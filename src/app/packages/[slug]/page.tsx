export const revalidate = 300;
export const dynamicParams = true;

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPackageBySlug, getPriorityPackageSlugs, getRelatedPackages, getUgcPostsForDestination, getDestinationBySlug } from "@/lib/sanity-queries";
import {
  fillPackageSeo,
  packageBreadcrumbLd,
  packageFaqLd,
  packageTouristTripLd,
  speakableLd,
  founderPersonLd,
  synthesiseBestMonths,
  synthesiseVisaInfo,
} from "@/lib/seo-package";
import { getPackageStats } from "@/lib/package-stats";
import PackageItinerary from "@/components/PackageItinerary";
import PackageSlider from "@/components/PackageSlider";
import PackageSectionNav from "@/components/PackageSectionNav";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";
import BookingAside from "@/components/BookingAside";
import JsonLd from "@/components/JsonLd";
import {
  Clock, Star, MapPin, Check, X as XIcon, ChevronRight,
  Hotel, Sparkles, Zap, Users, Flame, Plane, Heart,
} from "lucide-react";
import PackagePixelEvent from "@/components/PackagePixelEvent";
import PackageStickyBar from "@/components/PackageStickyBar";
import PackageViewTracker from "@/components/PackageViewTracker";
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
import PackageMap from "@/components/package-detail/PackageMap";
import PackageAriaPreload from "@/components/package-detail/PackageAriaPreload";
import PackageHeroTrustRibbon from "@/components/package-detail/PackageHeroTrustRibbon";
import PackageDecisionPrompts from "@/components/package-detail/PackageDecisionPrompts";
import PackageGuaranteeBanner from "@/components/package-detail/PackageGuaranteeBanner";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  // Cap build-time pre-rendering to top 30 priority slugs (trending +
  // featured, sorted by rating). Long-tail packages still render via
  // ISR on first hit thanks to `dynamicParams = true`. Keeps build
  // worker memory + duration sane as the catalogue grows.
  const slugs = await getPriorityPackageSlugs(30);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const p = await getPackageBySlug(params.slug);
  if (!p) return {};
  const dest = await getDestinationBySlug(p.destinationSlug).catch(() => null);
  const seo = fillPackageSeo(p, dest);
  return {
    title: `${p.title} — ${p.duration} · From ₹${p.price.toLocaleString("en-IN")}`,
    description: p.description,
    keywords: seo.keywords,
    authors: [{ name: "Akash Mishra", url: "https://trustandtrip.com/about" }],
    openGraph: {
      title: p.title,
      description: p.description,
      type: "website",
      url: `https://trustandtrip.com/packages/${p.slug}`,
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

  const [relatedPackages, stats, guestPhotos, dest] = await Promise.all([
    getRelatedPackages(pkg.destinationSlug, pkg.slug, pkg.travelType).catch(() => []),
    getPackageStats(pkg.slug),
    getUgcPostsForDestination(pkg.destinationName).catch(() => []),
    getDestinationBySlug(pkg.destinationSlug).catch(() => null),
  ]);

  // Server-side SEO/AEO/GEO fill — synthesises FAQs, whyThisPackage, and a
  // bestFor line whenever the Sanity record leaves them blank, so every
  // package page ships rich JSON-LD and crawlable answer copy.
  const seo = fillPackageSeo(pkg, dest);
  const bestMonths = synthesiseBestMonths(pkg, dest);
  const visaInfo = synthesiseVisaInfo(pkg, dest);
  // Real "vs OTA" reference price comes from Sanity comparePrice — only set
  // when the content team has verified savings against an aggregator. No
  // synthetic 22% markup so detail pages don't fake a discount on every
  // package.
  const originalPrice = pkg.comparePrice && pkg.comparePrice > pkg.price ? pkg.comparePrice : undefined;
  // Real Supabase numbers (with a deterministic floor for brand-new
  // packages). Editor-supplied bookedThisMonth still wins when set so the
  // content team can override for marketing campaigns.
  const viewedCount = stats.viewedCount;
  const enquiredCount = pkg.bookedThisMonth ?? stats.enquiredCount;
  const hotelStars = pkg.hotel?.stars ?? 3;

  // Soonest future fixed-departure batch — drives sticky-bar urgency.
  const nextDeparture = pkg.departures
    ?.filter((d) => {
      const t = new Date(d.date).getTime();
      return !Number.isNaN(t) && t > Date.now();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <>
      <PackageViewTracker slug={pkg.slug} />
      <PackageAriaPreload
        slug={pkg.slug}
        title={pkg.title}
        destinationName={pkg.destinationName}
        price={pkg.price}
        duration={pkg.duration}
        travelType={pkg.travelType}
        bestFor={pkg.bestFor}
      />
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
      <JsonLd data={packageTouristTripLd(pkg, dest)} />
      <JsonLd data={packageBreadcrumbLd(pkg)} />
      {/* FAQPage JSON-LD is emitted by <PackageFaqs/> below — single source
          of truth, avoids duplicate schemas confusing some crawlers. */}
      <JsonLd data={speakableLd(seo.speakableSelectors)} />
      <JsonLd data={founderPersonLd()} />

      {/* ── Compact Hero ───────────────────────────────────────── */}
      <section className="relative h-[55vh] min-h-[380px] w-full overflow-hidden bg-tat-charcoal">
        <Image src={pkg.heroImage} alt={pkg.title} fill priority fetchPriority="high" className="object-cover" sizes="100vw" quality={70} />
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
              {/* Source-city pickup — surfaced from ex-* tag. Tier-2/3 hint
                  Veena/PYT don't compete on. */}
              {(() => {
                const exTag = pkg.tags?.find((t) => t.startsWith("ex-"));
                if (!exTag) return null;
                const city = exTag.slice(3).replace(/-/g, " ");
                return (
                  <span className="inline-flex items-center gap-1.5 bg-tat-teal/15 border border-tat-teal/40 text-tat-paper text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                    <Plane className="h-3 w-3 text-tat-paper" />Pickup ex {city}
                  </span>
                );
              })()}
              {/* Best-for tag — direct quote from Sanity bestFor field. */}
              {pkg.bestFor && (
                <span className="inline-flex items-center gap-1.5 bg-tat-paper/10 border border-tat-paper/20 text-tat-paper/80 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                  <Heart className="h-3 w-3 text-tat-gold" />For {pkg.bestFor}
                </span>
              )}
              {/* Founder-signed for the Private tier — derived from category. */}
              {pkg.categories?.includes("Luxury") && (
                <span className="inline-flex items-center gap-1.5 bg-tat-gold/25 border border-tat-gold/50 text-tat-paper text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3 text-tat-gold" />Founder-signed
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

      {/* Trust ribbon beneath hero — rating · views · enquiries · ₹0 to
          start · 48 h free changes. Same pattern as destination detail. */}
      <PackageHeroTrustRibbon
        rating={pkg.rating}
        reviews={pkg.reviews}
        viewedCount={viewedCount}
        enquiredCount={enquiredCount}
      />

      {/* ── Section Nav ────────────────────────────────────────── */}
      <PackageSectionNav packageTitle={pkg.title} />

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="container-custom py-8 md:py-12 pb-24 lg:pb-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">

          {/* ── Left column ──────────────────────────────────────
              Section order follows the customer journey:
              Information → Visualization → Decision → Social proof →
              Action → Utility. Avoid stacking trust blocks ahead of
              the description; readers want to know what the trip IS
              before being told why it's good. */}
          <div className="min-w-0 space-y-0">

            {/* ┌─── INFORMATION ─────────────────────────────────┐ */}

            {/* Why this package — 3-bullet elevator pitch + best-for tag. */}
            <div id="package-summary" className="mb-8">
              <PackageWhyThis bullets={seo.whyThisPackage} bestFor={seo.bestFor} />
            </div>

            {/* Overview — narrative description + highlights grid.
                Highlights live here only (TourIncludesRibbon was the
                second copy and is gone). */}
            <section id="overview" className="mb-12 scroll-mt-32">
              <span className="eyebrow">Overview</span>
              <h2 className="heading-section mt-2 mb-5 text-balance">
                What makes this journey
                <span className="italic text-tat-gold font-light"> unforgettable.</span>
              </h2>
              <p className="text-tat-charcoal/70 leading-relaxed mb-8">{pkg.description}</p>
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

            {/* Quick facts — group size, difficulty, visa. */}
            <div className="mb-12">
              <PackageQuickFacts
                groupSize={pkg.groupSize}
                difficulty={pkg.difficulty}
                visaInfo={visaInfo}
                destinationName={pkg.destinationName}
                isInternational={pkg.categories?.includes("International")}
              />
            </div>

            {/* ┌─── VISUALIZATION ───────────────────────────────┐ */}

            {/* Itinerary — day-by-day. */}
            <section id="itinerary" className="mb-10 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <PackageItinerary
                packageTitle={pkg.title}
                destinationName={pkg.destinationName}
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

            {/* Quick actions — Send / Download / Email itinerary.
                Placed right after itinerary because that's when "share
                this with my partner" intent peaks. */}
            <div className="mb-12">
              <QuickActionRow
                packageTitle={pkg.title}
                packageSlug={pkg.slug}
                packagePrice={pkg.price}
                duration={pkg.duration}
              />
            </div>

            {/* Map — geography aids itinerary comprehension. */}
            <PackageMap
              coords={pkg.mapCoords}
              imageOverride={pkg.mapImage}
              destinationName={pkg.destinationName}
            />

            {/* Video — when Sanity has youtubeUrl set. */}
            {pkg.youtubeUrl && (
              <PackageVideo
                url={pkg.youtubeUrl}
                poster={pkg.heroImage}
                title={pkg.title}
              />
            )}

            {/* Hotels — multi-city array when set, single-hotel fallback.
                Hotels round out the visualization phase: itinerary +
                map + video + where-you-sleep. */}
            {pkg.hotels && pkg.hotels.length > 0 ? (
              <PackageHotels hotels={pkg.hotels} activities={pkg.activities} />
            ) : (
              <section id="hotel" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
                <span className="eyebrow">Where you&rsquo;ll stay</span>
                <h2 className="heading-section mt-2 mb-8 text-balance">
                  Comfort you&rsquo;ll
                  <span className="italic text-tat-gold font-light"> remember.</span>
                </h2>
                {/* Hotel — typographic, no card chrome. Hotel icon sits
                    inline as a quiet eyebrow next to the star rating. */}
                <div className="grid grid-cols-[auto_1fr] gap-5 items-start">
                  <Hotel className="h-7 w-7 text-tat-gold mt-1" aria-hidden />
                  <div>
                    <h3 className="font-display text-[22px] md:text-[26px] font-medium text-tat-charcoal leading-tight">
                      {pkg.hotel.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < hotelStars ? "fill-tat-gold text-tat-gold" : "text-tat-charcoal/15"}`} aria-hidden />
                      ))}
                      <span className="text-[12px] text-tat-charcoal/50 ml-1.5">{hotelStars}-star accommodation</span>
                    </div>
                    <p className="mt-4 text-tat-charcoal/75 leading-relaxed text-[14px] max-w-[60ch]">{pkg.hotel.description}</p>
                  </div>
                </div>
                {pkg.activities.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-tat-charcoal/8">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-tat-charcoal/50 mb-3 font-semibold">Signature activities</p>
                    <p className="text-[14px] text-tat-charcoal/85 leading-relaxed max-w-[62ch]">
                      {pkg.activities.map((a, i) => (
                        <span key={a}>
                          <span className="font-medium text-tat-charcoal">{a}</span>
                          {i < pkg.activities.length - 1 && <span className="text-tat-gold mx-2">·</span>}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* ┌─── DECISION ────────────────────────────────────┐ */}

            {/* vs Aggregator — only when comparePrice is set. Anchors
                price BEFORE the inclusions reveal so the savings feel
                earned, not artificial. */}
            {pkg.comparePrice && pkg.comparePrice > pkg.price && (
              <div className="mb-12">
                <PackageVsAggregator
                  ourPrice={pkg.price}
                  theirPrice={pkg.comparePrice}
                  packageTitle={pkg.title}
                />
              </div>
            )}

            {/* Inclusions / Exclusions — editorial spread, no boxed cards.
                Two-column typographic layout with a hairline divider, gold
                check bullets on the left, muted X bullets on the right. */}
            <section id="inclusions" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <span className="eyebrow">Inclusions & Exclusions</span>
              <h2 className="heading-section mt-2 mb-8 text-balance">
                What&rsquo;s in — and
                <span className="italic text-tat-gold font-light"> what&rsquo;s not.</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 md:divide-x md:divide-tat-charcoal/8">
                <div className="md:pr-10">
                  <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold mb-4 inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    Included
                  </p>
                  <ul className="space-y-2.5">
                    {pkg.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[14px] text-tat-charcoal/85 leading-relaxed">
                        <Check className="h-4 w-4 text-tat-gold shrink-0 mt-0.5" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:pl-10">
                  <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-charcoal/55 mb-4 inline-flex items-center gap-1.5">
                    <XIcon className="h-3.5 w-3.5" aria-hidden />
                    Not included
                  </p>
                  <ul className="space-y-2.5">
                    {pkg.exclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[14px] text-tat-charcoal/55 leading-relaxed">
                        <XIcon className="h-4 w-4 text-tat-charcoal/35 shrink-0 mt-0.5" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Departures — fixed batches with slot urgency. */}
            {pkg.departures && pkg.departures.length > 0 && (
              <DeparturesGrid
                departures={pkg.departures}
                packageTitle={pkg.title}
                packageSlug={pkg.slug}
                basePrice={pkg.price}
                waNumber={WA}
              />
            )}

            {/* Price breakdown — per-occupancy rates. */}
            {pkg.priceBreakdown && (
              <PriceBreakdown breakdown={pkg.priceBreakdown} basePrice={pkg.price} />
            )}

            {/* Cancellation ladder — clarifies risk right after pricing
                so the next thought ("what if I have to cancel?") gets
                answered before doubt compounds. */}
            <section className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <CancellationLadder price={pkg.price} />
            </section>

            {/* Guarantee banner — risk-reversal directly before social
                proof. Trust + reviews compound. */}
            <PackageGuaranteeBanner />

            {/* ┌─── SOCIAL PROOF ────────────────────────────────┐ */}

            {/* Reviews. */}
            <section id="reviews" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <span className="eyebrow">Traveler Reviews</span>
                  <h2 className="heading-section mt-2 text-balance">
                    Travelers who&rsquo;ve
                    <span className="italic text-tat-gold font-light"> been there.</span>
                  </h2>
                </div>
              </div>
              <ReviewsList packageSlug={pkg.slug} initialRating={pkg.rating} />
              <div className="mt-6">
                <ReviewForm packageSlug={pkg.slug} packageTitle={pkg.title} />
              </div>
            </section>

            {/* Guest photos — UGC filtered by destination. */}
            <PackageGuestPhotos posts={guestPhotos} destinationName={pkg.destinationName} />

            {/* Decision prompts — six high-intent shopper questions wired
                into Aria. Surfaces here, after social proof, when the
                visitor is closest to deciding but may still have one
                last objection to clear. */}
            <PackageDecisionPrompts
              destinationName={pkg.destinationName}
              packageTitle={pkg.title}
              travelType={pkg.travelType}
              bestMonthHint={bestMonths
                .filter((m) => m.tag === "peak" || !m.tag)
                .map((m) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m.month - 1])
                .filter(Boolean)[0]}
            />

            {/* ┌─── ACTION ──────────────────────────────────────┐ */}

            {/* Callback form — primary capture for fence-sitters who
                want a human voice before paying. */}
            <section className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <CallbackForm packageTitle={pkg.title} packageSlug={pkg.slug} />
            </section>

            {/* Upgrades — paid add-ons (private guide, hotel bumps). */}
            <section className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
              <UpgradesTabs />
            </section>

            {/* ┌─── UTILITY (post-decision detail) ──────────────┐ */}

            {/* FAQs — Sanity-driven when set, synthesised otherwise. */}
            <div id="package-faqs">
              <PackageFaqs
                faqs={seo.faqs}
                pageUrl={`https://trustandtrip.com/packages/${pkg.slug}`}
              />
            </div>

            {/* Best months strip. */}
            {bestMonths.length > 0 && (
              <BestMonthsStrip months={bestMonths} destinationName={pkg.destinationName} />
            )}

            {/* Packing list. */}
            {pkg.packingList && pkg.packingList.length > 0 && (
              <PackingList list={pkg.packingList} />
            )}

            {/* Need to know — destination-level practical advice. */}
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

      {/* Sticky mobile bottom bar — every promo claim backed by real
          Sanity / Supabase data. No synthetic discounts or hash-based
          ribbons. */}
      <PackageStickyBar
        price={pkg.price}
        title={pkg.title}
        slug={pkg.slug}
        duration={pkg.duration}
        originalPrice={originalPrice}
        limitedSlots={pkg.limitedSlots}
        enquiredCount={enquiredCount}
        nextDepartureDate={nextDeparture?.date}
        nextDepartureSlots={nextDeparture?.slotsLeft}
      />
    </>
  );
}
