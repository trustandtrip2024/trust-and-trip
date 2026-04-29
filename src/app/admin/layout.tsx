import Link from "next/link";
import { Home, Users, Star, Gift, Sparkles, Wallet, ShieldCheck } from "lucide-react";

const ADMIN_LINKS = [
  { href: "/admin/leads",     label: "Leads",     icon: Users },
  { href: "/admin/reviews",   label: "Reviews",   icon: Star },
  { href: "/admin/referrals", label: "Referrals", icon: Gift },
  { href: "/admin/creators",  label: "Creators",  icon: Sparkles },
  { href: "/admin/payouts",   label: "Payouts",   icon: Wallet },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-tat-paper">
      {/* Top bar — sticky, holds Home + section nav */}
      <header className="sticky top-0 z-30 bg-white border-b border-tat-charcoal/12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-tat-charcoal hover:text-tat-charcoal"
          >
            <Home className="h-4 w-4" />
            <span>Trust &amp; Trip</span>
            <span className="hidden sm:inline ml-1 text-[10px] uppercase tracking-widest text-tat-slate/70">
              Home
            </span>
          </Link>

          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold text-tat-slate hover:text-tat-charcoal"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-tat-slate/70" />
            Admin
          </Link>
        </div>

        {/* Sub-nav across admin sections */}
        <nav className="max-w-6xl mx-auto px-4 md:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar -mt-px border-t border-transparent">
          {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-tat-slate hover:text-tat-charcoal whitespace-nowrap"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
