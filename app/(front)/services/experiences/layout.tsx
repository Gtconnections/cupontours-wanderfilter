import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Experiences",
  description:
    "Curated luxury experiences with Cupontours: bespoke activities and once in a lifetime moments across our destinations.",
  path: "/services/experiences",
  languages: { en: "/services/experiences", es: "/es/services/experiences", "x-default": "/services/experiences" },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
