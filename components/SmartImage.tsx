"use client";

import Image from "next/image";
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
 * Envoltura de next/image en modo `fill`. Reemplaza a <img> dentro de
 * contenedores que ya son position:relative con dimensiones (aspect-ratio /
 * padding-top). Mantiene el respaldo onError via estado (next/image no permite
 * reasignar .src directamente).
 */
export default function SmartImage({
  src,
  alt,
  fallbackSrc,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
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
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      style={{ objectFit }}
      onError={() => {
        if (fallbackSrc && imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
    />
  );
}
