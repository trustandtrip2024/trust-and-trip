import { redirect } from "next/navigation";
import CreatorNav from "@/components/creators/CreatorNav";
import { getServerUser } from "@/lib/supabase-server";

// Server-side auth + role guard. Unauthed users go to /login; authed
// users without role=creator land on /creators/apply.
export default async function CreatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/login?next=/creators/dashboard");
  const role = (user.user_metadata as Record<string, unknown> | undefined)?.role;
  if (role !== "creator") redirect("/creators/apply");

  return (
    <div className="min-h-screen bg-tat-paper/50 flex">
      <CreatorNav user={user} />
      <div className="flex-1 min-w-0 pb-16 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
