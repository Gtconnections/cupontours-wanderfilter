"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { getDict } from "@/app/i18n/dictionaries"
import { localeFromPath } from "@/app/i18n/locale"
import { Star, MapPin, Users, Car, Ship, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "../../app/lib/utils"

export interface PropertyCardData {
  id: string
  title: string
  location: string
  description: string
  price: {
    amount: number
    currency: string
    period?: string // "night", "day", "hour"
  }
  rating: number
  reviewCount: number
  images: string[]
  features?: {
    guests?: number
    bedrooms?: number
    bathrooms?: number
    // For cars
    seats?: number
    transmission?: "automatic" | "manual"
    fuelType?: string
    // For yachts
    length?: string
    crew?: number
    // For jets/helicopters
    passengers?: number
    maxPassengers?: number
    range?: string
    speed?: string
  }
  type: "property" | "car" | "yacht" | "jet" | "helicopter"
  available?: boolean
  featured?: boolean
  href: string
}

interface PropertyCardProps {
  data: PropertyCardData
  className?: string
  onFavorite?: (id: string) => void
  isFavorite?: boolean
}

export function PropertyCard({ 
  data, 
  className, 
  onFavorite, 
  isFavorite = false 
}: PropertyCardProps) {
  const router = useRouter()
  const c = getDict(localeFromPath(usePathname() || "/")).card
  
  const handleBookingClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (data.available) {
      router.push(data.href)
    }
  }
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ))
  }

  const renderFeatures = () => {
    const { features, type } = data
    if (!features) return null

    switch (type) {
      case "property":
        return (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {features.guests && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{features.guests} {c.guests}</span>
              </div>
            )}
            {features.bedrooms && (
              <span>{features.bedrooms} {c.bed}</span>
            )}
            {features.bathrooms && (
              <span>{features.bathrooms} {c.bath}</span>
            )}
          </div>
        )
      
      case "car":
        return (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {features.seats && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{features.seats} {c.seats}</span>
              </div>
            )}
            {features.transmission && (
              <span className="capitalize">{features.transmission}</span>
            )}
            {features.fuelType && (
              <span>{features.fuelType}</span>
            )}
          </div>
        )
      
      case "yacht":
        return (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {features.length && (
              <div className="flex items-center gap-1">
                <Ship className="h-4 w-4" />
                <span>{features.length}</span>
              </div>
            )}
            {features.guests && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{features.guests} {c.guests}</span>
              </div>
            )}
            {features.crew && (
              <span>{features.crew} {c.crew}</span>
            )}
          </div>
        )
      
      case "jet":
        return (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {(features.passengers || features.maxPassengers) && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{features.passengers || features.maxPassengers} {c.passengers}</span>
              </div>
            )}
            {features.range && (
              <span>{features.range} {c.range}</span>
            )}
            {features.speed && (
              <span>{features.speed}</span>
            )}
          </div>
        )
      
      case "helicopter":
        return (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {features.passengers && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{features.passengers} {c.passengers}</span>
              </div>
            )}
            {features.range && (
              <span>{features.range} {c.range}</span>
            )}
            {features.speed && (
              <span>{features.speed}</span>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  const getBookingButtonText = () => {
    switch (data.type) {
      case "car":
        return data.available ? c.rentNow : c.unavailable
      case "yacht":
        return data.available ? c.charterNow : c.unavailable
      case "jet":
      case "helicopter":
        return data.available ? c.bookFlight : c.unavailable
      case "property":
      default:
        return data.available ? c.bookNow : c.unavailable
    }
  }

  const getPeriodText = () => {
    switch (data.type) {
      case "property":
        return c.night
      case "car":
        return c.day
      case "yacht":
        return c.day
      case "jet":
      case "helicopter":
        return c.hour
      default:
        return data.price.period || "day"
    }
  }

  return (
    <div className={cn(
      "group bg-background rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
      !data.available && "opacity-75",
      className
    )}>
      <Link href={data.href}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {data.images && data.images.length > 0 && data.images[0] ? (
            <Image
              src={data.images[0]}
              alt={data.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                // Fallback to a default image if the original fails to load
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-muted-foreground text-sm">{c.noImage}</div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {data.featured && (
              <Badge variant="secondary" className="bg-yellow-500 text-black">
                Featured
              </Badge>
            )}
            {!data.available && (
              <Badge variant="destructive">
                Unavailable
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          {onFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onFavorite(data.id)
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                )}
              />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title and Location */}
          <div className="mb-2">
            <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
              {data.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{data.location}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {data.description}
          </p>

          {/* Features */}
          <div className="mb-3">
            {renderFeatures()}
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {renderStars(data.rating)}
            </div>
            <span className="text-sm text-muted-foreground">
              ({data.reviewCount} {c.reviews})
            </span>
          </div>

          {/* Price and Book Button */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-foreground">
                {data.price.currency}{data.price.amount}
              </span>
              <span className="text-sm text-muted-foreground">
                /{getPeriodText()}
              </span>
            </div>
            <Button 
              size="sm" 
              disabled={!data.available}
              onClick={handleBookingClick}
              className={cn(
                "hover:bg-primary/90 transition-colors",
                data.available ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <Calendar className="w-3 h-3 mr-1" />
              {getBookingButtonText()}
            </Button>
          </div>
        </div>
      </Link>
    </div>
  )
}