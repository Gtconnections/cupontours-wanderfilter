import type { Metadata } from "next";
import ContactContent from "../../contact/ContactContent";

export const metadata: Metadata = {
  title: "Contáctanos | Cupontours",
  description: "Ponte en contacto con Cupontours para alquileres de lujo, autos, yates, jets privados y servicios de concierge. Habla con nuestro equipo en Miami.",
  alternates: { canonical: "/es/contact", languages: { en: "/contact", es: "/es/contact", "x-default": "/contact" } },
};

export default function ContactPageEs() {
  return <ContactContent locale="es" />;
}
