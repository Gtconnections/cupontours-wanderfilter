import type { Metadata } from "next";
import { getRealEstateById } from "@/app/lib/api/services";
import { buildMetadata, metaDescription } from "@/app/lib/seo";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const item = await getRealEstateById(id);
    if (!item) return { title: "Bienes raices | Cupontours" };
    return buildMetadata({
      title: item.name,
      description: metaDescription(
        item.descripcion,
        `${item.name}${item.location ? " en " + item.location : ""} — desarrollo inmobiliario de lujo disponible a traves de Cupontours.`
      ),
      path: `/es/services/real-estate/${id}`,
      languages: {
        en: `/services/real-estate/${id}`,
        es: `/es/services/real-estate/${id}`,
        "x-default": `/services/real-estate/${id}`,
      },
      image: item.principal_image,
    });
  } catch {
    return { title: "Bienes raices | Cupontours" };
  }
}

export default function Layout({ children }: Props) {
  return children;
}
