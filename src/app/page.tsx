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
import HomeTopDestChips from "@/components/home/HomeTopDestChips";
import TrustBadgeStrip from "@/components/home/TrustBadgeStrip";
import RecentlyCraftedSection from "@/components/home/RecentlyCraftedSection";
import ByHowYouTravelSection, { type StyleId } from "@/components/home/ByHowYouTravelSection";
import PilgrimFeatureBand from "@/components/home/PilgrimFeatureBand";
import PackagesByDurationSection from "@/components/home/PackagesByDurationSection";
import VisaFreeDestinations from "@/components/home/VisaFreeDestinations";
import HomeFAQ from "@/components/home/HomeFAQ";
import HomeBlogTeaser from "@/components/home/HomeBlogTeaser";
import HomePlannerCard from "@/components/home/HomePlannerCard";
import HomeBrandReel from "@/components/home/HomeBrandReel";
import HowItWorks from "@/components/homepage-v2/HowItWorks";
import RailSkeleton from "@/components/home/RailSkeleton";
import type { PackageCardProps } from "@/components/ui/PackageCard";
import type { Package } from "@/lib/data";

import {
  getDestinations,
  getPilgrimPackages,
  getHomepageContent,
  getPackagesByType,
  getPartnerLogos,
  getFeaturedPressQuote,
  getUgcPosts,
  getBlogPosts,
  getOfferBanners,
} from "@/lib/sanity-queries";
import { fetchGoogleReviews } from "@/lib/google-reviews";
import { getSiteStats } from "@/lib/site-stats";
import { getGeoContext, getCityRecommendations } from "@/lib/geo";
import CityFavouritesStrip from "@/components/home/CityFavouritesStrip";
import MobileQuizPill from "@/components/home/MobileQuizPill";
import OfferBannerStrip from "@/components/home/OfferBannerStrip";

// Below-fold — chunk-split, still SSR'd for SEO. Skeletons reserve height
// AND signal loading so a slow CDN response doesn't read as a blank gap.
// Heights tuned to live render at desktop py-16 md:py-24 rhythm so swap-in
// doesn't trigger CLS.
const ReviewsRail            = dynamic(() => import("@/components/home/ReviewsRail"),            { loading: () => <RailSkeleton aspect="square"   height={720} cards={4} /> });
const LoveFromTheGramStrip   = dynamic(() => import("@/components/home/LoveFromTheGramStrip"),   { loading: () => <RailSkeleton aspect="square"   height={640} cards={6} /> });
const WhyTrustAndTripPillars = dynamic(() => import("@/components/home/WhyTrustAndTripPillars"), { loading: () => <div className="h-[640px]" />                                  });
const PressPartnersBand      = dynamic(() => import("@/components/home/PressPartnersBand"),      { loading: () => <div className="h-[360px]" />                                  });
const HomeOfferDealsRail     = dynamic(() => import("@/components/home/HomeOfferDealsRail"),     { loading: () => <RailSkeleton aspect="portrait" height={800} cards={4} /> });
const FinalCTABand           = dynamic(() => import("@/components/home/FinalCTABand"),           { loading: () => <div className="h-[420px]" />                                  });
const HomeNewsletter         = dynamic(() => import("@/components/home/HomeNewsletter"),         { loading: () => <div className="h-[360px]" />                                  });
const SeoFooterIndex         = dynamic(() => import("@/components/home/SeoFooterIndex"),         { loading: () => <div className="h-[720px]" />                                  });
const LiveActivityTicker     = dynamic(() => import("@/components/home/LiveActivityTicker"),     { ssr: false });

// Sanity Package -> PackageCardProps so card hrefs point at real pages.
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

