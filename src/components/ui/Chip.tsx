import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  icon?: LucideIcon;
  children: ReactNode;
  active?: boolean;
  as?: "button" | "a";
  href?: string;
  onClick?: () => void;
  ariaSelected?: boolean;
  role?: string;
}

export default function Chip({
  icon: Icon, children, active = false, as = "button",
  href, onClick, ariaSelected, role,
}: Props) {
  const cls = `tt-chip ${active ? "tt-chip--active" : ""}`;
  if (as === "a" && href) {
    return (
      <Link href={href} className={cls} role={role} aria-selected={ariaSelected}>
        {Icon && <Icon />}
        <span>{children}</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls}
      role={role}
      aria-selected={ariaSelected}
      aria-pressed={role ? undefined : active}
    >
      {Icon && <Icon />}
      <span>{children}</span>
    </button>
  );
}
