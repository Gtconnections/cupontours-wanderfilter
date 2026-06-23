/**
 * Hostaway API Service
 * Simplified service for fetching property data from Hostaway API
 * Documentation: https://api.hostaway.com/documentation#listings
 */

import { hostawayClient } from './hostaway-client'
import { logError } from '@/lib/utils/logger'

export interface HostawayAmenity {
  id: number
  amenityId: number
  amenityName: string
}

export interface HostawayImage {
  id: number
  caption?: string
  bookingEngineCaption?: string
  airbnbCaption?: string
  vrboCaption?: string
  url: string
  sortOrder: number
}

export interface HostawayListing {
  id: number
  name: string
  description: string
  houseRules: string
  country: string
  countryCode: string
  state: string
  city: string
  thumbnailUrl: string
  price: number
  starRating: number
  personCapacity: number
  cancellationPolicy: string
  bedroomsNumber: number
  bedsNumber: number
  bathroomsNumber: number
  minNights: number
  maxNights: number
  guestsIncluded: number
  cleaningFee: number
  checkInTimeStart: number
  checkInTimeEnd: number | null
  checkOutTime: number
  address: string
  lat: number
  lng: number
  airbnbSummary: string
  airbnbSpace: string
  airbnbAccess: string
  airbnbInteraction: string
  airbnbNeighborhoodOverview: string
  airbnbTransit: string
  airbnbNotes: string
  averageReviewRating: number
  listingAmenities: HostawayAmenity[]
  listingImages: HostawayImage[]
}

export interface HostawayListingsResponse {
  status: string
  result: HostawayListing[]
  count: number
  limit: number
  offset: number
}

/**
 * Hostaway Service Class
 * Simplified service for properties data
 */
class HostawayService {
  private static instance: HostawayService
  private listingsCache: Map<string, { data: HostawayListingsResponse; expiry: number }> = new Map()
  private listingCache: Map<string, { data: { status: string; result: HostawayListing }; expiry: number }> = new Map()
  private readonly cacheTimeout = 15 * 60 * 1000 // 15 minutes

  private constructor() {}

  static getInstance(): HostawayService {
    if (!HostawayService.instance) {
      HostawayService.instance = new HostawayService()
    }
    return HostawayService.instance
  }

  /**
   * Cache management for listings
   */
  private getCacheKey(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const paramString = params ? JSON.stringify(params) : ''
    return `${endpoint}:${paramString}`
  }

  private getCachedListings(cacheKey: string): HostawayListingsResponse | null {
    const cached = this.listingsCache.get(cacheKey)
    if (cached && Date.now() < cached.expiry) {
      return cached.data
    }
    this.listingsCache.delete(cacheKey)
    return null
  }

  private setCachedListings(cacheKey: string, data: HostawayListingsResponse): void {
    this.listingsCache.set(cacheKey, {
      data,
      expiry: Date.now() + this.cacheTimeout
    })
  }

  private getCachedListing(cacheKey: string): { status: string; result: HostawayListing } | null {
    const cached = this.listingCache.get(cacheKey)
    if (cached && Date.now() < cached.expiry) {
      return cached.data
    }
    this.listingCache.delete(cacheKey)
    return null
  }

  private setCachedListing(cacheKey: string, data: { status: string; result: HostawayListing }): void {
    this.listingCache.set(cacheKey, {
      data,
      expiry: Date.now() + this.cacheTimeout
    })
  }

  /**
   * Search listings with availability and filters
   */
  async searchListings(params?: {
    limit?: number
    offset?: number
    city?: string
    country?: string
    availabilityDateStart?: string
    availabilityDateEnd?: string
    guests?: number
    sortOrder?: 'asc' | 'desc'
  }): Promise<HostawayListingsResponse> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey('/listings/search', params)
      const cachedData = this.getCachedListings(cacheKey)
      
      if (cachedData) {
                return cachedData
      }

      // Prepare query parameters
      const queryParams: Record<string, string | number> = {
        limit: params?.limit || 50,
        offset: params?.offset || 0,
        includeResources: 1
      }

