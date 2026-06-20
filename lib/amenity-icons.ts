import { 
  Wifi, 
  Car, 
  Waves, 
  Flame, 
  Wind, 
  Tv, 
  Coffee, 
  ChefHat, 
  WashingMachine, 
  Refrigerator, 
  Microwave, 
  AirVent, 
  Mountain, 
  Trees, 
  Sun, 
  Moon, 
  Home, 
  Bed, 
  Bath, 
  Sofa, 
  Utensils, 
  Wine, 
  Baby, 
  PawPrint, 
  Cigarette, 
  Shield, 
  Bell, 
  Key, 
  Thermometer, 
  Snowflake, 
  TreePine, 
  Dumbbell, 
  MapPin, 
  Users, 
  Camera, 
  Phone, 
  Music, 
  Calendar, 
  Clock,
  ShowerHead,
  Volume2,
  Laptop,
  Gamepad2,
  Book,
  Scissors,
  Shirt,
  UtensilsCrossed,
  Coffee as CoffeeIcon,
  Zap,
  Eye,
  Lock,
  Lightbulb,
  Fan,
  Heater,
  Droplets,
  Flower,
  Flame as Barbecue,
  Umbrella
} from "lucide-react"

export interface AmenityIcon {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  category: string
}

// Comprehensive amenity mapping with icons and colors
export const amenityMapping: Record<string, AmenityIcon> = {
  // Básicos (Basics)
  "wifi": { icon: Wifi, color: "text-blue-600", bgColor: "bg-blue-100", category: "Internet & Office" },
  "wireless internet": { icon: Wifi, color: "text-blue-600", bgColor: "bg-blue-100", category: "Internet & Office" },
  "hot water": { icon: Droplets, color: "text-blue-600", bgColor: "bg-blue-100", category: "Basics" },
  "towels": { icon: Shirt, color: "text-blue-600", bgColor: "bg-blue-100", category: "Basics" },
  "linens": { icon: Bed, color: "text-blue-600", bgColor: "bg-blue-100", category: "Basics" },
  "toilet paper": { icon: Home, color: "text-blue-600", bgColor: "bg-blue-100", category: "Basics" },
  "soap": { icon: Droplets, color: "text-blue-600", bgColor: "bg-blue-100", category: "Basics" },

  // Baño (Bathroom)
  "shower": { icon: ShowerHead, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bathroom" },
  "bathtub": { icon: Bath, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bathroom" },
  "hair dryer": { icon: Wind, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bathroom" },
  "shampoo": { icon: Droplets, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bathroom" },
  "conditioner": { icon: Droplets, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bathroom" },

  // Dormitorio & Lavandería (Bedroom & Laundry)
  "bed linens": { icon: Bed, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bedroom & Laundry" },
  "extra pillows": { icon: Bed, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bedroom & Laundry" },
  "closet": { icon: Home, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bedroom & Laundry" },
  "hangers": { icon: Shirt, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bedroom & Laundry" },
  "iron": { icon: Shirt, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bedroom & Laundry" },
  "washer": { icon: WashingMachine, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bedroom & Laundry" },
  "dryer": { icon: WashingMachine, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bedroom & Laundry" },
  "washing machine": { icon: WashingMachine, color: "text-blue-600", bgColor: "bg-blue-100", category: "Bedroom & Laundry" },

  // Entretenimiento (Entertainment)
  "tv": { icon: Tv, color: "text-blue-600", bgColor: "bg-blue-100", category: "Entertainment" },
  "television": { icon: Tv, color: "text-blue-600", bgColor: "bg-blue-100", category: "Entertainment" },
  "cable tv": { icon: Tv, color: "text-blue-600", bgColor: "bg-blue-100", category: "Entertainment" },
  "netflix": { icon: Tv, color: "text-blue-600", bgColor: "bg-blue-100", category: "Entertainment" },
  "speakers": { icon: Volume2, color: "text-blue-600", bgColor: "bg-blue-100", category: "Entertainment" },
  "sound system": { icon: Music, color: "text-blue-600", bgColor: "bg-blue-100", category: "Entertainment" },
  "games": { icon: Gamepad2, color: "text-blue-600", bgColor: "bg-blue-100", category: "Entertainment" },
  "books": { icon: Book, color: "text-blue-600", bgColor: "bg-blue-100", category: "Entertainment" },

  // Familia (Family)
  "crib": { icon: Baby, color: "text-blue-600", bgColor: "bg-blue-100", category: "Family" },
  "high chair": { icon: Baby, color: "text-blue-600", bgColor: "bg-blue-100", category: "Family" },
  "baby gates": { icon: Shield, color: "text-blue-600", bgColor: "bg-blue-100", category: "Family" },
  "toys": { icon: Baby, color: "text-blue-600", bgColor: "bg-blue-100", category: "Family" },

  // Climatización (Heating & Cooling)
  "air conditioning": { icon: Snowflake, color: "text-blue-600", bgColor: "bg-blue-100", category: "Heating & Cooling" },
  "air conditioner": { icon: Snowflake, color: "text-blue-600", bgColor: "bg-blue-100", category: "Heating & Cooling" },
  "heating": { icon: Heater, color: "text-blue-600", bgColor: "bg-blue-100", category: "Heating & Cooling" },
  "fan": { icon: Fan, color: "text-blue-600", bgColor: "bg-blue-100", category: "Heating & Cooling" },
  "fireplace": { icon: Flame, color: "text-blue-600", bgColor: "bg-blue-100", category: "Heating & Cooling" },

  // Seguridad (Home Safety)
  "smoke detector": { icon: Eye, color: "text-blue-600", bgColor: "bg-blue-100", category: "Home Safety" },
  "carbon monoxide detector": { icon: Shield, color: "text-blue-600", bgColor: "bg-blue-100", category: "Home Safety" },
  "fire extinguisher": { icon: Shield, color: "text-blue-600", bgColor: "bg-blue-100", category: "Home Safety" },
  "first aid kit": { icon: Shield, color: "text-blue-600", bgColor: "bg-blue-100", category: "Home Safety" },
  "safe": { icon: Lock, color: "text-blue-600", bgColor: "bg-blue-100", category: "Home Safety" },
  "security cameras": { icon: Camera, color: "text-blue-600", bgColor: "bg-blue-100", category: "Home Safety" },

  // Internet & Oficina (Internet & Office)
  "internet": { icon: Wifi, color: "text-blue-600", bgColor: "bg-blue-100", category: "Internet & Office" },
  "desk": { icon: Laptop, color: "text-blue-600", bgColor: "bg-blue-100", category: "Internet & Office" },
  "laptop friendly": { icon: Laptop, color: "text-blue-600", bgColor: "bg-blue-100", category: "Internet & Office" },
  "office chair": { icon: Sofa, color: "text-blue-600", bgColor: "bg-blue-100", category: "Internet & Office" },
  "printer": { icon: Phone, color: "text-blue-600", bgColor: "bg-blue-100", category: "Internet & Office" },

  // Cocina & Comedor (Kitchen & Dining)
  "kitchen": { icon: ChefHat, color: "text-blue-600", bgColor: "bg-blue-100", category: "Kitchen & Dining" },
  "refrigerator": { icon: Refrigerator, color: "text-blue-600", bgColor: "bg-blue-100", category: "Kitchen & Dining" },
  "microwave": { icon: Microwave, color: "text-blue-600", bgColor: "bg-blue-100", category: "Kitchen & Dining" },
  "oven": { icon: ChefHat, color: "text-blue-600", bgColor: "bg-blue-100", category: "Kitchen & Dining" },
  "stove": { icon: Flame, color: "text-blue-600", bgColor: "bg-blue-100", category: "Kitchen & Dining" },
  "dishwasher": { icon: Utensils, color: "text-blue-600", bgColor: "bg-blue-100", category: "Kitchen & Dining" },
  "coffee maker": { icon: Coffee, color: "text-blue-600", bgColor: "bg-blue-100", category: "Kitchen & Dining" },
  "toaster": { icon: UtensilsCrossed, color: "text-blue-600", bgColor: "bg-blue-100", category: "Kitchen & Dining" },
  "blender": { icon: Wine, color: "text-blue-600", bgColor: "bg-blue-100", category: "Kitchen & Dining" },
  "dining table": { icon: UtensilsCrossed, color: "text-blue-600", bgColor: "bg-blue-100", category: "Kitchen & Dining" },
  "cookware": { icon: ChefHat, color: "text-blue-600", bgColor: "bg-blue-100", category: "Kitchen & Dining" },

  // Exterior (Outdoor)
  "pool": { icon: Waves, color: "text-blue-600", bgColor: "bg-blue-100", category: "Outdoor" },
  "hot tub": { icon: Waves, color: "text-blue-600", bgColor: "bg-blue-100", category: "Outdoor" },
  "jacuzzi": { icon: Waves, color: "text-blue-600", bgColor: "bg-blue-100", category: "Outdoor" },
  "garden": { icon: Flower, color: "text-blue-600", bgColor: "bg-blue-100", category: "Outdoor" },
  "patio": { icon: Umbrella, color: "text-blue-600", bgColor: "bg-blue-100", category: "Outdoor" },
  "balcony": { icon: Mountain, color: "text-blue-600", bgColor: "bg-blue-100", category: "Outdoor" },
  "bbq": { icon: Barbecue, color: "text-blue-600", bgColor: "bg-blue-100", category: "Outdoor" },
  "grill": { icon: Barbecue, color: "text-blue-600", bgColor: "bg-blue-100", category: "Outdoor" },
  "outdoor furniture": { icon: Sofa, color: "text-blue-600", bgColor: "bg-blue-100", category: "Outdoor" },
  "terrace": { icon: Mountain, color: "text-blue-600", bgColor: "bg-blue-100", category: "Outdoor" },

  // Estacionamiento & Instalaciones (Parking & Facilities)
  "parking": { icon: Car, color: "text-blue-600", bgColor: "bg-blue-100", category: "Parking & Facilities" },
  "garage": { icon: Car, color: "text-blue-600", bgColor: "bg-blue-100", category: "Parking & Facilities" },
  "elevator": { icon: AirVent, color: "text-blue-600", bgColor: "bg-blue-100", category: "Parking & Facilities" },
  "gym": { icon: Dumbbell, color: "text-blue-600", bgColor: "bg-blue-100", category: "Parking & Facilities" },
  "doorman": { icon: Users, color: "text-blue-600", bgColor: "bg-blue-100", category: "Parking & Facilities" },

  // Servicios (Services)
  "self check-in": { icon: Key, color: "text-blue-600", bgColor: "bg-blue-100", category: "Services" },
  "keypad": { icon: Key, color: "text-blue-600", bgColor: "bg-blue-100", category: "Services" },
  "lockbox": { icon: Lock, color: "text-blue-600", bgColor: "bg-blue-100", category: "Services" },
  "cleaning service": { icon: Home, color: "text-blue-600", bgColor: "bg-blue-100", category: "Services" },

  // Características especiales
  "smoking allowed": { icon: Cigarette, color: "text-blue-600", bgColor: "bg-blue-100", category: "House Rules" },
  "pets allowed": { icon: PawPrint, color: "text-blue-600", bgColor: "bg-blue-100", category: "House Rules" },
  "events allowed": { icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-100", category: "House Rules" },

  // Vistas y ubicación
  "ocean view": { icon: Waves, color: "text-blue-600", bgColor: "bg-blue-100", category: "Location Features" },
  "city view": { icon: MapPin, color: "text-blue-600", bgColor: "bg-blue-100", category: "Location Features" },
  "mountain view": { icon: Mountain, color: "text-blue-600", bgColor: "bg-blue-100", category: "Location Features" },
  "garden view": { icon: Trees, color: "text-blue-600", bgColor: "bg-blue-100", category: "Location Features" },
  "beach access": { icon: Waves, color: "text-blue-600", bgColor: "bg-blue-100", category: "Location Features" },

  // Fallback por defecto
  "default": { icon: Home, color: "text-blue-600", bgColor: "bg-blue-100", category: "Other" }
}

/**
 * Get amenity icon data by name with fuzzy matching
 */
export function getAmenityIcon(amenityName: string): AmenityIcon {
  if (!amenityName) return amenityMapping["default"]
  
  const normalizedName = amenityName.toLowerCase().trim()
  
  // Direct match
  if (amenityMapping[normalizedName]) {
    return amenityMapping[normalizedName]
  }
  
  // Fuzzy matching - check if any key is contained in the amenity name
  for (const [key, value] of Object.entries(amenityMapping)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value
    }
  }
  
  // Special fuzzy matching for common variations
  if (normalizedName.includes('wifi') || normalizedName.includes('internet')) {
    return amenityMapping["wifi"]
  }
  if (normalizedName.includes('pool') || normalizedName.includes('piscina')) {
    return amenityMapping["pool"]
  }
  if (normalizedName.includes('parking') || normalizedName.includes('estacionamiento')) {
    return amenityMapping["parking"]
  }
  if (normalizedName.includes('kitchen') || normalizedName.includes('cocina')) {
    return amenityMapping["kitchen"]
  }
  if (normalizedName.includes('tv') || normalizedName.includes('television')) {
    return amenityMapping["tv"]
  }
  if (normalizedName.includes('air') && normalizedName.includes('conditioning')) {
    return amenityMapping["air conditioning"]
  }
  
  return amenityMapping["default"]
}

/**
 * Group amenities by category
 */
export function groupAmenitiesByCategory(amenities: string[]): Record<string, Array<{name: string, icon: AmenityIcon}>> {
  const grouped: Record<string, Array<{name: string, icon: AmenityIcon}>> = {}
  
  amenities.forEach(amenity => {
    const iconData = getAmenityIcon(amenity)
    const category = iconData.category
    
    if (!grouped[category]) {
      grouped[category] = []
    }
    
    grouped[category].push({
      name: amenity,
      icon: iconData
    })
  })
  
  return grouped
}