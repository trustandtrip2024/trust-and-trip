"use client";

import { usePathname } from "next/navigation";

const NO_PADDING = ["/dashboard", "/login"];

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const clean = NO_PADDING.some((p) => path.startsWith(p));
  return (
    <main className={clean ? "flex-1" : "flex-1 pb-16 lg:pb-0"}>
      {children}
    </main>
  );
}
