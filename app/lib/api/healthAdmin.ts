// app/lib/api/healthAdmin.ts

export interface Health {
  id: number;
  name: string;
  slug: string | null;
  principal_image: string;
  price: string;
  duration_minutes: number;
  category: string;
  location: string;
  descripcion: string;
  status: 'activo' | 'inactivo' | string;
  created_at: string;
  updated_at: string;
}

export interface HealthResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Health[];
}

// 🔥 OBTENER LISTA DE SERVICIOS DE SALUD
export async function getHealthServices(): Promise<HealthResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  const url = `${API_BASE_URL}/health/`;
  
  console.log('📡 Obteniendo servicios de salud:', url);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los servicios de salud'}`);
    }

    const data = await response.json();
    console.log('✅ Servicios de salud obtenidos:', data);
    
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
    console.error('❌ Error en getHealthServices:', error);
    throw error;
  }
}

// 🔥 OBTENER DETALLE DE SERVICIO DE SALUD
export async function getHealthDetail(id: number): Promise<Health> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/health/${id}/`;
    console.log('📡 Obteniendo detalle de servicio de salud:', url);

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
      throw new Error(`Servicio de salud ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el servicio de salud'}`);
    }

    const data = await response.json();
    console.log('✅ Servicio de salud detalle obtenido:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getHealthDetail:', error);
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