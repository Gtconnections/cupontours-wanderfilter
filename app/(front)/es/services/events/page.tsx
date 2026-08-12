import type { Metadata } from "next";
import EventsContent from "../../../services/events/EventsContent";
import { getServices } from "@/app/i18n/dictionaries";

const t = getServices("es")["events"];
export const metadata: Metadata = {
  title: `${t.heroTitle} | Cupontours`,
  description: t.heroSub,
  alternates: { canonical: "/es/services/events", languages: { en: "/services/events", es: "/es/services/events", "x-default": "/services/events" } },
};

export default function EventsPageEs() {
  return <EventsContent locale="es" />;
}
