"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import CreatorNav from "@/components/creators/CreatorNav";

export default function CreatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?next=/creators/dashboard");
      return;
    }
    if (user.user_metadata?.role !== "creator") {
      router.replace("/creators/apply");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink/30" />
      </div>
    );
  }
  if (!user || user.user_metadata?.role !== "creator") return null;

  return (
    <div className="min-h-screen bg-cream/50 flex">
      <CreatorNav user={user} />
      <div className="flex-1 min-w-0 pb-16 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
