// lib/api/carsAdmin.ts

import { RawApiItem } from "../types/raw";

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

export interface CarDetail {
  car_id: number;
  brand: string;
  description: string | null;
  model: string;
  year: number;
  plate: string;
  miles: number;
  principal_image: string | null;
  car_images: string[];
  rent_price: number;
  booking_price: number | null;
  status: 'available' | 'business' | 'rented' | 'maintenance';
  external_id: string;
  owner_id: number;
  full_name: string;
  phone_number: string;
  email: string;
  total_deposits: number;
  percentage: number;
  expenses_type: string;
  total_income_annual: number | null;
  percentage_total_income_annual: number | null;
  total_expenses_annual: number | null;
  percentage_total_expenses_annual: number | null;
  total_profit_annual: number | null;
  percentage_total_profit_annual: number | null;
  earnings_month: number | null;
  percentage_earnings_month: number | null;
  expenses_month: number | null;
  percentage_expenses_month: number | null;
  profit_last_month: number | null;
  percentage_profit_last_month: number | null;
  agreements: RawApiItem[] | null;
  profit_and_loss_history: RawApiItem[] | null;
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

const CACHE_DURATION = 30 * 1000;
const DETAIL_CACHE_DURATION = 60 * 1000;

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

export async function getCarById(carId: number, forceRefresh = false): Promise<CarDetail> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

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

    carDetailCache = {
      data: data,
      timestamp: Date.now(),
      carId: carId
    };

    return data;

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

// 🔥 CREAR AUTO
export async function createCar(data: FormData): Promise<CarDetail> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars/`;
    console.log('📡 Creando auto:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
      body: data,
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
      
      let errorMsg = `Error ${response.status}: No se pudo crear el auto`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Auto creado:', result);

    clearCarsCache();

    return result;

  } catch (error) {
    console.error('❌ Error en createCar:', error);
    throw error;
  }
}

// 🔥 SUBIR IMAGEN PRINCIPAL
export async function uploadPrincipalImage(carId: number, imageFile: File): Promise<{ principal_image: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  if (imageFile.type !== 'image/png') {
    throw new Error('Solo se permiten imágenes PNG');
  }

  try {
    const url = `${API_BASE_URL}/cars/principal_image/`;
    console.log('📡 Subiendo imagen principal:', url);

    const formData = new FormData();
    formData.append('car_id', carId.toString());
    formData.append('image', imageFile);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${token}`,
      },
      body: formData,
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
      
      let errorMsg = `Error ${response.status}: No se pudo subir la imagen`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Imagen subida:', result);

    carDetailCache = {
      data: null,
      timestamp: 0,
      carId: null
    };

    return result;

  } catch (error) {
    console.error('❌ Error en uploadPrincipalImage:', error);
    throw error;
  }
}

// 🔥 ACTUALIZAR AUTO
export async function updateCar(carId: number, data: unknown): Promise<CarDetail> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars/${carId}/`;
    console.log('📡 Actualizando auto:', url, data);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
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
      throw new Error('Auto no encontrado');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo actualizar el auto`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Auto actualizado:', result);

    carDetailCache = {
      data: null,
      timestamp: 0,
      carId: null
    };

    return result;

  } catch (error) {
    console.error('❌ Error en updateCar:', error);
    throw error;
  }
}

// 🔥 SUBIR MÚLTIPLES IMÁGENES
export async function uploadCarImages(carId: number, files: File[]): Promise<unknown> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars/car_images/`;
    console.log('📡 Subiendo imágenes:', url);

    const formData = new FormData();
    formData.append('car_id', carId.toString());
    files.forEach(file => {
      formData.append('image', file);
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
      body: formData,
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
      
      let errorMsg = `Error ${response.status}: No se pudieron subir las imágenes`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Imágenes subidas:', result);

    carDetailCache = {
      data: null,
      timestamp: 0,
      carId: null
    };

    return result;

  } catch (error) {
    console.error('❌ Error en uploadCarImages:', error);
    throw error;
  }
}

// 🔥 IMÁGENES DE LA GALERÍA CON ID (para poder eliminarlas individualmente)
export interface CarGalleryImage {
  id: number;
  image: string;
  car_id: number;
}

export async function getCarImages(carId: number): Promise<CarGalleryImage[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars/car_images/${carId}/`;
    console.log('📡 Obteniendo imágenes de la galería:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      },
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
      throw new Error(`Error ${response.status}: No se pudieron obtener las imágenes`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result : [];

  } catch (error) {
    console.error('❌ Error en getCarImages:', error);
    throw error;
  }
}

