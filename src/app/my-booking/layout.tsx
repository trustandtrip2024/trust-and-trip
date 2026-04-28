// Metadata for /my-booking (client-rendered).

export const metadata = {
  title: "My booking",
  description: "Find a Trust and Trip booking by email and trip code.",
  robots: { index: false, follow: false },
};

export default function MyBookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
