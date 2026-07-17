// app/lib/api/suscripcionAdmin.ts

export interface Suscripcion {
  id: number;
  membresia_id: number;
  usuario_id: number | null;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  monto_acordado: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: 'activa' | 'vencida' | 'cancelada' | string;
  qr_url: string | null;
  verify_hash: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSuscripcionData {
  membresia_id: number;
  usuario_id?: number;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  monto_acordado: number;
  fecha_inicio: string;
  fecha_fin?: string;
  estado?: string;
  notas?: string;
}

export interface UpdateSuscripcionData {
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  monto_acordado?: number;
  fecha_inicio?: string;
  fecha_fin?: string | null;
  estado?: string;
  notas?: string;
}

export interface SuscripcionFilters {
  membresia_id?: number;
  usuario_id?: number;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface SuscripcionResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Suscripcion[];
}

// 🔥 OBTENER LISTA DE SUSCRIPCIONES (con filtros del lado del servidor)
export async function getSuscripciones(filters?: SuscripcionFilters): Promise<SuscripcionResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  const params = new URLSearchParams();
  if (filters?.membresia_id) params.set('membresia_id', String(filters.membresia_id));
  if (filters?.usuario_id) params.set('usuario_id', String(filters.usuario_id));
  if (filters?.estado) params.set('estado', filters.estado);
  if (filters?.fecha_desde) params.set('fecha_desde', filters.fecha_desde);
  if (filters?.fecha_hasta) params.set('fecha_hasta', filters.fecha_hasta);
  const qs = params.toString();

  const url = `${API_BASE_URL}/suscripciones/${qs ? `?${qs}` : ''}`;

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar las suscripciones'}`);
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
    console.error('❌ Error en getSuscripciones:', error);
    throw error;
  }
}

// 🔥 OBTENER DETALLE DE SUSCRIPCIÓN
export async function getSuscripcionDetail(id: number): Promise<Suscripcion> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/suscripciones/${id}/`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      cache: 'no-store'
    });

    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isUserLoggedIn');
        localStorage.removeItem('userData');
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&error=session_expired`;
      }
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error(`Suscripción ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar la suscripción'}`);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error en getSuscripcionDetail:', error);
    throw error;
  }
}

// 🔥 CREAR SUSCRIPCIÓN (genera QR y envía el correo al miembro)
export async function createSuscripcion(data: CreateSuscripcionData): Promise<{ message: string; id: number; qr_url: string | null }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/suscripciones/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
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
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error en createSuscripcion:', error);
    throw error;
  }
}

// 🔥 ACTUALIZAR SUSCRIPCIÓN (ej. cambiar estado, extender vigencia)
export async function updateSuscripcion(id: number, data: UpdateSuscripcionData): Promise<Suscripcion> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/suscripciones/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
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
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error en updateSuscripcion:', error);
    throw error;
  }
}

// 🔥 ELIMINAR SUSCRIPCIÓN
export async function deleteSuscripcion(id: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/suscripciones/${id}/`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isUserLoggedIn');
        localStorage.removeItem('userData');
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&error=session_expired`;
      }
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error(`Suscripción ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error('❌ Error en deleteSuscripcion:', error);
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
