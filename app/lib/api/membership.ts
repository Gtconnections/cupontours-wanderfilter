export interface MembershipVerification {
  valid: boolean;
  message?: string;
  estado?: 'activa' | 'vencida' | 'cancelada';
  cliente_nombre?: string;
  membresia?: string;
  fecha_inicio?: string;
  fecha_fin?: string | null;
}

export async function getMembershipVerification(hash: string): Promise<MembershipVerification> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL_LOCAL || 'https://gthomework.com/api';
  try {
    const response = await fetch(`${API_BASE}/suscripciones/${hash}/verificar`, { cache: 'no-store' });
    return await response.json();
  } catch (error) {
    console.error(`Error verifying membership ${hash}:`, error);
    return { valid: false, message: 'Connection error' };
  }
}
