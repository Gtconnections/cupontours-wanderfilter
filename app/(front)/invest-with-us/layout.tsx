import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Vacation Rental Management in Miami for Owners",
  description:
    "Maximize the income of your Miami property with dynamic pricing, OTA distribution and 24/7 operations.",
  path: "/invest-with-us",
  languages: { en: "/invest-with-us", es: "/es/invest-with-us", "x-default": "/invest-with-us" },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
