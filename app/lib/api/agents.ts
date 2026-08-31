// lib/api/agents.ts — Dashboard de agentes (comisiones, asignación, vista del agente)

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api'
).replace(/\/$/, '');

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
    if (typeof window !== 'undefined') window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    throw new Error('No hay sesión activa');
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}`, ...(options.headers || {}) },
    cache: 'no-store',
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error(res.status === 403 ? 'No tienes permisos (requiere staff).' : 'Sesión expirada.');
  }
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try { const j = await res.json(); msg = j.error || j.detail || msg; } catch { /* */ }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export interface AgentLite {
  id: number;
  name: string | null;
  email: string;
}

export interface CommissionPayment {
  id: number;
  agent: number;
  agent_name: string | null;
  listing: number | null;
  listing_name: string | null;
  amount: string;
  period: string;
  paid_at: string | null;
  status: 'pending' | 'paid';
  note: string;
  document_url: string | null;
  created_at: string;
}

export interface AgentListing {
  id: number;
  name: string;
  public_name: string;
  commission_pct: string;
  last_pl: {
    date: string | null;
    total_income: string;
    income_minus_expenses: string;
    partner_net: string;
  } | null;
  agreement: { title: string; expiration_date: string | null; url: string | null } | null;
}

export interface AgentDashboard {
  agent: { id: number; name: string | null; email: string };
  totals: { listings: number; commission_paid: number; commission_pending: number };
  listings: AgentListing[];
  commissions: CommissionPayment[];
}

export async function getAgents(): Promise<AgentLite[]> {
  const d = await request('/agents/');
  return d.agents || [];
}

export async function getAgentDashboard(agentId?: number): Promise<AgentDashboard> {
  const q = agentId ? `?agent=${agentId}` : '';
  return request(`/agents/me/dashboard/${q}`);
}

export interface AgentListingDetail {
  id: number;
  name: string;
  public_name: string;
  listing_type: string | null;
  address: string | null;
  status: string | null;
  beds: number | null;
  bath: number | null;
  max_of_guest: number | null;
  rent_price: string;
  description: string;
  commission_pct: string;
  principal_photo: string | null;
  photos: string[];
  agreement: { title: string; expiration_date: string | null; url: string | null } | null;
  pl_history: {
    date: string | null;
    total_income: string;
    total_expenses: string;
    income_minus_expenses: string;
    partner_net: string;
  }[];
}

export async function getAgentListing(listingId: number): Promise<AgentListingDetail> {
  return request(`/agents/me/listings/${listingId}/`);
}

export async function assignAgent(
  listingId: number,
  agentId: number | null,
  commission: number | string,
) {
  return request(`/agents/listings/${listingId}/assign/`, {
    method: 'POST',
    body: JSON.stringify({ agent_id: agentId, agent_commission: commission }),
  });
}

export async function getCommissions(params: { agent?: number; listing?: number } = {}): Promise<CommissionPayment[]> {
  const qs = new URLSearchParams();
  if (params.agent) qs.set('agent', String(params.agent));
  if (params.listing) qs.set('listing', String(params.listing));
  const q = qs.toString() ? `?${qs.toString()}` : '';
  const d = await request(`/agents/commissions/${q}`);
  return d.commissions || [];
}

export interface CommissionInput {
  agent: number;
  listing?: number | null;
  amount: number | string;
  period?: string;
  paid_at?: string | null;
  status?: 'pending' | 'paid';
  note?: string;
}

export async function createCommission(payload: CommissionInput) {
  return request('/agents/commissions/', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateCommission(id: number, payload: Partial<CommissionInput>) {
  return request(`/agents/commissions/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteCommission(id: number) {
  return request(`/agents/commissions/${id}/`, { method: 'DELETE' });
}
