"use client";

import { useScrollDirection } from "@/hooks/useScrollDirection";

interface Props {
  children: React.ReactNode;
  className?: string;
  topClass?: string;
  zClass?: string;
}

export default function StickyOnScrollUp({
  children,
  className = "",
  topClass = "top-16 lg:top-20",
  zClass = "z-30",
}: Props) {
  const { direction, atTop } = useScrollDirection();
  const visible = atTop || direction === "up";
  return (
    <div
      className={`sticky ${topClass} ${zClass} transition-transform duration-300 will-change-transform ${
        visible ? "translate-y-0" : "-translate-y-full"
      } ${className}`}
    >
      {children}
    </div>
  );
}
