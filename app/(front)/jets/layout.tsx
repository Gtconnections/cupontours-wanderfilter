import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "On-Demand Private Jet Charters",
  description:
    "Private flights with FBO access, custom routes and a quote in under 2 hours.",
  path: "/jets",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
