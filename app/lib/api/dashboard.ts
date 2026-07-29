// lib/api/dashboard.ts
import { AuthResponse } from './login';

export interface DashboardData {
  listing_count: number;
  total_profit: number;
  reservations_count?: number;
  pending_reservations?: number;
  active_listings?: number;
  total_revenue?: number;
  monthly_growth?: number;
  recent_activities?: Activity[];
  chart_data?: ChartData;
  all_incomes_this_year?: number;
  all_nights?: number;
  upcoming_reservations?: Reservation[];
  check_in?: Reservation[];
  check_out?: Reservation[];
  reservations_data?: ReservationData[];
  // 🔥 NUEVOS CAMPOS CON LOS DATOS REALES DE TU API
  monthly_reservations_count?: {
    [key: string]: number;
  };
  monthly_sales?: {
    [key: string]: number;
  };
  [key: string]: unknown;
}

export interface Activity {
  id: string | number;
  type: 'reservation' | 'listing' | 'payment' | 'user';
  description: string;
  date: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface Reservation {
  id: string | number;
  listing_name: string;
  guest_name: string;
  start_date: string;
  end_date: string;
  earnings: string | number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  nights: number;
  number_of_guest: number;
}

export interface ReservationDataListing {
  id: string | number;
  name: string;
  listing_type?: string;
  address?: string | null;
  photo?: string | null;
  max_of_guest?: number | null;
  booking_price?: string | number;
  listing_status?: boolean;
}

export interface ReservationData {
  id: string | number;
  listing: ReservationDataListing;
  booked: string;
  start: string;
  end: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  confirmation_code?: string;
  reservation_type?: string;
  earnings?: string | number;
}

export interface MonthlyReservation {
  month: string;
  monthKey: string;
  year: number;
  count: number;
  revenue: number;
  nights: number;
}

// Cache para evitar múltiples peticiones
let dashboardCache: {
  data: DashboardData | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function getDashboardData(forceRefresh = false): Promise<DashboardData> {
  if (!forceRefresh && dashboardCache.data && (Date.now() - dashboardCache.timestamp) < CACHE_DURATION) {
    return dashboardCache.data;
  }

  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  let token: string | null = null;
  
  if (typeof window !== 'undefined') {
    const cookieToken = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
    if (cookieToken) {
      token = cookieToken.split('=')[1];
    }
    
    if (!token) {
      token = localStorage.getItem('accessToken');
    }
    
    if (!token || token === 'undefined' || token === 'null') {
      console.warn('⚠️ Token no válido');
      token = null;
    }
  }


  if (!token) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isUserLoggedIn');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      cache: 'no-store'
    });

    if (response.status === 401 || response.status === 403) {
      console.error('❌ Error de autenticación:', response.status);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isUserLoggedIn');
        localStorage.removeItem('userData');
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&error=session_expired`;
      }
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el dashboard'}`);
    }

    const data = await response.json();

    dashboardCache = {
      data: data,
      timestamp: Date.now()
    };

    return data;

  } catch (error) {
    console.error('❌ Error en getDashboardData:', error);
    
    if (dashboardCache.data) {
      return dashboardCache.data;
    }
    
    throw error;
  }
}

export function clearDashboardCache() {
  dashboardCache = {
    data: null,
    timestamp: 0
  };
}

export async function refreshDashboard() {
  clearDashboardCache();
  return getDashboardData(true);
}