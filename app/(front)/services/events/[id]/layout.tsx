import type { Metadata } from "next";
import { getEventById } from "@/app/lib/api/services";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const item = await getEventById(id);
    return { title: item ? `${item.name} | Cupontours` : "Event | Cupontours" };
  } catch {
    return { title: "Event | Cupontours" };
  }
}

export default function Layout({ children }: Props) {
  return children;
}
