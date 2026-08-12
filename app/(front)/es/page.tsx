import type { Metadata } from "next";
import HomeContent from "../HomeContent";

export const metadata: Metadata = {
  title: "Alquileres de lujo, autos exóticos y charters de yate en Miami | Cupontours",
  description:
    "Gestión hotelera y reservas premium en Miami: villas, autos exóticos, yates y jets privados. Reserva directa, sin intermediarios.",
  alternates: {
    canonical: "/es",
    languages: { en: "/", es: "/es", "x-default": "/" },
  },
  openGraph: {
    title: "Alquileres de lujo, autos exóticos y charters de yate en Miami | Cupontours",
    description:
      "Gestión hotelera y reservas premium en Miami: villas, autos exóticos, yates y jets privados. Reserva directa, sin intermediarios.",
    url: "/es",
    type: "website",
  },
};

export default function HomePageEs() {
  return <HomeContent locale="es" />;
}
