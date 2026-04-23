"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle,
  Download, MessageCircle, Phone, Mail, MapPin, Users, Receipt, Loader2,
  CreditCard, ArrowRight,
} from "lucide-react";
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
  status: "created" | "paid" | "verified" | "refunded" | "cancelled";
  created_at: string;
  updated_at: string;
}

const STATUS_STEPS = [
  { key: "created", label: "Booking Created", icon: Receipt },
  { key: "paid", label: "Payment Received", icon: CreditCard },
  { key: "verified", label: "Confirmed", icon: CheckCircle2 },
] as const;

const STATUS_MAP: Record<Booking["status"], { label: string; badge: string; icon: typeof CheckCircle2 }> = {
  created: { label: "Pending Payment", badge: "text-amber-600 bg-amber-50 border-amber-100", icon: AlertCircle },
  paid: { label: "Payment Received", badge: "text-blue-600 bg-blue-50 border-blue-100", icon: Clock },
  verified: { label: "Confirmed", badge: "text-green-600 bg-green-50 border-green-100", icon: CheckCircle2 },
  refunded: { label: "Refunded", badge: "text-ink/60 bg-ink/5 border-ink/10", icon: XCircle },
  cancelled: { label: "Cancelled", badge: "text-red-600 bg-red-50 border-red-100", icon: XCircle },
};

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const { user } = useUserStore();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const sess = await supabase.auth.getSession();
        const token = sess.data.session?.access_token;
        if (!token) { setError("Session expired."); setLoading(false); return; }

        const res = await fetch(`/api/user/bookings/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) { setError("Booking not found."); setLoading(false); return; }
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setBooking(data.booking);
      } catch (err) {
        setError("Couldn't load this booking. Try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-ink/30" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div>
        <Link href="/dashboard/bookings" className="inline-flex items-center gap-1.5 text-sm text-ink/55 hover:text-ink mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
        </Link>
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
          <p className="font-medium text-ink">{error || "Booking not found"}</p>
        </div>
      </div>
    );
  }

  const cfg = STATUS_MAP[booking.status];
  const StatusIcon = cfg.icon;
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === booking.status);
  const createdAt = new Date(booking.created_at);
  const updatedAt = new Date(booking.updated_at);
  const travelDate = booking.travel_date ? new Date(booking.travel_date) : null;
  const remainingAmount = (booking.package_price * booking.num_travellers) - booking.deposit_amount;

  const waHelp = `https://wa.me/918115999588?text=${encodeURIComponent(
    `Hi Trust and Trip! Need help with my booking (ref: ${booking.id.slice(0, 8)}) — ${booking.package_title}`
  )}`;

  return (
    <div>
      {/* Back */}
      <Link href="/dashboard/bookings" className="inline-flex items-center gap-1.5 text-sm text-ink/55 hover:text-ink mb-6 group">
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to bookings
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Booking #{booking.id.slice(0, 8).toUpperCase()}</p>
        <h1 className="font-display text-2xl md:text-3xl font-medium text-ink leading-tight mb-3">
          {booking.package_title}
        </h1>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${cfg.badge}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {cfg.label}
        </span>
      </div>

      {/* Status timeline */}
      {booking.status !== "cancelled" && booking.status !== "refunded" && (
        <div className="bg-white rounded-2xl border border-ink/8 p-5 md:p-6 mb-5">
          <p className="text-xs font-semibold text-ink/60 uppercase tracking-wider mb-5">Progress</p>
          <div className="flex items-start gap-2 md:gap-4">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStepIndex;
              const active = i === currentStepIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <span
                      className={`absolute top-4 right-1/2 w-full h-0.5 ${
                        i <= currentStepIndex ? "bg-gold" : "bg-ink/10"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <div
                    className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                      done
                        ? "bg-gold text-ink"
                        : "bg-ink/5 text-ink/35"
                    } ${active ? "ring-4 ring-gold/20" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className={`mt-2 text-[10px] md:text-xs font-medium text-center leading-tight ${done ? "text-ink" : "text-ink/40"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Trip details */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-ink/8 p-5 md:p-6">
          <p className="text-xs font-semibold text-ink/60 uppercase tracking-wider mb-4">Trip details</p>

          <div className="space-y-4">
            {travelDate && (
              <Row icon={CalendarCheck} label="Travel date">
                {travelDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </Row>
            )}
            <Row icon={Users} label="Travellers">
              {booking.num_travellers} {booking.num_travellers === 1 ? "person" : "people"}
            </Row>
            <Row icon={MapPin} label="Package">
              <Link href={`/packages/${booking.package_slug}`} className="text-ink hover:text-gold underline decoration-ink/20 hover:decoration-gold underline-offset-2">
                View package →
              </Link>
            </Row>
            {booking.special_requests && (
              <Row icon={AlertCircle} label="Special requests" align="start">
                <p className="text-sm text-ink/70 leading-relaxed">{booking.special_requests}</p>
              </Row>
            )}
          </div>

          <div className="border-t border-ink/8 mt-5 pt-5">
            <p className="text-xs font-semibold text-ink/60 uppercase tracking-wider mb-4">Guest contact</p>
            <div className="space-y-3">
              <Row icon={Users} label="Name">{booking.customer_name}</Row>
              <Row icon={Mail} label="Email">
                <a href={`mailto:${booking.customer_email}`} className="text-ink hover:text-gold">{booking.customer_email}</a>
              </Row>
              <Row icon={Phone} label="Phone">
                <a href={`tel:${booking.customer_phone}`} className="text-ink hover:text-gold">{booking.customer_phone}</a>
              </Row>
            </div>
          </div>
        </div>

        {/* Payment + actions */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-ink/8 p-5 md:p-6">
            <p className="text-xs font-semibold text-ink/60 uppercase tracking-wider mb-4">Payment</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/60">Package total</span>
                <span className="text-sm font-medium text-ink">₹{(booking.package_price * booking.num_travellers).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/60">Deposit paid</span>
                <span className="text-sm font-medium text-green-700">₹{booking.deposit_amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between border-t border-ink/8 pt-3">
                <span className="text-sm font-semibold text-ink">Balance due</span>
                <span className="font-display text-lg font-medium text-ink">₹{remainingAmount.toLocaleString("en-IN")}</span>
              </div>
              {booking.razorpay_payment_id && (
                <p className="text-[10px] text-ink/35 pt-2 font-mono break-all">
                  Payment ID: {booking.razorpay_payment_id}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-ink/8 p-5 md:p-6">
            <p className="text-xs font-semibold text-ink/60 uppercase tracking-wider mb-4">Actions</p>
            <div className="space-y-2">
              {(booking.status === "paid" || booking.status === "verified") && (
                <Link
                  href={`/dashboard/bookings/${booking.id}/receipt`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full bg-ink hover:bg-gold text-cream hover:text-ink py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  <Download className="h-4 w-4" /> Download receipt
                </Link>
              )}
              <a
                href={waHelp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-[#25D366]/30 bg-[#25D366]/5 hover:bg-[#25D366]/15 text-[#1a9e4e] py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                <MessageCircle className="h-4 w-4" /> Need help?
              </a>
              {booking.status === "created" && (
                <Link
                  href={`/packages/${booking.package_slug}`}
                  className="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold/90 text-ink py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  Pay deposit <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="text-[11px] text-ink/35 space-y-1 px-1">
            <p>Booked: {createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            <p>Last updated: {updatedAt.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
  align = "center",
}: {
  icon: typeof CheckCircle2;
  label: string;
  children: React.ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div className={`flex gap-3 ${align === "start" ? "items-start" : "items-center"}`}>
      <div className="h-8 w-8 rounded-lg bg-ink/5 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-ink/55" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-ink/40 mb-0.5">{label}</p>
        <div className="text-sm text-ink">{children}</div>
      </div>
    </div>
  );
}
