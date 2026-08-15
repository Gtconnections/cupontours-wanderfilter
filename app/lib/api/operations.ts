// lib/api/operations.ts — módulo de Operaciones / Mantenimiento

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

export interface Ticket {
  id: number;
  listing: number;
  listing_name: string;
  property_id: string | null;
  title: string;
  category: string;
  category_display: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  priority_display: string;
  description: string;
  status: 'abierto' | 'en_progreso' | 'resuelto';
  status_display: string;
  vendor: number | null;
  vendor_name: string | null;
  cost: string | null;
  resolution_note: string;
  created_at: string;
  resolved_at: string | null;
  photos: { id: number; image: string | null }[];
}

export interface TicketKpis { urgentes: number; abiertos: number; en_progreso: number; resueltos: number; stock_bajo: number; }
export interface TicketsResponse { kpis: TicketKpis; tickets: Ticket[]; }
export interface Vendor { id: number; name: string; category: string; phone: string; email: string; notes: string; is_active: boolean; }

export function getTickets(filters: { listing_id?: number; status?: string; priority?: string; search?: string } = {}): Promise<TicketsResponse> {
  const p = new URLSearchParams();
  if (filters.listing_id) p.append('listing_id', String(filters.listing_id));
  if (filters.status) p.append('status', filters.status);
  if (filters.priority) p.append('priority', filters.priority);
  if (filters.search) p.append('search', filters.search);
  const q = p.toString();
  return request(`/ops/tickets/${q ? `?${q}` : ''}`);
}

