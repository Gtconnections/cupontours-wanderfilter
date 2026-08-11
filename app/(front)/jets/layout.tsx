import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Private Jet Charters",
  description:
    "Private jet charters tailored to your schedule, domestic and international, with concierge-level service from takeoff to landing. Fly private with Cupontours.",
  path: "/jets",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
