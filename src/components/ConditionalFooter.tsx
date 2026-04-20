"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const path = usePathname();
  // Hide footer on package detail pages
  if (/^\/packages\/[^/]+/.test(path)) return null;
  return <Footer />;
}
