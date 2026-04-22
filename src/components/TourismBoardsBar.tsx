const boards = [
  { name: "Kerala Tourism", flag: "🇮🇳", accent: "#006400" },
  { name: "Incredible India", flag: "🇮🇳", accent: "#FF6B00" },
  { name: "Thailand TAT", flag: "🇹🇭", accent: "#a30000" },
  { name: "Singapore Tourism Board", flag: "🇸🇬", accent: "#1a1a8c" },
  { name: "Dubai Tourism", flag: "🇦🇪", accent: "#c8a030" },
  { name: "Maldives Tourism", flag: "🇲🇻", accent: "#006b3f" },
  { name: "Switzerland Tourism", flag: "🇨🇭", accent: "#d52b1e" },
  { name: "Rajasthan Tourism", flag: "🇮🇳", accent: "#8B4513" },
  { name: "Tourism New Zealand", flag: "🇳🇿", accent: "#00529B" },
  { name: "Tourism Australia", flag: "🇦🇺", accent: "#c8a030" },
  { name: "JNTO Japan", flag: "🇯🇵", accent: "#bc002d" },
  { name: "Uttarakhand Tourism", flag: "🇮🇳", accent: "#2e7d32" },
];

export default function TourismBoardsBar() {
  return (
    <section className="py-12 md:py-16 bg-sand/30 border-y border-ink/5">
      <div className="container-custom mb-6 md:mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-ink/40 text-center">
          Official partners &amp; accredited by
        </p>
      </div>

      <div className="overflow-hidden relative">
        {/* Fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-sand/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-sand/30 to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused]">
          {[...boards, ...boards].map((b, i) => (
            <div
              key={i}
              className="shrink-0 flex items-center gap-3 bg-white border border-ink/8 rounded-xl px-5 py-3.5 shadow-sm hover:shadow-md hover:border-ink/15 transition-all duration-300 group"
            >
              {/* Color accent bar */}
              <div
                className="w-1 h-8 rounded-full shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: b.accent }}
              />
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base leading-none">{b.flag}</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-ink/30">Official</span>
                </div>
                <p className="text-[13px] font-medium text-ink/80 whitespace-nowrap leading-tight">{b.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
