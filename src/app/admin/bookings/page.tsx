import { createClient } from "@supabase/supabase-js";
import BookingsTable from "./BookingsTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Booking {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  package_title: string | null;
  package_slug: string | null;
  package_price: number | null;
  deposit_amount: number | null;
  status: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  travel_date: string | null;
  num_travellers: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  refund_amount: number | null;
  refund_ref: string | null;
  lead_tier: string | null;
  utm_source: string | null;
}

async function getBookings(): Promise<Booking[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await sb
    .from("bookings")
    .select("id, created_at, customer_name, customer_email, customer_phone, package_title, package_slug, package_price, deposit_amount, status, razorpay_order_id, razorpay_payment_id, travel_date, num_travellers, cancelled_at, cancel_reason, refund_amount, refund_ref, lead_tier, utm_source")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return (data ?? []) as Booking[];
}

export default async function BookingsPage() {
  const bookings = await getBookings();
  const stats = {
    total: bookings.length,
    verified: bookings.filter((b) => b.status === "verified").length,
    cancelled: bookings.filter((b) => b.status === "cancelled" || b.status === "refunded").length,
    pending: bookings.filter((b) => b.status === "created" || b.status === "pending").length,
    refunded: bookings.reduce((s, b) => s + (b.refund_amount ?? 0), 0),
  };
  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-tat-charcoal">Bookings</h1>
          <p className="text-tat-slate text-sm mt-1">All Razorpay deposits + cancellations.</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Stat label="Total" value={stats.total} />
          <Stat label="Verified" value={stats.verified} color="green" />
          <Stat label="Pending" value={stats.pending} color="yellow" />
          <Stat label="Cancelled / refunded" value={stats.cancelled} color="amber" />
          <Stat label="Refunded ₹" value={fmt(stats.refunded)} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <BookingsTable bookings={bookings} />
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: "green" | "yellow" | "amber";
}) {
  const map: Record<string, string> = {
    green:  "bg-green-50 text-green-700 border-green-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    amber:  "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <div className={`rounded-xl border p-4 ${map[color ?? ""] ?? "bg-blue-50 text-blue-700 border-blue-100"}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
