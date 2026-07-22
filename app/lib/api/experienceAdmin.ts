// app/lib/api/experienceAdmin.ts

export interface Experience {
  id: number;
  name: string;
  slug: string | null;
  principal_image: string;
  price: string;
  capacity_min: number;
  capacity_max: number;
  location: string;
  duration_days: number;
  pet_friendly: number | boolean;
  category: string;
  descripcion: string;
  status: 'activo' | 'inactivo' | string;
  created_at: string;
  updated_at: string;
}

export interface UpdateExperienceData {
  name: string;
  price: number;
  capacity_max: number;
  category?: string;
  capacity_min?: number;
  location?: string;
  duration_days?: number;
  pet_friendly?: boolean;
  descripcion?: string;
  status?: string;
}

export interface ExperienceResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Experience[];
}

// 🔥 OBTENER LISTA DE EXPERIENCIAS
export async function getExperiences(): Promise<ExperienceResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  const url = `${API_BASE_URL}/experiences/`;
  

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar las experiencias'}`);
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
    console.error('❌ Error en getExperiences:', error);
    throw error;
  }
}

// 🔥 OBTENER DETALLE DE EXPERIENCIA
export async function getExperienceDetail(id: number): Promise<Experience> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/experiences/${id}/`;

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
      throw new Error(`Experiencia ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar la experiencia'}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Error en getExperienceDetail:', error);
    throw error;
  }
}

// 🔥 CREAR EXPERIENCIA
export async function createExperience(data: unknown): Promise<Experience> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/experiences/`;

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
    console.error('❌ Error en createExperience:', error);
    throw error;
  }
}

// 🔥 ACTUALIZAR EXPERIENCIA
export async function updateExperience(id: number, data: UpdateExperienceData): Promise<Experience> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/experiences/${id}`;

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
    console.error('❌ Error en updateExperience:', error);
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

// app/lib/api/experienceAdmin.ts - AÑADIR AL FINAL DEL ARCHIVO

// 🔥 ELIMINAR EXPERIENCIA
export async function deleteExperience(id: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/experiences/${id}/`;

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
      throw new Error(`Experiencia ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en la respuesta:', response.status, errorData);
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }


  } catch (error) {
    console.error('❌ Error en deleteExperience:', error);
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
    const url = `${API_BASE_URL}/experiences/${id}/galeria`;

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
    const url = `${API_BASE_URL}/experiences/${id}/imagen`;

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