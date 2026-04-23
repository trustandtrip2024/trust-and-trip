"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

interface Booking {
  id: string;
  package_slug: string;
  package_title: string;
  package_price: number;
  deposit_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  travel_date: string | null;
  num_travellers: number;
  special_requests: string | null;
  status: "created" | "paid" | "verified" | "refunded" | "cancelled";
  created_at: string;
  razorpay_order_id: string | null;
}

const STATUS_CONFIG = {
  created: { label: "Pending Payment", icon: AlertCircle, color: "text-amber-600 bg-amber-50 border-amber-100" },
  paid: { label: "Payment Received", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
  verified: { label: "Confirmed", icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-100" },
  refunded: { label: "Refunded", icon: XCircle, color: "text-ink/60 bg-ink/5 border-ink/10" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-600 bg-red-50 border-red-100" },
};

export default function BookingsPage() {
  const { user } = useUserStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) { setLoading(false); return; }

      const res = await fetch("/api/user/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(data.bookings ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Dashboard</p>
        <h1 className="font-display text-2xl font-medium text-ink">My Bookings</h1>
        <p className="text-sm text-ink/50 mt-1">Your booking history and payment status.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-ink/30" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/8 p-10 text-center">
          <CalendarCheck className="h-10 w-10 text-ink/20 mx-auto mb-3" />
          <p className="font-medium text-ink">No bookings yet</p>
          <p className="text-sm text-ink/45 mt-1 mb-5">Your confirmed bookings will appear here.</p>
          <Link href="/packages" className="inline-flex items-center gap-2 bg-ink text-cream px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gold hover:text-ink transition-all">
            Browse packages <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.created;
            const Icon = cfg.icon;
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-ink/8 p-5 md:p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-medium text-ink leading-snug mt-1">{b.package_title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-ink/45 flex-wrap">
                      {b.travel_date && (
                        <span className="flex items-center gap-1.5">
                          <CalendarCheck className="h-3 w-3" />
                          {b.travel_date}
                        </span>
                      )}
                      <span>{b.num_travellers} traveller{b.num_travellers > 1 ? "s" : ""}</span>
                      <span>{new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    {b.special_requests && (
                      <p className="text-xs text-ink/40 mt-2 line-clamp-1">Notes: {b.special_requests}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-ink/40 mb-0.5">Deposit paid</p>
                    <p className="font-display text-lg font-medium text-ink">₹{b.deposit_amount.toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-ink/35 mt-0.5">of ₹{b.package_price.toLocaleString("en-IN")} total</p>
                    <Link
                      href={`/packages/${b.package_slug}`}
                      className="inline-flex items-center gap-1 text-[11px] text-ink/40 hover:text-gold transition-colors mt-2"
                    >
                      View package <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
