// lib/api/transportAdmin.ts

export interface Transport {
  id: number;
  name: string;
  slug: string | null;
  principal_image: string;
  price_hour: string;
  capacity: number;
  category: string;
  brand: string;
  model: string;
  color: string;
  kit: string;
  descripcion: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TransportResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transport[];
}

// 🔥 OBTENER LISTA DE TRANSPORTES
export async function getTransports(): Promise<TransportResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  const url = `${API_BASE_URL}/transporte-privado/`;
  
  console.log('📡 Obteniendo transportes:', url);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los transportes'}`);
    }

    const data = await response.json();
    console.log('✅ Transportes obtenidos:', data);
    
    // 🔥 Manejar ambos casos: array directo o objeto con results
    if (Array.isArray(data)) {
      return {
        count: data.length,
        next: null,
        previous: null,
        results: data
      };
    }
    
    return data;

  } catch (error) {
    console.error('❌ Error en getTransports:', error);
    throw error;
  }
}

// 🔥 OBTENER DETALLE DE TRANSPORTE
export async function getTransportDetail(id: number): Promise<Transport> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/transporte-privado/${id}/`;
    console.log('📡 Obteniendo detalle de transporte:', url);

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
      throw new Error(`Transporte ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el transporte'}`);
    }

    const data = await response.json();
    console.log('✅ Transporte detalle obtenido:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getTransportDetail:', error);
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