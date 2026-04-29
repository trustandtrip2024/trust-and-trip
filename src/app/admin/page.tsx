import Link from "next/link";
import { Users, Star, Gift, Sparkles, Wallet } from "lucide-react";

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-tat-paper flex items-center justify-center">
      <div className="text-center max-w-sm w-full px-4">
        <h1 className="text-2xl font-semibold text-tat-charcoal mb-1">Trust and Trip</h1>
        <p className="text-tat-slate mb-8 text-sm">Admin Dashboard</p>
        <div className="grid gap-3">
          <Link href="/admin/leads"
            className="flex items-center gap-3 bg-tat-charcoal text-white px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-tat-charcoal/90 transition-colors">
            <Users className="h-4 w-4" />
            Leads & Enquiries
          </Link>
          <Link href="/admin/reviews"
            className="flex items-center gap-3 bg-white border border-tat-charcoal/12 text-tat-charcoal px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-tat-paper transition-colors">
            <Star className="h-4 w-4 text-tat-gold" />
            Reviews Moderation
          </Link>
          <Link href="/admin/referrals"
            className="flex items-center gap-3 bg-white border border-tat-charcoal/12 text-tat-charcoal px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-tat-paper transition-colors">
            <Gift className="h-4 w-4 text-tat-gold" />
            Referral Tracking
          </Link>
          <Link href="/admin/creators"
            className="flex items-center gap-3 bg-white border border-tat-charcoal/12 text-tat-charcoal px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-tat-paper transition-colors">
            <Sparkles className="h-4 w-4 text-tat-charcoal/60" />
            Creator Program
          </Link>
          <Link href="/admin/payouts"
            className="flex items-center gap-3 bg-white border border-tat-charcoal/12 text-tat-charcoal px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-tat-paper transition-colors">
            <Wallet className="h-4 w-4 text-tat-success-fg" />
            Creator Payouts
          </Link>
        </div>
      </div>
    </div>
  );
}
