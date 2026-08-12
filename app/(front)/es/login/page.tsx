import type { Metadata } from "next";
import LoginContent from "../../login/LoginContent";

export const metadata: Metadata = {
  title: "Iniciar sesión | Cupontours",
  description: "Inicia sesión en tu cuenta de Cupontours para gestionar reservas, propiedades y servicios.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/es/login" },
};

export default function LoginPageEs() {
  return <LoginContent locale="es" />;
}
