import type { Metadata } from "next";
import { getYachtById } from "@/app/lib/api/yachts";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const yacht = await getYachtById(id);
    return { title: `${yacht.title} | Cupontours` };
  } catch {
    return { title: "Luxury Yacht Charter | Cupontours" };
  }
}

export default function Layout({ children }: Props) {
  return children;
}
