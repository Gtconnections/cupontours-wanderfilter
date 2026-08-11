import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

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
