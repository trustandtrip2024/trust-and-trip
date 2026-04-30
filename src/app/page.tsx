export const revalidate = 30;

export const metadata = {
  title: "Trust and Trip — Trips that feel made just for you",
  description:
    "A real planner builds your itinerary in 24 hours. Free until you're sure. 4.9 on Google · 8,000+ travelers since 2019.",
  alternates: { canonical: "https://trustandtrip.com" },
};

import dynamic from "next/dynamic";
import HeroSearchWizard from "@/components/home/HeroSearchWizard";
import HomeDealRibbon from "@/components/home/HomeDealRibbon";
import HomeStickySubnav from "@/components/home/HomeStickySubnav";
import TrustBadgeStrip from "@/components/home/TrustBadgeStrip";
import SmartDestinationGrid from "@/components/home/SmartDestinationGrid";
import RecentlyCraftedSection from "@/components/home/RecentlyCraftedSection";
import BrowseTabs, { type StyleId } from "@/components/home/BrowseTabs";
import PilgrimFeatureBand from "@/components/home/PilgrimFeatureBand";
import HomeFAQ from "@/components/home/HomeFAQ";
import HomeBlogTeaser from "@/components/home/HomeBlogTeaser";
import HowItWorks from "@/components/homepage-v2/HowItWorks";
import RailSkeleton from "@/components/home/RailSkeleton";
import type { PackageCardProps } from "@/components/ui/PackageCard";
import type { Package } from "@/lib/data";

import {
  getDestinations,
  getPilgrimPackages,
  getHomepageContent,
  getPackagesByType,
  getUgcPosts,
  getBlogPosts,
} from "@/lib/sanity-queries";
import { fetchGoogleReviews } from "@/lib/google-reviews";
import { getSiteStats } from "@/lib/site-stats";
import MobileQuizPill from "@/components/home/MobileQuizPill";

const ReviewsRail            = dynamic(() => import("@/components/home/ReviewsRail"),            { loading: () => <RailSkeleton aspect="square"   height={720} cards={4} /> });
const LoveFromTheGramStrip   = dynamic(() => import("@/components/home/LoveFromTheGramStrip"),   { loading: () => <RailSkeleton aspect="square"   height={640} cards={6} /> });
const WhyTrustAndTripPillars = dynamic(() => import("@/components/home/WhyTrustAndTripPillars"), { loading: () => <div className="h-[640px]" />                                  });
const HomeOfferDealsRail     = dynamic(() => import("@/components/home/HomeOfferDealsRail"),     { loading: () => <RailSkeleton aspect="portrait" height={800} cards={4} /> });
const FinalCTABand           = dynamic(() => import("@/components/home/FinalCTABand"),           { loading: () => <div className="h-[420px]" />                                  });
const SeoFooterIndex         = dynamic(() => import("@/components/home/SeoFooterIndex"),         { loading: () => <div className="h-[720px]" />                                  });
const LiveActivityTicker     = dynamic(() => import("@/components/home/LiveActivityTicker"),     { ssr: false });

function toCardProps(p: Package): PackageCardProps {
  return {
    image: p.image,
    title: p.title,
    href: `/packages/${p.slug}`,
    destination: p.destinationName,
    travelStyle: p.travelType,
    duration: p.duration,
    rating: p.rating,
    ratingCount: p.reviews,
    price: p.price,
    originalPrice: Math.round(p.price * 1.18),
    saveAmount: Math.round(p.price * 0.18),
    customizeHref: `/customize-trip?package=${p.slug}`,
    trending: p.trending,
    limitedSlots: p.limitedSlots,
  };
}

const ANCHOR_OFFSET = "scroll-mt-44 lg:scroll-mt-32";

