import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Login",
  description:
    "Sign in to your Cupontours account to manage bookings, properties and services.",
  path: "/login",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
