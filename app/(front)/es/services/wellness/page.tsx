import type { Metadata } from "next";
import WellnessContent from "../../../services/wellness/WellnessContent";
import { getServices } from "@/app/i18n/dictionaries";

const t = getServices("es")["wellness"];
export const metadata: Metadata = {
  title: `${t.heroTitle} | Cupontours`,
  description: t.heroSub,
  alternates: { canonical: "/es/services/wellness", languages: { en: "/services/wellness", es: "/es/services/wellness", "x-default": "/services/wellness" } },
};

export default function WellnessPageEs() {
  return <WellnessContent locale="es" />;
}
