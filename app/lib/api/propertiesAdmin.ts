// lib/api/propertiesAdmin.ts

export interface Property {
  id: number;
  name: string;
  public_name: string;
  description: string;
  photo: string | null;
  address: string;
  owner: string;
  beds_number: number;
  baths_number: number;
  cleaning_fee: string;
  rent_price: string;
  status: 'available' | 'reserved' | 'cleaning' | 'business';
  listing_type: 'house' | 'apartment' | 'car' | 'business' | 'luxury';
  property_id: string;
  max_of_guest: number;
  booking_price: string;
  listing_status: boolean;
  amenities: any[];
}

export interface PropertyDetailImage {
  id: number;
  image_url: string;
}

export interface PropertyDetail {
  listing_id: number;
  name: string;
  public_name: string;
  slug: string;
  listing_type: string;
  address: string;
  percentage: number;
  expenses_type: string;
  property_id: string;
  photo: string | null;
  listing_images: PropertyDetailImage[];
  max_of_guest: number;
  booking_price: number;
  description: string;
  listing_status: boolean;
  owner_info: {
    full_name: string;
    phone_number: string;
    email: string;
  };
  earnings_data: {
    total_earnings: number;
    total_month_earnings: number;
    last_year_total_earnings: number;
  };
  expenses_data: {
    total_expenses: number;
    total_month_expenses: number;
    last_year_total_expenses: number;
  };
  beds: number;
  bathrooms: number;
  rent: number;
  cleaning_fee: number;
  agreements: any[];
  profit_and_loss_history: {
    id: number;
    date: string;
    total_income: number;
    net_income: number;
  }[];
  amenities: any[];
}

export interface PropertyDetailResponse {
  listing: PropertyDetail;
  network: string | {
    network: string;
    password: string;
  };
}

export interface PropertiesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Property[];
}

export interface PropertiesFilters {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  listing_type?: string;
}

// 🔥 INTERFACE PARA CREAR WIFI
export interface WiFiCreateData {
  network: string;
  password: string;
  listing: number;
}

export interface WiFiResponse {
  id: number;
  listing: {
    id: number;
    public_name: string;
    property_id: string;
    listing_status: boolean;
  };
  network: string;
  password: string;
}

// 🔥 INTERFACE PARA SUBIR IMÁGENES
export interface UploadImageResponse {
  id: number;
  photo: string;
  listing_id: number;
}

// Cache para propiedades
let propertiesCache: {
  data: PropertiesResponse | null;
  timestamp: number;
  cacheKey: string;
} = {
  data: null,
  timestamp: 0,
  cacheKey: ''
};

let propertyDetailCache: {
  data: PropertyDetailResponse | null;
  timestamp: number;
  propertyId: number | null;
} = {
  data: null,
  timestamp: 0,
  propertyId: null
};

const CACHE_DURATION = 30 * 1000;
const DETAIL_CACHE_DURATION = 60 * 1000;

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

// 🔥 OBTENER LISTA DE PROPIEDADES
export async function getProperties(filters: PropertiesFilters = {}, forceRefresh = false): Promise<PropertiesResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  const params = new URLSearchParams();
  params.append('paginated', 'True');
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.page_size) params.append('page_size', filters.page_size.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.listing_type) params.append('listing_type', filters.listing_type);
  if (filters.search && filters.search.trim()) {
    params.append('name__icontains', filters.search.trim());
  }
  
  const queryString = params.toString();
  const cacheKey = queryString || 'default';

  if (!forceRefresh && propertiesCache.data && propertiesCache.cacheKey === cacheKey && (Date.now() - propertiesCache.timestamp) < CACHE_DURATION) {
    console.log('📦 Usando caché de propiedades');
    return propertiesCache.data;
  }

  try {
    const url = `${API_BASE_URL}/listings/${queryString ? `?${queryString}` : ''}`;
    console.log('📡 Fetching properties:', url);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar las propiedades'}`);
    }

    const data = await response.json();
    console.log('✅ Propiedades recibidas:', data);

    propertiesCache = {
      data: data,
      timestamp: Date.now(),
      cacheKey: cacheKey
    };

    return data;

  } catch (error) {
    console.error('❌ Error en getProperties:', error);
    
    if (propertiesCache.data) {
      console.log('📦 Usando caché por error de red');
      return propertiesCache.data;
    }
    
    throw error;
  }
}

