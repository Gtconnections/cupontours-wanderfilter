import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Cupontours for luxury vacation rentals, car and yacht charters, private jets and concierge services. Speak with our Miami-based team.",
  path: "/contact",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
