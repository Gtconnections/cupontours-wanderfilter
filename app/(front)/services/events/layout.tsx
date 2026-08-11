import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Events",
  description:
    "Plan unforgettable events with Cupontours: private celebrations, corporate gatherings and exclusive experiences arranged for you.",
  path: "/services/events",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