// 🔥 OBTENER DETALLE DE PROPIEDAD
export async function getPropertyDetail(propertyId: number, forceRefresh = false): Promise<PropertyDetailResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  if (!forceRefresh && propertyDetailCache.data && propertyDetailCache.propertyId === propertyId && (Date.now() - propertyDetailCache.timestamp) < DETAIL_CACHE_DURATION) {
    console.log('📦 Usando caché de propiedad');
    return propertyDetailCache.data;
  }

  try {
    const url = `${API_BASE_URL}/listings/${propertyId}/`;
    console.log('📡 Fetching property detail:', url);

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
      throw new Error(`Propiedad ${propertyId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar la propiedad'}`);
    }

    const data = await response.json();
    console.log('✅ Propiedad detalle recibida:', data);

    propertyDetailCache = {
      data: data,
      timestamp: Date.now(),
      propertyId: propertyId
    };

    return data;

  } catch (error) {
    console.error('❌ Error en getPropertyDetail:', error);
    
    if (propertyDetailCache.data && propertyDetailCache.propertyId === propertyId) {
      console.log('📦 Usando caché por error de red');
      return propertyDetailCache.data;
    }
    
    throw error;
  }
}

// 🔥 CREAR WIFI
export async function createWiFi(data: WiFiCreateData): Promise<WiFiResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/wifi/create/`;
    console.log('📡 Creando WiFi:', url, data);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al crear el WiFi'}`);
    }

    const result = await response.json();
    console.log('✅ WiFi creado exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en createWiFi:', error);
    throw error;
  }
}

// 🔥 SUBIR IMÁGENES DE PROPIEDAD
export async function uploadListingImages(listingId: number, files: File[]): Promise<UploadImageResponse[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/listings/listing_photos/`;
    console.log('📡 Subiendo imágenes:', url, `(${files.length} archivos)`);

    const formData = new FormData();
    formData.append('listing_id', listingId.toString());
    
    // Agregar cada archivo con el mismo campo 'photo'
    files.forEach((file) => {
      formData.append('photo', file);
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
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al subir las imágenes'}`);
    }

    const result = await response.json();
    console.log('✅ Imágenes subidas exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en uploadListingImages:', error);
    throw error;
  }
}

// 🔥 LIMPIAR CACHÉ
export function clearPropertiesCache() {
  propertiesCache = {
    data: null,
    timestamp: 0,
    cacheKey: ''
  };
  propertyDetailCache = {
    data: null,
    timestamp: 0,
    propertyId: null
  };
  console.log('🧹 Caché de propiedades limpiada');
}

// 🔥 REFRESCAR PROPIEDADES
export async function refreshProperties(filters: PropertiesFilters = {}) {
  clearPropertiesCache();
  return getProperties(filters, true);
}

// 🔥 REFRESCAR DETALLE DE PROPIEDAD
export async function refreshPropertyDetail(propertyId: number) {
  propertyDetailCache = {
    data: null,
    timestamp: 0,
    propertyId: null
  };
  return getPropertyDetail(propertyId, true);
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 ELIMINAR IMAGEN DE PROPIEDAD
export async function deleteListingImage(imageId: number): Promise<{ message: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/delete_listing_photos/${imageId}/`;
    console.log('📡 Eliminando imagen:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
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
      throw new Error(`Imagen ${imageId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar la imagen'}`);
    }

    // Si la respuesta está vacía (204 No Content), retornamos éxito
    if (response.status === 204) {
      console.log('✅ Imagen eliminada exitosamente (204)');
      return { message: 'Imagen eliminada exitosamente' };
    }

    const result = await response.json();
    console.log('✅ Imagen eliminada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en deleteListingImage:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 CAMBIAR IMAGEN PRINCIPAL DE PROPIEDAD
export async function updatePrincipalPhoto(listingId: number, file: File): Promise<{ photo: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/listings/principal_photo/`;
    console.log('📡 Actualizando foto principal:', url);

    const formData = new FormData();
    formData.append('listing_id', listingId.toString());
    formData.append('photo', file);

    const response = await fetch(url, {
      method: 'PATCH',
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
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al actualizar la foto principal'}`);
    }

    const result = await response.json();
    console.log('✅ Foto principal actualizada:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en updatePrincipalPhoto:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA OWNER
export interface Owner {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
}

// 🔥 OBTENER LISTA DE OWNERS
export async function getOwners(): Promise<Owner[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/profiles/get-owners/`;
    console.log('📡 Obteniendo owners:', url);

    const response = await fetch(url, {
      method: 'GET',
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al obtener los owners'}`);
    }

    const data = await response.json();
    console.log('✅ Owners obtenidos:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getOwners:', error);
    throw error;
  }
}

