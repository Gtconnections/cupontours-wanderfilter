// app/lib/api/luxuryAccessAdmin.ts
// CRUD para los códigos de acceso de la app Luxury (tabla luxury_acces del backend PHP).

export interface LuxuryAccess {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  code: string;
  is_active: number | string | boolean;
  created_at: string;
  updated_at: string;
}

export interface LuxuryAccessData {
  name: string;
  email: string;
  phone?: string;
  code: string;
  is_active?: number;
}

export interface LuxuryAccessResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LuxuryAccess[];
}

// El backend responde al crear con { message, id } (message indica si el
// código se envió por correo o si el envío falló).
export interface CreateLuxuryAccessResult {
  message?: string;
  id: number;
}

const getApiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, '');

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

const handleAuthError = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isUserLoggedIn');
    localStorage.removeItem('userData');
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&error=session_expired`;
  }
};

// 🔥 LISTA DE ACCESOS (incluye activos e inactivos)
export async function getLuxuryAccessAdmin(): Promise<LuxuryAccessResponse> {
  const API_BASE_URL = getApiBase();
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/luxury-acces/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      cache: 'no-store',
    });

    if (response.status === 401 || response.status === 403) {
      handleAuthError();
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los accesos'}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }

    return data;
  } catch (error) {
    console.error('❌ Error en getLuxuryAccessAdmin:', error);
    throw error;
  }
}

// 🔥 CREAR ACCESO
export async function createLuxuryAccess(data: LuxuryAccessData): Promise<CreateLuxuryAccessResult> {
  const API_BASE_URL = getApiBase();
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/luxury-acces/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
      handleAuthError();
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error en createLuxuryAccess:', error);
    throw error;
  }
}

// 🔥 ACTUALIZAR ACCESO
export async function updateLuxuryAccess(id: number, data: LuxuryAccessData): Promise<LuxuryAccess> {
  const API_BASE_URL = getApiBase();
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/luxury-acces/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
      handleAuthError();
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error en updateLuxuryAccess:', error);
    throw error;
  }
}

// 🔥 ELIMINAR ACCESO
export async function deleteLuxuryAccess(id: number): Promise<void> {
  const API_BASE_URL = getApiBase();
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/luxury-acces/${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      handleAuthError();
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error(`Acceso ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error en deleteLuxuryAccess:', error);
    throw error;
  }
}
