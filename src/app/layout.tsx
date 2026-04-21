import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import MobileBottomNav from "@/components/MobileBottomNav";
import TripPlannerModal from "@/components/TripPlannerModal";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import JsonLd from "@/components/JsonLd";
import ScrollToTop from "@/components/ScrollToTop";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CompareBar from "@/components/CompareBar";
import ConditionalFooter from "@/components/ConditionalFooter";
import SearchProvider from "@/components/SearchProvider";
import AriaChatWidget from "@/components/AriaChatWidget";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { TripPlannerProvider } from "@/context/TripPlannerContext";
import "../styles/globals.css";

const BASE_URL = "https://trustandtrip.com";

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
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Trust and Trip — Travel Beyond Packages. Experience Trust.",
    template: "%s — Trust and Trip",
  },
  description:
    "Handcrafted travel packages across 60+ destinations. Honeymoons, family holidays, group tours and solo adventures — designed around you, not a template.",
  keywords: [
    "travel packages India",
    "honeymoon packages",
    "family tour packages",
    "international tour packages",
    "custom itinerary",
    "trust and trip",
    "Bali packages",
    "Maldives packages",
    "Kerala packages",
  ],
  authors: [{ name: "Trust and Trip", url: BASE_URL }],
  creator: "Trust and Trip",
  publisher: "Trust and Trip",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "Trust and Trip — Travel Beyond Packages",
    description: "Handcrafted travel packages across 60+ destinations. Honeymoons, family holidays, group tours.",
    url: BASE_URL,
    siteName: "Trust and Trip",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Trust and Trip — Travel Beyond Packages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trust_and_trip",
    creator: "@trust_and_trip",
    title: "Trust and Trip — Travel Beyond Packages",
    description: "Handcrafted travel packages across 60+ destinations.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <head>
        {/* Preconnect to speed up third-party resources */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://lekxoexyebfvngllpeqx.supabase.co" />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B1C2C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Trust&amp;Trip" />
      </head>
      <body className="min-h-screen flex flex-col bg-cream text-ink">
        <JsonLd data={[
          {
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            name: "Trust and Trip",
            url: BASE_URL,
            telephone: "+918115999588",
            email: "hello@trustandtrip.com",
            priceRange: "₹₹–₹₹₹₹",
            description: "Handcrafted travel packages across 60+ destinations for couples, families, groups and solo travelers.",
            address: {
              "@type": "PostalAddress",
              streetAddress: "R-607, Amrapali Princely, Noida Sector 71",
              addressLocality: "Noida",
              addressRegion: "Uttar Pradesh",
              postalCode: "201301",
              addressCountry: "IN",
            },
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              opens: "08:00",
              closes: "22:00",
            },
            sameAs: [
              "https://www.instagram.com/trust_and_trip",
              "https://www.facebook.com/trustandtrip",
              "https://www.linkedin.com/company/trust-and-trip",
              "https://x.com/trust_and_trip",
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Trust and Trip",
            url: BASE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${BASE_URL}/packages?destination={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          },
        ]} />
        <TripPlannerProvider>
          <Navbar />
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
          <ConditionalFooter />
          <FloatingWhatsApp />
          <MobileBottomNav />
          <TripPlannerModal />
          <ExitIntentPopup />
          <CompareBar />
          <SearchProvider />
          <AriaChatWidget />
          <ScrollToTop />
          <GoogleAnalytics />
          <ServiceWorkerRegister />
        </TripPlannerProvider>
      </body>
    </html>
  );
}
