// app/lib/api/dashboard.ts

// IMPORTANTE: Ajusta esta importación según cómo estés trayendo clientConfig 
// en tus otros archivos (cars.ts, properties.ts, etc.)
// import { clientConfig } from '@/config/client'; 

export interface DashboardData {
  tickets_count: number;
  total_profit: number;
  listing_count: number;
  cars_count: number;
  yachts_count: number;
  all_incomes_this_year: number;
  all_nights: number;
  ocuppancy_rate: number;
  monthly_sales: Record<string, number>;
  monthly_reservations_count: Record<string, number>;
  next_cleanings: any[];
  reservations_data: any[];
  listings: any[];
  cars: any[];
  yachts: any[];
  invoices: any[];
  check_in: any[];
  check_out: any[];
  upcoming_reservations: any[];
}

export async function getDashboardData(): Promise<DashboardData> {
  // Asumiendo que esta es tu URL base configurada.
  // const API_BASE_URL = clientConfig.api.baseUrl; 
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api';

  try {
    // Si necesitas caché dinámico (que siempre traiga data fresca en el panel), agregamos 'no-store'
    const response = await fetch(`${API_BASE_URL}/dashboard/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${tu_token_aqui}` <-- Listo para cuando conectemos el login
      },
      cache: 'no-store' 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DashboardData = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}