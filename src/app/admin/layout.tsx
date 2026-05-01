import Link from "next/link";
import {
  Home, ShieldCheck,
  CheckSquare, Users, ShoppingBag, Star, Activity,
  Map as MapIcon, BarChart3, Megaphone, Palette,
  Sparkles, Wallet, Gift,
} from "lucide-react";

const NAV_GROUPS: { label: string; items: { href: string; label: string; icon: typeof Home }[] }[] = [
  {
    label: "Ops",
    items: [
      { href: "/admin/daily",    label: "Daily",    icon: CheckSquare },
      { href: "/admin/health",   label: "Health",   icon: Activity },
      { href: "/admin/leads",    label: "Leads",    icon: Users },
      { href: "/admin/bookings", label: "Bookings", icon: ShoppingBag },
      { href: "/admin/reviews",  label: "Reviews",  icon: Star },
    ],
  },
  {
    label: "Direction",
    items: [
      { href: "/admin/roadmap",   label: "Roadmap",   icon: MapIcon },
      { href: "/admin/insights",  label: "Insights",  icon: BarChart3 },
      { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
      { href: "/admin/brand",     label: "Brand",     icon: Palette },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/creators",  label: "Creators",  icon: Sparkles },
      { href: "/admin/payouts",   label: "Payouts",   icon: Wallet },
      { href: "/admin/referrals", label: "Referrals", icon: Gift },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-tat-paper">
      <header className="sticky top-0 z-30 bg-white border-b border-tat-charcoal/12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-tat-charcoal hover:text-tat-charcoal">
            <Home className="h-4 w-4" />
            <span>Trust &amp; Trip</span>
            <span className="hidden sm:inline ml-1 text-[10px] uppercase tracking-widest text-tat-slate/70">Home</span>
          </Link>
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold text-tat-slate hover:text-tat-charcoal"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-tat-slate/70" />
            Admin home
          </Link>
        </div>

        <nav className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar -mt-px border-t border-transparent">
          {NAV_GROUPS.map((g) => (
            <div key={g.label} className="shrink-0 flex items-center gap-1 pr-4 mr-2 border-r border-tat-charcoal/8 last:border-r-0">
              <span className="text-[9px] uppercase tracking-[0.18em] font-semibold text-tat-slate/65 mr-1">
                {g.label}
              </span>
              {g.items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-tat-slate hover:text-tat-charcoal whitespace-nowrap"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
