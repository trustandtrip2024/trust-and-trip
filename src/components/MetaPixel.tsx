"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useCookieConsent } from "@/context/CookieConsentContext";

const PIXEL_ID = "1712300429671832";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

function MetaPixelInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  return null;
}

interface Props {
  /** Per-request CSP nonce. Threaded down from layout.tsx → middleware. */
  nonce?: string;
}

export default function MetaPixel({ nonce }: Props = {}) {
  const { consent } = useCookieConsent();

  if (!consent?.marketing) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="lazyOnload"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            ${nonce ? "t.nonce='" + nonce + "';" : ""}
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense>
        <MetaPixelInner />
      </Suspense>
    </>
  );
}

// ─── Event helpers — call these anywhere in the app ───────────────────────

/**
 * Fire a Pixel event. Pass `eventId` to de-dup against a server-side CAPI
 * call that uses the same id. Without dedup the same conversion is counted
 * twice and Meta's optimizer trains on inflated numbers.
 */
export function pixelTrack(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (typeof window !== "undefined" && window.fbq) {
    if (eventId) {
      window.fbq("track", event, params, { eventID: eventId });
    } else {
      window.fbq("track", event, params);
    }
  }
}

export const pixel = {
  lead: (value?: number, eventId?: string) =>
    pixelTrack("Lead", value ? { value, currency: "INR" } : undefined, eventId),

  initiateCheckout: (packageTitle: string, value: number, eventId?: string) =>
    pixelTrack("InitiateCheckout", { content_name: packageTitle, value, currency: "INR" }, eventId),

  purchase: (packageTitle: string, value: number, eventId?: string) =>
    pixelTrack("Purchase", { content_name: packageTitle, value, currency: "INR" }, eventId),

  viewContent: (packageTitle: string, value: number, eventId?: string) =>
    pixelTrack("ViewContent", { content_name: packageTitle, value, currency: "INR", content_type: "product" }, eventId),

  search: (query: string, eventId?: string) =>
    pixelTrack("Search", { search_string: query }, eventId),

  contact: (eventId?: string) =>
    pixelTrack("Contact", undefined, eventId),
};
