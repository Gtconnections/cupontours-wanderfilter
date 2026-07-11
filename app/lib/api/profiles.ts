// lib/api/profiles.ts

export interface UserProfile {
  id: number;
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  photo: string | null;
  position: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: number;
  subscription_id: number | null;
  customer_id: string | null;
}

export interface ProfilesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserProfile[];
}

export interface UpdateUserData {
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: number;
}

export const POSITIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
  { value: 'seller', label: 'Seller' },
  { value: 'housekeeper', label: 'Housekeeper' },
  { value: 'front_desk', label: 'Front Desk' },
  { value: 'portal', label: 'Portal' },
  { value: 'customer', label: 'Customer' },
];

let profilesCache: {
  data: UserProfile[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 60 * 1000; // 1 minuto

// 🔥 OBTENER TOKEN (función auxiliar)
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

// 🔥 OBTENER TODOS LOS PERFILES
export async function getProfiles(forceRefresh = false): Promise<UserProfile[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  if (!forceRefresh && profilesCache.data && (Date.now() - profilesCache.timestamp) < CACHE_DURATION) {
    console.log('📦 Usando caché de perfiles');
    return profilesCache.data;
  }

  try {
    const url = `${API_BASE_URL}/profiles/`;
    console.log('📡 Fetching profiles:', url);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los usuarios'}`);
    }

    const data = await response.json();
    console.log('✅ Perfiles recibidos:', data);

    profilesCache = {
      data: data.results || data || [],
      timestamp: Date.now()
    };

    return profilesCache.data;

  } catch (error) {
    console.error('❌ Error en getProfiles:', error);
    
    if (profilesCache.data) {
      console.log('📦 Usando caché por error de red');
      return profilesCache.data;
    }
    
    throw error;
  }
}

// 🔥 ACTUALIZAR USUARIO (MÉTODO PATCH)
export async function updateUser(userId: number, userData: UpdateUserData): Promise<UserProfile> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/user-management/update-user/${userId}/`;
    console.log('📡 Actualizando usuario (PATCH):', url, userData);

    const response = await fetch(url, {
      // 🔥 CAMBIADO DE PUT A PATCH
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(userData),
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
      throw new Error('El usuario no existe');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo actualizar el usuario`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log('✅ Usuario actualizado:', data);

    // Limpiar caché para que se refresque la lista
    clearProfilesCache();

    return data;

  } catch (error) {
    console.error('❌ Error en updateUser:', error);
    throw error;
  }
}

// 🔥 ELIMINAR USUARIO
export async function deleteUser(userId: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/profiles/${userId}/`;
    console.log('📡 Eliminando usuario:', url);

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
      throw new Error('El usuario no existe');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo eliminar el usuario`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    console.log('✅ Usuario eliminado:', userId);

    clearProfilesCache();

  } catch (error) {
    console.error('❌ Error en deleteUser:', error);
    throw error;
  }
}

// Función para limpiar caché
export function clearProfilesCache() {
  profilesCache = {
    data: null,
    timestamp: 0
  };
  console.log('🧹 Caché de perfiles limpiada');
}

// Función para forzar recarga
export async function refreshProfiles() {
  clearProfilesCache();
  return getProfiles(true);
}