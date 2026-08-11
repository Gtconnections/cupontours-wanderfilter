import type { Metadata } from "next";
import { getYachtById } from "@/app/lib/api/yachts";
import { buildMetadata, metaDescription, parsePrice, SITE_URL } from "@/app/lib/seo";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const yacht = await getYachtById(id);
    return buildMetadata({
      title: yacht.title,
      description: metaDescription(
        yacht.description,
        `Charter the ${yacht.title} with Cupontours — a fully crewed luxury yacht for unforgettable days on the water.`
      ),
      path: `/yachts/${id}`,
      image: yacht.img,
    });
  } catch {
    return { title: "Luxury Yacht Charter | Cupontours" };
  }
}

export default async function Layout({ params, children }: Props) {
  const { id } = await params;
  let jsonLd: Record<string, unknown> | null = null;
  try {
    const yacht = await getYachtById(id);
    const price = parsePrice(yacht.price_full_day);
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: yacht.title,
      category: "Yacht Charter",
      description: metaDescription(yacht.description, yacht.title),
      image: yacht.gallery?.length ? yacht.gallery : yacht.img,
      ...(price
        ? {
            offers: {
              "@type": "Offer",
              price: String(price),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}/yachts/${id}`,
            },
          }
        : {}),
    };
  } catch {}
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {children}
    </>
  );
}
