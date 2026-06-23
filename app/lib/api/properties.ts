// lib/api/properties.ts
import { HostawayListing } from "../../lib/services/hostaway";

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

// ✅ CORREGIDO: Ahora apunta a tus propias API Routes
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
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    // ✅ CAMBIADO: usar ruta local en lugar de cupontours.com
    const response = await fetch(`/api/properties?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch properties');
    }
    
    return data.data.map((listing: HostawayListing) => convertHostawayToPropertyCard(listing));
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

// lib/api/properties.ts

/**
 * Obtener propiedades para el home (solo 8)
 */
export async function getHomeProperties(): Promise<PropertyCardData[]> {
  try {
    const response = await fetch(`/api/properties?limit=8`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch properties');
    }
    
    return data.data.map((listing: HostawayListing) => convertHostawayToPropertyCard(listing));
  } catch (error) {
    console.error('Error fetching home properties:', error);
    return [];
  }
}

export async function getPropertyById(id: string): Promise<HostawayListing | null> {
  try {
    // ✅ CAMBIADO: usar ruta local
    const response = await fetch(`/api/properties/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch property');
    }
    
    return data.data;
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
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    // ✅ CAMBIADO: usar ruta local
    const response = await fetch(`/api/properties/search?${searchParams}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Search failed');
    }

    return data.data.result.map((listing: HostawayListing) => convertHostawayToPropertyCard(listing));
  } catch (error) {
    console.error('Error searching properties:', error);
    return [];
  }
}

export async function getAvailableCities(): Promise<string[]> {
  try {
    // ✅ CAMBIADO: usar ruta local
    const response = await fetch('/api/properties/cities');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch cities');
    }

    return data.data.cities || [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}