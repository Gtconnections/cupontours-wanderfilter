import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "About Us",
  description:
    "Cupontours is a Miami-based luxury marketplace for vacation rentals, exotic cars, yachts, private jets and concierge services. Discover our story and how we work.",
  path: "/about-us",
  languages: { en: "/about-us", es: "/es/about-us", "x-default": "/about-us" },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
