import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Health Services",
  description:
    "Health and medical concierge services with Cupontours: trusted providers arranged for you during your stay.",
  path: "/services/health",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
