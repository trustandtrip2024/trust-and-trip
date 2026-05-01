Recognition + tourism-partner logos.

The home-page Recognition Strip (src/components/home-v3/RecognitionStrip.tsx)
loads each logo from this folder by slug:

  /public/partners/{slug}.svg

Drop SVG files matching the slugs below to replace the typographic
wordmark fallback with the real mark:

Trade bodies / accreditations
  iata.svg                  — IATA
  pata.svg                  — PATA
  sata.svg                  — SATA
  asta.svg                  — ASTA

Government tourism boards (India)
  ministry-of-tourism.svg   — Incredible India
  uttarakhand-tourism.svg   — Uttarakhand Tourism
  kerala-tourism.svg        — Kerala Tourism
  rajasthan-tourism.svg     — Rajasthan Tourism
  goa-tourism.svg           — Goa Tourism

Government tourism boards (international)
  thailand-tourism.svg      — Amazing Thailand
  vietnam-tourism.svg       — Visit Vietnam
  dubai-tourism.svg         — Visit Dubai
  turkey-tourism.svg        — Go Türkiye
  maldives-tourism.svg      — Visit Maldives
  switzerland-tourism.svg   — Switzerland Tourism
  singapore-tourism.svg     — Singapore Tourism
  sri-lanka-tourism.svg     — Sri Lanka Tourism

Notes:
- SVG preferred. PNG works if you also update RecognitionStrip.tsx.
- Aim for marks that look right at h-9 / h-10 (36-40px).
- Use mono / single-color marks where possible — the strip sits on a
  cream paper background and gold-on-cream reads cleanest.
- Until the asset is dropped, the strip auto-renders a typographic
  wordmark with the partner name + tagline. The strip will never
  look broken.
