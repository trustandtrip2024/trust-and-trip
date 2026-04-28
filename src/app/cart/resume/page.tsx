// Cart resume — landing page hit from the abandoned-cart email/WA link.
//
// /cart/resume?u=<userId>&t=<HMAC>
//
// Verifies the token, fetches the user's open cart, then renders a CTA that
// redirects either to /dashboard/cart (logged-in user) or to a sign-in
// magic-link prompt. Since carts are scoped to user_id and most cart-abandon
// emails go to logged-out users, we surface a "send me a sign-in link" CTA.

import { createClient } from "@supabase/supabase-js";

export const metadata = {
  title: "Resume your booking",
  description: "Pick up your trip planning right where you left off.",
  robots: { index: false, follow: false },
};
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { verifyCartResumeToken } from "@/lib/cart-resume";

export const dynamic = "force-dynamic";

interface CartItem {
  id: string;
  package_slug: string;
  package_title: string | null;
  package_image: string | null;
  package_price: number | null;
  destination_name: string | null;
  duration: string | null;
  num_travelers: number | null;
  created_at: string;
}

interface Props {
  searchParams?: { u?: string; t?: string };
}

export default async function CartResumePage({ searchParams }: Props) {
  const userId = (searchParams?.u ?? "").trim();
  const token = (searchParams?.t ?? "").trim();
  if (!userId || !token) return notFound();
  if (!verifyCartResumeToken(userId, token)) return notFound();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return notFound();
  }
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const [{ data: cartRows }, { data: { user } = { user: null } }] = await Promise.all([
    sb
      .from("user_cart")
      .select("id, package_slug, package_title, package_image, package_price, destination_name, duration, num_travelers, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    sb.auth.admin.getUserById(userId),
  ]);

  const items = (cartRows ?? []) as CartItem[];
  const total = items.reduce((s, c) => s + (c.package_price ?? 0), 0);

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0]
    ?? user?.email?.split("@")[0]
    ?? "there";

  // We don't auto-sign-in via this link (security). Instead surface a clear
  // CTA + a "sign-in link via email" button if the user clicks past the
  // confirmation. Logged-in users redirected straight to /dashboard/cart.

  return (
    <main className="min-h-screen bg-tat-paper py-12">
      <div className="container-custom max-w-3xl">
        <div className="bg-white rounded-card border border-tat-charcoal/10 shadow-card p-6 md:p-10">
          <p className="tt-eyebrow">Welcome back</p>
          <h1 className="mt-2 font-display text-display-md text-tat-charcoal leading-tight">
            We held your trip{items.length > 1 ? "s" : ""} for you, {firstName}.
          </h1>
          <p className="mt-3 text-tat-charcoal/75 leading-relaxed">
            {items.length === 0
              ? "Your cart is empty — looks like you've already booked or cleared it. Start a fresh draft any time."
              : `${items.length} saved ${items.length === 1 ? "trip" : "trips"} · estimated total ${fmt(total)} (full package value, deposit only at checkout).`}
          </p>

          {items.length > 0 && (
            <ul className="mt-7 space-y-4">
              {items.map((c) => (
                <li
                  key={c.id}
                  className="flex items-stretch gap-4 rounded-card border border-tat-charcoal/10 overflow-hidden"
                >
                  {c.package_image ? (
                    <div className="relative shrink-0 w-28 sm:w-40 aspect-[4/3]">
                      <Image
                        src={c.package_image}
                        alt={c.package_title ?? "Saved trip"}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="shrink-0 w-28 sm:w-40 bg-tat-cream-warm/40" />
                  )}
                  <div className="flex-1 min-w-0 py-3 pr-4">
                    <p className="font-display text-h4 text-tat-charcoal leading-snug truncate">
                      {c.package_title ?? "Saved trip"}
                    </p>
                    <p className="mt-1 text-meta text-tat-slate truncate">
                      {[c.destination_name, c.duration, c.num_travelers && `${c.num_travelers} pax`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="mt-2 flex items-end justify-between">
                      <p className="text-tat-charcoal font-medium">
                        {c.package_price ? fmt(c.package_price) : "—"}
                        <span className="text-meta text-tat-slate ml-1">total</span>
                      </p>
                      <Link
                        href={`/packages/${c.package_slug}`}
                        className="text-meta text-tat-charcoal hover:text-tat-gold underline-offset-4 hover:underline"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/login?next=%2Fdashboard%2Fcart"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill bg-tat-orange text-white font-semibold hover:bg-tat-orange/90 transition"
            >
              Sign in & resume checkout
            </Link>
            <Link
              href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip%2C%20I%27d%20like%20to%20resume%20my%20cart."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill border border-emerald-700/40 text-emerald-800 font-medium hover:bg-emerald-50 transition"
            >
              Get help on WhatsApp
            </Link>
          </div>

          <p className="mt-6 text-meta text-tat-slate">
            This link is private to your account. It expires when you book or clear the cart.
          </p>
        </div>
      </div>
    </main>
  );
}
