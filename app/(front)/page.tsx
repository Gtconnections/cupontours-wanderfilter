import type { Metadata } from "next";
import HomeContent from "./HomeContent";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { en: "/", es: "/es", "x-default": "/" },
  },
};

export default function HomePage() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
        fetchPriority="high"
      />
      <HomeContent locale="en" />
    </>
  );
}
