import { Metadata } from "next";
import TripBuilderClient from "./TripBuilderClient";
import { getPackages, getDestinations } from "@/lib/sanity-queries";

export const metadata: Metadata = {
  title: "Build Your Trip — Trust and Trip",
  description: "Step-by-step trip builder. Pick your destination, style, budget and dates — get matched experiences instantly.",
};

export default async function BuildTripPage() {
  const [packages, destinations] = await Promise.all([getPackages(), getDestinations()]);
  return <TripBuilderClient packages={packages} destinations={destinations} />;
}
