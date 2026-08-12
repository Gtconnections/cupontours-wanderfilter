"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { localeFromPath } from "@/app/i18n/locale";

// Ajusta <html lang> según la ruta (en por defecto, es en /es).
export default function HtmlLang() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = localeFromPath(pathname);
  }, [pathname]);
  return null;
}
