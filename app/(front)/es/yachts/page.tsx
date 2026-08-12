import type { Metadata } from "next";
import YachtsCatalogClient from "../../yachts/YachtsCatalogClient";
import { getAllYachts } from "../../../lib/api/yachts";

export const metadata: Metadata = {
  title: "Charters de yate de lujo en Miami | Cupontours",
  description: "Charters privados desde embarcaciones íntimas hasta mega yates con tripulación profesional en aguas de Miami.",
  alternates: { canonical: "/es/yachts", languages: { en: "/yachts", es: "/es/yachts", "x-default": "/yachts" } },
  openGraph: {
    title: "Charters de yate de lujo en Miami | Cupontours",
    description: "Charters privados desde embarcaciones íntimas hasta mega yates con tripulación profesional en aguas de Miami.",
    url: "/es/yachts", type: "website",
  },
};

export default async function YachtsPageEs() {
  const items = await getAllYachts();
  return <YachtsCatalogClient initialItems={items} initialCount={items.length} locale="es" />;
}
