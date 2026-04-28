// Metadata for the /login route. Page is "use client" so we lift the
// metadata up to a sibling layout, which Next merges into <head>.

export const metadata = {
  title: "Sign in",
  description: "Sign in to your Trust and Trip account to manage bookings, points and saved trips.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://trustandtrip.com/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
