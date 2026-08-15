/**
 * Tracking centralizado: Google Tag Manager + Meta (Facebook) Pixel.
 *
 * Todo queda INERTE si no hay IDs configurados (NEXT_PUBLIC_GTM_ID /
 * NEXT_PUBLIC_META_PIXEL_ID en .env.local). Las funciones son seguras en
 * servidor (guardan `window`) y no fallan si el pixel/GTM aún no cargó.
 */
import { clientConfig } from "@/app/lib/config";

export const GTM_ID = clientConfig.analytics.gtmId;
export const META_PIXEL_ID = clientConfig.analytics.metaPixelId;
export const ANALYTICS_ENABLED = Boolean(GTM_ID || META_PIXEL_ID);

type Params = Record<string, unknown>;

interface WindowWithTracking extends Window {
  dataLayer?: Params[];
  fbq?: (...args: unknown[]) => void;
}

function getWindow(): WindowWithTracking | null {
  return typeof window === "undefined"
    ? null
    : (window as unknown as WindowWithTracking);
}

/** Empuja un evento al dataLayer de GTM. */
export function gtmEvent(event: string, params: Params = {}): void {
  const win = getWindow();
  if (!win) return;
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({ event, ...params });
}

/** Dispara un evento del Meta Pixel (estándar o personalizado). */
export function pixelEvent(
  name: string,
  params: Params = {},
  kind: "track" | "trackCustom" = "track"
): void {
  const win = getWindow();
  if (!win || typeof win.fbq !== "function") return;
  win.fbq(kind, name, params);
}

export interface TrackedItem {
  id: string | number;
  name: string;
  price?: number;
  currency?: string;
  category?: "property" | "car" | "yacht" | "jet" | string;
}

/** Vista de un producto (al abrir la página de detalle). */
export function trackViewContent(item: TrackedItem): void {
  const currency = item.currency || "USD";
  pixelEvent("ViewContent", {
    content_ids: [String(item.id)],
    content_name: item.name,
    content_type: "product",
    content_category: item.category,
    value: item.price,
    currency,
  });
  gtmEvent("view_content", {
    item_id: String(item.id),
    item_name: item.name,
    item_category: item.category,
    value: item.price,
    currency,
  });
}

/** Intención de reserva (clic en "Reservar" / "Solicitar"). */
export function trackAddToCart(item: TrackedItem): void {
  const currency = item.currency || "USD";
  pixelEvent("AddToCart", {
    content_ids: [String(item.id)],
    content_name: item.name,
    content_type: "product",
    content_category: item.category,
    value: item.price,
    currency,
  });
  gtmEvent("add_to_cart", {
    item_id: String(item.id),
    item_name: item.name,
    item_category: item.category,
    value: item.price,
    currency,
  });
}

/** Envío de formulario de contacto/reserva (lead). */
export function trackLead(item?: Partial<TrackedItem>): void {
  const currency = item?.currency || "USD";
  pixelEvent("Lead", {
    content_name: item?.name,
    value: item?.price,
    currency,
  });
  gtmEvent("generate_lead", {
    item_name: item?.name,
    value: item?.price,
    currency,
  });
}

/** PageView manual para la navegación SPA (App Router). */
export function trackPageView(url?: string): void {
  pixelEvent("PageView");
  gtmEvent("page_view", url ? { page_path: url } : {});
}
