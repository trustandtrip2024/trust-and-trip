"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Trash2, Clock, Users, CalendarDays, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

interface CartItem {
  id: string;
  package_slug: string;
  package_title: string;
  package_image: string;
  package_price: number;
  duration: string;
  destination_name: string;
  travel_type: string;
  num_travelers: number;
  travel_date: string | null;
}

export default function CartPage() {
  const { user } = useUserStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string>("");
  const [updating, setUpdating] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    const { data } = await supabase
      .from("user_cart")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  async function removeItem(id: string) {
    setRemoving(id);
    await supabase.from("user_cart").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setRemoving("");
  }

  async function updateTravelers(id: string, num: number) {
    setUpdating(id);
    await supabase.from("user_cart").update({ num_travelers: num }).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, num_travelers: num } : i));
    setUpdating("");
  }

  async function updateDate(id: string, date: string) {
    await supabase.from("user_cart").update({ travel_date: date }).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, travel_date: date } : i));
  }

  const totalDeposit = items.reduce((sum, i) => {
    const deposit = Math.max(Math.round(i.package_price * 0.3 / 100) * 100, 5000);
    return sum + deposit * i.num_travelers;
  }, 0);

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Dashboard</p>
        <h1 className="font-display text-2xl font-medium text-ink">My Cart</h1>
        <p className="text-sm text-ink/50 mt-1">Experiences ready to book.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-ink/30" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/8 p-10 text-center">
          <ShoppingCart className="h-10 w-10 text-ink/20 mx-auto mb-3" />
          <p className="font-medium text-ink">Your cart is empty</p>
          <p className="text-sm text-ink/45 mt-1 mb-5">Add experiences from Saved Trips or browse.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/dashboard/saved" className="inline-flex items-center gap-2 bg-ink text-cream px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gold hover:text-ink transition-all">
              Saved trips <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/packages" className="inline-flex items-center gap-2 border border-ink/20 text-ink px-5 py-2.5 rounded-full text-sm font-medium hover:border-ink/40 transition-all">
              Browse experiences
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const depositPerPerson = Math.max(Math.round(item.package_price * 0.3 / 100) * 100, 5000);
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-ink/8 p-4 md:p-5">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative h-20 w-28 md:h-24 md:w-36 rounded-xl overflow-hidden shrink-0">
                    {item.package_image ? (
                      <Image
                        src={item.package_image}
                        alt={item.package_title}
                        fill
                        sizes="144px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-sand/60" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-ink/40">{item.destination_name}</p>
                        <h3 className="font-display text-base font-medium text-ink leading-snug">{item.package_title}</h3>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={removing === item.id}
                        className="h-7 w-7 rounded-lg hover:bg-red-50 hover:text-red-500 text-ink/35 flex items-center justify-center transition-all shrink-0"
                      >
                        {removing === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-ink/45 mt-1.5">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.duration}</span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-ink/40" />
                        <select
                          value={item.num_travelers}
                          onChange={(e) => updateTravelers(item.id, Number(e.target.value))}
                          disabled={updating === item.id}
                          className="text-xs border border-ink/15 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gold/40"
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                            <option key={n} value={n}>{n} traveller{n > 1 ? "s" : ""}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-ink/40" />
                        <input
                          type="date"
                          value={item.travel_date ?? ""}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => updateDate(item.id, e.target.value)}
                          className="text-xs border border-ink/15 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gold/40"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing + CTA */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink/5">
                  <div>
                    <p className="text-xs text-ink/40">Total deposit ({item.num_travelers} × ₹{depositPerPerson.toLocaleString("en-IN")})</p>
                    <p className="font-display text-lg text-ink">₹{(depositPerPerson * item.num_travelers).toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-ink/30">30% of ₹{(item.package_price * item.num_travelers).toLocaleString("en-IN")} total</p>
                  </div>
                  <Link
                    href={`/packages/${item.package_slug}`}
                    className="flex items-center gap-2 bg-ink hover:bg-gold text-cream hover:text-ink px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    Book Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Cart total */}
          <div className="bg-ink rounded-2xl p-5 text-cream flex items-center justify-between">
            <div>
              <p className="text-xs text-cream/50 mb-0.5">Total deposit for all items</p>
              <p className="font-display text-2xl">₹{totalDeposit.toLocaleString("en-IN")}</p>
            </div>
            <Link
              href="/packages"
              className="flex items-center gap-2 bg-gold text-ink px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gold/90 transition-all"
            >
              Continue browsing experiences <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