// 🔥 INTERFACE PARA EDITAR PROPIEDAD
export interface EditListingData {
  owner_id: number;
  listing_public_name: string;
  listing_name: string;
  property_id: string;
  listing_type: string;
  address: string;
  rent_price: number;
  beds_number: number;
  baths_number: number;
  cleaning_fee: number;
  percentage: number;
  booking_price: number;
  max_of_guest: number;
  listing_status: boolean;
  description: string;
}

// 🔥 EDITAR PROPIEDAD
export async function editListing(listingId: number, data: EditListingData): Promise<any> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/listings/${listingId}/`;
    console.log('📡 Editando propiedad:', url, data);

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
      throw new Error(`Propiedad ${listingId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al editar la propiedad'}`);
    }

    const result = await response.json();
    console.log('✅ Propiedad editada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en editListing:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA PROFIT AND LOSS
export interface ProfitAndLossItem {
  id: number;
  date: string;
  reservation_income: string;
  additional_income: string;
  total_income: string;
  rent: string;
  invoices: string;
  total_expenses: string;
  income_minus_expenses: string;
  fee_cupon_tours: string;
  partner_net: string;
  deposit: string;
  refunds: string;
  listing: {
    id: number;
    name: string;
    description: string;
    photo: string;
    address: string;
    owner: string;
    beds: number;
    bath: number;
    cleaning_fee: string;
    rent_price: string;
    status: string;
    property_id: string;
  };
  list_invoices: any[];
  list_reservations: any[];
}

export interface ProfitAndLossResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    total_income: number;
    total_expenses: number;
    total_deposit: number;
    results: ProfitAndLossItem[];
  };
}

export interface ProfitAndLossFilters {
  page?: number;
  page_size?: number;
  slug__icontains?: string;
  date__icontains?: string;
}

