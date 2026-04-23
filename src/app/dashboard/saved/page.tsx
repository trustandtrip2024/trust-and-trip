"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, ArrowRight, Loader2, Trash2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

interface SavedTrip {
  id: string;
  package_slug: string;
  package_title: string;
  package_image: string;
  package_price: number;
  duration: string;
  destination_name: string;
  travel_type: string;
}

export default function SavedTripsPage() {
  const { user } = useUserStore();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string>("");
  const [removing, setRemoving] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    const { data } = await supabase
      .from("user_saved_trips")
      .select("*")
      .order("created_at", { ascending: false });
    setTrips(data ?? []);
    setLoading(false);
  }

  async function removeTrip(id: string) {
    setRemoving(id);
    await supabase.from("user_saved_trips").delete().eq("id", id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
    setRemoving("");
  }

  async function moveToCart(trip: SavedTrip) {
    setAdding(trip.id);
    await supabase.from("user_cart").upsert({
      user_id: user!.id,
      package_slug: trip.package_slug,
      package_title: trip.package_title,
      package_image: trip.package_image,
      package_price: trip.package_price,
      duration: trip.duration,
      destination_name: trip.destination_name,
      travel_type: trip.travel_type,
    }, { onConflict: "user_id,package_slug" });
    setAdding("");
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Dashboard</p>
        <h1 className="font-display text-2xl font-medium text-ink">Saved Trips</h1>
        <p className="text-sm text-ink/50 mt-1">Packages you&apos;ve bookmarked for later.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-ink/30" />
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/8 p-10 text-center">
          <Heart className="h-10 w-10 text-ink/20 mx-auto mb-3" />
          <p className="font-medium text-ink">No saved trips yet</p>
          <p className="text-sm text-ink/45 mt-1 mb-5">Tap the heart icon on any package to save it here.</p>
          <Link href="/packages" className="inline-flex items-center gap-2 bg-ink text-cream px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gold hover:text-ink transition-all">
            Browse packages <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-2xl border border-ink/8 overflow-hidden group hover:shadow-soft transition-all">
              <div className="relative aspect-[16/9] overflow-hidden">
                {trip.package_image ? (
                  <Image
                    src={trip.package_image}
                    alt={trip.package_title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-sand/60" />
                )}
                <button
                  onClick={() => removeTrip(trip.id)}
                  disabled={removing === trip.id}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-ink/50 transition-all"
                >
                  {removing === trip.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="p-4">
                <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">{trip.destination_name}</p>
                <h3 className="font-display text-base font-medium text-ink leading-snug mb-2">{trip.package_title}</h3>
                <div className="flex items-center gap-3 text-xs text-ink/45 mb-3">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{trip.duration}</span>
                </div>
                <div className="flex items-center justify-between border-t border-ink/5 pt-3">
                  <p className="font-display text-lg text-ink">
                    ₹{trip.package_price?.toLocaleString("en-IN")}
                    <span className="text-xs text-ink/40 font-sans ml-1">/ person</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveToCart(trip)}
                      disabled={adding === trip.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/10 hover:bg-gold text-ink text-xs font-medium transition-all border border-gold/20 hover:border-gold"
                    >
                      {adding === trip.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-3 w-3" />
                      )}
                      Add to cart
                    </button>
                    <Link
                      href={`/packages/${trip.package_slug}`}
                      className="h-8 w-8 rounded-xl bg-ink flex items-center justify-center hover:bg-gold transition-colors"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-cream hover:text-ink transition-colors" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
