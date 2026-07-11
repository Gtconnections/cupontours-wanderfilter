// lib/api/cars.ts

export interface Car {
  id: number;
  brand: string;
  description: string | null;
  model: string;
  year: number;
  plate: string;
  miles: string;
  principal_image: string | null;
  rent_price: string;
  booking_price: string | null;
  status: 'available' | 'business' | 'rented' | 'maintenance';
  external_id: string;
  owner: string;
}

export interface CarDetail extends Car {
  // Información adicional del detalle
  owner_id?: number;
  owner_email?: string;
  owner_phone?: string;
  total_deposits?: number;
  // Métricas financieras
  total_income?: number;
  total_expenses?: number;
  total_profit?: number;
}

export interface CarsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Car[];
}

export interface CarsFilters {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
}

// Cache para autos
let carsCache: {
  data: CarsResponse | null;
  timestamp: number;
  cacheKey: string;
} = {
  data: null,
  timestamp: 0,
  cacheKey: ''
};

let carDetailCache: {
  data: CarDetail | null;
  timestamp: number;
  carId: number | null;
} = {
  data: null,
  timestamp: 0,
  carId: null
};

const CACHE_DURATION = 30 * 1000; // 30 segundos
const DETAIL_CACHE_DURATION = 60 * 1000; // 1 minuto

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const cookieToken = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
  if (cookieToken) {
    return cookieToken.split('=')[1];
  }
  
  const storedToken = localStorage.getItem('accessToken');
  if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
    return storedToken;
  }
  
  return null;
};

export async function getCars(filters: CarsFilters = {}, forceRefresh = false): Promise<CarsResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  const params = new URLSearchParams();
  params.append('paginated', 'True');
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.page_size) params.append('page_size', filters.page_size.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.search && filters.search.trim()) {
    params.append('brand__icontains', filters.search.trim());
  }
  
  const queryString = params.toString();
  const cacheKey = queryString || 'default';

  if (!forceRefresh && carsCache.data && carsCache.cacheKey === cacheKey && (Date.now() - carsCache.timestamp) < CACHE_DURATION) {
    console.log('📦 Usando caché de autos');
    return carsCache.data;
  }

  try {
    const url = `${API_BASE_URL}/cars/${queryString ? `?${queryString}` : ''}`;
    console.log('📡 Fetching cars:', url);

    const response = await fetch(url, {
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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los autos'}`);
    }

    const data = await response.json();
    console.log('✅ Autos recibidos:', data);

    carsCache = {
      data: data,
      timestamp: Date.now(),
      cacheKey: cacheKey
    };

    return data;

  } catch (error) {
    console.error('❌ Error en getCars:', error);
    
    if (carsCache.data) {
      console.log('📦 Usando caché por error de red');
      return carsCache.data;
    }
    
    throw error;
  }
}

// 🔥 OBTENER DETALLE DE UN AUTO POR ID
export async function getCarById(carId: number, forceRefresh = false): Promise<CarDetail> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  // Verificar caché
  if (!forceRefresh && carDetailCache.data && carDetailCache.carId === carId && (Date.now() - carDetailCache.timestamp) < DETAIL_CACHE_DURATION) {
    console.log('📦 Usando caché del auto:', carId);
    return carDetailCache.data;
  }

  try {
    const url = `${API_BASE_URL}/cars/${carId}/`;
    console.log('📡 Fetching car detail:', url);

    const response = await fetch(url, {
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

    if (response.status === 404) {
      throw new Error(`Auto con ID ${carId} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el auto'}`);
    }

    const data = await response.json();
    console.log('✅ Auto detalle recibido:', data);

    // Enriquecer los datos con información adicional
    const carDetail: CarDetail = {
      ...data,
      // Si la respuesta no tiene estos campos, los agregamos con valores por defecto
      owner_id: data.owner_id || data.user?.id || null,
      owner_email: data.owner_email || data.user?.email || null,
      owner_phone: data.owner_phone || data.user?.phone || null,
      total_deposits: data.total_deposits || 0,
      total_income: data.total_income || 0,
      total_expenses: data.total_expenses || 0,
      total_profit: data.total_profit || 0,
    };

    carDetailCache = {
      data: carDetail,
      timestamp: Date.now(),
      carId: carId
    };

    return carDetail;

  } catch (error) {
    console.error('❌ Error en getCarById:', error);
    
    if (carDetailCache.data && carDetailCache.carId === carId) {
      console.log('📦 Usando caché por error de red');
      return carDetailCache.data;
    }
    
    throw error;
  }
}

export function clearCarsCache() {
  carsCache = {
    data: null,
    timestamp: 0,
    cacheKey: ''
  };
  carDetailCache = {
    data: null,
    timestamp: 0,
    carId: null
  };
  console.log('🧹 Caché de autos limpiada');
}

export async function refreshCars(filters: CarsFilters = {}) {
  clearCarsCache();
  return getCars(filters, true);
}

export async function refreshCarDetail(carId: number) {
  carDetailCache = {
    data: null,
    timestamp: 0,
    carId: null
  };
  return getCarById(carId, true);
}