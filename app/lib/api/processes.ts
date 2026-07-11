// lib/api/processes.ts

export interface Process {
  id: number;
  name: string;
  repetition: string | null;
  description: string;
}

export interface ProcessCategory {
  process_name: string;
  processes: Process[];
}

export interface ProcessType {
  id: number;
  process_name: string;
  user_position: string;
}

export interface ProcessFormData {
  name: string;
  repetition: string;
  description: string;
  process_type: number;
}

export const REPETITION_OPTIONS = [
  { value: 'one_time', label: 'ONE TIME' },
  { value: 'daily', label: 'DAILY' },
  { value: 'weekly', label: 'WEEKLY' },
  { value: 'monthly', label: 'MONTHLY' },
];

// Cache para procesos
let processesCache: {
  data: ProcessCategory[] | null;
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

export async function getProcesses(forceRefresh = false): Promise<ProcessCategory[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  if (!forceRefresh && processesCache.data && (Date.now() - processesCache.timestamp) < CACHE_DURATION) {
    console.log('📦 Usando caché de procesos');
    return processesCache.data;
  }

  try {
    const url = `${API_BASE_URL}/process/`;
    console.log('📡 Fetching processes:', url);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los procesos'}`);
    }

    const data = await response.json();
    console.log('✅ Procesos recibidos:', data);

    processesCache = {
      data: data,
      timestamp: Date.now()
    };

    return data;

  } catch (error) {
    console.error('❌ Error en getProcesses:', error);
    
    if (processesCache.data) {
      console.log('📦 Usando caché por error de red');
      return processesCache.data;
    }
    
    throw error;
  }
}

export async function getProcessTypes(forceRefresh = false): Promise<ProcessType[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/process_type/`;
    console.log('📡 Fetching process types:', url);

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
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los tipos de procesos'}`);
    }

    const data = await response.json();
    console.log('✅ Tipos de procesos recibidos:', data);

    return data;

  } catch (error) {
    console.error('❌ Error en getProcessTypes:', error);
    throw error;
  }
}

// 🔥 ACTUALIZAR PROCESO (PATCH)
export async function updateProcess(processId: number, data: ProcessFormData): Promise<Process> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/process/${processId}/`;
    console.log('📡 Actualizando proceso:', url, data);

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
      throw new Error('El proceso no existe');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo actualizar el proceso`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Proceso actualizado:', result);

    processesCache = {
      data: null,
      timestamp: 0
    };

    return result;

  } catch (error) {
    console.error('❌ Error en updateProcess:', error);
    throw error;
  }
}

// 🔥 CREAR PROCESO (POST)
export async function createProcess(data: ProcessFormData): Promise<Process> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/process/`;
    console.log('📡 Creando proceso:', url, data);

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
      
      let errorMsg = `Error ${response.status}: No se pudo crear el proceso`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Proceso creado:', result);

    processesCache = {
      data: null,
      timestamp: 0
    };

    return result;

  } catch (error) {
    console.error('❌ Error en createProcess:', error);
    throw error;
  }
}

// 🔥 ELIMINAR PROCESO
export async function deleteProcess(processId: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/process/${processId}/`;
    console.log('📡 Eliminando proceso:', url);

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
      throw new Error('El proceso no existe');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo eliminar el proceso`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    console.log('✅ Proceso eliminado:', processId);

    processesCache = {
      data: null,
      timestamp: 0
    };

  } catch (error) {
    console.error('❌ Error en deleteProcess:', error);
    throw error;
  }
}

export function clearProcessesCache() {
  processesCache = {
    data: null,
    timestamp: 0
  };
  console.log('🧹 Caché de procesos limpiada');
}

// lib/api/processes.ts

// ... (todo el código anterior se mantiene igual) ...

// 🔥 CREAR TIPO DE PROCESO (POST a /api/process_type/)
export async function createProcessType(data: { process_name: string; user_position: string }): Promise<ProcessType> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/process_type/`;
    console.log('📡 Creando tipo de proceso:', url, data);

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
      
      let errorMsg = `Error ${response.status}: No se pudo crear el tipo de proceso`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Tipo de proceso creado:', result);

    return result;

  } catch (error) {
    console.error('❌ Error en createProcessType:', error);
    throw error;
  }
}