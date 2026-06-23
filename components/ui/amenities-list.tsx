"use client"

import { getAmenityIcon, groupAmenitiesByCategory } from "@/lib/amenity-icons"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "./button"

interface Amenity {
  id: number
  amenityId: number
  amenityName: string
}

interface AmenitiesListProps {
  amenities: Amenity[]
  className?: string
  maxDisplay?: number
  showCategories?: boolean
}

export function AmenitiesList({ 
  amenities, 
  className = "", 
  maxDisplay,
  showCategories = true 
}: AmenitiesListProps) {
  const [showAll, setShowAll] = useState(false)
  
  if (!amenities || amenities.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No amenities listed
      </div>
    )
  }

  const amenityNames = amenities.map(a => a.amenityName)
  
  if (showCategories) {
    const groupedAmenities = groupAmenitiesByCategory(amenityNames)
    const categories = Object.keys(groupedAmenities)
    const displayCategories = showAll ? categories : categories.slice(0, 3)
    
    return (
      <div className={`space-y-6 ${className}`}>
        {displayCategories.map(category => (
          <div key={category}>
            <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupedAmenities[category].map((amenity, index) => {
                const IconComponent = amenity.icon.icon
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${amenity.icon.bgColor}`}>
                      <IconComponent className={`w-4 h-4 ${amenity.icon.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {amenity.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        
        {categories.length > 3 && (
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show All {categories.length} Categories
              </>
            )}
          </Button>
        )}
      </div>
    )
  }

  // Simple list view (original behavior)
  const displayAmenities = maxDisplay && !showAll 
    ? amenityNames.slice(0, maxDisplay) 
    : amenityNames

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayAmenities.map((amenityName, index) => {
          const amenityIcon = getAmenityIcon(amenityName)
          const IconComponent = amenityIcon.icon
          
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${amenityIcon.bgColor}`}>
                <IconComponent className={`w-4 h-4 ${amenityIcon.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-700 capitalize">
                {amenityName}
              </span>
            </div>
          )
        })}
      </div>
      
      {maxDisplay && amenityNames.length > maxDisplay && (
        <Button
          variant="outline"
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show All {amenityNames.length} Amenities
            </>
          )}
        </Button>
      )}
    </div>
  )
}