"use client";

import { useEffect, useState } from "react";

interface SmartImageProps {
  src?: string | null;
  alt: string;
  /** Imagen de respaldo si la principal falla al cargar. */
  fallbackSrc?: string;
  /** Atributo sizes para el optimizador (responsive). */
  sizes?: string;
  className?: string;
  /** true = above-the-fold (LCP): precarga + fetchpriority high, sin lazy. */
  priority?: boolean;
  objectFit?: "cover" | "contain";
}

/**
 * Imagen de catalogo cargada directamente con <img> (sin pasar por el
 * optimizador de next/image, porque las URLs que devuelve el backend se rompen
 * al optimizarse). Rellena el contenedor (position:relative) igual que el modo
 * `fill` de next/image y mantiene el respaldo onError via estado.
 */
export default function SmartImage({
  src,
  alt,
  fallbackSrc,
  sizes,
  className,
  priority = false,
  objectFit = "cover",
}: SmartImageProps) {
  const initial = src || fallbackSrc || "";
  const [imgSrc, setImgSrc] = useState(initial);

  useEffect(() => {
    setImgSrc(src || fallbackSrc || "");
  }, [src, fallbackSrc]);

  if (!imgSrc) return null;

  return (
    <img
      src={imgSrc}
      alt={alt}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit,
      }}
      onError={() => {
        if (fallbackSrc && imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
    />
  );
}
