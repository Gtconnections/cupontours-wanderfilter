import type { Metadata } from "next";
import HealthContent from "../../../services/health/HealthContent";
import { getServices } from "@/app/i18n/dictionaries";

const t = getServices("es")["health"];
export const metadata: Metadata = {
  title: `${t.heroTitle} | Cupontours`,
  description: t.heroSub,
  alternates: { canonical: "/es/services/health", languages: { en: "/services/health", es: "/es/services/health", "x-default": "/services/health" } },
};

export default function HealthPageEs() {
  return <HealthContent locale="es" />;
}
