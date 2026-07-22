// lib/api/profiles.ts

export interface UserProfile {
  id: number;
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  };
  photo: string | null;
  position: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: number | null;
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

// 🔥 CACHE INICIALIZADO CON UN ARRAY VACÍO EN LUGAR DE NULL
let profilesCache: {
  data: UserProfile[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 60 * 1000; // 1 minuto

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

export async function getProfiles(forceRefresh = false): Promise<UserProfile[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  // 🔥 VERIFICAR CACHÉ - SI HAY DATOS Y NO HA EXPIRADO, RETORNARLOS
  if (!forceRefresh && profilesCache.data && (Date.now() - profilesCache.timestamp) < CACHE_DURATION) {
    return profilesCache.data; // ✅ profilesCache.data es UserProfile[] (no null porque verificamos)
  }

  try {
    const url = `${API_BASE_URL}/profiles/`;

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

    // 🔥 Asegurar que siempre guardamos un array
    const results = data.results || data || [];
    
    profilesCache = {
      data: results,
      timestamp: Date.now()
    };

    return results;

  } catch (error) {
    console.error('❌ Error en getProfiles:', error);
    
    // 🔥 Si hay error de red y tenemos caché, usar caché
    if (profilesCache.data) {
      return profilesCache.data;
    }
    
    // 🔥 Si no hay caché, retornar un array vacío en lugar de lanzar error
    console.warn('⚠️ No se pudieron cargar los perfiles, retornando array vacío');
    return [];
  }
}

// 🔥 ACTUALIZAR USUARIO
export async function updateUser(userId: number, userData: UpdateUserData): Promise<UserProfile> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/user-management/update-user/${userId}/`;

    const response = await fetch(url, {
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

    const result = await response.json();

    // Limpiar caché
    profilesCache = {
      data: null,
      timestamp: 0
    };

    return result;

  } catch (error) {
    console.error('❌ Error en updateUser:', error);
    throw error;
  }
}

// 🔥 ACTIVAR / DESACTIVAR USUARIO
export async function updateUserStatus(userId: number, isActive: boolean): Promise<UserProfile> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/user-management/update-user/${userId}/`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      // El backend interpreta el string 'approved' como activar; cualquier otro valor desactiva.
      body: JSON.stringify({ is_active: isActive ? 'approved' : 'rejected' }),
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

      let errorMsg = `Error ${response.status}: No se pudo cambiar el estado del usuario`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();

    // Limpiar caché
    profilesCache = {
      data: null,
      timestamp: 0
    };

    return result;

  } catch (error) {
    console.error('❌ Error en updateUserStatus:', error);
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


    // Limpiar caché
    profilesCache = {
      data: null,
      timestamp: 0
    };

  } catch (error) {
    console.error('❌ Error en deleteUser:', error);
    throw error;
  }
}

export interface CreateUserData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  position: string;
  phone: string;
}

// Extrae un mensaje legible de las distintas formas de error que devuelve authenticate/register/
function parseRegisterError(errorText: string, fallback: string): string {
  try {
    const errorData = JSON.parse(errorText);
    if (Array.isArray(errorData?.error) && errorData.error.length > 0) {
      return String(errorData.error[0]);
    }
    if (typeof errorData === 'object' && errorData !== null) {
      const firstKey = Object.keys(errorData)[0];
      const firstValue = firstKey ? errorData[firstKey] : undefined;
      if (Array.isArray(firstValue) && firstValue.length > 0) {
        return `${firstKey}: ${firstValue[0]}`;
      }
      if (errorData.message || errorData.detail) {
        return errorData.message || errorData.detail;
      }
    }
  } catch {
    // no era JSON, se usa el fallback
  }
  return errorText || fallback;
}

// 🔥 CREAR USUARIO
export async function createUser(userData: CreateUserData): Promise<unknown> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");

  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/authenticate/register/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        ...userData,
        repeat_password: userData.password,
      }),
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
      throw new Error(parseRegisterError(errorText, 'No se pudo crear el usuario'));
    }

    const result = await response.json();

    // Limpiar caché
    profilesCache = {
      data: null,
      timestamp: 0
    };

    return result;

  } catch (error) {
    console.error('❌ Error en createUser:', error);
    throw error;
  }
}

export function clearProfilesCache() {
  profilesCache = {
    data: null,
    timestamp: 0
  };
}

export async function refreshProfiles() {
  clearProfilesCache();
  return getProfiles(true);
}