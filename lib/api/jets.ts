import { PropertyCardData } from "@/components/ui/property-card"

// Sample data for jets/private aircraft
const sampleJets: PropertyCardData[] = [
  {
    id: "jet-1",
    title: "Citation CJ3+ - Light Jet",
    location: "Miami International Airport",
    description: "Experience luxury aviation with this state-of-the-art light jet. Perfect for business travel or weekend getaways with outstanding comfort and efficiency.",
    price: { amount: 3500, currency: "$", period: "hour" },
    rating: 5,
    reviewCount: 42,
    images: [
      "https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    features: {
      passengers: 7,
      range: "2,040 nm",
      speed: "416 kts"
    },
    type: "jet",
    available: true,
    featured: true,
    href: "/jets/jet-1"
  },
  {
    id: "jet-2",
    title: "Gulfstream G650 - Ultra Long Range",
    location: "Miami International Airport",
    description: "The pinnacle of private aviation. This ultra-long-range jet offers unmatched luxury, technology, and performance for the most discerning travelers.",
    price: { amount: 8500, currency: "$", period: "hour" },
    rating: 5,
    reviewCount: 38,
    images: [
      "https://images.unsplash.com/photo-1583884130830-8681ad511c8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    features: {
      passengers: 14,
      range: "7,000 nm",
      speed: "516 kts"
    },
    type: "jet",
    available: true,
    featured: true,
    href: "/jets/jet-2"
  },
  {
    id: "jet-3",
    title: "King Air 350i - Turboprop",
    location: "Miami International Airport", 
    description: "Reliable and efficient turboprop aircraft perfect for short to medium-range flights. Ideal for accessing smaller airports with luxury amenities.",
    price: { amount: 2200, currency: "$", period: "hour" },
    rating: 5,
    reviewCount: 29,
    images: [
      "https://images.unsplash.com/photo-1436262513933-a0b06755c784?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    features: {
      passengers: 9,
      range: "1,806 nm", 
      speed: "312 kts"
    },
    type: "jet",
    available: true,
    href: "/jets/jet-3"
  },
  {
    id: "jet-4",
    title: "Challenger 650 - Super Mid-Size",
    location: "Miami International Airport",
    description: "Perfect balance of performance and comfort. This super mid-size jet offers spacious cabin, advanced avionics, and exceptional range capabilities.",
    price: { amount: 5500, currency: "$", period: "hour" },
    rating: 5,
    reviewCount: 35,
    images: [
      "https://images.unsplash.com/photo-1488202481186-8d04c10b58b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    features: {
      passengers: 10,
      range: "4,000 nm",
      speed: "459 kts"
    },
    type: "jet",
    available: true,
    featured: true,
    href: "/jets/jet-4"
  },
  {
    id: "helicopter-1",
    title: "Bell 407 - Luxury Helicopter",
    location: "Miami Heliport",
    description: "Experience the ultimate in helicopter luxury. Perfect for scenic tours, quick transfers, or special occasions with breathtaking aerial views.",
    price: { amount: 2800, currency: "$", period: "hour" },
    rating: 5,
    reviewCount: 52,
    images: [
      "https://images.unsplash.com/photo-1544996265-f0c1a8a6e7c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    features: {
      passengers: 6,
      range: "374 nm",
      speed: "140 kts"
    },
    type: "helicopter",
    available: true,
    featured: true,
    href: "/jets/helicopter-1"
  },
  {
    id: "helicopter-2",
    title: "Airbus H145 - Twin Engine",
    location: "Miami Heliport",
    description: "State-of-the-art twin-engine helicopter with advanced safety features. Ideal for VIP transport, aerial photography, or luxury tours.",
    price: { amount: 4200, currency: "$", period: "hour" },
    rating: 5,
    reviewCount: 28,
    images: [
      "https://images.unsplash.com/photo-1569007768567-ac72bb5ad135?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    features: {
      passengers: 8,
      range: "400 nm",
      speed: "155 kts"
    },
    type: "helicopter",
    available: true,
    href: "/jets/helicopter-2"
  }
]

// Simulate async API call
export const getJets = async (): Promise<PropertyCardData[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100))
  return Promise.resolve(sampleJets)
}

// Get only airplanes/jets
export const getAirplanes = async (): Promise<PropertyCardData[]> => {
  const jets = await getJets()
  return jets.filter(jet => jet.type === "jet")
}

// Get only helicopters
export const getHelicopters = async (): Promise<PropertyCardData[]> => {
  const jets = await getJets()
  return jets.filter(jet => jet.type === "helicopter")
}