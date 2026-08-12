import type { Locale } from "./dictionaries";

// Rutas que YA tienen versión en español (se amplía conforme se traducen más).
export const ES_ROUTES = new Set<string>(["/"]);

export function localeFromPath(pathname: string): Locale {
  return pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";
}

/** Quita el prefijo /es de una ruta para obtener la ruta base en inglés. */
export function stripLocale(pathname: string): string {
  if (pathname === "/es") return "/";
  if (pathname.startsWith("/es/")) return pathname.slice(3);
  return pathname;
}

/** Antepone /es a un href interno cuando el locale es es. */
export function withLocale(href: string, locale: Locale): string {
  if (locale !== "es") return href;
  if (!href.startsWith("/")) return href; // externo o ancla
  if (href === "/") return "/es";
  return "/es" + href;
}
