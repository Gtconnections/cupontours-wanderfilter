'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  objectFit = 'cover',
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  ...props
}: OptimizedImageProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-200 text-gray-400",
          className
        )}
        style={{ width, height }}
      >
        <span>Image failed to load</span>
      </div>
    )
  }

  const imageProps = {
    src,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    quality,
    sizes,
    placeholder,
    blurDataURL,
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-0' : 'opacity-100',
      className
    ),
    ...props
  }

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        style={{ objectFit }}
      />
    )
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
      style={{ objectFit }}
    />
  )
}

// Cloudinary optimization helper
export function getCloudinaryUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
    crop?: 'fill' | 'fit' | 'scale' | 'crop'
  } = {}
) {
  const {
    width,
    height,
    quality = 75,
    format = 'auto',
    crop = 'fill'
  } = options

  // Only process Cloudinary URLs
  if (!url.includes('cloudinary.com')) {
    return url
  }

  // Extract the public ID and build optimized URL
  const parts = url.split('/upload/')
  if (parts.length !== 2) return url

  const [baseUrl, pathWithPublicId] = parts
  const transformations = []

  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (quality) transformations.push(`q_${quality}`)
  if (format) transformations.push(`f_${format}`)
  if (crop) transformations.push(`c_${crop}`)

  const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : ''
  return `${baseUrl}/upload/${transformString}${pathWithPublicId}`
}

// Hook for responsive image sizes
export function useResponsiveImageSizes(breakpoints: { [key: string]: string }) {
  const sizeEntries = Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(max-width: ${breakpoint}) ${size}`)
    .join(', ')
  
  return sizeEntries
}