import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Wellness Services",
  description:
    "Wellness and spa concierge services with Cupontours: relaxation and rejuvenation arranged end to end.",
  path: "/services/wellness",
  languages: { en: "/services/wellness", es: "/es/services/wellness", "x-default": "/services/wellness" },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
