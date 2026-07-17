// app/lib/api/transaccionAdmin.ts

export type TransaccionTipo = 'ingreso' | 'gasto';

export const SERVICIO_TIPOS_CONTABLES = [
  'transporte_privado',
  'real_estate',
  'experiences',
  'servicios_generales',
  'wellness',
  'health',
  'events',
] as const;

export interface Transaccion {
  id: number;
  servicio_tipo: string | null;
  servicio_id: number | null;
  reserva_id: number | null;
  tipo: TransaccionTipo;
  categoria: string | null;
  monto: string;
  fecha: string;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransaccionesFilters {
  servicio_tipo?: string;
  servicio_id?: number;
  reserva_id?: number;
  tipo?: TransaccionTipo;
  categoria?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface ResumenData {
  ingresos: number;
  gastos: number;
  balance: number;
}

export interface SaveTransaccionData {
  tipo: TransaccionTipo;
  monto: number;
  fecha: string;
  servicio_tipo?: string | null;
  servicio_id?: number | null;
  reserva_id?: number | null;
  categoria?: string;
  descripcion?: string;
}

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

const buildQueryString = (filters: TransaccionesFilters): string => {
  const params = new URLSearchParams();

  if (filters.servicio_tipo) params.append('servicio_tipo', filters.servicio_tipo);
  if (filters.servicio_id) params.append('servicio_id', filters.servicio_id.toString());
  if (filters.reserva_id) params.append('reserva_id', filters.reserva_id.toString());
  if (filters.tipo) params.append('tipo', filters.tipo);
  if (filters.categoria) params.append('categoria', filters.categoria);
  if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
  if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);

  const query = params.toString();
  return query ? `?${query}` : '';
};

const handleAuthError = (status: number) => {
  if (status === 401 || status === 403) {
    console.error('❌ Error de autenticación:', status);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isUserLoggedIn');
      localStorage.removeItem('userData');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&error=session_expired`;
    }
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }
};

// 🔥 OBTENER LISTA DE TRANSACCIONES
export async function getTransacciones(filters: TransaccionesFilters = {}): Promise<Transaccion[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  const url = `${API_BASE_URL}/transacciones/${buildQueryString(filters)}`;

  console.log('📡 Obteniendo transacciones:', url);

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
      handleAuthError(response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar las transacciones'}`);
    }

    const data = await response.json();
    console.log('✅ Transacciones obtenidas:', data);
    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error('❌ Error en getTransacciones:', error);
    throw error;
  }
}

// 🔥 OBTENER RESUMEN (ingresos, gastos, balance)
export async function getResumen(filters: TransaccionesFilters = {}): Promise<ResumenData> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  const url = `${API_BASE_URL}/transacciones/resumen${buildQueryString(filters)}`;

  console.log('📡 Obteniendo resumen contable:', url);

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
      handleAuthError(response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el resumen'}`);
    }

    const data = await response.json();
    console.log('✅ Resumen contable obtenido:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getResumen:', error);
    throw error;
  }
}

// 🔥 OBTENER DETALLE DE TRANSACCIÓN
export async function getTransaccionDetail(id: number): Promise<Transaccion> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/transacciones/${id}`;
    console.log('📡 Obteniendo detalle de transacción:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      cache: 'no-store'
    });

    if (response.status === 401 || response.status === 403) {
      handleAuthError(response.status);
    }

    if (response.status === 404) {
      throw new Error(`Transacción ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar la transacción'}`);
    }

    const data = await response.json();
    console.log('✅ Transacción detalle obtenido:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getTransaccionDetail:', error);
    throw error;
  }
}

// 🔥 CREAR TRANSACCIÓN
export async function createTransaccion(data: SaveTransaccionData): Promise<{ message: string; id: number }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/transacciones/`;
    console.log('📡 Creando transacción:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
      handleAuthError(response.status);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en la respuesta:', response.status, errorData);
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Transacción creada:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en createTransaccion:', error);
    throw error;
  }
}

// 🔥 ACTUALIZAR TRANSACCIÓN
export async function updateTransaccion(id: number, data: SaveTransaccionData): Promise<{ message: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/transacciones/${id}`;
    console.log('📡 Actualizando transacción:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
      handleAuthError(response.status);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en la respuesta:', response.status, errorData);
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Transacción actualizada:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en updateTransaccion:', error);
    throw error;
  }
}

// 🔥 ELIMINAR TRANSACCIÓN
export async function deleteTransaccion(id: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/transacciones/${id}`;
    console.log('📡 Eliminando transacción:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      handleAuthError(response.status);
    }

    if (response.status === 404) {
      throw new Error(`Transacción ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en la respuesta:', response.status, errorData);
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    console.log('✅ Transacción eliminada:', id);

  } catch (error) {
    console.error('❌ Error en deleteTransaccion:', error);
    throw error;
  }
}
