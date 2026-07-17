import type { Metadata } from "next";
import { getCarById } from "@/app/lib/api/cars";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const car = await getCarById(id);
    return { title: `${car.title} | Cupontours` };
  } catch {
    return { title: "Luxury Car Rental | Cupontours" };
  }
}

export default function Layout({ children }: Props) {
  return children;
}
