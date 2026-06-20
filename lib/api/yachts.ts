import { clientConfig } from "@/lib/config"
import { Yacht, YachtApiResponse } from "@/types/globals"
import { PropertyCardData } from "@/components/ui/property-card"

const API_BASE_URL = clientConfig.api.baseUrl

/**
 * Transform a Yacht object to PropertyCardData format
 */
function transformYachtToPropertyCard(yacht: Yacht): PropertyCardData {
  return {
    id: yacht.id.toString(),
    title: yacht.name,
    location: "Miami, FL",
    description: `Experience luxury aboard this magnificent ${yacht.length}ft yacht. Perfect for up to ${yacht.capacity} guests.`,
    price: {
      amount: Number(yacht.price_full_day || yacht.price_half_day || 0),
      currency: "USD",
      period: yacht.price_full_day ? "day" : "half day"
    },
    rating: 5.0,
    reviewCount: Math.floor(Math.random() * 50) + 20, // Random review count for demo
    images: yacht.gallery && yacht.gallery.length > 0 
      ? yacht.gallery.map(img => img.image_url)
      : ["https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    features: {
      guests: yacht.capacity || 0,
      bedrooms: yacht.staterooms || 0,
      bathrooms: yacht.bathrooms || 0,
      length: `${yacht.length}ft`,
      crew: yacht.crew ? 1 : 0
    },
    type: "yacht" as const,
    available: true,
    featured: false,
    href: `/yachts/${yacht.id}`
  }
}

/**
 * Fetch all yachts and transform to PropertyCardData format
 * @param page - Page number for pagination (optional)
 * @returns Promise with transformed yachts data
 */
export async function getYachtsForListing(page?: number): Promise<PropertyCardData[]> {
  try {
    const yachtResponse = await getYachts(page)
    return yachtResponse.results.map(transformYachtToPropertyCard)
  } catch (error) {
        return []
  }
}

/**
 * Fetch all yachts from the external API
 * @param page - Page number for pagination (optional)
 * @returns Promise with yachts data
 */
export async function getYachts(page?: number): Promise<YachtApiResponse> {
  try {
    // Fixed: Proper URL construction
    let url = `${API_BASE_URL}/landing/yachts/`
    if (page) {
      url += `?page=${page}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache configuration for better performance
      next: {
        revalidate: 3600, // Revalidate every hour
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch yachts: ${response.status} ${response.statusText}`)
    }

    const data: YachtApiResponse = await response.json()
    return data
  } catch (error) {
        throw new Error('Failed to fetch yachts data')
  }
}

/**
 * Fetch a single yacht by ID
 * @param id - Yacht ID
 * @returns Promise with yacht data
 */
export async function getYachtById(id: number): Promise<Yacht> {
  try {
    const url = `${API_BASE_URL}/landing/yachts/${id}/`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 3600, // Revalidate every hour
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Yacht not found')
      }
      throw new Error(`Failed to fetch yacht: ${response.status} ${response.statusText}`)
    }

    const yacht: Yacht = await response.json()
    return yacht
  } catch (error) {
        throw error
  }
}

/**
 * Search yachts by various criteria
 * @param searchParams - Search parameters
 * @returns Promise with filtered yachts data
 */
export async function searchYachts(searchParams: {
  name?: string
  minLength?: number
  maxLength?: number
  minCapacity?: number
  maxCapacity?: number
  amenities?: string[]
  page?: number
}): Promise<YachtApiResponse> {
  try {
    const data = await getYachts(searchParams.page)
    
    let filteredYachts = data.results
    
    // Apply filters
    if (searchParams.name) {
      filteredYachts = filteredYachts.filter(
        yacht => yacht.name.toLowerCase().includes(searchParams.name!.toLowerCase())
      )
    }
    
    if (searchParams.minLength) {
      filteredYachts = filteredYachts.filter(yacht => yacht.length >= searchParams.minLength!)
    }
    
    if (searchParams.maxLength) {
      filteredYachts = filteredYachts.filter(yacht => yacht.length <= searchParams.maxLength!)
    }
    
    if (searchParams.minCapacity) {
      filteredYachts = filteredYachts.filter(yacht => yacht.capacity >= searchParams.minCapacity!)
    }
    
    if (searchParams.maxCapacity) {
      filteredYachts = filteredYachts.filter(yacht => yacht.capacity <= searchParams.maxCapacity!)
    }
    
    if (searchParams.amenities && searchParams.amenities.length > 0) {
      filteredYachts = filteredYachts.filter(yacht => {
        return searchParams.amenities!.every(amenity => {
          switch (amenity.toLowerCase()) {
            case 'certified_captain':
              return yacht.certified_captain
            case 'fuel':
              return yacht.fuel
            case 'water_toys':
              return yacht.water_toys
            case 'vip_host':
              return yacht.vip_host
            case 'crew':
              return yacht.crew
            case 'jet_sky':
              return yacht.jet_sky
            case 'jacuzzi':
              return yacht.jacuzzi
            case 'slide':
              return yacht.slide
            case 'seabob':
              return yacht.seabob
            default:
              return false
          }
        })
      })
    }
    
    return {
      ...data,
      results: filteredYachts,
      count: filteredYachts.length,
    }
  } catch (error) {
        throw new Error('Failed to search yachts')
  }
}