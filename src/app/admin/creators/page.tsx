import { createClient } from "@supabase/supabase-js";
import CreatorsAdminClient from "./CreatorsAdminClient";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export default async function CreatorsAdminPage() {
  const { data } = await admin
    .from("creators")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return <CreatorsAdminClient initialCreators={data ?? []} />;
}
