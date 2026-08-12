import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Transport Services",
  description:
    "Premium transport services with Cupontours: chauffeured cars, airport transfers and private transport on demand.",
  path: "/services/transport",
  languages: { en: "/services/transport", es: "/es/services/transport", "x-default": "/services/transport" },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
