import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Luxury Yacht Charters in Miami",
  description:
    "Private charters from intimate vessels to mega yachts with professional crew on Miami waters.",
  path: "/yachts",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
