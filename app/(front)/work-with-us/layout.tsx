import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Work With Us",
  description:
    "Partner with Cupontours, a Miami luxury travel marketplace for vacation rentals, exotic cars, yachts, private jets and concierge services. Join our network of operators and owners.",
  path: "/work-with-us",
  languages: { en: "/work-with-us", es: "/es/work-with-us", "x-default": "/work-with-us" },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
