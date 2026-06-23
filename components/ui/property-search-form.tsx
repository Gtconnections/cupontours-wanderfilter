"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, MapPin, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAvailableCities } from "@/lib/api/properties"

export interface SearchFormData {
  destination: string
  checkIn: string
  checkOut: string
  guests: string
}

interface PropertySearchFormProps {
  onSearch: (searchData: SearchFormData) => void
  initialData?: Partial<SearchFormData>
  isLoading?: boolean
  className?: string
  showTitle?: boolean
}

export function PropertySearchForm({ 
  onSearch, 
  initialData = {}, 
  isLoading = false, 
  className = "",
  showTitle = true 
}: PropertySearchFormProps) {
  const [searchData, setSearchData] = useState<SearchFormData>(() => ({
    destination: initialData.destination || "",
    checkIn: initialData.checkIn || "",
    checkOut: initialData.checkOut || "",
    guests: initialData.guests || "2"
  }))
  
  const [availableCities, setAvailableCities] = useState<string[]>([])

  // Load available cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cities = await getAvailableCities()
        setAvailableCities(cities)
      } catch (error) {
              }
    }
    
    loadCities()
  }, [])

  // Update form when initialData changes
  useEffect(() => {
    const hasInitialData = initialData && (
      initialData.destination || 
      initialData.checkIn || 
      initialData.checkOut || 
      initialData.guests
    )
    
    if (hasInitialData) {
      setSearchData(prev => ({
        ...prev,
        destination: initialData.destination || prev.destination,
        checkIn: initialData.checkIn || prev.checkIn,
        checkOut: initialData.checkOut || prev.checkOut,
        guests: initialData.guests || prev.guests
      }))
    }
  }, [initialData?.destination, initialData?.checkIn, initialData?.checkOut, initialData?.guests])

  const handleInputChange = useCallback((field: keyof SearchFormData, value: string) => {
    setSearchData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSearch = useCallback(() => {
    onSearch(searchData)
  }, [onSearch, searchData])

  return (
    <div className={`bg-white rounded-lg p-6 shadow-lg ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Search Properties
        </h3>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        {/* Search Destination */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Search destinations
          </label>
          <div className="relative">
            <Input
              placeholder="Where to?"
              value={searchData.destination}
              onChange={(e) => handleInputChange("destination", e.target.value)}
              className="h-12"
              list="cities-list"
            />
            <datalist id="cities-list">
              {availableCities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Check In */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Check in
          </label>
          <Input
            type="date"
            value={searchData.checkIn}
            onChange={(e) => handleInputChange("checkIn", e.target.value)}
            className="h-12"
          />
        </div>

        {/* Check Out */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Check out
          </label>
          <Input
            type="date"
            value={searchData.checkOut}
            onChange={(e) => handleInputChange("checkOut", e.target.value)}
            className="h-12"
          />
        </div>

        {/* Add Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Add guests
          </label>
          <select
            value={searchData.guests}
            onChange={(e) => handleInputChange("guests", e.target.value)}
            className="h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="1">1 Guest</option>
            <option value="2">2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
            <option value="5">5+ Guests</option>
          </select>
        </div>

        {/* Search Button */}
        <div>
          <Button 
            onClick={handleSearch}
            disabled={isLoading}
            className="h-12 w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
    </div>
  )
}