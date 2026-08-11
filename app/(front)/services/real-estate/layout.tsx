import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Real Estate Services",
  description:
    "Luxury real estate services with Cupontours: buy, sell and invest in premier properties with expert guidance.",
  path: "/services/real-estate",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
