import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { pushNewsletterSubscriber } from "@/lib/bitrix24";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.toLowerCase().trim() });

    if (error) {
      // Unique violation = already subscribed — treat as success, don't re-push to Bitrix24
      if (error.code === "23505") {
        return NextResponse.json({ success: true, already: true });
      }
      return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
    }

    // Fire-and-forget: sync fresh subscribers into Bitrix24 as low-priority Leads
    pushNewsletterSubscriber(email.toLowerCase().trim()).catch((e) =>
      console.error("Bitrix24 pushNewsletterSubscriber error:", e)
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
