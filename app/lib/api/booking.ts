// lib/api/booking.ts — widget de reserva propio (público, sin auth)

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api'
).replace(/\/$/, '');

export interface AvailabilityResult {
  available: boolean;
  nights: number;
  nightly_total: number;
  cleaning_fee: number;
  total: number;
  currency: string;
  nightly: { date: string; price: number | string | null; available: number | boolean | string }[];
}

export interface ReservationResult {
  success: boolean;
  reservation: {
    id: number | null;
    confirmation_code: number | string | null;
    arrival: string;
    departure: string;
    nights: number;
    total: number;
    currency: string;
  };
}

async function readError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    return j.error || j.detail || `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
}

export async function checkAvailability(listingId: number, start: string, end: string): Promise<AvailabilityResult> {
  const res = await fetch(`${API_BASE_URL}/hostaway/availability/?listing_id=${listingId}&start=${start}&end=${end}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export interface CreateReservationPayload {
  listing_id: number;
  arrival: string;
  departure: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  guests?: number;
  message?: string;
}

export async function createReservation(payload: CreateReservationPayload): Promise<ReservationResult> {
  const res = await fetch(`${API_BASE_URL}/hostaway/create-reservation/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}
