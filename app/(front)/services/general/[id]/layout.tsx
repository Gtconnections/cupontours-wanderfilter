import type { Metadata } from "next";
import { getGeneralServiceById } from "@/app/lib/api/services";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const item = await getGeneralServiceById(id);
    return { title: item ? `${item.name} | Cupontours` : "General Service | Cupontours" };
  } catch {
    return { title: "General Service | Cupontours" };
  }
}

export default function Layout({ children }: Props) {
  return children;
}