export default async function HomePage() {
  const [
    destinations,
    pilgrimPackages,
    content,
    couple,
    family,
    solo,
    group,
    googleData,
    ugcPosts,
    blogPosts,
    siteStats,
  ] = await Promise.all([
    getDestinations(),
    getPilgrimPackages(),
    getHomepageContent(),
    getPackagesByType("Couple"),
    getPackagesByType("Family"),
    getPackagesByType("Solo"),
    getPackagesByType("Group"),
    fetchGoogleReviews(),
    getUgcPosts(),
    getBlogPosts().catch(() => []),
    getSiteStats(),
  ]);

  const c = content ?? {};

  const packagesByStyle: Partial<Record<StyleId, PackageCardProps[]>> = {
    Honeymoon: couple.map(toCardProps),
    Family:    family.map(toCardProps),
    Solo:      solo.map(toCardProps),
    Group:     group.map(toCardProps),
    Pilgrim:   pilgrimPackages.map(toCardProps),
  };

  return (
    <>
      <HomeDealRibbon />
      <HeroSearchWizard
        eyebrow={c.hero?.eyebrow}
        trustStrip={c.hero?.trustStrip ?? siteStats.trustStripLine}
      />
      <HomeStickySubnav />

      <TrustBadgeStrip
        totalTravelers={siteStats.totalTravelers}
        reviewCount={siteStats.googleReviewCount}
        rating={siteStats.googleRating}
      />

      {/* Section 1 — Trending + Visa-free smart grid */}
      <div className={ANCHOR_OFFSET}>
        <SmartDestinationGrid destinations={destinations} />
      </div>

      {/* Section 2 — Recent itineraries */}
      <div id="recent" className={ANCHOR_OFFSET}>
        <RecentlyCraftedSection
          eyebrow={c.recentlyCrafted?.eyebrow}
          titleStart={c.recentlyCrafted?.titleStart}
          titleItalic={c.recentlyCrafted?.titleItalic}
          lede={c.recentlyCrafted?.lede}
        />
      </div>

      {/* Section 3 — One offers section */}
      <div id="deals" className={ANCHOR_OFFSET}>
        <HomeOfferDealsRail />
      </div>

      {/* Section 4 — Browse by Style + Duration tabs */}
      <div className={ANCHOR_OFFSET}>
        <BrowseTabs
          eyebrow={c.byHowYouTravel?.eyebrow}
          titleStart={c.byHowYouTravel?.titleStart}
          titleItalic={c.byHowYouTravel?.titleItalic}
          packagesByStyle={packagesByStyle}
        />
      </div>

      {/* Editorial — Char Dham band sits between browse and trust beats */}
      <div id="pilgrim" className={ANCHOR_OFFSET}>
        <PilgrimFeatureBand
          eyebrow={c.pilgrimFeature?.eyebrow}
          titleStart={c.pilgrimFeature?.titleStart}
          titleItalic={c.pilgrimFeature?.titleItalic}
          yatras={pilgrimPackages.map(toCardProps)}
        />
      </div>

      <div id="why">
        <HowItWorks />
        <WhyTrustAndTripPillars
          eyebrow={c.pillars?.eyebrow}
          titleStart={c.pillars?.titleStart}
          titleItalic={c.pillars?.titleItalic}
          lede={c.pillars?.lede}
          closingLine={c.pillars?.closingLine}
          pillars={c.pillars?.pillars}
          tightTop
        />
      </div>

      <div id="reviews" className={ANCHOR_OFFSET}>
        <ReviewsRail
          eyebrow={c.reviews?.eyebrow}
          titleStart={c.reviews?.titleStart}
          titleItalic={c.reviews?.titleItalic}
          lede={c.reviews?.lede}
          googleData={googleData}
        />
        <LoveFromTheGramStrip
          eyebrow={c.ugc?.eyebrow}
          titleStart={c.ugc?.titleStart}
          titleItalic={c.ugc?.titleItalic}
          lede={c.ugc?.lede}
          posts={ugcPosts}
          tightTop
        />
      </div>

      <div id="guides" className={ANCHOR_OFFSET}>
        <HomeBlogTeaser posts={blogPosts} />
      </div>

      <div id="faq" className={ANCHOR_OFFSET}>
        <HomeFAQ />
      </div>

      <div id="plan" className={ANCHOR_OFFSET}>
        <FinalCTABand
          eyebrow={c.finalCta?.eyebrow}
          titleStart={c.finalCta?.titleStart}
          titleItalic={c.finalCta?.titleItalic}
          lede={c.finalCta?.lede}
          ctaLabel={c.finalCta?.ctaLabel}
          microcopy={c.finalCta?.microcopy}
        />
      </div>

      <SeoFooterIndex />
      <LiveActivityTicker />
      <MobileQuizPill />
    </>
  );
}
