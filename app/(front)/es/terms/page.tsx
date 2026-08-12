import type { Metadata } from "next";
import TermsContent from "../../terms/TermsContent";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Cupontours",
  description: "Lee los términos y condiciones para reservar alquileres vacacionales de lujo, autos, yates y servicios de concierge a través de Cupontours.",
  alternates: { canonical: "/es/terms", languages: { en: "/terms", es: "/es/terms", "x-default": "/terms" } },
};

export default function TermsPageEs() {
  return <TermsContent locale="es" />;
}
