import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Our Services",
  description:
    "Explore Cupontours concierge services: events, experiences, wellness, health, transport and real estate, all handled end to end by our Miami team.",
  path: "/services",
  languages: { en: "/services", es: "/es/services", "x-default": "/services" },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
