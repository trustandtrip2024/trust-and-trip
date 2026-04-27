import Link from "next/link";
import { Users, Star, Gift, Sparkles, Wallet } from "lucide-react";

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-sm w-full px-4">
        <h1 className="text-2xl font-semibold text-tat-charcoal mb-1">Trust and Trip</h1>
        <p className="text-tat-slate mb-8 text-sm">Admin Dashboard</p>
        <div className="grid gap-3">
          <Link href="/admin/leads"
            className="flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            <Users className="h-4 w-4" />
            Leads & Enquiries
          </Link>
          <Link href="/admin/reviews"
            className="flex items-center gap-3 bg-white border border-gray-200 text-tat-charcoal px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Star className="h-4 w-4 text-yellow-500" />
            Reviews Moderation
          </Link>
          <Link href="/admin/referrals"
            className="flex items-center gap-3 bg-white border border-gray-200 text-tat-charcoal px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Gift className="h-4 w-4 text-tat-gold" />
            Referral Tracking
          </Link>
          <Link href="/admin/creators"
            className="flex items-center gap-3 bg-white border border-gray-200 text-tat-charcoal px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Creator Program
          </Link>
          <Link href="/admin/payouts"
            className="flex items-center gap-3 bg-white border border-gray-200 text-tat-charcoal px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Wallet className="h-4 w-4 text-emerald-500" />
            Creator Payouts
          </Link>
        </div>
      </div>
    </div>
  );
}
