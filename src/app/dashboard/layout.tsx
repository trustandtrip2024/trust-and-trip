"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-tat-paper flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-tat-charcoal/30" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-tat-paper/50 flex">
      <DashboardNav user={user} />
      <div className="flex-1 min-w-0 pb-16 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