// 🔥 OBTENER PROFIT AND LOSS
export async function getProfitAndLoss(filters: ProfitAndLossFilters = {}): Promise<ProfitAndLossResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.page_size) params.append('page_size', filters.page_size.toString());
  if (filters.slug__icontains) params.append('slug__icontains', filters.slug__icontains);
  if (filters.date__icontains) params.append('date__icontains', filters.date__icontains);
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/profit-and-loss/${queryString ? `?${queryString}` : ''}`;
  
  console.log('📡 Fetching profit and loss:', url);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar Profit and Loss'}`);
    }

    const data = await response.json();
    console.log('✅ Profit and Loss recibido:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getProfitAndLoss:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA DETALLE DE PROFIT AND LOSS
export interface ProfitAndLossDetail {
  id: number;
  date: string;
  reservation_income: string;
  additional_income: string;
  total_income: string;
  rent: string;
  invoices: string;
  total_expenses: string;
  income_minus_expenses: string;
  fee_cupon_tours: string;
  partner_net: string;
  deposit: string;
  refunds: string;
  listing: {
    id: number;
    name: string;
    description: string;
    photo: string;
    address: string;
    owner: string;
    beds: number;
    bath: number;
    cleaning_fee: string;
    rent_price: string;
    status: string;
    property_id: string;
  };
  list_invoices: {
    id: number;
    title: string;
    price: string;
    date: string;
    invoice_type: string;
    listing_id: number;
    list_details: {
      item: string;
      quantity: number;
      rate: string;
      amount: string;
    }[];
    list_images: {
      id: number;
      image: string;
    }[];
    partner_refund: boolean;
  }[];
  list_reservations: {
    id: number;
    listing_id: number;
    listing_name: string;
    booked: string;
    start_date: string;
    end_date: string;
    status: string;
    confirmation_code: string;
    reservation_type: string;
    platform_reservation: string;
    nights: number;
    guest_id: number;
    guest_name: string;
    guest_phone: string;
    number_of_guest: number;
    earnings: string;
    observations: string;
    image: string | null;
  }[];
}

// 🔥 OBTENER DETALLE DE PROFIT AND LOSS
export async function getProfitAndLossDetail(id: number): Promise<ProfitAndLossDetail> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/profit-and-loss/${id}/`;
    console.log('📡 Fetching profit and loss detail:', url);

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
      throw new Error(`Registro ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el detalle'}`);
    }

    const data = await response.json();
    console.log('✅ Detalle de Profit and Loss:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getProfitAndLossDetail:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 ELIMINAR PROFIT AND LOSS
export async function deleteProfitAndLoss(id: number): Promise<{ message: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/profit-and-loss/${id}/`;
    console.log('📡 Eliminando Profit and Loss:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
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
      throw new Error(`Registro ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar el registro'}`);
    }

    // Si la respuesta está vacía (204 No Content), retornamos éxito
    if (response.status === 204) {
      console.log('✅ Profit and Loss eliminado exitosamente (204)');
      return { message: 'Registro eliminado exitosamente' };
    }

    const result = await response.json();
    console.log('✅ Profit and Loss eliminado exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en deleteProfitAndLoss:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA LISTING SIMPLE (nombre e ID)
export interface ListingSimple {
  id: number;
  name: string;
}

// 🔥 INTERFACE PARA CREAR PROFIT AND LOSS
export interface CreateProfitAndLossData {
  type: string;
  start_date: string;
  list_listing_id: number[];
  month: string;
  year: string;
}

export interface CreateProfitAndLossResponse {
  list_errors: {
    detail: string;
  }[];
  list_success: {
    id: number;
    listing_id: number;
  }[];
}

// 🔥 OBTENER LISTA DE LISTINGS (solo id y name)
export async function getListingsNamesAndIds(): Promise<ListingSimple[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/listings_names_and_ids/`;
    console.log('📡 Obteniendo listings:', url);

    const response = await fetch(url, {
      method: 'GET',
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al obtener los listings'}`);
    }

    const data = await response.json();
    console.log('✅ Listings obtenidos:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getListingsNamesAndIds:', error);
    throw error;
  }
}

// 🔥 CREAR PROFIT AND LOSS
export async function createProfitAndLoss(data: CreateProfitAndLossData): Promise<CreateProfitAndLossResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/profit-and-loss/`;
    console.log('📡 Creando Profit and Loss:', url, data);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al crear el Profit and Loss'}`);
    }

    const result = await response.json();
    console.log('✅ Profit and Loss creado:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en createProfitAndLoss:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA AGREEMENT
export interface Agreement {
  id: number;
  created_at: string;
  title: string;
  expiration_date: string;
  agreement: string;
  user: number;
  listing: number;
}

export interface AgreementsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Agreement[];
}

export interface AgreementsFilters {
  page?: number;
  page_size?: number;
  search?: string;
}

// 🔥 OBTENER AGREEMENTS
export async function getAgreements(filters: AgreementsFilters = {}): Promise<AgreementsResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.page_size) params.append('page_size', filters.page_size.toString());
  if (filters.search) params.append('search', filters.search);
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/agreement/${queryString ? `?${queryString}` : ''}`;
  
  console.log('📡 Obteniendo agreements:', url);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los agreements'}`);
    }

    const data = await response.json();
    console.log('✅ Agreements obtenidos:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getAgreements:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 ELIMINAR AGREEMENT
export async function deleteAgreement(id: number): Promise<{ message: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/agreement/${id}/`;
    console.log('📡 Eliminando Agreement:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
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
      throw new Error(`Agreement ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar el agreement'}`);
    }

    // Si la respuesta está vacía (204 No Content), retornamos éxito
    if (response.status === 204) {
      console.log('✅ Agreement eliminado exitosamente (204)');
      return { message: 'Agreement eliminado exitosamente' };
    }

    const result = await response.json();
    console.log('✅ Agreement eliminado exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en deleteAgreement:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA CREAR AGREEMENT
export interface CreateAgreementData {
  title: string;
  expiration_date: string;
  listing_id: number;
  user_id: number;
  agreement: File;
}

export interface CreateAgreementResponse {
  id: number;
  created_at: string;
  title: string;
  expiration_date: string;
  agreement: string;
  user: number;
  listing: number;
}

// 🔥 CREAR AGREEMENT
export async function createAgreement(data: CreateAgreementData): Promise<CreateAgreementResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/agreement/`;
    console.log('📡 Creando Agreement:', url);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('expiration_date', data.expiration_date);
    formData.append('listing_id', data.listing_id.toString());
    formData.append('user_id', data.user_id.toString());
    formData.append('agreement', data.agreement);

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
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al crear el agreement'}`);
    }

    const result = await response.json();
    console.log('✅ Agreement creado exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en createAgreement:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA RESERVATION
export interface Reservation {
  id: number;
  booked: string;
  start_date: string;
  end_date: string;
  status: string;
  confirmation_code: string;
  reservation_type: string;
  nights: number;
  number_of_guest: number;
  earnings: number;
  observations: string;
  image: string;
  listing_id: number;
  listing_name: string;
  platform_reservation: string;
  guest_id: number;
  guest_name: string;
  guest_phone: string;
}

// 🔥 INTERFACE PARA LA RESPUESTA DE RESERVACIONES
export interface ReservationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    reservations: {
      listing_name: string;
      reservations: Reservation[];
      total_earnings: number; // 🔥 AGREGADO: total_earnings aquí
    };
  };
}

