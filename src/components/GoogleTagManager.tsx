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

interface Props {
  /** Per-request CSP nonce. Threaded down from layout.tsx → middleware. */
  nonce?: string;
}

export default function GoogleTagManager({ nonce }: Props) {
  const { consent } = useCookieConsent();

  if (!GTM_ID || !consent?.analytics) return null;

  // The GTM loader uses the official nonce-aware variant: it copies the
  // nonce from any element with a `nonce` attribute onto the dynamically
  // created gtm.js <script>. Combined with our strict-dynamic CSP, this
  // lets GTM-loaded tags inherit trust without us listing them all.
  return (
    <>
      <Script
        id="gtm-init"
        strategy="afterInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;
            var n=d.querySelector('[nonce]');
            n&&j.setAttribute('nonce',n.nonce||n.getAttribute('nonce'));
            f.parentNode.insertBefore(j,f);
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
