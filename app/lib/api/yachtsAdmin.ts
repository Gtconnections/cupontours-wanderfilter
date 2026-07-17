// lib/api/yachtsAdmin.ts

import { RawApiItem } from "../types/raw";

export interface Yacht {
  id: number;
  name: string;
  principal_image: string;
  status: string | null;
  external_id: string;
  description: string | null;
  length: number;
  capacity: number;
  staterooms: number;
  bathrooms: number;
  price_full_day: string;
  price_half_day: string;
  certified_captain: boolean;
  fuel: boolean;
  water_toys: boolean;
  vip_host: boolean;
  crew: boolean;
  jet_sky: boolean;
  jacuzzi: boolean;
  slide: boolean;
  seabob: boolean;
  owner: string;
  yacht_images: string[];
}

export interface YachtsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Yacht[];
}

export interface YachtsFilters {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface YachtGalleryImage {
  id: number;
  image: string;
  yacht_id: number;
}

export interface YachtImagesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: YachtGalleryImage[];
}

// 🔥 INTERFACE PARA DETALLE DE YATE (desde /yachts/{id}/)
export interface YachtFullDetail {
  yacht_id: number;
  name: string;
  principal_image: string;
  status: string | null;
  external_id: string;
  description: string | null;
  length: number;
  capacity: number;
  staterooms: number;
  bathrooms: number;
  price_full_day: number;
  price_half_day: number;
  certified_captain: boolean;
  fuel: boolean;
  water_toys: boolean;
  vip_host: boolean;
  crew: boolean;
  jet_sky: boolean;
  jacuzzi: boolean;
  slide: boolean;
  seabob: boolean;
  owner_id: number;
  full_name: string;
  phone_number: string;
  email: string;
  total_deposits: number;
  percentage: number;
  expenses_type: string | null;
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

// 🔥 INTERFACE PARA ACTUALIZAR YATE
export interface UpdateYachtData {
  owner_id: number;
  name: string;
  external_id: string;
  description: string;
  length: number;
  capacity: number;
  staterooms: number;
  bathrooms: number;
  price_full_day: number;
  price_half_day: number;
  certified_captain: boolean;
  fuel: boolean;
  water_toys: boolean;
  vip_host: boolean;
  crew: boolean;
  jet_sky: boolean;
  jacuzzi: boolean;
  slide: boolean;
  seabob: boolean;
}

// 🔥 OBTENER LISTA DE YATES
export async function getYachts(filters: YachtsFilters = {}, forceRefresh = false): Promise<YachtsResponse> {
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
  if (filters.search) params.append('search', filters.search);
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/yachts/${queryString ? `?${queryString}` : ''}`;
  
  console.log('📡 Obteniendo yates:', url);

  try {
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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los yates'}`);
    }

    const data = await response.json();
    console.log('✅ Yates obtenidos:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getYachts:', error);
    throw error;
  }
}

// 🔥 OBTENER YATE COMPLETO (desde /yachts/{id}/)
export async function getFullYacht(id: number): Promise<YachtFullDetail> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts/${id}/`;
    console.log('📡 Obteniendo yate completo:', url);

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
      throw new Error(`Yate ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el yate'}`);
    }

    const data = await response.json();
    console.log('✅ Yate completo obtenido:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getFullYacht:', error);
    throw error;
  }
}

// 🔥 OBTENER IMÁGENES DEL YATE (desde /yachts/yacht_images/{id}/)
export async function getYachtImages(id: number): Promise<YachtGalleryImage[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts/yacht_images/${id}/`;
    console.log('📡 Obteniendo imágenes del yate:', url);

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
      throw new Error(`Imágenes del yate ${id} no encontradas`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar las imágenes del yate'}`);
    }

    const data = await response.json();
    console.log('✅ Imágenes del yate obtenidas:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getYachtImages:', error);
    throw error;
  }
}

// 🔥 ACTUALIZAR YATE
export async function updateYacht(id: number, data: UpdateYachtData): Promise<unknown> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts/${id}/`;
    console.log('📡 Actualizando yate:', url, data);

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
      throw new Error(`Yate ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al actualizar el yate'}`);
    }

    const result = await response.json();
    console.log('✅ Yate actualizado exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en updateYacht:', error);
    throw error;
  }
}

// 🔥 OBTENER LISTA DE OWNERS
export interface YachtOwner {
  id: number;
  user?: {
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

export async function getOwners(): Promise<YachtOwner[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/profiles/get-owners/`;
    console.log('📡 Obteniendo owners:', url);

    const response = await fetch(url, {
      method: 'GET',
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al obtener los owners'}`);
    }

    const data = await response.json();
    console.log('✅ Owners obtenidos:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getOwners:', error);
    throw error;
  }
}

// Función auxiliar para obtener token
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

// lib/api/yachtsAdmin.ts

// ... (interfaces existentes)

// 🔥 SUBIR IMÁGENES DEL YATE
export async function uploadYachtImages(yachtId: number, files: File[]): Promise<unknown[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts/yacht_images/`;
    console.log('📡 Subiendo imágenes del yate:', url, `(${files.length} archivos)`);

    const formData = new FormData();
    formData.append('yacht_id', yachtId.toString());
    
    files.forEach((file) => {
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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al subir las imágenes'}`);
    }

    const result = await response.json();
    console.log('✅ Imágenes subidas exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en uploadYachtImages:', error);
    throw error;
  }
}

// lib/api/yachtsAdmin.ts

// ... (interfaces existentes)

// 🔥 CREAR YATE
export async function createYacht(data: UpdateYachtData): Promise<{ id: number }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts/`;
    console.log('📡 Creando yate:', url, data);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al crear el yate'}`);
    }

    const result = await response.json();
    console.log('✅ Yate creado exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en createYacht:', error);
    throw error;
  }
}

// lib/api/yachtsAdmin.ts

// ... (interfaces existentes)

// 🔥 ELIMINAR YATE
export async function deleteYacht(id: number): Promise<{ message: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts/${id}/`;
    console.log('📡 Eliminando yate:', url);

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
      throw new Error(`Yate ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar el yate'}`);
    }

    if (response.status === 204) {
      console.log('✅ Yate eliminado exitosamente (204)');
      return { message: 'Yate eliminado exitosamente' };
    }

    const result = await response.json();
    console.log('✅ Yate eliminado exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en deleteYacht:', error);
    throw error;
  }
}

// 🔥 CAMBIAR IMAGEN PRINCIPAL DEL YATE
export async function uploadYachtPrincipalImage(yachtId: number, imageFile: File): Promise<{ principal_image: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts/principal_image/`;
    console.log('📡 Subiendo imagen principal:', url);

    const formData = new FormData();
    formData.append('yacht_id', yachtId.toString());
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
      } catch {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Imagen principal actualizada:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en uploadYachtPrincipalImage:', error);
    throw error;
  }
}

// 🔥 ELIMINAR IMAGEN DE LA GALERÍA DEL YATE
export async function deleteYachtImage(imageId: number): Promise<{ message: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts/yacht_images/`;
    console.log('📡 Eliminando imagen de yate:', url, imageId);

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
    console.error('❌ Error en deleteYachtImage:', error);
    throw error;
  }
}