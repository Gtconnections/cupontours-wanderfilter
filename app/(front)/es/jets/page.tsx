import type { Metadata } from "next";
import JetsContent from "../../jets/JetsContent";

export const metadata: Metadata = {
  title: "Charters de jet privado a demanda | Cupontours",
  description: "Vuelos privados con acceso FBO, rutas a medida y cotización en menos de 2 horas.",
  alternates: { canonical: "/es/jets", languages: { en: "/jets", es: "/es/jets", "x-default": "/jets" } },
  openGraph: { title: "Charters de jet privado a demanda | Cupontours", description: "Vuelos privados con acceso FBO, rutas a medida y cotización en menos de 2 horas.", url: "/es/jets", type: "website" },
};

export default function JetsPageEs() {
  return <JetsContent locale="es" />;
}
