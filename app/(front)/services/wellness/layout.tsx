import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Wellness Services",
  description:
    "Wellness and spa concierge services with Cupontours: relaxation and rejuvenation arranged end to end.",
  path: "/services/wellness",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
