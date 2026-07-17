import type { Metadata } from "next";
import { getExperienceById } from "@/app/lib/api/services";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const item = await getExperienceById(id);
    return { title: item ? `${item.name} | Cupontours` : "Experience | Cupontours" };
  } catch {
    return { title: "Experience | Cupontours" };
  }
}

export default function Layout({ children }: Props) {
  return children;
}
