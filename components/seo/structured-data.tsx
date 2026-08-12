import { clientConfig } from '@/app/lib/config'

interface StructuredDataProps {
  type?: 'Organization' | 'WebSite' | 'Product' | 'RentalProperty' | 'Vehicle'
  data?: Record<string, unknown>
}

export function StructuredData({ type = 'Organization', data = {} }: StructuredDataProps) {
  const baseOrganization = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${clientConfig.site.url}/#organization`,
    "name": "Cupontours",
    // legalName = razón social registrada. Consistente con el footer.
    // Si la entidad registrada real es "GT Connections LLC", cambia esta línea.
    "legalName": "GT Connections LLC, dba Cupon Tours",
    "url": clientConfig.site.url,
    "logo": clientConfig.brand.logo,
    "image": clientConfig.brand.logo,
    "description": "Luxury travel and property management in Miami: vacation rentals, exotic cars, yachts, private jets and concierge services.",
    "telephone": clientConfig.company.phone,
    "email": clientConfig.company.email,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Miami",
      "addressRegion": "FL",
      "addressCountry": "US"
    },
    "areaServed": [
      { "@type": "City", "name": "Miami" },
      { "@type": "City", "name": "Hallandale Beach" },
      { "@type": "City", "name": "Orlando" },
      { "@type": "City", "name": "Atlanta" },
      { "@type": "City", "name": "Cali" }
    ],
    "sameAs": [
      clientConfig.social.facebook,
      clientConfig.social.instagram
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": clientConfig.company.phone,
      "contactType": "customer service",
      "availableLanguage": ["English", "Spanish"]
    }
  }

  const baseWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": clientConfig.company.name,
    "url": clientConfig.site.url,
    "description": "Find and book luxury vacation rentals, premium car rentals, and yacht charters",
    "publisher": {
      "@type": "Organization",
      "name": clientConfig.company.name
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${clientConfig.site.url}/properties?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  const schemas = {
    Organization: { ...baseOrganization, ...data },
    WebSite: { ...baseWebSite, ...data },
    Product: {
      "@context": "https://schema.org",
      "@type": "Product",
      ...data
    },
    RentalProperty: {
      "@context": "https://schema.org",
      "@type": "Accommodation",
      "category": "Vacation Rental",
      ...data
    },
    Vehicle: {
      "@context": "https://schema.org",
      "@type": "Vehicle",
      ...data
    }
  }

  const structuredData = schemas[type]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}