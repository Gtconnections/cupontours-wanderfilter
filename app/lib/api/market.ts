// lib/api/market.ts — cliente del módulo Market (Competitive Set / Market Intelligence)

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const cookieToken = document.cookie.split('; ').find(r => r.startsWith('accessToken='));
  if (cookieToken) return cookieToken.split('=')[1];
  const stored = localStorage.getItem('accessToken');
  if (stored && stored !== 'undefined' && stored !== 'null') return stored;
  return null;
}

export interface ListingMetrics {
  listing_id: number;
  property_id: string | null;
  name: string;
  window_days: number;
  adr: number;
  occupancy: number;
  revpar: number;
  revenue: number;
  nights_booked: number;
  forward_pacing: number;
  lat: number | null;
  lng: number | null;
  city: string | null;
  base_price: number | null;
  min_price: number | null;
  max_price: number | null;
}

export interface MarketBlock {
  provider: string;
  configured: boolean;
  comp_set?: { configured: boolean; pending?: boolean; message?: string; competitors: unknown[] };
  stats?: { configured: boolean; pending?: boolean; message?: string };
  events?: { configured: boolean; pending?: boolean; message?: string; events: unknown[] };
}

export interface CompetitiveSetResponse { you: ListingMetrics; market: MarketBlock; }
export interface MarketIntelligenceResponse {
  portfolio: {
    count: number; avg_adr: number; avg_occupancy: number; avg_revpar: number;
    total_revenue: number; listings: ListingMetrics[];
  };
  market: MarketBlock;
}

async function authGet<T>(path: string): Promise<T> {
  const token = getAuthToken();
  if (!token) throw new Error('No hay sesión activa');
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export function getMarketIntelligence(): Promise<MarketIntelligenceResponse> {
  return authGet<MarketIntelligenceResponse>('/market/intelligence/');
}

export function getCompetitiveSet(listingId: number): Promise<CompetitiveSetResponse> {
  return authGet<CompetitiveSetResponse>(`/market/competitive-set/${listingId}/`);
}
