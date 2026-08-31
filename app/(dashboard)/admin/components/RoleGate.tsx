'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';

// Rutas que un agente SÍ puede abrir dentro del back office.
const AGENT_ALLOWED = ['/admin/agents', '/admin/profile'];

function isAllowedForAgent(pathname: string): boolean {
  return AGENT_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/**
 * Guard de rol en cliente. Si el usuario es agente y entra a una sección que no
 * le corresponde, se le devuelve a su panel. No sustituye la seguridad del backend
 * (cada endpoint exige is_staff / pertenencia); solo evita que el agente navegue
 * por el back office completo.
 */
export default function RoleGate({ children }: { children: React.ReactNode }) {
  const { user, isChecking } = useAuth();
  const pathname = usePathname() || '';
  const router = useRouter();

  const position = String((user?.position as string) || '').toLowerCase();
  const isAgent = position === 'agent' || position === '4';
  const blocked = isAgent && !isAllowedForAgent(pathname);

  useEffect(() => {
    if (isChecking) return;
    if (blocked) router.replace('/admin/agents');
  }, [isChecking, blocked, router]);

  if (blocked) return null; // evita el flash de contenido no permitido durante el redirect
  return <>{children}</>;
}
