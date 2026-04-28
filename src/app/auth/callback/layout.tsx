// Metadata for /auth/callback (client-rendered token-exchange page).
// noindex — never useful as a search result.

export const metadata = {
  title: "Signing you in",
  description: "Completing sign-in to Trust and Trip.",
  robots: { index: false, follow: false },
};

export default function AuthCallbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