      // Add optional search parameters
      if (params?.city) {
        queryParams.city = params.city
      }
      if (params?.country) {
        queryParams.country = params.country
      }
      if (params?.availabilityDateStart) {
        queryParams.availabilityDateStart = params.availabilityDateStart
      }
      if (params?.availabilityDateEnd) {
        queryParams.availabilityDateEnd = params.availabilityDateEnd
      }
      if (params?.sortOrder) {
        queryParams.sortOrder = params.sortOrder
      }

            const response = await hostawayClient.get<HostawayListing[]>('/listings', queryParams)
      
      let listings = Array.isArray(response) ? response : []

      // Filter by guest capacity if provided
      if (params?.guests) {
        listings = listings.filter(listing => listing.personCapacity >= params.guests!)
      }

      const result: HostawayListingsResponse = {
        status: 'success',
        result: listings,
        count: listings.length,
        limit: queryParams.limit as number,
        offset: queryParams.offset as number
      }

      // Cache the result
      this.setCachedListings(cacheKey, result)
      
            return result

    } catch (error) {
      logError('HostawayService.searchListings', error)
      throw new Error(`Failed to search listings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all listings with caching (backwards compatibility)
   */
  async getListings(params?: {
    limit?: number
    offset?: number
  }): Promise<HostawayListingsResponse> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey('/listings', params)
      const cachedData = this.getCachedListings(cacheKey)
      
      if (cachedData) {
                return cachedData
      }

      // Prepare query parameters
      const queryParams: Record<string, string | number> = {
        limit: params?.limit || 50,
        offset: params?.offset || 0,
        includeResources: 1
      }

            const response = await hostawayClient.get<HostawayListing[]>('/listings', queryParams)
      
      const listings = Array.isArray(response) ? response : []

      const result: HostawayListingsResponse = {
        status: 'success',
        result: listings,
        count: listings.length,
        limit: queryParams.limit as number,
        offset: queryParams.offset as number
      }

      // Cache the result
      this.setCachedListings(cacheKey, result)
      
            return result

    } catch (error) {
      logError('HostawayService.getListings', error)
      throw new Error(`Failed to fetch listings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get a single listing by ID with images and amenities
   */
  async getListing(id: string | number): Promise<{ status: string; result: HostawayListing }> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey('/listings', { id })
      const cachedData = this.getCachedListing(cacheKey)
      
      if (cachedData) {
                return cachedData
      }

            
      // Include relations for images and amenities using the new parameter
      const params = {
        includeResources: 1
      }
      
      const response = await hostawayClient.get<HostawayListing>(`/listings/${id}`, params)

      const result = {
        status: 'success',
        result: response
      }

      // Cache the result
      this.setCachedListing(cacheKey, result)
      
            return result

    } catch (error) {
      logError('HostawayService.getListing', error)
      throw new Error(`Failed to fetch listing ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Clear all caches (useful for testing)
   */
  clearCache(): void {
    this.listingsCache.clear()
      }

  /**
   * Get available cities from listings
   */
  async getAvailableCities(): Promise<{ cities: string[]; countries: string[] }> {
    try {
            const response = await this.getListings({ limit: 1000 }) // Get more to extract all cities
      
      const cities = new Set<string>()
      const countries = new Set<string>()
      
      response.result.forEach(listing => {
        if (listing.city) cities.add(listing.city)
        if (listing.country) countries.add(listing.country)
      })

      return {
        cities: Array.from(cities).sort(),
        countries: Array.from(countries).sort()
      }
    } catch (error) {
      logError('HostawayService.getAvailableCities', error)
      throw new Error(`Failed to fetch cities: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: string
    authenticated: boolean
    cacheSize: number
    tokenInfo?: Record<string, unknown>
  }> {
    try {
      const healthCheck = await hostawayClient.healthCheck()
      
      return {
        ...healthCheck,
        cacheSize: this.listingsCache.size
      }
    } catch (error) {
      return {
        status: 'error',
        authenticated: false,
        cacheSize: this.listingsCache.size
      }
    }
  }
}

// Export singleton instance
export const hostawayService = HostawayService.getInstance()

// Export for testing and backwards compatibility
export { HostawayService }
export default hostawayService