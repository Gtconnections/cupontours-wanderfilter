import type { Metadata } from "next";
import WorkContent from "../../work-with-us/WorkContent";

export const metadata: Metadata = {
  title: "Trabaja con Nosotros | Cupontours",
  description: "Asóciate con Cupontours, el marketplace de viajes de lujo en Miami: alquileres vacacionales, autos exóticos, yates, jets privados y concierge. Únete a nuestra red de operadores y propietarios.",
  alternates: { canonical: "/es/work-with-us", languages: { en: "/work-with-us", es: "/es/work-with-us", "x-default": "/work-with-us" } },
};

export default function WorkWithUsPageEs() {
  return <WorkContent locale="es" />;
}
