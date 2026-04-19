import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import "../styles/globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Trust and Trip — Travel Beyond Packages. Experience Trust.",
  description:
    "Curated, handcrafted travel experiences across the world. Honeymoons, family vacations, and solo journeys designed around you — not a template.",
  keywords: ["travel", "luxury travel", "honeymoon packages", "custom itineraries", "trust and trip"],
  openGraph: {
    title: "Trust and Trip — Travel Beyond Packages",
    description: "Curated, handcrafted travel experiences across the world.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream text-ink">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
