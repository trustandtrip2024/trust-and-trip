import Link from "next/link";
import { WifiOff, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "You're offline",
  description: "It looks like your internet is offline. Reconnect to continue planning with Trust and Trip.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-tat-paper flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="h-20 w-20 rounded-full bg-tat-charcoal/5 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-9 w-9 text-tat-charcoal/30" />
        </div>
        <h1 className="font-display text-2xl font-medium mb-3">You're offline</h1>
        <p className="text-tat-charcoal/60 text-sm leading-relaxed mb-8">
          No internet connection. Check your connection and try again — or{" "}
          <a href="https://wa.me/918115999588" className="text-tat-gold hover:underline">WhatsApp us</a>{" "}
          directly.
        </p>
        <Link href="/" className="btn-outline inline-flex">
          <ArrowLeft className="h-4 w-4" />
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
