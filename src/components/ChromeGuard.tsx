"use client";

import { usePathname } from "next/navigation";

const HIDDEN_ON = ["/coming-soon"];

/**
 * Hides chrome (floating overlays, popups, ad widgets, etc.) on routes
 * where the page should own the full viewport — coming-soon takeover,
 * future onboarding flows, etc. Wrap the offending overlay in this and
 * it disappears on the listed paths.
 */
export default function ChromeGuard({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (HIDDEN_ON.some((p) => path.startsWith(p))) return null;
  return <>{children}</>;
}
