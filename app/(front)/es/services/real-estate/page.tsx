import type { Metadata } from "next";
import RealEstateContent from "../../../services/real-estate/RealEstateContent";
import { getServices } from "@/app/i18n/dictionaries";

const t = getServices("es")["real-estate"];
export const metadata: Metadata = {
  title: `${t.heroTitle} | Cupontours`,
  description: t.heroSub,
  alternates: { canonical: "/es/services/real-estate", languages: { en: "/services/real-estate", es: "/es/services/real-estate", "x-default": "/services/real-estate" } },
};

export default function RealEstatePageEs() {
  return <RealEstateContent locale="es" />;
}
