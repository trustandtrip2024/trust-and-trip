// Sanity is the only image source. Curated DESTINATION_GALLERY map that
// used to live here was removed once every destination got its own image
// + gallery in Sanity (scripts/upload-destination-images.mjs).

export function getGalleryImages(_destinationSlug: string, heroImage: string): string[] {
  // Sanity gallery is the canonical source. When a destination doc has no
  // gallery uploaded yet, render the hero image solo so the section never
  // looks broken.
  return [heroImage];
}

// Sanity-managed `gallery[]` is now the only source. When a destination
// has no gallery yet, fall back to the hero image so the lightbox never
// renders empty.
export function resolveGallery(
  sanityGallery: { url: string }[] | undefined | null,
  _destinationSlug: string,
  heroImage: string,
): string[] {
  if (sanityGallery && sanityGallery.length > 0) {
    const urls = sanityGallery.map((g) => g.url).filter(Boolean);
    if (urls.length > 0) return urls.slice(0, 12);
  }
  return [heroImage];
}
