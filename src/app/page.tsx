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

// Below-fold — chunk-split, still SSR'd for SEO; reserve height to avoid CLS.
const ReviewsRail            = dynamic(() => import("@/components/home/ReviewsRail"),            { loading: () => <div className="h-[560px]" /> });
const LoveFromTheGramStrip   = dynamic(() => import("@/components/home/LoveFromTheGramStrip"),   { loading: () => <div className="h-[480px]" /> });
const WhyTrustAndTripPillars = dynamic(() => import("@/components/home/WhyTrustAndTripPillars"), { loading: () => <div className="h-[520px]" /> });
const PressPartnersBand      = dynamic(() => import("@/components/home/PressPartnersBand"),      { loading: () => <div className="h-[420px]" /> });
const FinalCTABand           = dynamic(() => import("@/components/home/FinalCTABand"),           { loading: () => <div className="h-[420px]" /> });
const HomeNewsletter         = dynamic(() => import("@/components/home/HomeNewsletter"),         { loading: () => <div className="h-[360px]" /> });
const SeoFooterIndex         = dynamic(() => import("@/components/home/SeoFooterIndex"),         { loading: () => <div className="h-[640px]" /> });

export default function HomePage() {
  return (
    <>
      <HeroVideoSearch />
      <RecentlyCraftedSection />
      <ThreeStepsBand />
      <ByHowYouTravelSection />
      <PilgrimFeatureBand />
      <PackagesByDurationSection />
      <DestinationsGrid />
      <ReviewsRail />
      <LoveFromTheGramStrip />
      <WhyTrustAndTripPillars />
      <PressPartnersBand />
      <FinalCTABand />
      <HomeNewsletter />
      <SeoFooterIndex />
    </>
  );
}
