"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { Button } from "./button"

interface GalleryImage {
  id: number
  url: string
  caption?: string
  sortOrder?: number
}

interface ImageGalleryProps {
  images: GalleryImage[]
  className?: string
  layout?: "default" | "compact"
}

export function ImageGallery({ images, className = "", layout = "default" }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className={`w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-500">No images available</span>
      </div>
    )
  }

  const sortedImages = [...images].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  const currentImage = sortedImages[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? sortedImages.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === sortedImages.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (layout === "compact") {
    return (
      <div className={`w-full ${className}`}>
        {/* Main Image */}
        <div className="relative group mb-3">
          <div className="aspect-[4/3] relative overflow-hidden rounded-lg bg-gray-200">
            <img
              src={currentImage.url}
              alt={currentImage.caption || `Image ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Zoom Button */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setIsModalOpen(true)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            {/* Navigation Arrows (only if more than 1 image) */}
            {sortedImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            {sortedImages.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {currentIndex + 1} / {sortedImages.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Slider */}
        {sortedImages.length > 1 && (
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {sortedImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 relative overflow-hidden rounded transition-all duration-200 ${
                    index === currentIndex 
                      ? 'ring-2 ring-blue-500 opacity-100' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.caption || `Thumbnail ${index + 1}`}
                    className="w-16 h-12 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Full Screen Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Navigation Arrows */}
              {sortedImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Main Image */}
              <img
                src={currentImage.url}
                alt={currentImage.caption || `Image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />

              {/* Image Info */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
                <p className="text-sm opacity-80">
                  {currentIndex + 1} of {sortedImages.length}
                </p>
                {currentImage.caption && (
                  <p className="text-lg mt-1">{currentImage.caption}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default layout (for backward compatibility)
  return (
    <div className={`w-full ${className}`}>
      {/* Main Image */}
      <div className="relative group mb-4">
        <div className="aspect-[16/10] relative overflow-hidden rounded-lg bg-gray-200">
          <img
            src={currentImage.url}
            alt={currentImage.caption || `Image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Zoom Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
            onClick={() => setIsModalOpen(true)}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>

          {/* Navigation Arrows */}
          {sortedImages.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
                onClick={goToNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {sortedImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
              {currentIndex + 1} / {sortedImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Grid */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {sortedImages.slice(0, 6).map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToSlide(index)}
              className={`aspect-square relative overflow-hidden rounded transition-all duration-200 ${
                index === currentIndex 
                  ? 'ring-2 ring-blue-500 opacity-100' 
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={image.url}
                alt={image.caption || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation Arrows */}
            {sortedImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <img
              src={currentImage.url}
              alt={currentImage.caption || `Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image Info */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
              <p className="text-sm opacity-80">
                {currentIndex + 1} of {sortedImages.length}
              </p>
              {currentImage.caption && (
                <p className="text-lg mt-1">{currentImage.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}