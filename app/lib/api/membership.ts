export interface MembershipPlan {
  id: number;
  name: string;
  slug: string | null;
  principal_image: string | null;
  price: string;
  period: string;
  benefits: string[];
  featured: number | boolean;
  icon: string | null;
  sort_order: number;
  description: string | null;
  status: string;
}

export async function getMembresias(): Promise<MembershipPlan[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL_LOCAL || 'https://gthomework.com/api';
  try {
    const response = await fetch(`${API_BASE}/membresias?status=activo`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data: MembershipPlan[] = await response.json();
    return data.sort((a, b) => a.sort_order - b.sort_order);
  } catch (error) {
    console.error('Error al obtener membresías:', error);
    return [];
  }
}

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
