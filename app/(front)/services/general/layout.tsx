import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "General Services",
  description:
    "General concierge services from Cupontours: whatever you need for a seamless luxury stay, handled by our team.",
  path: "/services/general",
  languages: { en: "/services/general", es: "/es/services/general", "x-default": "/services/general" },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