export interface ReservationsFilters {
  page?: number;
  listing_id?: number;
  start_date?: string;
  end_date?: string;
}

// 🔥 OBTENER RESERVACIONES
export async function getReservations(filters: ReservationsFilters = {}): Promise<ReservationsResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No hay sesión activa');
  }

  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.listing_id) params.append('listing_id', filters.listing_id.toString());
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/reservation/${queryString ? `?${queryString}` : ''}`;
  
  console.log('📡 Obteniendo reservaciones:', url);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar las reservaciones'}`);
    }

    const data = await response.json();
    console.log('✅ Reservaciones obtenidas:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getReservations:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA DETALLE DE RESERVACIÓN
export interface ReservationDetail {
  id: number;
  listing_id: number;
  listing_name: string;
  booked: string;
  start_date: string;
  end_date: string;
  status: string;
  confirmation_code: string;
  reservation_type: string;
  platform_reservation: string;
  nights: number;
  guest_id: number;
  guest_name: string;
  guest_phone: string;
  number_of_guest: number;
  earnings: number;
  observations: string;
  image: string;
}

// 🔥 OBTENER DETALLE DE RESERVACIÓN
export async function getReservationDetail(id: number): Promise<ReservationDetail> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/reservation/${id}/`;
    console.log('📡 Obteniendo detalle de reservación:', url);

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
      throw new Error(`Reservación ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el detalle de la reservación'}`);
    }

    const data = await response.json();
    console.log('✅ Detalle de reservación obtenido:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getReservationDetail:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 ELIMINAR RESERVACIÓN
export async function deleteReservation(id: number): Promise<{ message: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/reservation/${id}/`;
    console.log('📡 Eliminando reservación:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
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
      throw new Error(`Reservación ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar la reservación'}`);
    }

    if (response.status === 204) {
      console.log('✅ Reservación eliminada exitosamente (204)');
      return { message: 'Reservación eliminada exitosamente' };
    }

    const result = await response.json();
    console.log('✅ Reservación eliminada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en deleteReservation:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA CREAR RESERVACIÓN
export interface CreateReservationData {
  confirmation_code: string;
  booked: string;
  listing_id: number;
  check_in: string;
  check_out: string;
  reservation_status: string;
  platform_reservation: string;
  guest_name: string;
  guest_phone: string;
  number_of_guest: number;
  earnings: number;
  observations: string;
}

export interface CreateReservationResponse {
  id: number;
  confirmation_code: string;
  booked: string;
  listing_id: number;
  check_in: string;
  check_out: string;
  reservation_status: string;
  platform_reservation: string;
  guest_name: string;
  guest_phone: string;
  number_of_guest: number;
  earnings: number;
  observations: string;
}

// 🔥 CREAR RESERVACIÓN
export async function createReservation(data: CreateReservationData): Promise<CreateReservationResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/reservation/`;
    console.log('📡 Creando reservación:', url, data);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al crear la reservación'}`);
    }

    const result = await response.json();
    console.log('✅ Reservación creada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en createReservation:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// 🔥 INTERFACE PARA ACTUALIZAR RESERVACIÓN (para PATCH)
export interface UpdateReservationData {
  confirmation_code: string;
  booked: string;
  listing_id: number;
  start_date: string;
  end_date: string;
  status: string;
  platform_reservation: string;
  guest_name: string;
  guest_phone: string;
  number_of_guest: number;
  earnings: string;
  observations: string;
}

// 🔥 ACTUALIZAR RESERVACIÓN - con interfaz correcta
export async function updateReservation(id: number, data: UpdateReservationData): Promise<any> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/reservation/${id}/`;
    console.log('📡 Editando reservación:', url, data);

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
      throw new Error(`Reservación ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al editar la reservación'}`);
    }

    const result = await response.json();
    console.log('✅ Reservación editada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en updateReservation:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 ELIMINAR PROPIEDAD
export async function deleteListing(id: number): Promise<{ message: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/listings/${id}/`;
    console.log('📡 Eliminando propiedad:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
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
      throw new Error(`Propiedad ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar la propiedad'}`);
    }

    if (response.status === 204) {
      console.log('✅ Propiedad eliminada exitosamente (204)');
      return { message: 'Propiedad eliminada exitosamente' };
    }

    const result = await response.json();
    console.log('✅ Propiedad eliminada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en deleteListing:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA AMENITY
export interface Amenity {
  id: number;
  name: string;
  icon?: string;
}

// 🔥 INTERFACE PARA CREAR PROPIEDAD
export interface CreateListingData {
  owner_id: number;
  listing_public_name: string;
  listing_name: string;
  property_id: string;
  listing_type: string;
  address: string;
  rent_price: number;
  beds_number: number;
  baths_number: number;
  cleaning_fee: number;
  percentage: number;
  expenses: string;
  max_of_guest: number;
  booking_price: number;
  description: string;
  amenities: number[];
}

export interface CreateListingResponse {
  listing_id: number;
  name: string;
  public_name: string;
  slug: string;
  listing_type: string;
  address: string;
  percentage: number;
  expenses_type: string;
  property_id: string;
  photo: string | null;
  listing_images: any[];
  max_of_guest: number;
  booking_price: string;
  description: string;
  listing_status: boolean;
  owner_info: {
    full_name: string;
    phone_number: string;
    email: string;
  };
  earnings_data: {
    total_earnings: string;
    total_month_earnings: string;
    last_year_total_earnings: string;
  };
  expenses_data: {
    total_expenses: string;
    total_month_expenses: string;
    last_year_total_expenses: string;
  };
  beds: number;
  bathrooms: number;
  rent: string;
  cleaning_fee: string;
  agreements: any[];
  profit_and_loss_history: any[];
  amenities: any[];
}

// 🔥 OBTENER AMENITIES
export async function getAmenities(): Promise<Amenity[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/amenities/`;
    console.log('📡 Obteniendo amenities:', url);

    const response = await fetch(url, {
      method: 'GET',
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al obtener los amenities'}`);
    }

    const data = await response.json();
    console.log('✅ Amenities obtenidos:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getAmenities:', error);
    throw error;
  }
}

