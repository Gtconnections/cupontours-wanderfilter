import type { Metadata } from "next";
import PrivacyContent from "../../privacy/PrivacyContent";

export const metadata: Metadata = {
  title: "Política de Privacidad | Cupontours",
  description: "Conoce cómo Cupontours recopila, usa y protege tus datos personales en nuestra plataforma de alquileres de lujo, autos, yates y concierge.",
  alternates: { canonical: "/es/privacy", languages: { en: "/privacy", es: "/es/privacy", "x-default": "/privacy" } },
};

export default function PrivacyPageEs() {
  return <PrivacyContent locale="es" />;
}
