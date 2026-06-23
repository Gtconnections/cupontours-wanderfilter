"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "./button"

interface PropertyImage {
  id: number
  url: string
  caption?: string
  sortOrder: number
}

interface PropertyGalleryProps {
  images: PropertyImage[]
  className?: string
}

export function PropertyGallery({ images, className = "" }: PropertyGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  
  const sortedImages = images.sort((a, b) => a.sortOrder - b.sortOrder)

  const openModal = (index: number) => {
    setSelectedImageIndex(index)
  }

  const closeModal = () => {
    setSelectedImageIndex(null)
  }

  const showPrevious = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex === 0 ? sortedImages.length - 1 : selectedImageIndex - 1)
    }
  }

  const showNext = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex === sortedImages.length - 1 ? 0 : selectedImageIndex + 1)
    }
  }

  if (!sortedImages.length) {
    return (
      <div className={`w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-500">No images available</span>
      </div>
    )
  }

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {sortedImages.map((image, index) => (
          <div 
            key={image.id} 
            className="relative group overflow-hidden rounded-lg aspect-square cursor-pointer"
            onClick={() => openModal(index)}
          >
            <img
              src={image.url}
              alt={image.caption || `Property image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {image.caption && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-sm font-medium text-center px-2">
                  {image.caption}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for enlarged image view */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white/20 border-white/20 text-white hover:bg-white/30"
              onClick={closeModal}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <img
              src={sortedImages[selectedImageIndex].url}
              alt={sortedImages[selectedImageIndex].caption || `Property image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {sortedImages[selectedImageIndex].caption && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-2 rounded text-center">
                {sortedImages[selectedImageIndex].caption}
              </div>
            )}
            
            {sortedImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 border-white/20 text-white hover:bg-white/30"
                  onClick={showPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 border-white/20 text-white hover:bg-white/30"
                  onClick={showNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}