// 🔥 CREAR PROPIEDAD
export async function createListing(data: CreateListingData): Promise<CreateListingResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/listings/`;
    console.log('📡 Creando propiedad:', url, data);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al crear la propiedad'}`);
    }

    const result = await response.json();
    console.log('✅ Propiedad creada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en createListing:', error);
    throw error;
  }
}

// 🔥 SUBIR IMÁGENES DE PROPIEDAD (ya existe, solo la usamos)
// uploadListingImages(listingId, files)

// 🔥 CAMBIAR IMAGEN PRINCIPAL (ya existe, solo la usamos)
// updatePrincipalPhoto(listingId, file)

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA OWNER - CORREGIDA
export interface Owner {
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
  customer_id: number | null;
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA RESERVACIÓN DEL CALENDARIO
export interface CalendarReservation {
  booked: string;
  start_date: string;
  end_date: string;
  status: string;
  confirmation_code: string;
  reservation_type: string;
  nights: number;
  number_of_guest: number;
  earnings: string;
  platform_reservation: string;
  observations: string;
  guest_name: string;
}

// 🔥 OBTENER CALENDARIO DE PROPIEDAD
export async function getPropertyCalendar(listingId: number): Promise<CalendarReservation[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/calendar/${listingId}/`;
    console.log('📡 Obteniendo calendario de propiedad:', url);

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
      throw new Error(`Propiedad ${listingId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el calendario'}`);
    }

    const data = await response.json();
    console.log('✅ Calendario de propiedad obtenido:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getPropertyCalendar:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA FACTURA
export interface Invoice {
  id: number;
  title: string;
  price: string;
  date: string;
  invoice_type: string;
  listing_id: number;
  image: string | null;
  listing_name: string;
  list_details: {
    item: string;
    quantity: number;
    rate: string;
    amount: string;
  }[];
  list_images: {
    id: number;
    image: string;
  }[];
  partner_refund: boolean;
  comment: string | null;
}

export interface InvoicesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invoice[];
  total_expenses: number;
  total_incomes: number;
  total_actual_month_incomes: number;
  total_actual_month_expenses: number;
}

export interface InvoicesFilters {
  page?: number;
  initial_date?: string;
  final_date?: string;
}

// 🔥 OBTENER FACTURAS POR LISTING
export async function getInvoicesByListing(listingId: number, filters: InvoicesFilters = {}): Promise<InvoicesResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.initial_date) params.append('initial_date', filters.initial_date);
  if (filters.final_date) params.append('final_date', filters.final_date);
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/invoices-by-listing/${listingId}/${queryString ? `?${queryString}` : ''}`;
  
  console.log('📡 Obteniendo facturas:', url);

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

    if (response.status === 404) {
      throw new Error(`Propiedad ${listingId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar las facturas'}`);
    }

