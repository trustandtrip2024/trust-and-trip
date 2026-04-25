import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import MainWrapper from "@/components/MainWrapper";
import MobileBottomNav from "@/components/MobileBottomNav";
import JsonLd from "@/components/JsonLd";
import ScrollToTop from "@/components/ScrollToTop";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import VercelAnalytics from "@/components/VercelAnalytics";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import ConditionalFooter from "@/components/ConditionalFooter";
import SearchProvider from "@/components/SearchProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import MetaPixel from "@/components/MetaPixel";

// Lazy-load below-fold and interaction-triggered components — keeps initial JS lean.
const TripPlannerModal = dynamic(() => import("@/components/TripPlannerModal"), { ssr: false });
const ExitIntentPopup = dynamic(() => import("@/components/ExitIntentPopup"), { ssr: false });
const CompareBar = dynamic(() => import("@/components/CompareBar"), { ssr: false });
const AriaChatWidget = dynamic(() => import("@/components/AriaChatWidget"), { ssr: false });
const CookieBanner = dynamic(() => import("@/components/CookieBanner"), { ssr: false });
const FloatingWhatsApp = dynamic(() => import("@/components/FloatingWhatsApp"), { ssr: false });
import { TripPlannerProvider } from "@/context/TripPlannerContext";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "../styles/globals.css";

// Inline, pre-hydration theme setter — prevents light/dark flash.
const THEME_INIT_SCRIPT = `
try {
  var t = localStorage.getItem('tt_theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (t === 'dark' || (!t && prefersDark)) document.documentElement.classList.add('dark');
} catch (e) {}
`;

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
    default: "Trust and Trip – Crafting Reliable Travel",
    template: "%s | Trust and Trip",
  },
  description:
    "Trust and Trip crafts reliable, handpicked travel experiences across 60+ destinations. Honeymoons, family holidays, group tours and solo adventures — planned with trust, delivered with care.",
  keywords: [
    "trust and trip",
    "crafting reliable travel",
    "travel packages India",
    "honeymoon packages India",
    "family tour packages",
    "international tour packages",
    "custom itinerary India",
    "Bali tour packages from India",
    "Maldives packages India",
    "Kerala tour packages",
    "reliable travel agency India",
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
    title: "Trust and Trip – Crafting Reliable Travel",
    description: "Handpicked travel experiences across 60+ destinations. Honeymoons, family holidays, group tours — planned with trust, delivered with care.",
    url: BASE_URL,
    siteName: "Trust and Trip",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Trust and Trip – Crafting Reliable Travel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trust_and_trip",
    creator: "@trust_and_trip",
    title: "Trust and Trip – Crafting Reliable Travel",
    description: "Handpicked travel experiences across 60+ destinations — planned with trust, delivered with care.",
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
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* Preconnect to speed up third-party resources */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://lekxoexyebfvngllpeqx.supabase.co" />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B1C2C" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Trust and Trip" />
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
            description: "Trust and Trip crafts reliable travel experiences across 60+ destinations for couples, families, groups and solo travelers.",
            slogan: "Crafting Reliable Travel",
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
        <ThemeProvider>
        <CookieConsentProvider>
        <AuthProvider>
        <TripPlannerProvider>
          <ConditionalNavbar />
          <MainWrapper>{children}</MainWrapper>
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
          <VercelAnalytics />
          <WebVitalsReporter />
          <MetaPixel />
          <ServiceWorkerRegister />
          <CookieBanner />
        </TripPlannerProvider>
        </AuthProvider>
        </CookieConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
