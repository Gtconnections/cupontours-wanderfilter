import type { Metadata } from "next";
import { getPropertyById } from "@/app/lib/api/properties";
import { buildMetadata, metaDescription, SITE_URL } from "@/app/lib/seo";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await getPropertyById(id);
    if (!p) return { title: "Alquiler vacacional de lujo | Cupontours" };
    const title = p.name || "Alquiler vacacional de lujo";
    const img = p.listingImages?.length ? p.listingImages[0].url : undefined;
    return buildMetadata({
      title,
      description: metaDescription(
        p.description,
        `Reserva ${title}${p.city ? " en " + p.city : ""} — alquiler vacacional de lujo gestionado por Cupontours.`
      ),
      path: `/es/properties/${id}`,
      languages: { en: `/properties/${id}`, es: `/es/properties/${id}`, "x-default": `/properties/${id}` },
      image: img,
    });
  } catch {
    return { title: "Alquiler vacacional de lujo | Cupontours" };
  }
}

export default async function Layout({ params, children }: Props) {
  const { id } = await params;
  let jsonLd: Record<string, unknown> | null = null;
  try {
    const p = await getPropertyById(id);
    if (p) {
      const images = p.listingImages?.length ? p.listingImages.map((i) => i.url) : undefined;
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        name: p.name,
        description: metaDescription(p.description, p.name || "Alquiler vacacional de lujo"),
        url: `${SITE_URL}/es/properties/${id}`,
        ...(images ? { image: images } : {}),
        address: {
          "@type": "PostalAddress",
          addressLocality: p.city || "Miami",
          addressRegion: "FL",
          addressCountry: "US",
        },
        ...(p.price ? { priceRange: `$${p.price}` } : {}),
        ...(p.bedroomsNumber ? { numberOfRooms: p.bedroomsNumber } : {}),
      };
    }
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
