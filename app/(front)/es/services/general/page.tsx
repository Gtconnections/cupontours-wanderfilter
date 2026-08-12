import type { Metadata } from "next";
import GeneralContent from "../../../services/general/GeneralContent";
import { getServices } from "@/app/i18n/dictionaries";

const t = getServices("es")["general"];
export const metadata: Metadata = {
  title: `${t.heroTitle} | Cupontours`,
  description: t.heroSub,
  alternates: { canonical: "/es/services/general", languages: { en: "/services/general", es: "/es/services/general", "x-default": "/services/general" } },
};

export default function GeneralPageEs() {
  return <GeneralContent locale="es" />;
}
