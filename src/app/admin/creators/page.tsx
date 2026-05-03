import { createClient } from "@supabase/supabase-js";
import CreatorsAdminClient from "./CreatorsAdminClient";
import { decryptPayout } from "@/lib/payout-crypto";

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

  // Decrypt payout_details server-side. Client component only sees plaintext
  // strings — never the AES ciphertext or the encryption key.
  const decrypted = (data ?? []).map((c) => ({
    ...c,
    payout_details: c.payout_details
      ? { raw: decryptPayout(c.payout_details) ?? "" }
      : null,
  }));

  return <CreatorsAdminClient initialCreators={decrypted} />;
}
