import type { Metadata } from "next";
import YachtsCatalogClient from "../../yachts/YachtsCatalogClient";
import { getYachtsPage } from "../../../lib/api/yachts";

const FALLBACK_PAGE_SIZE = 12;

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
  const { items, count } = await getYachtsPage(1);
  const initialPageSize = items.length > 0 && items.length < count ? items.length : FALLBACK_PAGE_SIZE;
  return <YachtsCatalogClient initialItems={items} initialCount={count} initialPageSize={initialPageSize} locale="es" />;
}
