import type { Metadata } from "next";
import RecoverContent from "../../recover-account/RecoverContent";

export const metadata: Metadata = {
  title: "Recuperar cuenta | Cupontours",
  description: "Recupera el acceso a tu cuenta de Cupontours.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/es/recover-account" },
};

export default function RecoverAccountPageEs() {
  return <RecoverContent locale="es" />;
}
