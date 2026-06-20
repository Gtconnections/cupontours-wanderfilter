// Centralized API exports
export { getProperties } from "./properties"
export { 
  getCars, 
  getCarById, 
  getAvailableCars, 
  getCarsByBrand, 
  searchCars 
} from "./cars"
export { 
  getYachts, 
  getYachtById, 
  searchYachts,
  getYachtsForListing 
} from "./yachts"
export { getJets, getAirplanes, getHelicopters } from "./jets"
export { 
  getFAQs, 
  getGeneralFAQs, 
  getAviationFAQs, 
  getYachtFAQs, 
  getHotelFAQs,
  getFAQsByCategory,
  allFAQs,
  generalFAQs,
  aviationFAQs,
  yachtFAQs,
  hotelFAQs
} from "./faqs"

// Re-export types
export type { PropertyCardData } from "@/components/ui/property-card"
export type { FAQData } from "@/components/ui/faq-item"

// Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Common API utilities
export const API_ENDPOINTS = {
  PROPERTIES: '/api/properties',
  CARS: '/api/cars',
  YACHTS: '/api/yachts',
  BOOKINGS: '/api/bookings',
  USERS: '/api/users'
} as const

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Generic API call function for future use
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new ApiError(
        `API call failed: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()
    return {
      data,
      success: true,
    }
  } catch (error) {
        throw error
  }
}