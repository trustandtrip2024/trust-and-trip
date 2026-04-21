import Link from "next/link";
import { WifiOff, ArrowLeft } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="h-20 w-20 rounded-full bg-ink/5 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-9 w-9 text-ink/30" />
        </div>
        <h1 className="font-display text-2xl font-medium mb-3">You're offline</h1>
        <p className="text-ink/60 text-sm leading-relaxed mb-8">
          No internet connection. Check your connection and try again — or{" "}
          <a href="https://wa.me/918115999588" className="text-gold hover:underline">WhatsApp us</a>{" "}
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
