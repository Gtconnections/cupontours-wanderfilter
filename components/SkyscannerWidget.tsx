"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * Verticales soportados por el MultiVerticalWidget de Skyscanner.
 * (Skyscanner NO ofrece "packages" en este widget.)
 */
export type SkyscannerVertical = "flights" | "hotels" | "cars";

export interface SkyscannerColors {
  /** Fondo del panel del widget */
  colour: string;
  /** Color de texto */
  fontColour: string;
  /** Fondo del botón de búsqueda */
  buttonColour: string;
  /** Texto del botón de búsqueda */
  buttonFontColour: string;
}

export interface SkyscannerWidgetProps {
  /** Verticales/pestañas visibles. El orden define el orden de las pestañas. */
  verticals?: SkyscannerVertical[];
  /** Pestaña abierta por defecto. */
  defaultTab?: SkyscannerVertical;
  /** Locale del widget (idioma). Ej: "en-US", "es-ES". */
  locale?: string;
  /** Mercado / dominio de Skyscanner. Ej: "US", "CO". */
  market?: string;
  /** Moneda de los redirects. Ej: "USD". */
  currency?: string;
  /** Associate / Partner ID para el tracking de afiliado. */
  associateId?: string;
  /** Radio de las esquinas del widget (px). */
  borderRadius?: number;
  /** Escala del widget (multiplicador, ej: 1.1). */
  scale?: number;
  /** Overrides de colores por tema (opcional; se mezclan con la paleta por defecto). */
  colors?: Partial<Record<"light" | "dark", Partial<SkyscannerColors>>>;
  /** Clases extra para el contenedor. */
  className?: string;
}

const LOADER_ID = "skyscanner-widget-loader";
const LOADER_SRC = "https://widgets.skyscanner.net/widget-server/js/loader.js";

/** Paleta por defecto alineada a la marca (dorado) y a las superficies del sitio. */
const DEFAULT_COLORS: Record<"light" | "dark", SkyscannerColors> = {
  light: {
    colour: "#ffffff",
    fontColour: "#222222",
    buttonColour: "#d4af37",
    buttonFontColour: "#0a0a0b",
  },
  dark: {
    colour: "#141416",
    fontColour: "#ece7dd",
    buttonColour: "#d4af37",
    buttonFontColour: "#0a0a0b",
  },
};

/**
 * SkyscannerWidget — Multi-vertical (vuelos / hoteles / autos).
 *
 * Gestiona automáticamente:
 *  - La carga del script loader de Skyscanner.
 *  - La reconstrucción del widget en transiciones de ruta (App Router) y al
 *    cambiar el tema claro/oscuro (el loader sólo escanea el DOM al ejecutarse,
 *    así que re-inyectamos el loader y remontamos el contenedor con `key`).
 *
 * Nota: el loader de Skyscanner puede devolver 403 en `localhost` (protección
 * anti-bot) y renderiza correctamente una vez desplegado.
 */
export default function SkyscannerWidget({
  verticals = ["flights", "hotels", "cars"],
  defaultTab,
  locale = "en-US",
  market = "US",
  currency = "USD",
  associateId = "",
  borderRadius = 16,
  scale,
  colors,
  className = "",
}: SkyscannerWidgetProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const mode: "light" | "dark" = theme === "dark" ? "dark" : "light";
  const palette: SkyscannerColors = {
    ...DEFAULT_COLORS[mode],
    ...(colors?.[mode] ?? {}),
  };

  // Clave única: cambia con la ruta, el tema y la configuración. Al cambiar,
  // React remonta el contenedor (nodo limpio) y el efecto re-inyecta el loader.
  const renderKey = [
    pathname,
    mode,
    verticals.join(","),
    defaultTab ?? "",
    locale,
    market,
    currency,
    associateId,
    borderRadius,
    scale ?? "",
    palette.colour,
    palette.fontColour,
    palette.buttonColour,
    palette.buttonFontColour,
  ].join("|");

  useEffect(() => {
    // Re-inyectar el loader fuerza un nuevo escaneo del DOM y (re)construye
    // cualquier contenedor [data-skyscanner-widget] aún sin inicializar.
    const previous = document.getElementById(LOADER_ID);
    if (previous) previous.remove();

    const script = document.createElement("script");
    script.id = LOADER_ID;
    script.src = LOADER_SRC;
    script.async = true;
    document.body.appendChild(script);

    // Si una versión del loader expone una API de recarga, la usamos también.
    // (No está documentada oficialmente; sólo se llama si existe.)
    const w = window as unknown as { skyscanner?: { load?: () => void } };
    if (typeof w.skyscanner?.load === "function") {
      try {
        w.skyscanner.load();
      } catch {
        /* noop */
      }
    }

    return () => {
      const s = document.getElementById(LOADER_ID);
      if (s) s.remove();
    };
  }, [renderKey]);

  return (
    <div
      key={renderKey}
      ref={containerRef}
      className={`skyscanner-widget ${className}`.trim()}
      data-skyscanner-widget="MultiVerticalWidget"
      data-locale={locale}
      data-market={market}
      data-currency={currency}
      data-verticals={verticals.join(",")}
      data-colour={palette.colour}
      data-font-colour={palette.fontColour}
      data-button-colour={palette.buttonColour}
      data-button-font-colour={palette.buttonFontColour}
      data-widget-border-radius={String(borderRadius)}
      {...(defaultTab ? { "data-verticals-default-tab": defaultTab } : {})}
      {...(associateId ? { "data-associate-id": associateId } : {})}
      {...(scale ? { "data-widget-scale": String(scale) } : {})}
    />
  );
}
