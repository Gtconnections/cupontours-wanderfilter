import { clientConfig } from "../config";
const API_BASE_URL = clientConfig.api.baseUrl;

export type YachtDuration = 'full_day' | 'half_day_in_the_morning' | 'half_day_in_the_afternoon';

export interface YachtDayAvail { full_day: boolean; morning: boolean; afternoon: boolean; }

export interface YachtAvailability {
  yacht_id: number;
  year: number;
  month: number;
  price_full_day: string;
  price_half_day: string;
  days: Record<string, YachtDayAvail>; // solo dias reservados; el resto = libre
}

export interface YachtReservationResult {
  id: number;
  yacht_id: number;
  date: string;
  duration: string;
  earnings: string;
  first_name: string;
  last_name: string;
}

export async function getYachtAvailability(yachtId: number, year: number, month: number): Promise<YachtAvailability> {
  const res = await fetch(`${API_BASE_URL}/landing/yachts/${yachtId}/availability/?year=${year}&month=${month}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Could not load availability');
  return res.json();
}

export async function createYachtReservation(payload: {
  yacht_id: number;
  date: string;
  duration: YachtDuration;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  occasion: string;
  observation?: string;
}): Promise<YachtReservationResult> {
  const res = await fetch(`${API_BASE_URL}/landing/yachts/reserve/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Could not create reservation');
  return data;
}
