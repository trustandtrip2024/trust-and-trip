import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Mountain, Camera, Compass, MessageCircle, Instagram, Mail, Facebook, Linkedin, Youtube, Phone } from "lucide-react";
import ComingSoonCountdown from "@/components/ComingSoonCountdown";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Something special is on the way — Trust and Trip",
  description:
    "We're polishing a brand-new Trust and Trip experience. Drop your email and we'll tell you the moment we're live.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Trust and Trip — upgrading the experience",
    description:
      "New stories, sharper visuals, smarter planning. Launching soon. Be first in.",
    images: ["/images/og-default.jpg"],
  },
};

const LAUNCH_ISO = "2026-05-04T09:00:00+05:30";

const upgrades = [
  {
    icon: Camera,
    title: "Crisper visuals",
    body: "New on-the-ground photography from Kashmir, Bali, Kerala and beyond.",
  },
  {
    icon: Mountain,
    title: "Cinematic hero",
    body: "A short film that captures what a Trust and Trip morning feels like.",
  },
  {
    icon: Compass,
    title: "Sharper planner",
    body: "Faster itineraries, cleaner pricing, fewer clicks between dream and book.",
  },
];

export default function ComingSoonPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-tat-paper text-tat-charcoal">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-tat-cream via-tat-paper to-tat-teal-mist/40" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-tat-teal/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-tat-gold/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] bg-grain mix-blend-multiply" />
      </div>

      <div className="container-custom flex min-h-screen flex-col">
        <header className="flex items-center justify-between py-6">
          <Link href="/coming-soon" className="flex items-center gap-3">
            <Image
              src="/icon.svg"
              alt="Trust and Trip"
              width={36}
              height={36}
              className="h-9 w-9"
              priority
            />
            <span className="font-display text-lg font-medium tracking-tight">
              Trust and Trip
            </span>
          </Link>
          <a
            href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip%2C%20I%27d%20like%20to%20plan%20a%20trip"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-tat-teal/30 bg-tat-paper/80 px-4 py-2 text-sm font-medium text-tat-teal-deep backdrop-blur transition hover:border-tat-teal hover:bg-tat-teal hover:text-tat-paper"
          >
            <MessageCircle className="h-4 w-4" />
            Talk to a planner now
          </a>
        </header>

        <section className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-tat-teal/10 px-3 py-1 text-eyebrow font-semibold uppercase tracking-[0.22em] text-tat-teal-deep">
              <Sparkles className="h-3.5 w-3.5" />
              Upgrading the experience
            </span>

            <h1 className="mt-6 font-display text-display-lg font-medium leading-[1.02] tracking-[-0.018em] text-balance">
              Something{" "}
              <span className="italic text-tat-orange">special</span> is on
              the way.
            </h1>

            <p className="mt-6 max-w-xl text-lead text-tat-charcoal/75">
              We&apos;re polishing a brand-new Trust and Trip — new visuals from
              the road, a cinematic hero film, and a planner that feels less
              like a form and more like a conversation. Doors reopen{" "}
              <span className="font-medium text-tat-teal-deep">Monday, 4 May</span>.
            </p>

            <div className="mt-8">
              <ComingSoonCountdown targetIso={LAUNCH_ISO} />
            </div>

            <div className="mt-10 max-w-md">
              <h2 className="font-display text-h3 font-medium">
                Be first through the door.
              </h2>
              <p className="mt-1 text-sm text-tat-charcoal/65">
                Drop your email — we&apos;ll send a single note the moment we&apos;re live, plus a launch-week discovery offer.
              </p>
              <div className="mt-4">
                <WaitlistForm />
              </div>
            </div>
          </div>

          <aside className="relative">
            <div className="relative overflow-hidden rounded-card shadow-soft-lg">
              <div className="aspect-[4/5] bg-gradient-to-br from-tat-teal-deep via-tat-teal to-tat-gold/70">
                <Image
                  src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=75"
                  alt="A quiet desert morning, Rajasthan"
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-cover opacity-95"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/70 via-transparent to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-tat-paper">
                <p className="font-display text-h3 italic leading-tight">
                  &ldquo;The trip didn&apos;t feel booked. It felt designed.&rdquo;
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-tat-paper/70">
                  — A guest, last season
                </p>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 hidden rounded-card border border-tat-teal/15 bg-tat-paper/95 p-5 shadow-soft backdrop-blur sm:block">
              <p className="text-eyebrow font-semibold uppercase tracking-[0.22em] text-tat-gold">
                Founders Akash & team
              </p>
              <p className="mt-1 max-w-[15ch] font-display text-sm leading-snug text-tat-charcoal/85">
                Building trips we&apos;d send our own families on.
              </p>
            </div>
          </aside>
        </section>

        <section className="border-t border-tat-charcoal/10 py-12">
          <p className="eyebrow-ink">What&apos;s changing on launch day</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {upgrades.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-card border border-tat-charcoal/8 bg-tat-paper/70 p-6 backdrop-blur transition hover:border-tat-teal/30 hover:shadow-soft"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-tat-teal/10 text-tat-teal-deep">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-h4 font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-tat-charcoal/70">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-tat-charcoal/10 py-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="eyebrow-ink">In the meantime</p>
              <h2 className="mt-3 font-display text-h2 font-medium leading-tight text-balance">
                Already dreaming of somewhere?{" "}
                <span className="italic text-tat-orange">Talk to us now.</span>
              </h2>
              <p className="mt-3 max-w-xl text-prose text-tat-charcoal/70">
                Our planners are still online while the new site finishes
                cooking. WhatsApp is fastest — you&apos;ll hear back the same
                day, often within the hour.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip%2C%20I%27d%20like%20to%20plan%20a%20trip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp us
                </a>
                <a href="tel:+918115999588" className="btn-outline">
                  <Phone className="h-4 w-4" />
                  +91 81159 99588
                </a>
              </div>
            </div>

            <div>
              <p className="eyebrow-ink">Follow the build</p>
              <p className="mt-3 text-prose text-tat-charcoal/70">
                We&apos;re sharing behind-the-scenes shots from the road
                while we wrap things up.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { href: "https://instagram.com/trust_and_trip", label: "Instagram", Icon: Instagram },
                  { href: "https://facebook.com/trustandtrip", label: "Facebook", Icon: Facebook },
                  { href: "https://linkedin.com/company/trust-and-trip", label: "LinkedIn", Icon: Linkedin },
                  { href: "https://youtube.com/@trustandtrip", label: "YouTube", Icon: Youtube },
                  { href: "https://x.com/trust_and_trip", label: "X / Twitter", Icon: Sparkles },
                  { href: "mailto:hello@trustandtrip.com", label: "Email us", Icon: Mail },
                ].map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-card border border-tat-charcoal/10 bg-tat-paper/80 px-4 py-3 text-sm font-medium text-tat-charcoal/80 transition hover:-translate-y-0.5 hover:border-tat-teal/40 hover:text-tat-teal-deep hover:shadow-soft"
                  >
                    <Icon className="h-4 w-4 text-tat-teal-deep transition group-hover:scale-110" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-start justify-between gap-2 border-t border-tat-charcoal/10 py-6 text-sm text-tat-charcoal/55 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Trust and Trip · Crafting reliable travel · Noida, India</p>
          <p className="text-xs uppercase tracking-[0.18em]">Back online · Mon 4 May, 9 AM IST</p>
        </footer>
      </div>
    </main>
  );
}
