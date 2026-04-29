"use client";

import { usePathname } from "next/navigation";

const NO_PADDING = ["/dashboard", "/login", "/creators/dashboard", "/admin"];

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const clean = NO_PADDING.some((p) => path.startsWith(p));
  return (
    <main id="main" className={clean ? "flex-1" : "flex-1 pb-[120px] md:pb-[96px] lg:pb-0"}>
      {children}
    </main>
  );
}
