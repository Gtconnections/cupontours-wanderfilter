import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Recover Account",
  description:
    "Recover access to your Cupontours account.",
  path: "/recover-account",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
