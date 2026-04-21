export interface GoogleReview {
  author_name: string;
  author_url: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface GooglePlaceData {
  reviews: GoogleReview[];
  rating: number;
  user_ratings_total: number;
}

// Cache duration: 6 hours
export const GOOGLE_REVIEWS_REVALIDATE = 21600;

export async function fetchGoogleReviews(): Promise<GooglePlaceData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey) return null;

  try {
    let resolvedPlaceId = placeId;

    // Auto-discover place ID if not set
    if (!resolvedPlaceId) {
      const searchRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Trust+And+Trip+Experiences+PVT+LTD&inputtype=textquery&fields=place_id&key=${apiKey}`,
        { next: { revalidate: GOOGLE_REVIEWS_REVALIDATE } }
      );
      const searchData = await searchRes.json();
      resolvedPlaceId = searchData.candidates?.[0]?.place_id;
    }

    if (!resolvedPlaceId) return null;

    const detailsRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${resolvedPlaceId}&fields=reviews,rating,user_ratings_total&reviews_sort=newest&key=${apiKey}`,
      { next: { revalidate: GOOGLE_REVIEWS_REVALIDATE } }
    );
    const data = await detailsRes.json();
    const result = data.result;

    if (!result) return null;

    return {
      reviews: result.reviews ?? [],
      rating: result.rating ?? 4.9,
      user_ratings_total: result.user_ratings_total ?? 0,
    };
  } catch {
    return null;
  }
}
