import { Suspense } from 'react';
import type { Metadata } from "next";
import CarsCatalogClient from "../../cars/CarsCatalogClient";
import { getAllCars } from "../../../lib/api/cars";

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
  const items = await getAllCars();
  return (
    <Suspense fallback={<div className="w-full text-center py-20 text-sm text-gray-400">Cargando catálogo...</div>}>
      <CarsCatalogClient initialItems={items} initialCount={items.length} locale="es" />
    </Suspense>
  );
}
