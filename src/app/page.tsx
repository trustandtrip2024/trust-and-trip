export const revalidate = 30;

export const metadata = {
  title: "Trust and Trip — Trips that feel made just for you",
  description:
    "A real planner builds your itinerary in 24 hours. Free until you're sure. 4.9 on Google · 8,000+ travelers since 2019.",
  alternates: { canonical: "https://trustandtrip.com" },
};

import dynamic from "next/dynamic";
import HeroVideoSearch from "@/components/home/HeroVideoSearch";
import RecentlyCraftedSection from "@/components/home/RecentlyCraftedSection";
import ThreeStepsBand from "@/components/home/ThreeStepsBand";
import ByHowYouTravelSection from "@/components/home/ByHowYouTravelSection";
import PilgrimFeatureBand from "@/components/home/PilgrimFeatureBand";
import PackagesByDurationSection from "@/components/home/PackagesByDurationSection";
import DestinationsGrid from "@/components/home/DestinationsGrid";

import {
  getDestinations,
  getPilgrimPackages,
  getHomepageContent,
} from "@/lib/sanity-queries";

// Below-fold — chunk-split, still SSR'd for SEO; reserve height to avoid CLS.
const ReviewsRail            = dynamic(() => import("@/components/home/ReviewsRail"),            { loading: () => <div className="h-[560px]" /> });
const LoveFromTheGramStrip   = dynamic(() => import("@/components/home/LoveFromTheGramStrip"),   { loading: () => <div className="h-[480px]" /> });
const WhyTrustAndTripPillars = dynamic(() => import("@/components/home/WhyTrustAndTripPillars"), { loading: () => <div className="h-[520px]" /> });
const PressPartnersBand      = dynamic(() => import("@/components/home/PressPartnersBand"),      { loading: () => <div className="h-[420px]" /> });
const FinalCTABand           = dynamic(() => import("@/components/home/FinalCTABand"),           { loading: () => <div className="h-[420px]" /> });
const HomeNewsletter         = dynamic(() => import("@/components/home/HomeNewsletter"),         { loading: () => <div className="h-[360px]" /> });
const SeoFooterIndex         = dynamic(() => import("@/components/home/SeoFooterIndex"),         { loading: () => <div className="h-[640px]" /> });
const SacredJourneys         = dynamic(() => import("@/components/homepage-v2/SacredJourneys"),  { loading: () => <div className="h-[600px]" /> });

export default async function HomePage() {
  const [destinations, pilgrimPackages, content] = await Promise.all([
    getDestinations(),
    getPilgrimPackages(),
    getHomepageContent(),
  ]);

  const c = content ?? {};

  return (
    <>
      <HeroVideoSearch
        eyebrow={c.hero?.eyebrow}
        titleStart={c.hero?.titleStart}
        titleItalic={c.hero?.titleItalic}
        lede={c.hero?.lede}
        searchPlaceholder={c.hero?.searchPlaceholder}
        ctaLabel={c.hero?.ctaLabel}
        trustStrip={c.hero?.trustStrip}
      />
      <RecentlyCraftedSection
        eyebrow={c.recentlyCrafted?.eyebrow}
        titleStart={c.recentlyCrafted?.titleStart}
        titleItalic={c.recentlyCrafted?.titleItalic}
        lede={c.recentlyCrafted?.lede}
      />
      <ThreeStepsBand
        eyebrow={c.threeSteps?.eyebrow}
        titleStart={c.threeSteps?.titleStart}
        titleItalic={c.threeSteps?.titleItalic}
        lede={c.threeSteps?.lede}
        closingLine={c.threeSteps?.closingLine}
        steps={c.threeSteps?.steps}
      />
      <ByHowYouTravelSection
        eyebrow={c.byHowYouTravel?.eyebrow}
        titleStart={c.byHowYouTravel?.titleStart}
        titleItalic={c.byHowYouTravel?.titleItalic}
        lede={c.byHowYouTravel?.lede}
      />
      <PilgrimFeatureBand
        eyebrow={c.pilgrimFeature?.eyebrow}
        titleStart={c.pilgrimFeature?.titleStart}
        titleItalic={c.pilgrimFeature?.titleItalic}
        lede={c.pilgrimFeature?.lede}
      />
      <PackagesByDurationSection
        eyebrow={c.packagesByDuration?.eyebrow}
        titleStart={c.packagesByDuration?.titleStart}
        titleItalic={c.packagesByDuration?.titleItalic}
        lede={c.packagesByDuration?.lede}
      />
      <DestinationsGrid
        destinations={destinations}
        eyebrow={c.destinations?.eyebrow}
        titleStart={c.destinations?.titleStart}
        titleItalic={c.destinations?.titleItalic}
        lede={c.destinations?.lede}
      />
      <ReviewsRail
        eyebrow={c.reviews?.eyebrow}
        titleStart={c.reviews?.titleStart}
        titleItalic={c.reviews?.titleItalic}
        lede={c.reviews?.lede}
      />
      <LoveFromTheGramStrip
        eyebrow={c.ugc?.eyebrow}
        titleStart={c.ugc?.titleStart}
        titleItalic={c.ugc?.titleItalic}
        lede={c.ugc?.lede}
      />
      <WhyTrustAndTripPillars
        eyebrow={c.pillars?.eyebrow}
        titleStart={c.pillars?.titleStart}
        titleItalic={c.pillars?.titleItalic}
        lede={c.pillars?.lede}
        closingLine={c.pillars?.closingLine}
        pillars={c.pillars?.pillars}
      />
      <PressPartnersBand
        eyebrow={c.press?.eyebrow}
        titleStart={c.press?.titleStart}
        titleItalic={c.press?.titleItalic}
        lede={c.press?.lede}
      />
      <SacredJourneys packages={pilgrimPackages} />
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
      />
      <SeoFooterIndex />
    </>
  );
}
