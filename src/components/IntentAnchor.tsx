"use client";

import { captureIntent } from "@/lib/capture-intent";
import type { AnchorHTMLAttributes } from "react";

type IntentSource =
  | "book_now_click"
  | "call_click"
  | "whatsapp_click"
  | "customize_click"
  | "enquire_click"
  | "schedule_call_click";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  intent: IntentSource;
  metadata?: {
    package_title?: string;
    package_slug?: string;
    destination?: string;
    travel_type?: string;
    note?: string;
  };
}

/**
 * Anchor that fires a Bitrix intent event before opening the link.
 * Use instead of <a> when you want to capture a click to /api/leads → Bitrix.
 *
 * Example:
 *   <IntentAnchor
 *     href="https://wa.me/918115999588"
 *     intent="whatsapp_click"
 *     metadata={{ note: "Contact page header" }}
 *     className="btn"
 *   >Chat with us</IntentAnchor>
 */
export default function IntentAnchor({
  intent, metadata, onClick, children, ...rest
}: Props) {
  const handle = (e: React.MouseEvent<HTMLAnchorElement>) => {
    captureIntent(intent, metadata ?? {});
    onClick?.(e);
  };
  return (
    <a {...rest} onClick={handle}>
      {children}
    </a>
  );
}
