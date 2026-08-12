import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Learn how Cupontours collects, uses and protects your personal data across our luxury vacation rental, car, yacht and concierge booking platform.",
  path: "/privacy",
  languages: { en: "/privacy", es: "/es/privacy", "x-default": "/privacy" },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
