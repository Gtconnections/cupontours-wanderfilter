'use client';

import { useAuth } from './useAuth';

/**
 * El perfil OWNER (socio) es solo-lectura: no puede crear, editar ni eliminar
 * registros (propiedades, reservas, facturas, P&L, etc.). Este hook indica si el
 * usuario actual es owner, para ocultar los controles de manipulacion.
 * (La seguridad real la impone el backend; esto es la capa de UI.)
 */
export function useIsOwner(): boolean {
  const { user } = useAuth();
  const position = String((user?.position as string) || '').toLowerCase();
  return position === 'owner' || position === '2';
}
