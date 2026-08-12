import type { Metadata } from "next";
import ServicesContent from "../../services/ServicesContent";

export const metadata: Metadata = {
  title: "Nuestros servicios premium en Miami | Cupontours",
  description: "Explora los servicios de concierge de Cupontours: propiedades, autos, yates, jets, transporte, bienes raíces, experiencias, bienestar, salud y eventos.",
  alternates: { canonical: "/es/services", languages: { en: "/services", es: "/es/services", "x-default": "/services" } },
};

export default function ServicesPageEs() {
  return <ServicesContent locale="es" />;
}
