import { Metadata } from "next";
import WishlistClient from "./WishlistClient";
import { getPackages } from "@/lib/sanity-queries";

export const metadata: Metadata = {
  title: "My Wishlist — Trust and Trip",
  description: "Your saved packages — ready to plan whenever you are.",
  robots: { index: false },
};

export default async function WishlistPage() {
  const packages = await getPackages();
  return <WishlistClient allPackages={packages} />;
}
