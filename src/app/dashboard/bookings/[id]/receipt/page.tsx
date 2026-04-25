"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

interface Booking {
  id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
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
  status: string;
  created_at: string;
}

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const { user } = useUserStore();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const sess = await supabase.auth.getSession();
      const token = sess.data.session?.access_token;
      if (!token) return;
      const res = await fetch(`/api/user/bookings/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBooking(data.booking);
      }
      setLoading(false);
    }
    load();
  }, [user, params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-tat-charcoal/30" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-tat-charcoal/60">Receipt not found.</p>
      </div>
    );
  }

  const booked = new Date(booking.created_at);
  const travel = booking.travel_date ? new Date(booking.travel_date) : null;
  const totalPrice = booking.package_price * booking.num_travellers;
  const balance = totalPrice - booking.deposit_amount;
  const receiptNumber = `TT-${booked.getFullYear()}-${booking.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-tat-paper py-6 md:py-10 print:bg-white print:py-0">
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .receipt-page { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      {/* Toolbar — hidden on print */}
      <div className="no-print max-w-3xl mx-auto px-4 mb-5 flex items-center justify-between gap-3">
        <Link
          href={`/dashboard/bookings/${booking.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-tat-charcoal/65 hover:text-tat-charcoal"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to booking
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Receipt */}
      <div className="receipt-page max-w-3xl mx-auto bg-white rounded-2xl shadow-soft border border-tat-charcoal/6 p-8 md:p-12 print:p-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-tat-charcoal/10 pb-6 mb-8 flex-wrap gap-4">
          <div>
            <p className="font-display text-2xl font-medium text-tat-charcoal">Trust and Trip</p>
            <p className="text-xs text-tat-charcoal/50 mt-0.5">Experiences Pvt. Ltd.</p>
            <p className="text-[11px] text-tat-charcoal/45 mt-3 leading-relaxed">
              R-607, Amrapali Princely, Sector 71<br />
              Noida, UP 201301, India<br />
              +91 8115 999 588 · hello@trustandtrip.com
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-tat-charcoal/45 mb-1">Receipt</p>
            <p className="font-mono text-sm font-semibold text-tat-charcoal">{receiptNumber}</p>
            <p className="text-[11px] text-tat-charcoal/50 mt-2">
              {booked.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <span className={`inline-block mt-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
              booking.status === "verified" || booking.status === "paid"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {booking.status === "verified" ? "Paid" : booking.status}
            </span>
          </div>
        </div>

        {/* Guest */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tat-charcoal/45 mb-2">Billed to</p>
            <p className="text-sm font-medium text-tat-charcoal">{booking.customer_name}</p>
            <p className="text-xs text-tat-charcoal/60 mt-0.5">{booking.customer_email}</p>
            <p className="text-xs text-tat-charcoal/60">{booking.customer_phone}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tat-charcoal/45 mb-2">Trip</p>
            <p className="text-sm font-medium text-tat-charcoal leading-tight">{booking.package_title}</p>
            {travel && (
              <p className="text-xs text-tat-charcoal/60 mt-1">
                Departure: {travel.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
            <p className="text-xs text-tat-charcoal/60">{booking.num_travellers} {booking.num_travellers === 1 ? "traveller" : "travellers"}</p>
          </div>
        </div>

        {/* Line items */}
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b border-tat-charcoal/10">
              <th className="text-left pb-2 text-[10px] uppercase tracking-widest text-tat-charcoal/45 font-medium">Description</th>
              <th className="text-right pb-2 text-[10px] uppercase tracking-widest text-tat-charcoal/45 font-medium">Qty</th>
              <th className="text-right pb-2 text-[10px] uppercase tracking-widest text-tat-charcoal/45 font-medium">Rate</th>
              <th className="text-right pb-2 text-[10px] uppercase tracking-widest text-tat-charcoal/45 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-tat-charcoal/5">
              <td className="py-3">
                <p className="text-tat-charcoal font-medium">{booking.package_title}</p>
                <p className="text-[11px] text-tat-charcoal/50 mt-0.5">Package slug: {booking.package_slug}</p>
              </td>
              <td className="py-3 text-right text-tat-charcoal/70">{booking.num_travellers}</td>
              <td className="py-3 text-right text-tat-charcoal/70">₹{booking.package_price.toLocaleString("en-IN")}</td>
              <td className="py-3 text-right text-tat-charcoal font-medium">₹{totalPrice.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto max-w-xs space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-tat-charcoal/60">Package total</span>
            <span className="text-tat-charcoal font-medium">₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-tat-charcoal/60">Deposit received</span>
            <span className="text-green-700 font-medium">-₹{booking.deposit_amount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-tat-charcoal/15">
            <span className="text-tat-charcoal font-semibold">Balance due</span>
            <span className="font-display text-lg font-medium text-tat-charcoal">₹{balance.toLocaleString("en-IN")}</span>
          </div>
          <p className="text-[10px] text-tat-charcoal/45 pt-1">
            Balance payable 14 days before departure.
          </p>
        </div>

        {/* Payment info */}
        {booking.razorpay_payment_id && (
          <div className="mt-8 pt-6 border-t border-tat-charcoal/8 text-[11px] text-tat-charcoal/50 space-y-1">
            <p>Payment method: Razorpay (UPI / Card / Netbanking)</p>
            <p className="font-mono break-all">Payment ID: {booking.razorpay_payment_id}</p>
            {booking.razorpay_order_id && (
              <p className="font-mono break-all">Order ID: {booking.razorpay_order_id}</p>
            )}
          </div>
        )}

        {booking.special_requests && (
          <div className="mt-6 pt-6 border-t border-tat-charcoal/8">
            <p className="text-[10px] uppercase tracking-widest text-tat-charcoal/45 mb-1.5">Special requests</p>
            <p className="text-xs text-tat-charcoal/70 leading-relaxed">{booking.special_requests}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-tat-charcoal/8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tat-charcoal/45 mb-1">Thank you</p>
            <p className="text-sm text-tat-charcoal/75 max-w-md leading-relaxed">
              Questions? Reach us at hello@trustandtrip.com or +91 8115 999 588. This is a computer-generated receipt — no signature required.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-tat-charcoal/45 mb-1">Authorised by</p>
            <p className="font-display text-base text-tat-charcoal">Akash Mishra</p>
            <p className="text-[11px] text-tat-charcoal/50">Founder, Trust and Trip</p>
          </div>
        </div>
      </div>
    </div>
  );
}
