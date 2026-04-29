import type { Metadata } from "next";
import { getPackagesByType } from "@/lib/sanity-queries";
import QuizClient from "./QuizClient";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Trip Finder Quiz — Trust and Trip",
  description: "4 questions, 60 seconds. We'll match you with the 3 trips most likely to feel right — from 200+ curated packages across 60+ destinations.",
  alternates: { canonical: "https://trustandtrip.com/quiz" },
  openGraph: {
    title: "What kind of trip suits you? — Trust and Trip",
    description: "4 questions. 60 seconds. Three matched packages.",
    images: [{ url: "/api/og?title=Find+the+trip+that+fits.&eyebrow=4+question+quiz&dest=60s", width: 1200, height: 630 }],
  },
};

export default async function QuizPage() {
  const [couple, family, solo, group] = await Promise.all([
    getPackagesByType("Couple"),
    getPackagesByType("Family"),
    getPackagesByType("Solo"),
    getPackagesByType("Group"),
  ]);

  // Pool shared with the client component; quiz scoring runs in the browser
  // so the user gets instant feedback without a round-trip per answer.
  const allPackages = [...couple, ...family, ...solo, ...group];

  return <QuizClient packages={allPackages} />;
}
