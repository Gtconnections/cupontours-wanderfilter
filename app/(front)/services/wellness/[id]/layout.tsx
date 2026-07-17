import type { Metadata } from "next";
import { getWellnessById } from "@/app/lib/api/services";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const item = await getWellnessById(id);
    return { title: item ? `${item.name} | Cupontours` : "Wellness Service | Cupontours" };
  } catch {
    return { title: "Wellness Service | Cupontours" };
  }
}

export default function Layout({ children }: Props) {
  return children;
}
