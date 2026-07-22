// lib/api/emergencyContacts.ts

export interface ContactType {
  id: number;
  contact_type: string;
}

export interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  contact_type: ContactType[];
}

// 🔥 CORREGIDO: El campo debe ser contact_type_id
export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  contact_type_id: number[]; // Array de IDs de tipos de contacto
}

export interface ContactTypeFormData {
  contact_type: string;
}

// Cache para contactos
let contactsCache: {
  data: Contact[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

let contactTypesCache: {
  data: ContactType[] | null;
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

// 🔥 OBTENER CONTACTOS
export async function getContacts(forceRefresh = false): Promise<Contact[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  if (!forceRefresh && contactsCache.data && (Date.now() - contactsCache.timestamp) < CACHE_DURATION) {
    return contactsCache.data;
  }

  try {
    const url = `${API_BASE_URL}/contacts/`;

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los contactos'}`);
    }

    const data = await response.json();

    contactsCache = {
      data: data,
      timestamp: Date.now()
    };

    return data;

  } catch (error) {
    console.error('❌ Error en getContacts:', error);
    
    if (contactsCache.data) {
      return contactsCache.data;
    }
    
    throw error;
  }
}

// 🔥 OBTENER TIPOS DE CONTACTO
export async function getContactTypes(forceRefresh = false): Promise<ContactType[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  if (!forceRefresh && contactTypesCache.data && (Date.now() - contactTypesCache.timestamp) < CACHE_DURATION) {
    return contactTypesCache.data;
  }

  try {
    const url = `${API_BASE_URL}/contact-type/`;

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los tipos de contacto'}`);
    }

    const data = await response.json();

    contactTypesCache = {
      data: data,
      timestamp: Date.now()
    };

    return data;

  } catch (error) {
    console.error('❌ Error en getContactTypes:', error);
    
    if (contactTypesCache.data) {
      return contactTypesCache.data;
    }
    
    throw error;
  }
}

// 🔥 CREAR CONTACTO - CORREGIDO: usa contact_type_id
export async function createContact(data: ContactFormData): Promise<Contact> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/contacts/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      // 🔥 Enviamos el campo como contact_type_id
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email,
        contact_type_id: data.contact_type_id,
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
      
      let errorMsg = `Error ${response.status}: No se pudo crear el contacto`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();

    contactsCache = {
      data: null,
      timestamp: 0
    };

    return result;

  } catch (error) {
    console.error('❌ Error en createContact:', error);
    throw error;
  }
}

// 🔥 ACTUALIZAR CONTACTO - CORREGIDO: usa contact_type_id
export async function updateContact(contactId: number, data: ContactFormData): Promise<Contact> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/contacts/${contactId}/`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      // 🔥 Enviamos el campo como contact_type_id
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email,
        contact_type_id: data.contact_type_id,
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

    if (response.status === 404) {
      throw new Error('El contacto no existe');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo actualizar el contacto`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();

    contactsCache = {
      data: null,
      timestamp: 0
    };

    return result;

  } catch (error) {
    console.error('❌ Error en updateContact:', error);
    throw error;
  }
}

// 🔥 ELIMINAR CONTACTO
export async function deleteContact(contactId: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/contacts/${contactId}/`;

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
      throw new Error('El contacto no existe');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo eliminar el contacto`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }


    contactsCache = {
      data: null,
      timestamp: 0
    };

  } catch (error) {
    console.error('❌ Error en deleteContact:', error);
    throw error;
  }
}

// 🔥 CREAR TIPO DE CONTACTO
export async function createContactType(data: ContactTypeFormData): Promise<ContactType> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/contact-type/`;

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
      
      let errorMsg = `Error ${response.status}: No se pudo crear el tipo de contacto`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();

    contactTypesCache = {
      data: null,
      timestamp: 0
    };

    return result;

  } catch (error) {
    console.error('❌ Error en createContactType:', error);
    throw error;
  }
}

// 🔥 ELIMINAR TIPO DE CONTACTO
export async function deleteContactType(contactTypeId: number): Promise<void> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/contact-type/${contactTypeId}/`;

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
      throw new Error('El tipo de contacto no existe');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      
      let errorMsg = `Error ${response.status}: No se pudo eliminar el tipo de contacto`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }


    contactTypesCache = {
      data: null,
      timestamp: 0
    };

  } catch (error) {
    console.error('❌ Error en deleteContactType:', error);
    throw error;
  }
}

export function clearContactsCache() {
  contactsCache = {
    data: null,
    timestamp: 0
  };
  contactTypesCache = {
    data: null,
    timestamp: 0
  };
}