    const data = await response.json();
    console.log('✅ Facturas obtenidas:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getInvoicesByListing:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA DETALLE DE FACTURA
export interface InvoiceDetail {
  id: number;
  title: string;
  price: string;
  date: string;
  invoice_type: string;
  listing_id: number;
  image: string | null;
  listing_name: string;
  list_details: {
    item: string;
    quantity: number;
    rate: string;
    amount: string;
  }[];
  list_images: {
    id: number;
    image: string;
  }[];
  partner_refund: boolean;
  comment: string | null;
}

// 🔥 OBTENER DETALLE DE FACTURA
export async function getInvoiceDetail(invoiceId: number): Promise<InvoiceDetail> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/invoices/${invoiceId}/`;
    console.log('📡 Obteniendo detalle de factura:', url);

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
      throw new Error(`Factura ${invoiceId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el detalle de la factura'}`);
    }

    const data = await response.json();
    console.log('✅ Detalle de factura obtenido:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getInvoiceDetail:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA CREAR FACTURA
export interface CreateInvoiceData {
  title: string;
  date: string;
  invoice_type: string;
  list_listings: number[];
  list_details: {
    item: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  partner_refund: boolean;
  comment: string;
  price: string;
}

export interface CreateInvoiceResponse {
  id: number;
  title: string;
  price: string;
  date: string;
  invoice_type: string;
  listing_id: number;
  listing_name: string;
  partner_refund: boolean;
  comment: string | null;
}

// 🔥 CREAR FACTURA
export async function createInvoice(data: CreateInvoiceData): Promise<CreateInvoiceResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/invoices/`;
    console.log('📡 Creando factura:', url, data);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al crear la factura'}`);
    }

    const result = await response.json();
    console.log('✅ Factura creada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en createInvoice:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 ELIMINAR FACTURA
export async function deleteInvoice(id: number, detail: string): Promise<{ message: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/invoices/${id}/?detail=${encodeURIComponent(detail)}`;
    console.log('📡 Eliminando factura:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
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
      throw new Error(`Factura ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar la factura'}`);
    }

    if (response.status === 204) {
      console.log('✅ Factura eliminada exitosamente (204)');
      return { message: 'Factura eliminada exitosamente' };
    }

    const result = await response.json();
    console.log('✅ Factura eliminada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en deleteInvoice:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 EDITAR FACTURA
export async function updateInvoice(id: number, data: any): Promise<any> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/invoices/${id}/`;
    console.log('📡 Editando factura:', url, data);

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
      throw new Error(`Factura ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al editar la factura'}`);
    }

    const result = await response.json();
    console.log('✅ Factura editada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en updateInvoice:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 SUBIR IMÁGENES DE FACTURA
export async function uploadInvoiceImages(invoiceId: number, files: File[]): Promise<any[]> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/invoice-images/`;
    console.log('📡 Subiendo imágenes de factura:', url, `(${files.length} archivos)`);

    const formData = new FormData();
    formData.append('invoice_id', invoiceId.toString());
    
    files.forEach((file) => {
      formData.append('image', file);
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
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al subir las imágenes'}`);
    }

    const result = await response.json();
    console.log('✅ Imágenes subidas exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en uploadInvoiceImages:', error);
    throw error;
  }
}

