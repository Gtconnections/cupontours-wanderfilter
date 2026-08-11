import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Luxury Car Rentals",
  description:
    "Rent luxury and exotic cars in Miami and beyond — supercars, convertibles and premium SUVs delivered to you. Book your dream drive with Cupontours.",
  path: "/cars",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
