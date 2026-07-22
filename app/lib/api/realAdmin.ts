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

export interface UpdateRealEstateData {
  name: string;
  price: number;
  operation_type: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  location?: string;
  address?: string;
  parking_spaces?: number;
  descripcion?: string;
  status?: string;
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
    return data;

  } catch (error) {
    console.error('❌ Error en getRealEstateDetail:', error);
    throw error;
  }
}

// 🔥 CREAR INMUEBLE
export async function createRealEstate(data: unknown): Promise<RealEstate> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/real-estate/`;

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
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en la respuesta:', response.status, errorData);
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const dataResponse = await response.json();
    return dataResponse;

  } catch (error) {
    console.error('❌ Error en createRealEstate:', error);
    throw error;
  }
}

// 🔥 ACTUALIZAR INMUEBLE
export async function updateRealEstate(id: number, data: UpdateRealEstateData): Promise<RealEstate> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/real-estate/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
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
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en la respuesta:', response.status, errorData);
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('❌ Error en updateRealEstate:', error);
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

// app/lib/api/realAdmin.ts - AÑADIR AL FINAL DEL ARCHIVO

// 🔥 ELIMINAR INMUEBLE
export async function deleteRealEstate(id: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/real-estate/${id}/`;

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
      throw new Error(`Inmueble ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en la respuesta:', response.status, errorData);
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }


  } catch (error) {
    console.error('❌ Error en deleteRealEstate:', error);
    throw error;
  }
}

// 🔥 SUBIR IMÁGENES A LA GALERÍA (agrega, no reemplaza)
export async function uploadGallery(id: number, files: File[]): Promise<unknown> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/real-estate/${id}/galeria`;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('imagenes[]', file);
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
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en la respuesta:', response.status, errorData);
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Error en uploadGallery:', error);
    throw error;
  }
}

// 🔥 CAMBIAR IMAGEN PRINCIPAL (reemplaza principal_image)
export async function changePrincipalImage(id: number, file: File): Promise<unknown> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/real-estate/${id}/imagen`;

    const formData = new FormData();
    formData.append('imagen', file);

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
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en la respuesta:', response.status, errorData);
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Error en changePrincipalImage:', error);
    throw error;
  }
}