// 🔥 ELIMINAR IMAGEN DE FACTURA
// lib/api/propertiesAdmin.ts

// 🔥 ELIMINAR IMAGEN DE FACTURA - CORREGIDO
export async function deleteInvoiceImage(imageId: number): Promise<{ message: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/invoice-images/`;
    console.log('📡 Eliminando imagen de factura:', url, 'image_id:', imageId);

    const formData = new FormData();
    formData.append('image_id', imageId.toString());

    const response = await fetch(url, {
      method: 'DELETE',
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

    if (response.status === 404) {
      throw new Error(`Imagen ${imageId} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar la imagen'}`);
    }

    if (response.status === 204) {
      console.log('✅ Imagen eliminada exitosamente (204)');
      return { message: 'Imagen eliminada exitosamente' };
    }

    const result = await response.json();
    console.log('✅ Imagen eliminada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en deleteInvoiceImage:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA ACCESS LINK
export interface AccessLinkAttribute {
  name: string;
  content: string;
  description: string;
}

export interface AccessLink {
  listing_link_access_id: number;
  name: string;
  link: string;
  description: string;
  listing_id: number;
  listing_link_attributes: AccessLinkAttribute[];
}

export interface AccessLinksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AccessLink[];
}

export interface AccessLinksFilters {
  page?: number;
  listing_id?: number;
}

// 🔥 OBTENER ACCESS LINKS
export async function getAccessLinks(filters: AccessLinksFilters = {}): Promise<AccessLinksResponse> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.listing_id) params.append('listing_id', filters.listing_id.toString());
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/listing-link-access/${queryString ? `?${queryString}` : ''}`;
  
  console.log('📡 Obteniendo access links:', url);

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

    if (response.status === 404) {
      throw new Error(`Propiedad ${filters.listing_id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los access links'}`);
    }

    const data = await response.json();
    console.log('✅ Access links obtenidos:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getAccessLinks:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 OBTENER DETALLE DE ACCESS LINK
export async function getAccessLinkDetail(id: number): Promise<AccessLink> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/listing-link-access/${id}/`;
    console.log('📡 Obteniendo detalle de access link:', url);

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
      throw new Error(`Access link ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar el access link'}`);
    }

    const data = await response.json();
    console.log('✅ Access link detalle obtenido:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en getAccessLinkDetail:', error);
    throw error;
  }
}

// 🔥 ELIMINAR ACCESS LINK
export async function deleteAccessLink(id: number): Promise<{ message: string }> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/listing-link-access/${id}/`;
    console.log('📡 Eliminando access link:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
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
      throw new Error(`Access link ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar el access link'}`);
    }

    if (response.status === 204) {
      console.log('✅ Access link eliminado exitosamente (204)');
      return { message: 'Access link eliminado exitosamente' };
    }

    const result = await response.json();
    console.log('✅ Access link eliminado exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en deleteAccessLink:', error);
    throw error;
  }
}

// lib/api/propertiesAdmin.ts

// ... (todas las interfaces y funciones existentes)

// 🔥 INTERFACE PARA CREAR ACCESS LINK
export interface CreateAccessLinkData {
  name: string;
  link: string;
  listing_id: string;
  description: string;
  attributes: {
    name: string;
    content: string;
    description: string;
  }[];
}

// 🔥 CREAR ACCESS LINK
export async function createAccessLink(data: CreateAccessLinkData): Promise<AccessLink> {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
  
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const url = `${API_BASE_URL}/listing-link-access/`;
    console.log('📡 Creando access link:', url, data);

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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al crear el access link'}`);
    }

    const result = await response.json();
    console.log('✅ Access link creado exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en createAccessLink:', error);
    throw error;
  }
}