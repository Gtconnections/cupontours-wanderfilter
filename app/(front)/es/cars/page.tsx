import type { Metadata } from "next";
import CarsCatalogClient from "../../cars/CarsCatalogClient";
import { getCarsPage } from "../../../lib/api/cars";

const FALLBACK_PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Renta de autos exóticos y de lujo en Miami | Cupontours",
  description: "Flota premium de SUVs, deportivos y eléctricos en Miami. Entrega en hotel, aeropuerto o propiedad.",
  alternates: { canonical: "/es/cars", languages: { en: "/cars", es: "/es/cars", "x-default": "/cars" } },
  openGraph: {
    title: "Renta de autos exóticos y de lujo en Miami | Cupontours",
    description: "Flota premium de SUVs, deportivos y eléctricos en Miami. Entrega en hotel, aeropuerto o propiedad.",
    url: "/es/cars", type: "website",
  },
};

export default async function CarsPageEs() {
  const { items, count } = await getCarsPage(1);
  const initialPageSize = items.length > 0 && items.length < count ? items.length : FALLBACK_PAGE_SIZE;
  return <CarsCatalogClient initialItems={items} initialCount={count} initialPageSize={initialPageSize} locale="es" />;
}
