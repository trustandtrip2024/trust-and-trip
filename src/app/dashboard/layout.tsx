import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { getServerUser } from "@/lib/supabase-server";

// Server-side auth guard: any unauthed visitor is redirected before any
// client JS runs. The previous client-side useEffect redirect remains in
// the navigation component for fast in-app transitions, but the security
// boundary now sits here.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/login");

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
