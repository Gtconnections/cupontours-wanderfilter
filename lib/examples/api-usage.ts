/**
 * Example Usage of API Services
 * This file demonstrates how to use the new API services
 */

import { apiClient } from '@/lib/api/client'

// Example: Contact Form Handler
export async function handleContactForm(formData: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  serviceType: 'property' | 'car' | 'yacht' | 'general'
  propertyId?: string
}) {
  try {
    const response = await apiClient.submitContactForm(formData)
    
    if (response.success) {
      // Show success message
      alert('Thank you! Your message has been sent successfully.')
      return true
    } else {
      // Show error message
      alert(`Error: ${response.error || 'Failed to send message'}`)
      return false
    }
  } catch (error) {
        alert('An unexpected error occurred. Please try again.')
    return false
  }
}

// Example: Booking Form Handler
export async function handleBookingForm(formData: {
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
}) {
  try {
    const response = await apiClient.submitBooking({
      ...formData,
      isNewCustomer: true, // You can implement logic to determine this
    })
    
    if (response.success) {
      // Show success message and redirect
      alert('Booking submitted successfully! Check your email for confirmation.')
      // Redirect to confirmation page
      window.location.href = '/booking-confirmation'
      return true
    } else {
      // Show error message
      alert(`Error: ${response.error || 'Failed to submit booking'}`)
      return false
    }
  } catch (error) {
        alert('An unexpected error occurred. Please try again.')
    return false
  }
}

// Example: Load Properties
export async function loadProperties(filters?: {
  city?: string
  guests?: number
  checkIn?: string
  checkOut?: string
  minPrice?: number
  maxPrice?: number
}) {
  try {
    const response = await apiClient.getProperties(filters)
    
    if (response.success && response.data) {
      return response.data
    } else {
            return []
    }
  } catch (error) {
        return []
  }
}

// Example: Load Single Property
export async function loadProperty(propertyId: string) {
  try {
    const response = await apiClient.getProperty(propertyId)
    
    if (response.success && response.data) {
      return response.data
    } else {
            return null
    }
  } catch (error) {
        return null
  }
}

// Example: Check Availability
export async function checkAvailability(
  propertyId: string,
  startDate: string,
  endDate: string
) {
  try {
    const response = await apiClient.getPropertyAvailability(propertyId, startDate, endDate)
    
    if (response.success && response.data) {
      return response.data
    } else {
            return null
    }
  } catch (error) {
        return null
  }
}

// Example: React Hook for Properties
import { useState, useEffect } from 'react'

export function useProperties(filters?: Parameters<typeof loadProperties>[0]) {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await loadProperties(filters)
      setProperties(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [JSON.stringify(filters)])

  return { properties, loading, error, refetch: fetchProperties }
}

// Example: React Hook for Single Property
export function useProperty(propertyId: string) {
  const [property, setProperty] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperty = async () => {
    if (!propertyId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await loadProperty(propertyId)
      setProperty(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperty()
  }, [propertyId])

  return { property, loading, error, refetch: fetchProperty }
}