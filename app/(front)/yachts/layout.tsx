import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Luxury Yacht Charters",
  description:
    "Charter luxury yachts by the day or the week — fully crewed vessels for celebrations, getaways and private events. Book your yacht charter with Cupontours.",
  path: "/yachts",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
