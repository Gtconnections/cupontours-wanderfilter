'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface LazyBackgroundImageProps {
  src: string
  alt?: string
  className?: string
  children?: React.ReactNode
  fallback?: string
  threshold?: number
  rootMargin?: string
}

export function LazyBackgroundImage({
  src,
  alt,
  className,
  children,
  fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01ODcuNSAzMzYuNUw2MjEuNSAzMDJMNjU1LjUgMzM2LjVMNjIxLjUgMzcxTDU4Ny41IDMzNi41WiIgZmlsbD0iI0NCRDVFMCIvPgo8L3N2Zz4K',
  threshold = 0.1,
  rootMargin = '50px',
}: LazyBackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  useEffect(() => {
    if (isInView && src) {
      const img = new window.Image()
      img.onload = () => setIsLoaded(true)
      img.src = src
    }
  }, [isInView, src])

  const backgroundImage = isLoaded ? `url(${src})` : `url(${fallback})`

  return (
    <div
      ref={ref}
      className={cn(
        'bg-cover bg-center bg-no-repeat transition-all duration-500',
        !isLoaded && 'blur-sm',
        className
      )}
      style={{
        backgroundImage,
      }}
      role={alt ? 'img' : undefined}
      aria-label={alt}
    >
      {children}
    </div>
  )
}

// Hook for optimizing background image URLs
export function useOptimizedBackgroundImage(url: string, width?: number, height?: number) {
  // For Cloudinary images, add optimization parameters
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/upload/')
    if (parts.length === 2) {
      const [baseUrl, pathWithPublicId] = parts
      const transformations = ['f_auto', 'q_auto']
      
      if (width) transformations.push(`w_${width}`)
      if (height) transformations.push(`h_${height}`)
      
      return `${baseUrl}/upload/${transformations.join(',')}/c_fill/${pathWithPublicId}`
    }
  }
  
  // For Unsplash images, add optimization parameters
  if (url.includes('unsplash.com')) {
    const urlObj = new URL(url)
    if (width) urlObj.searchParams.set('w', width.toString())
    if (height) urlObj.searchParams.set('h', height.toString())
    urlObj.searchParams.set('auto', 'format')
    urlObj.searchParams.set('fit', 'crop')
    urlObj.searchParams.set('q', '75')
    return urlObj.toString()
  }
  
  return url
}