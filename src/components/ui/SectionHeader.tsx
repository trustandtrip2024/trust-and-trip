interface Props {
  eyebrow: string;
  title: string;
  italicTail?: string;
  lede?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}

export default function SectionHeader({
  eyebrow, title, italicTail, lede, align = "left", as = "h2",
}: Props) {
  const Heading = as as "h1" | "h2";
  const headingSize = as === "h1"
    ? "text-display md:text-display"
    : "text-h2 md:text-h2";
  const wrap = align === "center" ? "text-center mx-auto" : "";
  return (
    <header className={`max-w-2xl ${wrap}`}>
      <p className="tt-eyebrow">{eyebrow}</p>
      <Heading className={`mt-2 font-serif ${headingSize} text-stone-900 text-balance`}>
        {title}
        {italicTail && (
          <>
            {" "}
            <em className="not-italic font-serif italic text-amber-700/80">{italicTail}</em>
          </>
        )}
      </Heading>
      {lede && <p className="tt-lede">{lede}</p>}
    </header>
  );
}
