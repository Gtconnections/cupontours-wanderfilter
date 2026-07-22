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
      return { message: 'Yate eliminado exitosamente' };
    }

    const result = await response.json();
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

// 🔥 OBTENER TODOS LOS YATES SIN PAGINAR (para selectores de formulario)
export async function getAllYachts(): Promise<Yacht[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts/`;

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

    return data;

  } catch (error) {
    console.error('❌ Error en getAllYachts:', error);
    throw error;
  }
}

// ==========================================================================
// RESERVACIONES (fuente de datos del Calendario)
// ==========================================================================

export interface YachtReservation {
  id: number;
  yacht_id: number;
  phone: string;
  first_name: string;
  last_name: string;
  earnings: number;
  date: string;
  duration: 'full_day' | 'half_day_in_the_morning' | 'half_day_in_the_afternoon';
  occasion: 'birthday' | 'family_trip' | 'fun_day_at_sea' | 'bachelorette' | 'business_lunch' | 'other';
  observation: string | null;
  order: number;
}

export interface YachtReservationsResponse {
  reservations: YachtReservation[];
  total_earnings: { earnings__sum: number | null };
}

// GET /yachts-reservation/?yacht_id={yachtId}
export async function getYachtReservations(yachtId: number): Promise<YachtReservationsResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts-reservation/?yacht_id=${yachtId}`;

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
      throw new Error(`Reservaciones para el yate ${yachtId} no encontradas`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar las reservaciones'}`);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error en getYachtReservations:', error);
    throw error;
  }
}

// ==========================================================================
// FACTURAS (INVOICES)
// ==========================================================================

export interface YachtInvoiceDetailItem {
  item: string;
  quantity: number;
  rate: string;
  amount: string;
}

export interface YachtInvoiceImage {
  id: number;
  image: string;
}

// Forma común devuelta tanto por el listado como por el detalle de una factura
export interface YachtInvoiceRecord {
  id: number;
  title: string;
  price: string;
  invoice_type: 'incomes' | 'expenses';
  date: string;
  yacht_id: number;
  yacht_name: string;
  lenght: number; // nombre del campo tal como lo devuelve el backend (typo original)
  list_details: YachtInvoiceDetailItem[];
  list_images: YachtInvoiceImage[];
  partner_refund: boolean;
  comment: string;
}

export interface YachtInvoicesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: YachtInvoiceRecord[];
}

export interface CreateYachtInvoiceData {
  title: string;
  date: string;
  invoice_type: 'incomes' | 'expenses';
  yacht_id: number;
  list_details: { item: string; quantity: number; rate: number; amount: number }[];
  partner_refund: boolean;
  comment: string;
  price: string;
}

// GET /yachts-invoices-by-yacht_id/{yachtId}/?page=1&initial_date=...&final_date=...
export async function getYachtInvoices(
  yachtId: number, page: number = 1, initialDate?: string, finalDate?: string
): Promise<YachtInvoicesResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (initialDate) params.append('initial_date', initialDate);
    if (finalDate) params.append('final_date', finalDate);

    const url = `${API_BASE_URL}/yachts-invoices-by-yacht_id/${yachtId}/?${params.toString()}`;

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
      throw new Error(`Facturas para el yate ${yachtId} no encontradas`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar las facturas'}`);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error en getYachtInvoices:', error);
    throw error;
  }
}

// GET /yachts-invoices/{invoiceId}/
export async function getYachtInvoiceDetail(invoiceId: number): Promise<YachtInvoiceRecord> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts-invoices/${invoiceId}/`;

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

    return await response.json();

  } catch (error) {
    console.error('❌ Error en getYachtInvoiceDetail:', error);
    throw error;
  }
}

// POST /yachts-invoices/
export async function createYachtInvoice(data: CreateYachtInvoiceData): Promise<YachtInvoiceRecord> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts-invoices/`;

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
      } catch {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error en createYachtInvoice:', error);
    throw error;
  }
}

// PATCH /yachts-invoices/{invoiceId}/
export async function updateYachtInvoice(invoiceId: number, data: Partial<CreateYachtInvoiceData>): Promise<YachtInvoiceRecord> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts-invoices/${invoiceId}/`;

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al actualizar la factura'}`);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error en updateYachtInvoice:', error);
    throw error;
  }
}

// DELETE /yachts-invoices/{invoiceId}/?detail={comment}
export async function deleteYachtInvoice(invoiceId: number, comment: string): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts-invoices/${invoiceId}/?detail=${encodeURIComponent(comment)}`;

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
      throw new Error('Se requiere un motivo para eliminar la factura');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar la factura'}`);
    }

  } catch (error) {
    console.error('❌ Error en deleteYachtInvoice:', error);
    throw error;
  }
}

// POST /yachts-invoices/invoice_image/  (FormData: invoice_id, image×N)
export async function uploadYachtInvoiceImages(invoiceId: number, files: File[]): Promise<unknown> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts-invoices/invoice_image/`;

    const formData = new FormData();
    formData.append('invoice_id', invoiceId.toString());
    files.forEach(file => formData.append('image', file));

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al subir las imágenes'}`);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error en uploadYachtInvoiceImages:', error);
    throw error;
  }
}

// DELETE /yachts-invoices/invoice_image/  (FormData: image_id)
export async function deleteYachtInvoiceImage(imageId: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts-invoices/invoice_image/`;

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

  } catch (error) {
    console.error('❌ Error en deleteYachtInvoiceImage:', error);
    throw error;
  }
}

// ==========================================================================
// RESERVACIONES - CRUD
// ==========================================================================

export interface CreateYachtReservationData {
  yacht_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  date: string;
  duration: 'full_day' | 'half_day_in_the_morning' | 'half_day_in_the_afternoon';
  occasion: 'birthday' | 'family_trip' | 'fun_day_at_sea' | 'bachelorette' | 'business_lunch' | 'other';
  earnings: number;
  observation?: string;
  order: number;
}

// GET /yachts-reservation/{reservationId}/
export async function getYachtReservationDetail(reservationId: number): Promise<YachtReservation> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts-reservation/${reservationId}/`;

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
      throw new Error(`Reservación ${reservationId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar la reservación'}`);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error en getYachtReservationDetail:', error);
    throw error;
  }
}

// POST /yachts-reservation/
export async function createYachtReservation(data: CreateYachtReservationData): Promise<YachtReservation> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts-reservation/`;

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
        errorMsg = errorData.Error || errorData.message || errorData.detail || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error en createYachtReservation:', error);
    throw error;
  }
}

// PATCH /yachts-reservation/{reservationId}/
export async function updateYachtReservation(reservationId: number, data: Partial<CreateYachtReservationData>): Promise<YachtReservation> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts-reservation/${reservationId}/`;

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
      throw new Error(`Reservación ${reservationId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);

      let errorMsg = `Error ${response.status}: No se pudo actualizar la reservación`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.Error || errorData.message || errorData.detail || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error en updateYachtReservation:', error);
    throw error;
  }
}

// DELETE /yachts-reservation/{reservationId}/
export async function deleteYachtReservation(reservationId: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/yachts-reservation/${reservationId}/`;

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
      throw new Error(`Reservación ${reservationId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar la reservación'}`);
    }

  } catch (error) {
    console.error('❌ Error en deleteYachtReservation:', error);
    throw error;
  }
}