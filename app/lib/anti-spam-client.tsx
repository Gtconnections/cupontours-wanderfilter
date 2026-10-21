'use client';

/**
 * Anti-spam (Capa 1) del lado del cliente.
 *
 * useSpamGuard() entrega:
 *   - hpRef: ref para el campo honeypot oculto (<Honeypot inputRef={hpRef} />).
 *   - payload(): { _hp_url, _elapsed } para mezclar en el body del POST.
 *
 * El honeypot es un campo oculto que el humano no ve ni enfoca; si un bot lo
 * llena, el backend descarta el envio. _elapsed mide cuanto estuvo abierto el
 * formulario (un envio casi instantaneo delata al bot).
 */
import { useRef } from 'react';

export function useSpamGuard() {
  const hpRef = useRef<HTMLInputElement>(null);
  const mountedAt = useRef<number>(Date.now());

  const payload = (): { _hp_url: string; _elapsed: number } => ({
    _hp_url: hpRef.current?.value ?? '',
    _elapsed: Date.now() - mountedAt.current,
  });

  return { hpRef, payload };
}

export function Honeypot({ inputRef }: { inputRef: React.Ref<HTMLInputElement> }) {
  return (
    <input
      ref={inputRef}
      type="text"
      name="_hp_url"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      defaultValue=""
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
