import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Invest With Us",
  description:
    "Put your property to work with Cupontours: professional short-term rental management, dynamic pricing and multi-channel distribution across Airbnb, Vrbo and Booking, plus a full owner dashboard.",
  path: "/invest-with-us",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
