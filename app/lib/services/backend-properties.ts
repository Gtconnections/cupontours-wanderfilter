/**
 * Backend Properties Service (server-side)
 *
 * Reemplaza el consumo directo de Hostaway. Ahora el front lee las propiedades
 * desde NUESTRO backend Django, que mantiene el mirror sincronizado con Hostaway
 * y superpone el precio del pricing engine.
 *
 * El backend devuelve el mismo envelope que Hostaway
 * ({ status, result, count, limit, offset }), asi que el resto del front
 * (convertHostawayToPropertyCard, pagina de detalle) no cambia.
 */
import type { HostawayListing } from './hostaway';

const BACKEND_API_BASE =
  process.env.API_BASE_URL ||
  'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api';

export interface BackendListingsResponse {
  status: string;
  result: HostawayListing[];
  count: number;
  limit: number;
  offset: number;
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | undefined>
): string {
  const url = new URL(`${BACKEND_API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function getBackendListings(params?: {
  limit?: number;
  offset?: number;
  city?: string;
  country?: string;
}): Promise<BackendListingsResponse> {
  const url = buildUrl('/hostaway/listings/', {
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
    city: params?.city,
    country: params?.country,
  });

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }

  const json = await res.json();
  const result: HostawayListing[] = Array.isArray(json?.result) ? json.result : [];

  return {
    status: json?.status ?? 'success',
    result,
    count: typeof json?.count === 'number' ? json.count : result.length,
    limit: typeof json?.limit === 'number' ? json.limit : params?.limit ?? 50,
    offset: typeof json?.offset === 'number' ? json.offset : params?.offset ?? 0,
  };
}

export async function getBackendListing(
  id: string | number
): Promise<{ status: string; result: HostawayListing | null }> {
  const url = buildUrl(`/hostaway/listings/${id}/`);

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (res.status === 404) {
    return { status: 'fail', result: null };
  }
  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }

  const json = await res.json();
  return { status: json?.status ?? 'success', result: json?.result ?? null };
}
