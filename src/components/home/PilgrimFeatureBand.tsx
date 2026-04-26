import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import PackageCardUI from "@/components/ui/PackageCard";
import { STYLE_PACKAGES } from "@/data/packagesByStyle";

// TODO: replace with real /img/pilgrim-feature.jpg once the asset is in /public.
const FEATURE_IMAGE =
  "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1600&q=75&auto=format&fit=crop";

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
}

export default function PilgrimFeatureBand({
  eyebrow = "A special kind of journey",
  titleStart = "Yatras, walked with",
  titleItalic = "quiet care.",
  lede = "Helicopter darshans, calm transfers, vegetarian planning, and hotels close to the temples. We've shepherded 600+ yatris this season — and our planners know which queue moves fastest at Kedarnath.",
}: Props = {}) {
  const yatras = STYLE_PACKAGES.filter((p) => p.style === "Pilgrim").slice(0, 3);

  // TODO: replace with real WhatsApp deeplink env or constant.
  const WHATSAPP_HREF =
    "https://wa.me/918115999588?text=" +
    encodeURIComponent("Hi Trust and Trip — I'd like help planning a yatra.");

  return (
    <section
      aria-labelledby="pilgrim-title"
      className="py-18 md:py-22 bg-amber-50/30 border-y border-amber-200/40"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10 items-start">
        <div className="md:col-span-2 relative rounded-card overflow-hidden aspect-[4/5] md:aspect-[3/4] bg-stone-200">
          <Image
            src={FEATURE_IMAGE}
            alt="A temple at dawn, lit by the first light."
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            quality={70}
            className="object-cover"
          />
        </div>

        <div className="md:col-span-3">
          <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

          {yatras.length > 0 && (
            <ul className="mt-7 grid grid-cols-1 gap-5">
              {yatras.map((p) => (
                <li key={p.id}>
                  <PackageCardUI {...p} layout="horizontal" density="compact" />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-3">
            <Link
              href="/destinations/uttarakhand"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-stone-900 hover:text-amber-700 transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 rounded-sm"
            >
              See all yatras
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="hidden sm:inline text-stone-300" aria-hidden>·</span>
            <Link
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-stone-700 hover:text-emerald-700 transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 rounded-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Or speak to our yatra desk on WhatsApp
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
