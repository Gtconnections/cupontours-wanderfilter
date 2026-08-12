import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Exotic & Luxury Car Rentals in Miami",
  description:
    "Premium fleet of SUVs, sports cars and electric vehicles in Miami. Delivery to your hotel, the airport or your property.",
  path: "/cars",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
