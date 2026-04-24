"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const HIDDEN_ON = ["/dashboard", "/login", "/creators/dashboard", "/admin"];

export default function ConditionalNavbar() {
  const path = usePathname();
  if (HIDDEN_ON.some((p) => path.startsWith(p))) return null;
  return <Navbar />;
}
