/**
 * API Client Utilities
 * Client-side utilities for making API requests
 */

import { clientConfig } from '@/lib/config'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  count?: number
  limit?: number
  offset?: number
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  serviceType: 'property' | 'car' | 'yacht' | 'general'
  propertyId?: string
  checkIn?: string
  checkOut?: string
  guests?: number
}

export interface BookingFormData {
  name: string
  email: string
  phone: string
  serviceType: 'property' | 'car' | 'yacht'
  serviceId: string
  serviceName: string
  startDate: string
  endDate?: string
  guests?: number
  specialRequests?: string
  totalAmount?: number
  isNewCustomer?: boolean
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = clientConfig.site.url
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api${endpoint}`
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
            return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Properties API
   */
  async getProperties(params?: {
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
  }) {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.makeRequest(endpoint)
  }

  async getProperty(id: string) {
    return this.makeRequest(`/properties/${id}`)
  }

  async getPropertyAvailability(id: string, startDate: string, endDate: string) {
    const params = new URLSearchParams({
      startDate,
      endDate,
    })
    return this.makeRequest(`/properties/${id}/availability?${params.toString()}`)
  }

  /**
   * Contact API
   */
  async submitContactForm(data: ContactFormData) {
    return this.makeRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Booking API
   */
  async submitBooking(data: BookingFormData) {
    return this.makeRequest('/booking', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient