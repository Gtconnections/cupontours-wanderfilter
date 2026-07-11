// lib/api/profile.ts

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
  zipcode: number | null;
  subscription_id: number | null;
  customer_id: string | null;
}

export interface UpdateProfileData {
  user?: {
    email?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  repeat_new_password: string;
}

let profileCache: {
  data: UserProfile | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 30 * 1000;

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

export async function getProfile(profileId: number, forceRefresh = false): Promise<UserProfile> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();
  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  if (!forceRefresh && profileCache.data && (Date.now() - profileCache.timestamp) < CACHE_DURATION) {
    console.log('📦 Usando caché del perfil');
    return profileCache.data;
  }

  try {
    const url = `${API_BASE_URL}/profiles/${profileId}/`;
    console.log('📡 Fetching profile:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      cache: 'no-store'
    });

    console.log('📡 Status de la respuesta:', response.status);

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
      throw new Error(`Perfil con ID ${profileId} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el perfil'}`);
    }

    const responseText = await response.text();
    console.log('📄 Respuesta raw:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError);
      throw new Error('La respuesta del servidor no es un JSON válido');
    }

    console.log('✅ Datos parseados:', data);

    if (!data) {
      throw new Error('La respuesta del servidor está vacía');
    }

    let profileData = data;

    if (data.profile) {
      profileData = data.profile;
      console.log('📦 Usando data.profile');
    }

    if (data.data) {
      profileData = data.data;
      console.log('📦 Usando data.data');
    }

    console.log('📦 Profile data:', profileData);

    if (!profileData.user) {
      console.error('❌ profileData no tiene "user":', profileData);
      throw new Error(`Estructura de respuesta inválida: falta el campo "user". Respuesta: ${JSON.stringify(data)}`);
    }

    const normalizedData: UserProfile = {
      id: profileData.id || 0,
      user: {
        id: profileData.user.id || 0,
        email: profileData.user.email || '',
        username: profileData.user.username || '',
        first_name: profileData.user.first_name || '',
        last_name: profileData.user.last_name || '',
      },
      photo: profileData.photo || null,
      position: profileData.position || 'customer',
      phone: profileData.phone || '',
      address: profileData.address || '',
      city: profileData.city || '',
      state: profileData.state || '',
      country: profileData.country || '',
      zipcode: profileData.zipcode || null,
      subscription_id: profileData.subscription_id || null,
      customer_id: profileData.customer_id || null,
    };

    console.log('✅ Perfil normalizado:', normalizedData);

    profileCache = {
      data: normalizedData,
      timestamp: Date.now()
    };

    return normalizedData;

  } catch (error) {
    console.error('❌ Error en getProfile:', error);
    
    if (profileCache.data) {
      console.log('📦 Usando caché por error de red');
      return profileCache.data;
    }
    
    throw error;
  }
}

export async function updateProfile(profileId: number, data: UpdateProfileData): Promise<UserProfile> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/profiles/${profileId}/`;
    console.log('📡 Actualizando perfil:', url, data);

    const response = await fetch(url, {
      method: 'PATCH',
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

    if (response.status === 404) {
      throw new Error('Perfil no encontrado');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo actualizar el perfil`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Error parseando JSON en update:', parseError);
      throw new Error('La respuesta del servidor no es un JSON válido');
    }

    console.log('✅ Perfil actualizado:', result);

    let profileData = result;
    if (result.profile) {
      profileData = result.profile;
    }
    if (result.data) {
      profileData = result.data;
    }

    const normalizedData: UserProfile = {
      id: profileData.id || 0,
      user: {
        id: profileData.user?.id || 0,
        email: profileData.user?.email || '',
        username: profileData.user?.username || '',
        first_name: profileData.user?.first_name || '',
        last_name: profileData.user?.last_name || '',
      },
      photo: profileData.photo || null,
      position: profileData.position || 'customer',
      phone: profileData.phone || '',
      address: profileData.address || '',
      city: profileData.city || '',
      state: profileData.state || '',
      country: profileData.country || '',
      zipcode: profileData.zipcode || null,
      subscription_id: profileData.subscription_id || null,
      customer_id: profileData.customer_id || null,
    };

    profileCache = {
      data: normalizedData,
      timestamp: Date.now()
    };

    return normalizedData;

  } catch (error) {
    console.error('❌ Error en updateProfile:', error);
    throw error;
  }
}

// 🔥 CAMBIAR CONTRASEÑA - CORREGIDO PARA MOSTRAR ERRORES ESPECÍFICOS
export async function changePassword(data: ChangePasswordData): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/authenticate/change-password/`;
    console.log('📡 Cambiando contraseña:', url);

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
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      // 🔥 Intentar extraer el mensaje de error específico
      let errorMsg = `Error ${response.status}: No se pudo cambiar la contraseña`;
      
      try {
        const errorData = JSON.parse(errorText);
        console.log('📦 Error parseado:', errorData);
        
        // 🔥 Buscar el mensaje de error en diferentes estructuras
        if (errorData.error) {
          // Si es un string
          if (typeof errorData.error === 'string') {
            errorMsg = errorData.error;
          }
          // Si es un array
          else if (Array.isArray(errorData.error)) {
            errorMsg = errorData.error.join(', ');
          }
          // Si es un objeto con mensajes
          else if (typeof errorData.error === 'object') {
            const messages = Object.values(errorData.error).flat();
            errorMsg = messages.join(', ');
          }
        } 
        else if (errorData.message) {
          errorMsg = errorData.message;
        }
        else if (errorData.detail) {
          errorMsg = errorData.detail;
        }
        else if (errorData[0]) {
          errorMsg = errorData[0];
        }
        // Si hay un objeto con campos de error
        else {
          const errorKeys = Object.keys(errorData);
          if (errorKeys.length > 0) {
            const messages = errorKeys.map(key => {
              const value = errorData[key];
              if (Array.isArray(value)) {
                return value.join(', ');
              }
              return value;
            });
            errorMsg = messages.join('. ');
          }
        }
        
        console.log('📝 Mensaje de error extraído:', errorMsg);
      } catch (e) {
        // Si no se puede parsear, usar el texto plano
        errorMsg = errorText || errorMsg;
        console.log('📝 Usando texto plano como error:', errorMsg);
      }
      
      throw new Error(errorMsg);
    }

    console.log('✅ Contraseña cambiada exitosamente');

  } catch (error) {
    console.error('❌ Error en changePassword:', error);
    throw error;
  }
}

export function clearProfileCache() {
  profileCache = {
    data: null,
    timestamp: 0
  };
  console.log('🧹 Caché del perfil limpiada');
}