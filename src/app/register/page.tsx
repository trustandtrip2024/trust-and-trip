import { redirect } from "next/navigation";

// /register is a thin redirect into /login?mode=signup so we keep
// one canonical auth form (which already supports sign-in / sign-up
// / reset modes) and avoid duplicating the password / OAuth flows.
export default function RegisterPage() {
  redirect("/login?mode=signup");
}
