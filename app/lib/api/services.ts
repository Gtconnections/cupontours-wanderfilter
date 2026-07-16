// ==========================================
// 1. TRANSPORT API
// ==========================================
export interface TransportItem {
  id: number;
  name: string;
  slug: string;
  principal_image: string;
  price_hour: string;
  capacity: number;
  category: string;
  brand: string;
  model: string;
  color: string;
  kit: string;
  descripcion: string;
  status: string;
}

export async function getPrivateTransport(): Promise<TransportItem[]> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/transporte-privado`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store' 
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener la flota:", error);
    return []; 
  }
}

export async function getPrivateTransportById(id: string): Promise<TransportItem | null> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/transporte-privado/${id}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener transporte ${id}:`, error);
    return null;
  }
}

// ==========================================
// 2. EXPERIENCES API
// ==========================================
export interface ExperienceItem {
  id: number;
  name: string;
  slug: string;
  principal_image: string;
  price: string;
  capacity_min: number;
  capacity_max: number;
  location: string;
  duration_days: number;
  pet_friendly: number;
  category: string;
  descripcion: string;
  status: string;
}

export async function getExperiences(): Promise<ExperienceItem[]> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/experiences?status=activo`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store' 
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener las experiencias:", error);
    return []; 
  }
}

export async function getExperienceById(id: string): Promise<ExperienceItem | null> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/experiences/${id}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener experiencia ${id}:`, error);
    return null;
  }
}

// ==========================================
// 3. REAL ESTATE API
// ==========================================
export interface RealEstateItem {
  id: number;
  name: string;
  slug: string;
  principal_image: string;
  price: string;
  operation_type: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  sqft: string;
  location: string;
  address: string;
  parking_spaces: number;
  descripcion: string;
  status: string;
}

export async function getRealEstate(): Promise<RealEstateItem[]> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/real-estate?status=activo`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store' 
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener real estate:", error);
    return []; 
  }
}

export async function getRealEstateById(id: string): Promise<RealEstateItem | null> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/real-estate/${id}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener propiedad ${id}:`, error);
    return null;
  }
}

// ==========================================
// 4. GENERAL SERVICES API
// ==========================================
export interface GeneralServiceItem {
  id: number;
  name: string;
  slug: string;
  principal_image: string;
  price: string | null;
  price_type: string;
  category: string;
  descripcion: string;
  status: string;
}

export async function getGeneralServices(): Promise<GeneralServiceItem[]> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/servicios-generales?status=activo`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store' 
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener servicios generales:", error);
    return []; 
  }
}

export async function getGeneralServiceById(id: string): Promise<GeneralServiceItem | null> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/servicios-generales/${id}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener servicio general ${id}:`, error);
    return null;
  }
}

// ==========================================
// 5. WELLNESS API
// ==========================================
export interface WellnessItem {
  id: number;
  name: string;
  slug: string;
  principal_image: string;
  price: string;
  duration_minutes: number;
  category: string;
  location: string;
  descripcion: string;
  status: string;
}

export async function getWellness(): Promise<WellnessItem[]> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/wellness?status=activo`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store' 
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener wellness:", error);
    return []; 
  }
}

export async function getWellnessById(id: string): Promise<WellnessItem | null> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/wellness/${id}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener wellness ${id}:`, error);
    return null;
  }
}

// ==========================================
// 6. HEALTH API
// ==========================================
export interface HealthItem {
  id: number;
  name: string;
  slug: string;
  principal_image: string;
  price: string;
  duration_minutes: number;
  category: string;
  location: string;
  descripcion: string;
  status: string;
}

export async function getHealth(): Promise<HealthItem[]> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/health?status=activo`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store' 
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener health:", error);
    return []; 
  }
}

export async function getHealthById(id: string): Promise<HealthItem | null> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/health/${id}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener health ${id}:`, error);
    return null;
  }
}

// ==========================================
// 7. EVENTS API
// ==========================================
export interface EventItem {
  id: number;
  name: string;
  slug: string;
  principal_image: string;
  descripcion: string;
  fecha_hora: string;
  price: string;
  location: string;
  capacity: number;
  category: string;
  status: string;
}

export async function getEvents(): Promise<EventItem[]> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/events?status=activo`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store' 
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return []; 
  }
}

export async function getEventById(id: string): Promise<EventItem | null> {
  const API_BASE = process.env.API_BASE_URL_LOCAL || 'http://localhost/backend_cupon';
  try {
    const response = await fetch(`${API_BASE}/events/${id}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener evento ${id}:`, error);
    return null;
  }
}