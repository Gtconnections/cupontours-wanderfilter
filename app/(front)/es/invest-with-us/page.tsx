import type { Metadata } from "next";
import InvestContent from "../../invest-with-us/InvestContent";

export const metadata: Metadata = {
  title: "Gestión de alquiler vacacional en Miami para propietarios | Cupontours",
  description: "Maximiza los ingresos de tu propiedad en Miami con pricing dinámico, distribución en OTAs y operación 24/7.",
  alternates: { canonical: "/es/invest-with-us", languages: { en: "/invest-with-us", es: "/es/invest-with-us", "x-default": "/invest-with-us" } },
  openGraph: { title: "Gestión de alquiler vacacional en Miami para propietarios | Cupontours", description: "Maximiza los ingresos de tu propiedad en Miami con pricing dinámico, distribución en OTAs y operación 24/7.", url: "/es/invest-with-us", type: "website" },
};

export default function InvestPageEs() {
  return <InvestContent locale="es" />;
}
