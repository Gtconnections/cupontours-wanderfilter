// lib/api/properties.ts
import { clientConfig } from "../config";
import { HostawayListing } from "../../lib/services/hostaway";

// Base del backend propio (mismo patrón que yachts/cars). El browser pega
// directo aquí, no a la ruta interna /api/properties.
const API_BASE_URL = clientConfig.api.baseUrl;

export interface PropertyCardData {
  id: string;
  title: string;
  location: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    period: string;
  };
  rating: number;
  reviewCount: number;
  images: string[];
  features: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
  };
  type: "property";
  available: boolean;
  featured: boolean;
  href: string;
}

interface BackendListingsResponse {
  status?: string;
  result?: HostawayListing[];
  count?: number;
  limit?: number;
  offset?: number;
}

function convertHostawayToPropertyCard(listing: HostawayListing): PropertyCardData {
  return {
    id: listing.id.toString(),
    title: listing.name,
    location: listing.city || "Private Location",
    description: listing.airbnbSummary || listing.description?.substring(0, 150) + "..." || "Beautiful property available for rent",
    price: {
      amount: listing.price,
      currency: '$',
      period: "night"
    },
    rating: listing.starRating || 5,
    reviewCount: 0,
    images: listing.listingImages?.length > 0
      ? listing.listingImages.sort((a, b) => a.sortOrder - b.sortOrder).map(pic => pic.url)
      : ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    features: {
      guests: listing.personCapacity,
      bedrooms: listing.bedroomsNumber,
      bathrooms: listing.bathroomsNumber
    },
    type: "property" as const,
    available: true,
    featured: false,
    href: `/properties/${listing.id}`
  };
}

// Trae listings crudos desde el backend (mirror de Hostaway + precio del motor)
async function fetchBackendListings(query: Record<string, string | number | undefined>): Promise<HostawayListing[]> {
  const url = new URL(`${API_BASE_URL}/hostaway/listings/`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data: BackendListingsResponse = await response.json();
  return Array.isArray(data.result) ? data.result : [];
}

export async function getProperties(params?: {
  limit?: number
  offset?: number
  city?: string
  state?: string
  country?: string
  guests?: number
  bedrooms?: number
  bathrooms?: number
  checkIn?: string
  checkOut?: string
  minPrice?: number
  maxPrice?: number
}): Promise<PropertyCardData[]> {
  try {
    let listings = await fetchBackendListings({
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
      city: params?.city,
      country: params?.country,
    });

    // Filtros que el backend no aplica (se resuelven en cliente)
    if (params?.guests) listings = listings.filter(l => (l.personCapacity ?? 0) >= params.guests!);
    if (params?.bedrooms) listings = listings.filter(l => (l.bedroomsNumber ?? 0) >= params.bedrooms!);
    if (params?.bathrooms) listings = listings.filter(l => (l.bathroomsNumber ?? 0) >= params.bathrooms!);
    if (params?.minPrice) listings = listings.filter(l => (l.price ?? 0) >= params.minPrice!);
    if (params?.maxPrice) listings = listings.filter(l => (l.price ?? 0) <= params.maxPrice!);

    return listings.map(convertHostawayToPropertyCard);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

export interface PropertiesPage {
  items: PropertyCardData[];
  count: number;
}

// Paginado numerado del servidor (offset/limit) devolviendo el total (count)
export async function getPropertiesPage(params: {
  page: number;
  pageSize: number;
  city?: string;
  country?: string;
}): Promise<PropertiesPage> {
  try {
    const offset = (params.page - 1) * params.pageSize;
    const url = new URL(`${API_BASE_URL}/hostaway/listings/`);
    url.searchParams.append('limit', String(params.pageSize));
    url.searchParams.append('offset', String(offset));
    if (params.city) url.searchParams.append('city', params.city);
    if (params.country) url.searchParams.append('country', params.country);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data: BackendListingsResponse = await response.json();
    const listings = Array.isArray(data.result) ? data.result : [];
    const count = typeof data.count === 'number' ? data.count : listings.length;
    return { items: listings.map(convertHostawayToPropertyCard), count };
  } catch (error) {
    console.error('Error fetching properties page:', error);
    return { items: [], count: 0 };
  }
}

/**
 * Obtener propiedades para el home (solo 8)
 */
export async function getHomeProperties(): Promise<PropertyCardData[]> {
  try {
    const listings = await fetchBackendListings({ limit: 8, offset: 0 });
    return listings.map(convertHostawayToPropertyCard);
  } catch (error) {
    console.error('Error fetching home properties:', error);
    return [];
  }
}

export async function getPropertyById(id: string): Promise<HostawayListing | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/hostaway/listings/${id}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.result ?? null;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

export async function getFeaturedProperties(): Promise<PropertyCardData[]> {
  try {
    const allProperties = await getProperties({ limit: 8 });
    return allProperties;
  } catch (error) {
    return [];
  }
}

export interface PropertySearchParams {
  city?: string
  country?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  limit?: number
  offset?: number
  sortOrder?: 'asc' | 'desc'
}

export async function searchProperties(params: PropertySearchParams = {}): Promise<PropertyCardData[]> {
  try {
    let listings = await fetchBackendListings({
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
      city: params.city,
      country: params.country,
    });

    if (params.guests) listings = listings.filter(l => (l.personCapacity ?? 0) >= params.guests!);

    return listings.map(convertHostawayToPropertyCard);
  } catch (error) {
    console.error('Error searching properties:', error);
    return [];
  }
}

export async function getAvailableCities(): Promise<string[]> {
  try {
    const listings = await fetchBackendListings({ limit: 1000, offset: 0 });
    const cities = new Set<string>();
    listings.forEach(l => { if (l.city) cities.add(l.city); });
    return Array.from(cities).sort();
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}
