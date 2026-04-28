"use client";

import Script from "next/script";
import { useCookieConsent } from "@/context/CookieConsentContext";

// Google Tag Manager container loader.
//
// GTM is the orchestration layer for GA4, Google Ads conversions, and any
// 3rd-party tags configured in tagmanager.google.com. Loads only after
// "Accept all" cookie consent — both `gtm.js` (script) and the noscript
// pixel are conditional.
//
// Meta Pixel + CAPI stays in code (needs shared event_id for dedup).
//
// Set NEXT_PUBLIC_GTM_ID="GTM-P8288WM" on Vercel.

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

export default function GoogleTagManager() {
  const { consent } = useCookieConsent();

  if (!GTM_ID || !consent?.analytics) return null;

  return (
    <>
      <Script
        id="gtm-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
      {/* noscript fallback — wrapped in <noscript> so JS-disabled / robot
          visitors still produce a hit. */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
        }}
      />
    </>
  );
}
