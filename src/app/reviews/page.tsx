import { redirect } from "next/navigation";

// Reviews live in the homepage ReviewsRail + Google business profile.
// Until we ship a dedicated reviews page, /reviews redirects to home.
export default function ReviewsPage() {
  redirect("/#reviews-title");
}
