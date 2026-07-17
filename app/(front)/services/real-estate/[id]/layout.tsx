import type { Metadata } from "next";
import { getRealEstateById } from "@/app/lib/api/services";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const item = await getRealEstateById(id);
    return { title: item ? `${item.name} | Cupontours` : "Real Estate Service | Cupontours" };
  } catch {
    return { title: "Real Estate Service | Cupontours" };
  }
}

export default function Layout({ children }: Props) {
  return children;
}
