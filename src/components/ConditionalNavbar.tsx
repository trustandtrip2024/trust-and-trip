"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const HIDDEN_ON = ["/dashboard", "/login", "/register", "/creators/dashboard", "/admin", "/coming-soon"];

export default function ConditionalNavbar() {
  const path = usePathname();
  if (HIDDEN_ON.some((p) => path.startsWith(p))) return null;
  return <Header />;
}