export function createTicket(payload: { listing: number; title: string; category: string; priority: string; description: string }): Promise<Ticket> {
  return request('/ops/tickets/', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateTicket(id: number, payload: Partial<{ status: string; vendor: number | null; priority: string; category: string; cost: string | number | null; resolution_note: string }>): Promise<Ticket> {
  return request(`/ops/tickets/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function getVendors(): Promise<Vendor[]> {
  return request('/ops/vendors/');
}

export function createVendor(payload: { name: string; category?: string; phone?: string; email?: string; notes?: string }): Promise<Vendor> {
  return request('/ops/vendors/', { method: 'POST', body: JSON.stringify(payload) });
}

export interface InventoryItem {
  id: number;
  listing: number | null;
  listing_name: string;
  name: string;
  category: string;
  category_display: string;
  unit: string;
  current_qty: string;
  min_qty: string;
  unit_cost: string | null;
  low_stock: boolean;
  updated_at: string;
}

export interface InventoryResponse { stock_bajo: number; items: InventoryItem[]; }

export function getInventory(filters: { listing_id?: number; search?: string; low_stock?: boolean } = {}): Promise<InventoryResponse> {
  const p = new URLSearchParams();
  if (filters.listing_id) p.append('listing_id', String(filters.listing_id));
  if (filters.search) p.append('search', filters.search);
  if (filters.low_stock) p.append('low_stock', '1');
  const q = p.toString();
  return request(`/ops/inventory/${q ? `?${q}` : ''}`);
}

export function createInventoryItem(payload: { name: string; listing?: number | null; category?: string; unit?: string; current_qty?: number; min_qty?: number; unit_cost?: number | null }): Promise<InventoryItem> {
  return request('/ops/inventory/', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateInventoryItem(id: number, payload: Partial<{ name: string; listing: number | null; category: string; unit: string; current_qty: number; min_qty: number; unit_cost: number | null }>): Promise<InventoryItem> {
  return request(`/ops/inventory/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function deleteInventoryItem(id: number): Promise<null> {
  return request(`/ops/inventory/${id}/`, { method: 'DELETE' });
}

export interface ChecklistTemplateItem { id: number; text: string; order: number; }
export interface ChecklistTemplate {
  id: number;
  name: string;
  type: string;
  type_display: string;
  is_active: boolean;
  item_count: number;
  items: ChecklistTemplateItem[];
  created_at: string;
}
export interface ChecklistItem { id: number; text: string; order: number; done: boolean; }
export interface Checklist {
  id: number;
  listing: number;
  listing_name: string;
  template: number | null;
  name: string;
  type: string;
  type_display: string;
  status: 'open' | 'completed';
  status_display: string;
  total_items: number;
  done_items: number;
  items: ChecklistItem[];
  created_at: string;
  completed_at: string | null;
}

export function getChecklistTemplates(): Promise<ChecklistTemplate[]> {
  return request('/ops/checklist-templates/');
}

export function createChecklistTemplate(payload: { name: string; type: string; items: string[] }): Promise<ChecklistTemplate> {
  return request('/ops/checklist-templates/', { method: 'POST', body: JSON.stringify(payload) });
}

export function deleteChecklistTemplate(id: number): Promise<null> {
  return request(`/ops/checklist-templates/${id}/`, { method: 'DELETE' });
}

export function getChecklists(filters: { listing_id?: number; status?: string; type?: string } = {}): Promise<Checklist[]> {
  const p = new URLSearchParams();
  if (filters.listing_id) p.append('listing_id', String(filters.listing_id));
  if (filters.status) p.append('status', filters.status);
  if (filters.type) p.append('type', filters.type);
  const q = p.toString();
  return request(`/ops/checklists/${q ? `?${q}` : ''}`);
}

export function createChecklist(payload: { listing: number; template: number; name?: string }): Promise<Checklist> {
  return request('/ops/checklists/', { method: 'POST', body: JSON.stringify(payload) });
}

export function setChecklistItem(id: number, itemId: number, done: boolean): Promise<Checklist> {
  return request(`/ops/checklists/${id}/`, { method: 'PATCH', body: JSON.stringify({ item_id: itemId, done }) });
}

export function setChecklistStatus(id: number, status: 'open' | 'completed'): Promise<Checklist> {
  return request(`/ops/checklists/${id}/`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export function deleteChecklist(id: number): Promise<null> {
  return request(`/ops/checklists/${id}/`, { method: 'DELETE' });
}

export interface Turnover {
  listing: number;
  listing_name: string;
  checkout_date: string;
  departing_code: string;
  next_checkin: string | null;
  next_code: string | null;
  gap_days: number | null;
  same_day: boolean;
  status: 'pending' | 'scheduled' | 'in_progress' | 'done';
  status_display: string;
  cleaner: number | null;
  cleaner_name: string | null;
  notes: string;
  checklist: number | null;
  checklist_done: number;
  checklist_total: number;
}
export interface TurnoverSummary { today: number; next7: number; same_day: number; unassigned: number; }
export interface TurnoversResponse { summary: TurnoverSummary; turnovers: Turnover[]; }
export interface TurnoverOverlay {
  listing: number;
  checkout_date: string;
  status: string;
  status_display: string;
  cleaner: number | null;
  cleaner_name: string | null;
  notes: string;
  checklist: number | null;
  checklist_done: number;
  checklist_total: number;
}

export function getTurnovers(filters: { days?: number; listing_id?: number; status?: string } = {}): Promise<TurnoversResponse> {
  const p = new URLSearchParams();
  if (filters.days) p.append('days', String(filters.days));
  if (filters.listing_id) p.append('listing_id', String(filters.listing_id));
  if (filters.status) p.append('status', filters.status);
  const q = p.toString();
  return request(`/ops/turnovers/${q ? `?${q}` : ''}`);
}

export function updateTurnover(payload: {
  listing_id: number;
  checkout_date: string;
  status?: string;
  cleaner?: number | null;
  notes?: string;
  template?: number;
}): Promise<TurnoverOverlay> {
  return request('/ops/turnovers/', { method: 'PATCH', body: JSON.stringify(payload) });
}

export interface AttentionTurnover { listing_name: string; checkout_date: string; next_checkin: string | null; same_day: boolean; is_today: boolean; status: string; cleaner_name: string | null; }
export interface AttentionTicket { id: number; title: string; listing_name: string; priority: string; status: string; category: string; vendor_name: string | null; }
export interface AttentionLowStock { id: number; name: string; listing_name: string; current_qty: string; min_qty: string; unit: string; }
export interface AttentionCheckin { listing_name: string; start_date: string; confirmation_code: string; guests: number; }
export interface AttentionCounts { turnovers_today: number; same_day: number; urgent_tickets: number; open_tickets: number; low_stock: number; checkins_soon: number; }
export interface AttentionData {
  turnovers: AttentionTurnover[];
  tickets: AttentionTicket[];
  low_stock: AttentionLowStock[];
  checkins: AttentionCheckin[];
  counts: AttentionCounts;
}

export function getAttention(): Promise<AttentionData> {
  return request('/ops/attention/');
}

export interface GuestListItem {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  reservations: number;
  property_reservations: number;
  yacht_reservations: number;
  total_spend: string;
  incidentals_total: string;
}
export interface GuestReservation {
  type: 'property' | 'yacht';
  listing_name?: string;
  yacht_name?: string;
  confirmation_code?: string;
  start_date?: string;
  end_date?: string | null;
  date?: string;
  duration?: string;
  nights?: number;
  guests?: number;
  earnings: string;
  status?: string;
  occasion?: string;
}
export interface GuestIncidental { id: number; title: string; amount: string; date: string | null; notes: string; created_at: string; }
export interface GuestDetail {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  notes: string;
  created_at: string;
  property_reservations: GuestReservation[];
  yacht_reservations: GuestReservation[];
  incidentals: GuestIncidental[];
  totals: { reservations: number; total_spend: string; incidentals_total: string };
}

export function getGuests(search?: string): Promise<{ guests: GuestListItem[] }> {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`/ops/guests/${q}`);
}
export function createGuest(payload: { full_name: string; email: string; phone?: string; notes?: string }): Promise<GuestListItem> {
  return request('/ops/guests/', { method: 'POST', body: JSON.stringify(payload) });
}
export function getGuest(id: number): Promise<GuestDetail> {
  return request(`/ops/guests/${id}/`);
}
export function updateGuest(id: number, payload: Partial<{ full_name: string; phone: string; notes: string }>): Promise<GuestDetail> {
  return request(`/ops/guests/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}
export function deleteGuest(id: number): Promise<null> {
  return request(`/ops/guests/${id}/`, { method: 'DELETE' });
}
export function addIncidental(guestId: number, payload: { title: string; amount?: number; date?: string; notes?: string }): Promise<GuestIncidental> {
  return request(`/ops/guests/${guestId}/incidentals/`, { method: 'POST', body: JSON.stringify(payload) });
}
export function deleteIncidental(incidentalId: number): Promise<null> {
  return request(`/ops/guests/incidentals/${incidentalId}/`, { method: 'DELETE' });
}

// ── Beta: clasificador de entrega de turno (solo clasifica, no crea nada) ──
export type HandoffBucket = 'urgente' | 'low_stock' | 'turnover' | 'checkin' | 'limpieza' | 'info';

export interface HandoffItem {
  bucket: HandoffBucket;
  title: string;
  property: string | null;
  listing_id: number | null;
  listing_name: string | null;
  category: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  resolved: boolean;
  action: string;
  excerpt: string;
  confidence: number | null;
}

export interface HandoffResult {
  model: string;
  count: number;
  items: HandoffItem[];
}

/** Envía el texto de la entrega de turno y devuelve la clasificación propuesta. */
export function classifyHandoff(text: string): Promise<HandoffResult> {
  return request('/ops/handoff/classify/', { method: 'POST', body: JSON.stringify({ text }) });
}
