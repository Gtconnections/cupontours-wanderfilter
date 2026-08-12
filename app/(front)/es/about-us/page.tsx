import type { Metadata } from "next";
import AboutContent from "../../about-us/AboutContent";

export const metadata: Metadata = {
  title: "Sobre Nosotros | Cupontours",
  description: "Cupontours es un marketplace de lujo con base en Miami: alquileres vacacionales, autos exóticos, yates, jets privados y servicios de concierge. Conoce nuestra historia y cómo trabajamos.",
  alternates: { canonical: "/es/about-us", languages: { en: "/about-us", es: "/es/about-us", "x-default": "/about-us" } },
};

export default function AboutPageEs() {
  return <AboutContent locale="es" />;
}
