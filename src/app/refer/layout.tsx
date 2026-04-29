// Server-rendered shell for the client-rendered /refer page. Holds metadata
// + JSON-LD so social shares and search engines see rich previews even
// though the page itself is "use client".

const SITE = "https://trustandtrip.com";
const OG_TITLE = "Refer & Earn ₹500 — Trust and Trip";
const OG_DESC =
  "Share Trust and Trip with friends. When they book, you both get ₹500 off — no limit on referrals.";

export const metadata = {
  title: "Refer & Earn ₹500",
  description: OG_DESC,
  alternates: { canonical: `${SITE}/refer` },
  openGraph: {
    type: "website",
    url: `${SITE}/refer`,
    title: OG_TITLE,
    description: OG_DESC,
    siteName: "Trust and Trip",
    images: [
      {
        url: `${SITE}/og/refer.jpg`,
        width: 1200,
        height: 630,
        alt: "Refer Trust and Trip — both save ₹500",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
    images: [`${SITE}/og/refer.jpg`],
  },
};

const referralProgramJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Trust and Trip Referral Program",
  serviceType: "Travel referral program",
  provider: {
    "@type": "TravelAgency",
    name: "Trust and Trip",
    url: SITE,
  },
  areaServed: { "@type": "Country", name: "India" },
  description: OG_DESC,
  url: `${SITE}/refer`,
  offers: {
    "@type": "Offer",
    name: "₹500 referral credit",
    description:
      "Both referrer and friend receive ₹500 off when the friend completes a booking.",
    price: 500,
    priceCurrency: "INR",
    eligibleCustomerType: "Existing and new travelers",
    availability: "https://schema.org/InStock",
  },
  potentialAction: {
    "@type": "JoinAction",
    target: `${SITE}/refer`,
    name: "Get your referral link",
  },
};

export default function ReferLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(referralProgramJsonLd) }}
      />
      {children}
    </>
  );
}
