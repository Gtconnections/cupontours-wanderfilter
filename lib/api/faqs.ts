import { FAQData } from "@/components/ui/faq-item"

// General FAQs about Cupon Tours services
export const generalFAQs: FAQData[] = [
  {
    id: "what-is-cupon-tours",
    question: "What is Cupon Tours?",
    answer: "Cupon Tours is a premium travel and tourism company specializing in luxury experiences including exclusive fly services, yacht charters, hotel bookings, and unique travel packages. We provide sophisticated adventures with high-end amenities and personalized service.",
    category: "general"
  },
  {
    id: "how-to-book",
    question: "How do I book a service with Cupon Tours?",
    answer: "You can book our services through our website by browsing our available options and using our booking system. You can also contact us directly via email at info@cupontours.com for personalized assistance and quotes.",
    category: "booking"
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), bank transfers, and PayPal. For high-value bookings, we also offer flexible payment plans and can arrange secure wire transfers.",
    category: "payment"
  },
  {
    id: "cancellation-policy",
    question: "What is your cancellation policy?",
    answer: "Our cancellation policy varies depending on the service and timing. Generally, cancellations made 48+ hours in advance receive a full refund. Cancellations within 24-48 hours may incur a 50% fee, and same-day cancellations may be non-refundable. Specific terms are provided at booking.",
    category: "policy"
  }
]

// Aviation/Jets specific FAQs
export const aviationFAQs: FAQData[] = [
  {
    id: "aircraft-types",
    question: "What types of aircraft do you have?",
    answer: "Our fleet includes light jets for quick business trips, mid-size jets for regional travel, and ultra-long-range aircraft for international journeys. All aircraft feature state-of-the-art technology, luxury amenities, and are maintained to the highest safety standards.",
    category: "aviation"
  },
  {
    id: "safety-standards",
    question: "What safety standards do you follow?",
    answer: "We adhere to the strictest aviation safety standards including FAA regulations, regular aircraft maintenance, experienced certified pilots with thousands of flight hours, and comprehensive safety protocols. All our aircraft undergo rigorous inspections and our crew receives continuous training.",
    category: "aviation"
  },
  {
    id: "flight-destinations",
    question: "Where can you fly to?",
    answer: "We can arrange flights to virtually any destination worldwide. Our aircraft can access thousands of airports, including smaller regional airports that commercial airlines cannot reach, providing you with maximum flexibility and convenience.",
    category: "aviation"
  },
  {
    id: "group-size",
    question: "How many passengers can you accommodate?",
    answer: "Depending on the aircraft, we can accommodate anywhere from 4 to 19 passengers. Our light jets typically seat 4-8 passengers, mid-size jets 6-10 passengers, and our larger aircraft can accommodate up to 19 passengers with full amenities.",
    category: "aviation"
  }
]

// Yacht/Marine FAQs
export const yachtFAQs: FAQData[] = [
  {
    id: "yacht-sizes",
    question: "What sizes of yachts are available?",
    answer: "Our fleet ranges from intimate 40-foot yachts perfect for couples or small groups, to luxury mega-yachts over 200 feet that can accommodate large parties. Each yacht comes with professional crew and high-end amenities.",
    category: "marine"
  },
  {
    id: "yacht-amenities",
    question: "What amenities are included on the yachts?",
    answer: "Our yachts feature luxury cabins, gourmet kitchens, entertainment systems, water sports equipment, and professional crew. Larger yachts may include helipads, infinity pools, spas, and fine dining restaurants.",
    category: "marine"
  },
  {
    id: "crew-included",
    question: "Is crew included with yacht charters?",
    answer: "Yes, all our yacht charters include a professional crew including captain, chef, and service staff. The crew size varies based on yacht size and your specific needs. All crew members are experienced and trained in luxury hospitality.",
    category: "marine"
  }
]

// Hotel FAQs
export const hotelFAQs: FAQData[] = [
  {
    id: "hotel-types",
    question: "What types of accommodations do you offer?",
    answer: "We specialize in luxury accommodations including 5-star hotels, boutique resorts, private villas, and exclusive properties. All our partnerships are with premium establishments that meet our high standards for service and amenities.",
    category: "hotels"
  },
  {
    id: "location-coverage",
    question: "What destinations do you cover for hotels?",
    answer: "We have partnerships with luxury properties worldwide, with special focus on premium destinations in the Caribbean, Europe, Asia, and the Americas. We can arrange accommodations for any destination you wish to visit.",
    category: "hotels"
  }
]

// Combined FAQ data for easy access
export const allFAQs: FAQData[] = [
  ...generalFAQs,
  ...aviationFAQs,
  ...yachtFAQs,
  ...hotelFAQs
]

// Function to get FAQs by category
export function getFAQsByCategory(category: string): FAQData[] {
  return allFAQs.filter(faq => faq.category === category)
}

// Function to get all FAQs (simulates API call)
export async function getFAQs(): Promise<FAQData[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  return allFAQs
}

// Function to get general FAQs (simulates API call)
export async function getGeneralFAQs(): Promise<FAQData[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return generalFAQs
}

// Function to get aviation FAQs (simulates API call)
export async function getAviationFAQs(): Promise<FAQData[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return aviationFAQs
}

// Function to get yacht FAQs (simulates API call)
export async function getYachtFAQs(): Promise<FAQData[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return yachtFAQs
}

// Function to get hotel FAQs (simulates API call)
export async function getHotelFAQs(): Promise<FAQData[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return hotelFAQs
}