// Used so that the anchored target sits below the sticky header + subnav.
const ANCHOR_OFFSET = "scroll-mt-32 md:scroll-mt-40";

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
    partnerLogos,
    pressQuote,
    ugcPosts,
    blogPosts,
    siteStats,
    offerBanners,
  ] = await Promise.all([
    getDestinations(),
    getPilgrimPackages(),
    getHomepageContent(),
    getPackagesByType("Couple"),
    getPackagesByType("Family"),
    getPackagesByType("Solo"),
    getPackagesByType("Group"),
    fetchGoogleReviews(),
    getPartnerLogos(),
    getFeaturedPressQuote(),
    getUgcPosts(),
    getBlogPosts().catch(() => []),
    getSiteStats(),
    getOfferBanners().catch(() => []),
  ]);

  const c = content ?? {};
  const geo = getGeoContext();
  const cityPrefix = geo.city ? ` · From ${geo.city}` : "";
  const trustStripWithCity = (c.hero?.trustStrip ?? siteStats.trustStripLine) + cityPrefix;
  const cityRec = getCityRecommendations(geo.city);

  // Map schema travelTypes onto the brief's 8 mood chips. Styles without a
  // direct schema flag (Adventure / Wellness / Luxury) render the
  // "we craft on request" CTA card from inside the section component.
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
        trustStrip={trustStripWithCity}
        heroImage={c.hero?.heroImage}
        videoMp4Url={c.hero?.videoMp4Url}
        videoUrl={c.hero?.videoUrl}
        videoPosterUrl={c.hero?.videoPosterUrl}
      />
      {/* MobileStickySearch removed — Header search modal already covers
          mobile re-engagement and the in-page subnav anchors are enough. */}
      <HomeStickySubnav />

      <TrustBadgeStrip
        totalTravelers={siteStats.totalTravelers}
        reviewCount={siteStats.googleReviewCount}
        rating={siteStats.googleRating}
      />

      {cityRec && (
        <CityFavouritesStrip city={cityRec.city} picks={cityRec.picks} />
      )}

      <div id="destinations" className={ANCHOR_OFFSET}>
        <HomeTopDestChips destinations={destinations} />
      </div>

      <OfferBannerStrip offers={offerBanners} />

      <RecentlyCraftedSection
        eyebrow={c.recentlyCrafted?.eyebrow}
        titleStart={c.recentlyCrafted?.titleStart}
        titleItalic={c.recentlyCrafted?.titleItalic}
        lede={c.recentlyCrafted?.lede}
      />

      <div id="deals" className={ANCHOR_OFFSET}>
        <HomeOfferDealsRail />
      </div>

      {/* Browse cluster — three "browse by X" sections share one anchor and
          a tight inter-section gap so they read as one editorial beat. */}
      <div id="browse" className={ANCHOR_OFFSET}>
        <div id="by-style">
          {/* Lede intentionally not forwarded — the chip group is its own
              affordance and a paragraph between title and chips dilutes
              the eyeline. Component default also leaves lede unset. */}
          <ByHowYouTravelSection
            eyebrow={c.byHowYouTravel?.eyebrow}
            titleStart={c.byHowYouTravel?.titleStart}
            titleItalic={c.byHowYouTravel?.titleItalic}
            packagesByStyle={packagesByStyle}
          />
        </div>
        <div id="by-duration">
          {/* Lede dropped — duration chips speak for themselves. */}
          <PackagesByDurationSection
            eyebrow={c.packagesByDuration?.eyebrow}
            titleStart={c.packagesByDuration?.titleStart}
            titleItalic={c.packagesByDuration?.titleItalic}
            tightTop
          />
        </div>
        <div id="pilgrim">
          {/* Lede dropped — component default uses the four Char Dham
              shrine names as a scannable subtitle. */}
          <PilgrimFeatureBand
            eyebrow={c.pilgrimFeature?.eyebrow}
            titleStart={c.pilgrimFeature?.titleStart}
            titleItalic={c.pilgrimFeature?.titleItalic}
            yatras={pilgrimPackages.map(toCardProps)}
            tightTop
          />
        </div>
      </div>

      <VisaFreeDestinations />

      {/* DestinationsGrid removed — HomeTopDestChips above already covers
          discovery; the full grid lives on /destinations and was duplicating
          a long photo grid mid-scroll. */}

      {/* WhyNotAggregators removed — WhyTrustAndTripPillars below covers the
          same trust pitch with better visual treatment, and HowItWorks fills
          the "why us" beat directly after. */}

      {/* Why-us cluster — process, founder, brand reel, pillars all read
          as one trust beat. tightTop on the followers tightens vertical
          gap so they don't read as four separate sections. */}
      <div id="why">
        <HowItWorks />
        <HomePlannerCard tripsPlanned={siteStats.totalTravelers} tightTop />
        <HomeBrandReel tightTop />
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

      <div id="press" className={ANCHOR_OFFSET}>
        <PressPartnersBand
          eyebrow={c.press?.eyebrow}
          titleStart={c.press?.titleStart}
          titleItalic={c.press?.titleItalic}
          lede={c.press?.lede}
          logos={partnerLogos}
          quote={pressQuote}
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
        <HomeNewsletter
          eyebrow={c.newsletter?.eyebrow}
          titleStart={c.newsletter?.titleStart}
          titleItalic={c.newsletter?.titleItalic}
          lede={c.newsletter?.lede}
          placeholder={c.newsletter?.placeholder}
          buttonLabel={c.newsletter?.buttonLabel}
          footerMicrocopy={c.newsletter?.footerMicrocopy}
          totalTravelers={siteStats.totalTravelers}
        />
      </div>

      <SeoFooterIndex />
      <LiveActivityTicker />
      <MobileQuizPill />
    </>
  );
}
