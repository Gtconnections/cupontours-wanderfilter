import { clientConfig } from "@/lib/config"
import { Car, CarApiResponse } from "@/types/globals"

const API_BASE_URL = clientConfig.api.baseUrl

/**
 * Fetch all cars from the external API
 * @param page - Page number for pagination (optional)
 * @returns Promise with cars data
 */
export async function getCars(page?: number): Promise<CarApiResponse> {
  try {
    // Fixed: Proper URL construction
    let url = `${API_BASE_URL}/landing/cars/`
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
      throw new Error(`Failed to fetch cars: ${response.status} ${response.statusText}`)
    }

    const data: CarApiResponse = await response.json()
    return data
  } catch (error) {
        throw new Error('Failed to fetch cars data')
  }
}

/**
 * Fetch a single car by ID
 * @param id - Car ID
 * @returns Promise with car data
 */
export async function getCarById(id: number): Promise<Car> {
  try {
    const url = `${API_BASE_URL}/landing/cars/${id}/`
    
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
        throw new Error('Car not found')
      }
      throw new Error(`Failed to fetch car: ${response.status} ${response.statusText}`)
    }

    const car: Car = await response.json()
    return car
  } catch (error) {
        throw error
  }
}

/**
 * Get available cars (filter by status)
 * @param page - Page number for pagination (optional)
 * @returns Promise with available cars data
 */
export async function getAvailableCars(page?: number): Promise<CarApiResponse> {
  try {
    const data = await getCars(page)
    
    // Filter available cars
    const availableCars = data.results.filter(car => car.status === 'available')
    
    return {
      ...data,
      results: availableCars,
      count: availableCars.length,
    }
  } catch (error) {
        throw new Error('Failed to fetch available cars')
  }
}

/**
 * Get cars by brand
 * @param brand - Car brand to filter by
 * @param page - Page number for pagination (optional)
 * @returns Promise with filtered cars data
 */
export async function getCarsByBrand(brand: string, page?: number): Promise<CarApiResponse> {
  try {
    const data = await getCars(page)
    
    // Filter cars by brand (case insensitive)
    const filteredCars = data.results.filter(
      car => car.brand.toLowerCase() === brand.toLowerCase()
    )
    
    return {
      ...data,
      results: filteredCars,
      count: filteredCars.length,
    }
  } catch (error) {
        throw new Error(`Failed to fetch ${brand} cars`)
  }
}

/**
 * Search cars by various criteria
 * @param searchParams - Search parameters
 * @returns Promise with filtered cars data
 */
export async function searchCars(searchParams: {
  brand?: string
  model?: string
  yearFrom?: number
  yearTo?: number
  priceFrom?: number
  priceTo?: number
  status?: string
  page?: number
}): Promise<CarApiResponse> {
  try {
    const data = await getCars(searchParams.page)
    
    let filteredCars = data.results
    
    // Apply filters
    if (searchParams.brand) {
      filteredCars = filteredCars.filter(
        car => car.brand.toLowerCase().includes(searchParams.brand!.toLowerCase())
      )
    }
    
    if (searchParams.model) {
      filteredCars = filteredCars.filter(
        car => car.model.toLowerCase().includes(searchParams.model!.toLowerCase())
      )
    }
    
    if (searchParams.yearFrom) {
      filteredCars = filteredCars.filter(car => car.year >= searchParams.yearFrom!)
    }
    
    if (searchParams.yearTo) {
      filteredCars = filteredCars.filter(car => car.year <= searchParams.yearTo!)
    }
    
    if (searchParams.priceFrom) {
      filteredCars = filteredCars.filter(
        car => parseFloat(car.rent_price) >= searchParams.priceFrom!
      )
    }
    
    if (searchParams.priceTo) {
      filteredCars = filteredCars.filter(
        car => parseFloat(car.rent_price) <= searchParams.priceTo!
      )
    }
    
    if (searchParams.status) {
      filteredCars = filteredCars.filter(car => car.status === searchParams.status)
    }
    
    return {
      ...data,
      results: filteredCars,
      count: filteredCars.length,
    }
  } catch (error) {
        throw new Error('Failed to search cars')
  }
}