"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GA_ID } from "@/lib/analytics";

export default function GoogleAnalytics() {
  const pathname = usePathname();

  // Track SPA navigation as page views
  useEffect(() => {
    if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
    window.gtag("config", GA_ID, { page_path: pathname });
  }, [pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
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
