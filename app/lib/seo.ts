import type { Metadata } from 'next';

/**
 * Configuración SEO central del sitio.
 * Dominio canónico oficial: www (el apex redirige a www en Vercel).
 */
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cupontours.com').replace(/\/$/, '');
export const SITE_NAME = 'Cupontours';

// Imagen por defecto para compartir (Open Graph / Twitter). Por ahora el logo;
// se puede reemplazar por una imagen 1200x630 diseñada.
export const DEFAULT_OG_IMAGE =
  process.env.NEXT_PUBLIC_OG_IMAGE ||
  `${SITE_URL}/og-default.jpg`;

interface PageMetaInput {
  /** Título de la página SIN el sufijo de marca (el template agrega "| Cupontours"). */
  title: string;
  description: string;
  /** Ruta relativa para el canonical, ej "/terms". Si se omite, no se emite canonical. */
  path?: string;
  /** Override de imagen para compartir. */
  image?: string;
  /** true = no indexar (páginas privadas/legales que no quieras en Google). */
  noindex?: boolean;
  keywords?: string[];
  languages?: Record<string, string>;
}

/**
 * Arma un objeto Metadata completo y consistente para una página:
 * title, description, canonical, Open Graph, Twitter Cards y robots.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  noindex,
  keywords,
  languages,
}: PageMetaInput): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const ogImage = image || DEFAULT_OG_IMAGE;
  const canonical = path ? path : undefined;

  return {
    title: fullTitle,
    description,
    ...(keywords && keywords.length ? { keywords } : {}),
    ...((canonical || languages) ? { alternates: { ...(canonical ? { canonical } : {}), ...(languages ? { languages } : {}) } } : {}),
    openGraph: {
      title: fullTitle,
      description,
      url: canonical || SITE_URL,
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: ogImage, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/** Limpia HTML y recorta un texto para usarlo como meta description. */
export function metaDescription(text: string | undefined | null, fallback: string, max = 160): string {
  if (!text) return fallback;
  const clean = String(text).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean;
}

/** Extrae un número de un precio en string ("$199 / day", "$11,500") o número. */
export function parsePrice(s: string | number | undefined | null): number | undefined {
  if (typeof s === 'number') return s;
  if (!s) return undefined;
  const m = String(s).replace(/,/g, '').match(/[\d.]+/);
  return m ? parseFloat(m[0]) : undefined;
}
