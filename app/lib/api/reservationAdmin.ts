// app/lib/api/reservationAdmin.ts

export interface Reservation {
  id: number;
  servicio_tipo: 'transporte_privado' | 'experiences' | 'servicios_generales' | 'wellness' | 'health' | 'real-estate' | 'events';
  servicio_id: number;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  personas: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | string;
  notas: string;
  created_at: string;
  updated_at: string;
}

export interface ReservationDetail extends Reservation {
  // Podemos extender si el detalle trae más campos
}

export interface ReservationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Reservation[];
}

// 🔥 OBTENER LISTA DE RESERVAS CON FILTROS
export async function getReservations(filters?: { servicio_tipo?: string }): Promise<ReservationResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  let url = `${API_BASE_URL}/reservas/`;
  
  if (filters?.servicio_tipo) {
    url += `?servicio_tipo=${encodeURIComponent(filters.servicio_tipo)}`;
  }
  
  console.log('📡 Obteniendo reservas:', url);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar las reservas'}`);
    }

    const data = await response.json();
    console.log('✅ Reservas obtenidas:', data);
    
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
    console.error('❌ Error en getReservations:', error);
    throw error;
  }
}

// 🔥 OBTENER DETALLE DE RESERVA
export async function getReservationDetail(id: number): Promise<ReservationDetail> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8000/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/reservas/${id}/`;
    console.log('📡 Obteniendo detalle de reserva:', url);

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
      throw new Error(`Reserva ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar la reserva'}`);
    }

    const data = await response.json();
    console.log('✅ Reserva detalle obtenido:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getReservationDetail:', error);
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