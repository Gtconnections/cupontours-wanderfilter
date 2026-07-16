// app/lib/api/realAdmin.ts

export interface RealEstate {
  id: number;
  name: string;
  slug: string | null;
  principal_image: string;
  price: string;
  operation_type: 'venta' | 'alquiler' | 'renta' | string;
  property_type: 'villa' | 'apartamento' | 'casa' | 'terreno' | 'local' | string;
  bedrooms: number;
  bathrooms: number;
  sqft: string;
  location: string;
  address: string;
  parking_spaces: number;
  descripcion: string;
  status: 'activo' | 'inactivo' | 'vendido' | 'alquilado' | string;
  created_at: string;
  updated_at: string;
}

export interface RealEstateResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RealEstate[];
}

// 🔥 OBTENER LISTA DE INMUEBLES
export async function getRealEstates(): Promise<RealEstateResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  const url = `${API_BASE_URL}/real-estate/`;
  
  console.log('📡 Obteniendo inmuebles:', url);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los inmuebles'}`);
    }

    const data = await response.json();
    console.log('✅ Inmuebles obtenidos:', data);
    
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
    console.error('❌ Error en getRealEstates:', error);
    throw error;
  }
}

// 🔥 OBTENER DETALLE DE INMUEBLE
export async function getRealEstateDetail(id: number): Promise<RealEstate> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/real-estate/${id}/`;
    console.log('📡 Obteniendo detalle de inmueble:', url);

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
      throw new Error(`Inmueble ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el inmueble'}`);
    }

    const data = await response.json();
    console.log('✅ Inmueble detalle obtenido:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getRealEstateDetail:', error);
    throw error;
  }
}

// Función auxiliar para obtener token (la misma que en transportAdmin.ts)
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