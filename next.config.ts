import type { NextConfig } from "next";

// ── Content Security Policy (modo REPORT-ONLY) ──────────────────────────────
// Empieza en Report-Only: NO bloquea nada, solo reporta violaciones en la
// consola del navegador. Deja correr unos dias, revisa la consola, ajusta las
// fuentes que falten y recien entonces cambia la cabecera a
// "Content-Security-Policy" (sin -Report-Only) para hacerla efectiva.
const csp = [
  "default-src 'self'",
  // Next.js necesita inline/eval para hidratacion; Vercel insights para analitica.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  // Imagenes: Cloudinary + DigitalOcean Spaces + data/blob.
  "img-src 'self' data: blob: https://res.cloudinary.com https://cp-prd-ny.nyc3.digitaloceanspaces.com https:",
  "font-src 'self' data:",
  // API del backend + telemetria de Vercel.
  "connect-src 'self' https://gthomework.com https://*.vercel-insights.com https://va.vercel-scripts.com",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // CSP en modo reporte (no bloquea). Cambiar a "Content-Security-Policy"
  // cuando la consola este limpia.
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  /* config options here */

  // Cabeceras de seguridad para todas las rutas.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // 301 permanentes: rutas del sitio viejo -> equivalentes actuales.
  // Blinda el www nuevo ante hits desde el índice de Google o backlinks
  // que aún apunten a las rutas antiguas.
  async redirects() {
    return [
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/terms-and-conditions", destination: "/terms", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
    ];
  },
};

export default nextConfig;