export async function deleteCarImage(imageId: number): Promise<{ message: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars/car_images/`;
    console.log('📡 Eliminando imagen de auto:', url, imageId);

    // El endpoint solo acepta FormParser/MultiPartParser (no JSON)
    const formData = new FormData();
    formData.append('image_id', imageId.toString());

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`,
      },
      body: formData,
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
      throw new Error(`Imagen ${imageId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar la imagen'}`);
    }

    if (response.status === 204) {
      return { message: 'Imagen eliminada exitosamente' };
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('❌ Error en deleteCarImage:', error);
    throw error;
  }
}

// 🔥 ELIMINAR AUTO
export async function deleteCar(carId: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars/${carId}/`;
    console.log('📡 Eliminando auto:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
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
      throw new Error('Auto no encontrado');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo eliminar el auto`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    console.log('✅ Auto eliminado:', carId);

    clearCarsCache();

  } catch (error) {
    console.error('❌ Error en deleteCar:', error);
    throw error;
  }
}

// 🔥 INTERFACE PARA RESERVACIONES
export interface CarReservation {
  id: number;
  car_id: number;
  brand: string;
  model: string;
  driver: string;
  phone: string;
  check_in: string;
  check_out: string;
  earnings: number;
  extra_charges: number;
  total_earnings: number;
  miles_pre_trip: number;
  miles_post_trip: number;
  miles_drive: number;
  gas_level_pre_trip: string;
  gas_level_post_trip: string;
  observation: string | null;
}

export interface CarReservationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    reservations: CarReservation[];
    total_earnings: number;
  };
}

// 🔥 OBTENER TODAS LAS RESERVACIONES DE UN AUTO
export async function getCarReservations(carId: number): Promise<CarReservationsResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars-reservation/?car_id=${carId}`;
    console.log('📡 Fetching all car reservations:', url);

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
      throw new Error(`Reservaciones para el auto ${carId} no encontradas`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar las reservaciones'}`);
    }

    const data = await response.json();
    console.log('✅ Reservaciones recibidas:', data);

    return data;

  } catch (error) {
    console.error('❌ Error en getCarReservations:', error);
    throw error;
  }
}

// 🔥 INTERFACE PARA CREAR RESERVACIÓN - CON total_earnings Y miles_drive
export interface CreateReservationData {
  car_id: number;
  driver: string;
  phone: string;
  check_in: string;
  check_out: string;
  check_in_time: string;
  check_out_time: string;
  earnings: number;
  extra_charges: number;
  total_earnings: number;
  miles_pre_trip: number;
  miles_post_trip: number;
  miles_drive: number;
  gas_level_pre_trip: string;
  gas_level_post_trip: string;
  observations: string;
}

// 🔥 OBTENER TODOS LOS AUTOS (para el select)
export async function getAllCars(): Promise<Car[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars/`;
    console.log('📡 Fetching all cars:', url);

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

    return data;

  } catch (error) {
    console.error('❌ Error en getAllCars:', error);
    throw error;
  }
}

// 🔥 CREAR RESERVACIÓN - CON total_earnings Y miles_drive
export async function createReservation(data: CreateReservationData): Promise<unknown> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars-reservation/`;
    console.log('📡 Creando reservación:', url, data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
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
      
      let errorMsg = `Error ${response.status}: No se pudo crear la reservación`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Reservación creada:', result);

    return result;

  } catch (error) {
    console.error('❌ Error en createReservation:', error);
    throw error;
  }
}

// lib/api/carsAdmin.ts - Añadir al final del archivo

// 🔥 INTERFACE PARA FACTURAS
export interface InvoiceDetail {
  item: string;
  quantity: number;
  rate: string;
  amount: string;
}

export interface InvoiceImage {
  id: number;
  image: string;
}

export interface Invoice {
  id: number;
  title: string;
  price: string;
  invoice_type: 'incomes' | 'expenses';
  date: string;
  car_id: number;
  brand: string;
  model: string;
  year: string;
  plate: string;
  list_details: InvoiceDetail[];
  list_images: InvoiceImage[];
  partner_refund: boolean;
  comment: string;
}

export interface InvoicesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invoice[];
}

// 🔥 OBTENER FACTURAS DE UN AUTO CON FILTROS (ENDPOINT CORREGIDO)
export async function getCarInvoices(
  carId: number,
  page: number = 1,
  initialDate?: string,
  finalDate?: string
): Promise<InvoicesResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  try {
    // 🔥 ENDPOINT CORREGIDO: api/cars-invoices-by-car_id/{carId}/?page=1
    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    if (initialDate) {
      params.append('initial_date', initialDate);
    }
    if (finalDate) {
      params.append('final_date', finalDate);
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/cars-invoices-by-car_id/${carId}/${queryString ? `?${queryString}` : ''}`;
    console.log('📡 Fetching car invoices:', url);

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
      throw new Error(`Facturas para el auto ${carId} no encontradas`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar las facturas'}`);
    }

    const data = await response.json();
    console.log('✅ Facturas recibidas:', data);

    return data;

  } catch (error) {
    console.error('❌ Error en getCarInvoices:', error);
    throw error;
  }
}

