"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const HIDDEN_ON = ["/dashboard", "/login", "/creators/dashboard", "/admin", "/coming-soon"];

export default function ConditionalFooter() {
  const path = usePathname();
  if (HIDDEN_ON.some((p) => path.startsWith(p))) return null;
  if (/^\/packages\/[^/]+/.test(path)) return null;
  return <Footer />;
}
