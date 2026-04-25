"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GA_ID } from "@/lib/analytics";
import { useCookieConsent } from "@/context/CookieConsentContext";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (!GA_ID || !consent?.analytics || typeof window === "undefined" || !window.gtag) return;
    window.gtag("config", GA_ID, { page_path: pathname });
  }, [pathname, consent]);

  if (!GA_ID || !consent?.analytics) return null;

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="ga4-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}
