import type { Metadata } from "next";
import ExperiencesContent from "../../../services/experiences/ExperiencesContent";
import { getServices } from "@/app/i18n/dictionaries";

const t = getServices("es")["experiences"];
export const metadata: Metadata = {
  title: `${t.heroTitle} | Cupontours`,
  description: t.heroSub,
  alternates: { canonical: "/es/services/experiences", languages: { en: "/services/experiences", es: "/es/services/experiences", "x-default": "/services/experiences" } },
};

export default function ExperiencesPageEs() {
  return <ExperiencesContent locale="es" />;
}
