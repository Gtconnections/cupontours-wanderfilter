// lib/api/claims.ts

export type ClaimStatus = 'started' | 'in process' | 'finished' | 'rejected';

export interface ClaimListing {
  id: number;
  name: string;
  description?: string;
  photo?: string | null;
  address?: string;
  owner?: string;
  beds?: number;
  bath?: number;
  cleaning_fee?: string | number;
  rent_price?: string | number;
  status?: string;
  property_id?: string;
}

export interface ClaimComment {
  comment_id: number;
  created_at: string;
  created_user_id: number;
  created_user_name: string;
  content: string;
}

export interface ClaimGalleryItem {
  gallery_id?: number;
  file_id?: number;
  file_url: string;
}

export interface Claim {
  claim_id: number;
  listing?: ClaimListing;
  car_id?: number;
  created_at: string;
  initial_date: string;
  name: string;
  code: string;
  description: string;
  status: ClaimStatus;
  final_message: string;
  comments: ClaimComment[];
  gallery: ClaimGalleryItem[];
}

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const cookieToken = document.cookie.split('; ').find((row) => row.startsWith('accessToken='));
  if (cookieToken) return cookieToken.split('=')[1];
  const storedToken = localStorage.getItem('accessToken');
  if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') return storedToken;
  return null;
};

/**
 * Trae los reclamos desde el backend (endpoint solo-staff).
 * El endpoint es GET /api/claims/?page=N. Hoy el backend responde con TODO el
 * arreglo (no pagina), pero se normaliza por si algún día llega paginado.
 */
export async function getClaims(page = 1): Promise<Claim[]> {
  const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL ||
    'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api'
  ).replace(/\/$/, '');

  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new Error('No hay sesión activa');
  }

  const url = `${API_BASE_URL}/claims/?page=${page}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    cache: 'no-store',
  });

  if (response.status === 401 || response.status === 403) {
    if (typeof window !== 'undefined' && response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isUserLoggedIn');
      localStorage.removeItem('userData');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&error=session_expired`;
    }
    throw new Error(
      response.status === 403
        ? 'No tienes permisos para ver los reclamos (requiere cuenta de staff).'
        : 'Sesión expirada. Inicia sesión nuevamente.'
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los reclamos'}`);
  }

  const data = await response.json();

  if (Array.isArray(data)) return data as Claim[];
  if (data && Array.isArray(data.results)) return data.results as Claim[];
  if (data && Array.isArray(data.claims)) return data.claims as Claim[];
  return [];
}
