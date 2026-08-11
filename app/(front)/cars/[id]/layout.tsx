import type { Metadata } from "next";
import { getCarById } from "@/app/lib/api/cars";
import { buildMetadata, metaDescription, parsePrice, SITE_URL } from "@/app/lib/seo";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const car = await getCarById(id);
    return buildMetadata({
      title: car.title,
      description: metaDescription(
        car.description,
        `Rent the ${car.title} with Cupontours — premium luxury and exotic car rentals in Miami and beyond.`
      ),
      path: `/cars/${id}`,
      image: car.img,
    });
  } catch {
    return { title: "Luxury Car Rental | Cupontours" };
  }
}

export default async function Layout({ params, children }: Props) {
  const { id } = await params;
  let jsonLd: Record<string, unknown> | null = null;
  try {
    const car = await getCarById(id);
    const price = parsePrice(car.price);
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: car.title,
      category: "Car Rental",
      description: metaDescription(car.description, car.title),
      image: car.gallery?.length ? car.gallery : car.img,
      ...(price
        ? {
            offers: {
              "@type": "Offer",
              price: String(price),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}/cars/${id}`,
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
