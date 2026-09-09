'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';

// Rutas que un AGENTE sí puede abrir dentro del back office.
const AGENT_ALLOWED = ['/admin/agents', '/admin/profile'];
// Rutas que un OWNER sí puede abrir: todo lo de propiedades (el backend ya filtra
// a las suyas) y su perfil.
const OWNER_ALLOWED = ['/admin/properties', '/admin/profile'];

function matchesAny(pathname: string, list: string[]): boolean {
  return list.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/**
 * Guard de rol en cliente. Si el usuario es agente u owner y entra a una sección que
 * no le corresponde, se le devuelve a su panel. No sustituye la seguridad del backend
 * (cada endpoint exige is_staff / pertenencia); solo evita que naveguen por el back
 * office completo.
 */
export default function RoleGate({ children }: { children: React.ReactNode }) {
  const { user, isChecking } = useAuth();
  const pathname = usePathname() || '';
  const router = useRouter();

  const position = String((user?.position as string) || '').toLowerCase();
  const isAgent = position === 'agent' || position === '4';
  const isOwner = position === 'owner' || position === '2';

  let allowed: string[] | null = null;
  let home = '';
  if (isAgent) {
    allowed = AGENT_ALLOWED;
    home = '/admin/agents';
  } else if (isOwner) {
    allowed = OWNER_ALLOWED;
    home = '/admin/properties/list';
  }

  const blocked = allowed !== null && !matchesAny(pathname, allowed);

  useEffect(() => {
    if (isChecking) return;
    if (blocked && home) router.replace(home);
  }, [isChecking, blocked, home, router]);

  if (blocked) return null; // evita el flash de contenido no permitido durante el redirect
  return <>{children}</>;
}