// lib/api/carsAdmin.ts - Añadir al final del archivo

// 🔥 INTERFACE PARA FACTURA DETALLE
export interface InvoiceDetailItem {
  item: string;
  quantity: number;
  rate: string;
  amount: string;
}

export interface InvoiceImage {
  id: number;
  image: string;
}

export interface InvoiceDetailResponse {
  id: number;
  title: string;
  price: string;
  invoice_type: 'incomes' | 'expenses';
  date: string;
  car_id: number;
  brand: string;
  model: string;
  year: string;
  plate: string;
  list_details: InvoiceDetailItem[];
  list_images: InvoiceImage[];
  partner_refund: boolean;
  comment: string;
}

// 🔥 OBTENER DETALLE DE UNA FACTURA
export async function getInvoiceDetail(invoiceId: number): Promise<InvoiceDetailResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars-invoices/${invoiceId}/`;
    console.log('📡 Fetching invoice detail:', url);

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
      throw new Error(`Factura ${invoiceId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar la factura'}`);
    }

    const data = await response.json();
    console.log('✅ Factura detalle recibida:', data);

    return data;

  } catch (error) {
    console.error('❌ Error en getInvoiceDetail:', error);
    throw error;
  }
}

// lib/api/carsAdmin.ts - Añadir al final del archivo

// 🔥 CREAR FACTURA
export async function createInvoice(data: unknown): Promise<InvoiceDetailResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars-invoices/`;
    console.log('📡 Creando factura:', url, data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
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
      
      let errorMsg = `Error ${response.status}: No se pudo crear la factura`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Factura creada:', result);

    return result;

  } catch (error) {
    console.error('❌ Error en createInvoice:', error);
    throw error;
  }
}

// lib/api/carsAdmin.ts - Añadir al final del archivo

// 🔥 ACTUALIZAR FACTURA
export async function updateInvoice(invoiceId: number, data: unknown): Promise<InvoiceDetailResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars-invoices/${invoiceId}/`;
    console.log('📡 Actualizando factura:', url, data);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
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
      throw new Error(`Factura ${invoiceId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo actualizar la factura`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Factura actualizada:', result);

    return result;

  } catch (error) {
    console.error('❌ Error en updateInvoice:', error);
    throw error;
  }
}

// lib/api/carsAdmin.ts - Añadir al final del archivo

// 🔥 ELIMINAR FACTURA (requiere motivo)
export async function deleteInvoice(invoiceId: number, comment: string): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    // 🔥 El endpoint requiere el parámetro 'detail' con el motivo
    const url = `${API_BASE_URL}/cars-invoices/${invoiceId}/?detail=${encodeURIComponent(comment)}`;
    console.log('📡 Eliminando factura:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`,
      },
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
      throw new Error(`Factura ${invoiceId} no encontrada`);
    }

    if (response.status === 400) {
      const errorText = await response.text();
      console.error('❌ Error 400:', errorText);
      throw new Error('Se requiere un motivo para eliminar la factura');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo eliminar la factura`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    console.log('✅ Factura eliminada:', invoiceId);

  } catch (error) {
    console.error('❌ Error en deleteInvoice:', error);
    throw error;
  }
}

// lib/api/carsAdmin.ts - Añadir al final del archivo

// 🔥 SUBIR IMÁGENES A UNA FACTURA
export async function uploadInvoiceImages(invoiceId: number, files: File[]): Promise<unknown> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars-invoices/invoice_image/`;
    console.log('📡 Subiendo imágenes a factura:', url);

    const formData = new FormData();
    formData.append('invoice_id', invoiceId.toString());
    files.forEach(file => {
      formData.append('image', file);
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
      body: formData,
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
      throw new Error(`Factura ${invoiceId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudieron subir las imágenes`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Imágenes subidas:', result);

    return result;

  } catch (error) {
    console.error('❌ Error en uploadInvoiceImages:', error);
    throw error;
  }
}

// lib/api/carsAdmin.ts - Añadir al final del archivo

// 🔥 ELIMINAR IMAGEN DE UNA FACTURA (usando FormData)
export async function deleteInvoiceImage(imageId: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars-invoices/invoice_image/`;
    console.log('📡 Eliminando imagen de factura:', url);
    console.log('📤 image_id:', imageId);

    // 🔥 CREAR FormData en lugar de JSON
    const formData = new FormData();
    formData.append('image_id', imageId.toString());

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`,
      },
      // 🔥 NO usar 'Content-Type': 'application/json', FormData lo maneja automáticamente
      body: formData,
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
      throw new Error(`Imagen ${imageId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo eliminar la imagen`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    console.log('✅ Imagen eliminada:', imageId);

  } catch (error) {
    console.error('❌ Error en deleteInvoiceImage:', error);
    throw error;
  }
}

// lib/api/carsAdmin.ts - Añadir al final del archivo (sin filtro de búsqueda)

// 🔥 INTERFACE PARA PROFIT AND LOSS
export interface ProfitAndLossItem {
  id: number;
  date: string;
  total_miles_drive: string;
  reservation_income: string;
  additional_income: string;
  total_income: string;
  rent: string;
  invoices: string | null;
  total_expenses: string;
  income_minus_expenses: string;
  fee_cupon_tours: string;
  partner_net: string;
  deposit: string;
  refunds: string;
  car: {
    id: number;
    principal_image: string | null;
    owner: string;
    brand: string;
    model: string;
    year: number;
    plate: string;
    rent_price: string;
    status: string;
    external_id: string;
  };
  list_invoices: RawApiItem[];
}

export interface ProfitAndLossResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProfitAndLossItem[];
}

