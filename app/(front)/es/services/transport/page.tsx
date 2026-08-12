import type { Metadata } from "next";
import TransportContent from "../../../services/transport/TransportContent";
import { getServices } from "@/app/i18n/dictionaries";

const t = getServices("es")["transport"];
export const metadata: Metadata = {
  title: `${t.heroTitle} | Cupontours`,
  description: t.heroSub,
  alternates: { canonical: "/es/services/transport", languages: { en: "/services/transport", es: "/es/services/transport", "x-default": "/services/transport" } },
};

export default function TransportPageEs() {
  return <TransportContent locale="es" />;
}
