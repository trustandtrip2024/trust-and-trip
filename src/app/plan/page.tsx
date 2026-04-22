import { Metadata } from "next";
import PlanClient from "./PlanClient";

export const metadata: Metadata = {
  title: "Get a Free Custom Itinerary — Trust and Trip",
  description: "Tell us where you want to go and we'll generate a personalised day-by-day itinerary for free. No sign-up required.",
  alternates: { canonical: "https://trustandtrip.com/plan" },
};

export default function PlanPage() {
  return <PlanClient />;
}