// 🔥 OBTENER PROFIT AND LOSS (SIN FILTRO DE BÚSQUEDA)
export async function getProfitAndLoss(page: number = 1): Promise<ProfitAndLossResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    const queryString = params.toString();
    const url = `${API_BASE_URL}/cars-profit-and-loss/${queryString ? `?${queryString}` : ''}`;
    console.log('📡 Fetching profit and loss:', url);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar Profit and Loss'}`);
    }

    const data = await response.json();
    console.log('✅ Profit and Loss recibido:', data);

    return data;

  } catch (error) {
    console.error('❌ Error en getProfitAndLoss:', error);
    throw error;
  }
}

// lib/api/carsAdmin.ts - Añadir al final del archivo

// 🔥 INTERFACE PARA DETALLE DE PROFIT AND LOSS
export interface ProfitAndLossDetail {
  id: number;
  date: string;
  total_miles_drive: string;
  reservation_income: string;
  additional_income: string;
  total_income: string;
  rent: string;
  invoices: string | null;
  total_expenses: string;
  income_minus_expenses: string;
  fee_cupon_tours: string;
  partner_net: string;
  deposit: string;
  refunds: string;
  car: {
    id: number;
    principal_image: string | null;
    owner: string;
    brand: string;
    model: string;
    year: number;
    plate: string;
    rent_price: string;
    status: string;
    external_id: string;
  };
  list_invoices: RawApiItem[];
}

// 🔥 OBTENER DETALLE DE PROFIT AND LOSS
export async function getProfitAndLossDetail(plId: number): Promise<ProfitAndLossDetail> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars-profit-and-loss/${plId}/`;
    console.log('📡 Fetching profit and loss detail:', url);

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
      throw new Error(`Profit and Loss ${plId} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el detalle'}`);
    }

    const data = await response.json();
    console.log('✅ Profit and Loss detalle recibido:', data);

    return data;

  } catch (error) {
    console.error('❌ Error en getProfitAndLossDetail:', error);
    throw error;
  }
}

// lib/api/carsAdmin.ts - Añadir al final del archivo

// 🔥 INTERFACE PARA CREAR PROFIT AND LOSS
export interface CreateProfitAndLossData {
  type: string;
  start_date: string;
  list_car_id: number[];
}

export interface CreateProfitAndLossResponse {
  list_errors: RawApiItem[];
  list_success: ProfitAndLossItem[];
}

// 🔥 CREAR PROFIT AND LOSS
export async function createProfitAndLoss(data: CreateProfitAndLossData): Promise<CreateProfitAndLossResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars-profit-and-loss/`;
    console.log('📡 Creando Profit and Loss:', url, data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
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
      
      let errorMsg = `Error ${response.status}: No se pudo crear Profit and Loss`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Profit and Loss creado:', result);

    return result;

  } catch (error) {
    console.error('❌ Error en createProfitAndLoss:', error);
    throw error;
  }
}

// lib/api/carsAdmin.ts - Añadir al final del archivo

// 🔥 ELIMINAR PROFIT AND LOSS
export async function deleteProfitAndLoss(plId: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/cars-profit-and-loss/${plId}/`;
    console.log('📡 Eliminando Profit and Loss:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
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
      throw new Error(`Profit and Loss ${plId} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo eliminar Profit and Loss`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    console.log('✅ Profit and Loss eliminado:', plId);

  } catch (error) {
    console.error('❌ Error en deleteProfitAndLoss:', error);
    throw error;
  }
}