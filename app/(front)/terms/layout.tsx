import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Terms & Conditions",
  description:
    "Read the terms and conditions for booking luxury vacation rentals, car and yacht charters, and concierge services through Cupontours.",
  path: "/terms",
  languages: { en: "/terms", es: "/es/terms", "x-default": "/terms" },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
