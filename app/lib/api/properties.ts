import { HostawayListing } from "../../lib/services/hostaway";

// CORRECCIÓN: Exportamos explícitamente el tipo de datos que el catálogo de vista consumirá
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

// Convert Hostaway listing to PropertyCardData format
function convertHostawayToPropertyCard(listing: HostawayListing): PropertyCardData {
  return {
    id: listing.id.toString(),
    title: listing.name,
    location: "Private Location", 
    description: listing.airbnbSummary || listing.description?.substring(0, 150) + "..." || "Beautiful property available for rent",
    price: { 
      amount: listing.price, 
      currency: '$', 
      period: "night" 
    },
    rating: 5, 
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
  }
}

// API functions that fetch from our backend which uses Hostaway
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
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`https://cupontours.com/api/properties?${searchParams.toString()}`)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch properties')
    }
    
    return data.data.map((listing: HostawayListing) => convertHostawayToPropertyCard(listing))
  } catch (error) {
    return []
  }
}

export async function getPropertyById(id: string): Promise<HostawayListing | null> {
  try {
    // CORRECCIÓN: Apuntamos de manera absoluta para evitar errores HTML inválidos en local
    const response = await fetch(`https://cupontours.com/api/properties/${id}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`API Error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch property')
    }
    
    return data.data
  } catch (error) {
    return null
  }
}

export async function getFeaturedProperties(): Promise<PropertyCardData[]> {
  try {
    const allProperties = await getProperties({ limit: 8 })
    return allProperties
  } catch (error) {
    return []
  }
}

// New search functionality
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

export interface PropertySearchResponse {
  success: boolean
  data: {
    status: string
    result: HostawayListing[]
    count: number
    limit: number
    offset: number
  }
  searchParams?: PropertySearchParams
  error?: string
}

export interface CitiesResponse {
  success: boolean
  data: {
    cities: string[]
    countries: string[]
  }
  error?: string
}

export async function searchProperties(params: PropertySearchParams = {}): Promise<PropertyCardData[]> {
  try {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    // CORRECCIÓN: Apuntamos de manera absoluta para evitar errores HTML inválidos en local
    const response = await fetch(`https://cupontours.com/api/properties/search?${searchParams}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`)
    }

    if (!data.success) {
      throw new Error(data.error || 'Search failed')
    }

    return data.data.result.map((listing: HostawayListing) => convertHostawayToPropertyCard(listing))
  } catch (error) {
    return []
  }
}

export async function getAvailableCities(): Promise<string[]> {
  try {
    // CORRECCIÓN: Apuntamos de manera absoluta para evitar errores HTML inválidos en local
    const response = await fetch('https://cupontours.com/api/properties/cities')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`)
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch cities')
    }

    return data.data.cities || []
  } catch (error) {
    return []
  }
}