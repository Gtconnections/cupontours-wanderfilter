// lib/api/pricing.ts  — Motor de precios (Fase 1)

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api'
).replace(/\/$/, '');

export interface PricingSettings {
  min_price: string;
  base_price: string;
  max_price: string;
  weekend_multiplier: string;
}

export interface DailyPrice {
  date: string;          // YYYY-MM-DD
  weekday: number;       // 0=Lun .. 6=Dom (python)
  is_weekend: boolean;
  is_booked: boolean;
  occupancy: number;
  suggested_price: string | null;
  price: string | null;
  source: 'auto' | 'manual';
}

export interface DailyResponse {
  listing_id: number;
  listing_name: string;
  month: string;
  settings: PricingSettings;
  days: DailyPrice[];
}

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const c = document.cookie.split('; ').find((r) => r.startsWith('accessToken='));
  if (c) return c.split('=')[1];
  const s = localStorage.getItem('accessToken');
  if (s && s !== 'undefined' && s !== 'null') return s;
  return null;
};

async function request(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new Error('No hay sesión activa');
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });
  if (res.status === 401 || res.status === 403) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&error=session_expired`;
    }
    throw new Error(res.status === 403 ? 'No tienes permisos (requiere cuenta de staff).' : 'Sesión expirada.');
  }
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const j = await res.json();
      msg = j.error || j.detail || msg;
    } catch {
      /* sin cuerpo JSON */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function getDailyPrices(listingId: number, month: string): Promise<DailyResponse> {
  return request(`/pricing/daily/?listing_id=${listingId}&month=${month}`);
}

export function savePricingSettings(p: {
  listing_id: number;
  min_price: number | string;
  base_price: number | string;
  max_price: number | string;
  weekend_multiplier: number | string;
}) {
  return request('/pricing/settings/', { method: 'PUT', body: JSON.stringify(p) });
}

export function saveDailyOverride(p: { listing_id: number; date: string; price: number | string }) {
  return request('/pricing/daily/', { method: 'PUT', body: JSON.stringify(p) });
}

export function deleteDailyOverride(listingId: number, date: string) {
  return request(`/pricing/daily/?listing_id=${listingId}&date=${date}`, { method: 'DELETE' });
}

// ---- Fase 2: Rules Engine ----
export interface PricingRules {
  enabled: boolean;
  last_minute_days: number | string;
  last_minute_discount: number | string;
  high_occupancy_threshold: number | string;
  high_occupancy_surge: number | string;
  low_occupancy_threshold: number | string;
  low_occupancy_discount: number | string;
  gap_night_discount: number | string;
  min_nights: number | string;
}

export interface DateRule {
  id: number;
  label: string;
  start_date: string;
  end_date: string;
  adjustment_percent: string;
  fixed_price: string | null;
}

export function getRules(listingId: number): Promise<PricingRules & { listing_id: number; exists: boolean }> {
  return request(`/pricing/rules/?listing_id=${listingId}`);
}

export function saveRules(p: PricingRules & { listing_id: number }) {
  return request('/pricing/rules/', { method: 'PUT', body: JSON.stringify(p) });
}

export function getDateRules(listingId: number): Promise<DateRule[]> {
  return request(`/pricing/date-rules/?listing_id=${listingId}`);
}

export function addDateRule(p: {
  listing_id: number; label: string; start_date: string; end_date: string;
  adjustment_percent: number | string; fixed_price: number | string | null;
}) {
  return request('/pricing/date-rules/', { method: 'POST', body: JSON.stringify(p) });
}

export function deleteDateRule(id: number) {
  return request(`/pricing/date-rules/?id=${id}`, { method: 'DELETE' });
}

export function generateRecommendations(p: {
  listing_id: number; start_date: string; end_date: string; overwrite_manual?: boolean;
}): Promise<{ success: boolean; generated: number }> {
  return request('/pricing/generate/', { method: 'POST', body: JSON.stringify(p) });
}
