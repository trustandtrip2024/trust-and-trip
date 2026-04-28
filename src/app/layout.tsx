import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { headers } from "next/headers";
import dynamic from "next/dynamic";

// Self-hosted via next/font — eliminates render-blocking Google Fonts
// <link> and ships only the latin subset.
//
// Typography system (2026-04): Fraunces + Inter. Two families, both
// variable. Fraunces (display, opsz+wght+SOFT axes) for editorial
// headlines and italic accents. Inter (body, wght axis) for everything
// else. No third family. No weight ≥ 700. Italic restricted to
// Fraunces headline accents in tat-orange.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});
import ConditionalNavbar from "@/components/ConditionalNavbar";
import MainWrapper from "@/components/MainWrapper";
import MobileBottomNav from "@/components/MobileBottomNav";
import JsonLd from "@/components/JsonLd";
import ScrollToTop from "@/components/ScrollToTop";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleTagManager from "@/components/GoogleTagManager";
import VercelAnalytics from "@/components/VercelAnalytics";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import ConditionalFooter from "@/components/ConditionalFooter";
import SearchProvider from "@/components/SearchProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import MetaPixel from "@/components/MetaPixel";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Lazy-load below-fold and interaction-triggered components — keeps initial JS lean.
const TripPlannerModal = dynamic(() => import("@/components/TripPlannerModal"), { ssr: false });
const ExitIntentPopup = dynamic(() => import("@/components/ExitIntentPopup"), { ssr: false });
const CompareBar = dynamic(() => import("@/components/CompareBar"), { ssr: false });
const AriaChatWidget = dynamic(() => import("@/components/AriaChatWidget"), { ssr: false });
const CookieBanner = dynamic(() => import("@/components/CookieBanner"), { ssr: false });
const FloatingWhatsApp = dynamic(() => import("@/components/FloatingWhatsApp"), { ssr: false });
const PWAInstallPrompt = dynamic(() => import("@/components/PWAInstallPrompt"), { ssr: false });
import { TripPlannerProvider } from "@/context/TripPlannerContext";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "../styles/globals.css";
import { cn } from "@/lib/utils";

// Inline, pre-hydration theme setter — prevents light/dark flash.
//
// Default theme is always LIGHT. Dark mode activates only when the user has
// explicitly chosen it via the ThemeToggle (stored in localStorage). We
// deliberately ignore prefers-color-scheme so first-time visitors land on
// the brand light palette.
const THEME_INIT_SCRIPT = `
try {
  if (localStorage.getItem('tt_theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
} catch (e) {}
`;

const BASE_URL = "https://trustandtrip.com";

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
  // Per-request nonce comes from middleware.ts → CSP header. Stamp it on
  // every <script> tag we emit so the strict-dynamic policy accepts them.
  const nonce = headers().get("x-nonce") ?? undefined;

  return (
    <html lang="en" className={cn(fraunces.variable, inter.variable, "font-sans")}>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* Expose nonce to client-side dynamic-script loaders (e.g. Razorpay
            in BookingDeposit). Reading from a <meta> is the standard pattern
            so we don't need to thread the nonce through every client tree. */}
        {nonce && <meta property="csp-nonce" content={nonce} />}
        {/* Preconnect to speed up third-party resources */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://lekxoexyebfvngllpeqx.supabase.co" />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2A2A2A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Trust and Trip" />
      </head>
      <body className="min-h-screen flex flex-col">
        <JsonLd nonce={nonce} data={[
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
          <GoogleAnalytics nonce={nonce} />
          <GoogleTagManager nonce={nonce} />
          <VercelAnalytics />
          <WebVitalsReporter />
          <MetaPixel nonce={nonce} />
          <ServiceWorkerRegister />
          <CookieBanner />
          <PWAInstallPrompt />
        </TripPlannerProvider>
        </AuthProvider>
        </CookieConsentProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
