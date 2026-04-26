"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { Star, ShieldCheck, Award, ArrowRight } from "lucide-react";

const STATS = [
  {
    href: "https://www.google.com/maps/search/Trust+And+Trip+Experiences+PVT+LTD",
    label: "Google",
    value: "4.9",
    sub: "200+ reviews",
    icon: <Star className="h-4 w-4 fill-tat-gold text-tat-gold" />,
  },
  {
    href: "https://www.tripadvisor.in/Search?q=Trust+And+Trip+Experiences",
    label: "Tripadvisor",
    value: "4.9",
    sub: "Travelers' Choice",
    icon: <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />,
  },
  {
    href: "#",
    label: "IATO",
    value: "Certified",
    sub: "Member",
    icon: <ShieldCheck className="h-4 w-4 text-sky-600" />,
  },
  {
    href: "#",
    label: "ISO 9001",
    value: "Audited",
    sub: "Quality",
    icon: <Award className="h-4 w-4 text-violet-600" />,
  },
];

const REVIEWS = [
  {
    name: "Priya S.",
    when: "2 weeks ago",
    tag: "Bali Honeymoon",
    quote:
      "Absolutely brilliant travel planning! Every detail of our Bali honeymoon was perfectly arranged.",
    platform: "Google",
  },
  {
    name: "Rahul M.",
    when: "1 month ago",
    tag: "Switzerland Family",
    quote:
      "Best travel agency in Jaipur! They planned our family trip to Switzerland and it was flawless.",
    platform: "Google",
  },
  {
    name: "Sunita K.",
    when: "3 weeks ago",
    tag: "Dubai Getaway",
    quote:
      "You can trust them completely! Dubai trip was seamlessly managed. Transparent pricing.",
    platform: "Google",
  },
  {
    name: "Arjun P.",
    when: "2 months ago",
    tag: "Maldives Romance",
    quote:
      "Exceptional service from start to finish. The Maldives package was luxurious and well within budget.",
    platform: "Google",
  },
  {
    name: "Deepa R.",
    when: "1 month ago",
    tag: "Kerala Backwaters",
    quote:
      "None compare to Trust and Trip. Kerala backwaters trip was magical, every hotel handpicked.",
    platform: "Tripadvisor",
  },
];

const PARTNERS = [
  "/logos/google.svg",
  "/logos/tripadvisor.svg",
  "/logos/iato.svg",
  "/logos/iso.svg",
  "/logos/mmt.svg",
];

export default function VerifiedByTravelers() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 4500, stopOnInteraction: false })]
  );

  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    setSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <section
      aria-label="Verified by Travelers"
      className="bg-[#fbf6ec] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 inline-block bg-tat-orange-soft/70 px-2 py-1 text-xs font-semibold uppercase tracking-wider">
            Verified by Travelers
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
            Trusted on every{" "}
            <span className="italic text-tat-gold">platform.</span>
          </h2>
        </div>

        {/* Stat strip */}
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="group flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-amber-400 hover:shadow-sm"
            >
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                {s.icon} {s.label}
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {s.value}
              </div>
              <div className="text-xs text-slate-500">{s.sub}</div>
            </Link>
          ))}
        </div>

        {/* Testimonial carousel — only 3 visible at a time */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {REVIEWS.map((r, i) => (
              <article
                key={i}
                className="flex min-w-0 shrink-0 grow-0 basis-[88%] flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:basis-[48%] lg:basis-[32%]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-tat-orange/15 font-semibold text-tat-gold">
                      {r.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {r.name}
                      </div>
                      <div className="text-xs text-slate-500">{r.when}</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    {r.platform}
                  </span>
                </div>

                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star
                      key={k}
                      className="h-4 w-4 fill-tat-gold text-tat-gold"
                    />
                  ))}
                </div>

                <p className="line-clamp-3 text-sm leading-relaxed text-slate-700">
                  &ldquo;{r.quote}&rdquo;
                </p>

                <span className="mt-auto inline-block w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                  {r.tag}
                </span>
              </article>
            ))}
          </div>
        </div>

        {/* Dots + CTA */}
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {snaps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === selected ? "w-8 bg-tat-orange" : "w-3 bg-slate-300"
                }`}
              />
            ))}
          </div>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-tat-gold"
          >
            Read all 200+ reviews <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Partner / "as seen on" greyscale strip */}
        <div className="mt-14 border-t border-slate-200 pt-8">
          <p className="mb-4 text-center text-xs uppercase tracking-widest text-slate-500">
            As seen on
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {PARTNERS.map((src) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={96}
                height={28}
                className="h-7 w-auto grayscale transition hover:grayscale-0"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
