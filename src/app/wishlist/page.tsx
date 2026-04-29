import { Metadata } from "next";
import WishlistClient from "./WishlistClient";
import { getPackages } from "@/lib/sanity-queries";

const SITE = "https://trustandtrip.com";
const TITLE = "My Wishlist — Trust and Trip";
const DESC = "Your saved packages — ready to plan whenever you are.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  // Personalized + per-device — keep out of search.
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE}/wishlist` },
  openGraph: {
    type: "website",
    url: `${SITE}/wishlist`,
    title: TITLE,
    description: DESC,
    siteName: "Trust and Trip",
    images: [{ url: `${SITE}/og/wishlist.jpg`, width: 1200, height: 630, alt: "Trust and Trip — Wishlist" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [`${SITE}/og/wishlist.jpg`],
  },
};

export default async function WishlistPage() {
  const packages = await getPackages();
  // Trending-first picks for the empty state — server-pruned so the
  // client doesn't render a card grid for a user who has nothing saved.
  const trendingPicks = [...packages]
    .sort((a, b) => Number(!!b.trending) - Number(!!a.trending) || (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 4);

  return <WishlistClient allPackages={packages} trendingPicks={trendingPicks} />;
}
