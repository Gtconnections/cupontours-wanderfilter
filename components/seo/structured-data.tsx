import { clientConfig } from '@/app/lib/config'

interface StructuredDataProps {
  type?: 'Organization' | 'WebSite' | 'Product' | 'RentalProperty' | 'Vehicle'
  data?: Record<string, unknown>
}

export function StructuredData({ type = 'Organization', data = {} }: StructuredDataProps) {
  const baseOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": clientConfig.company.name,
    "url": clientConfig.site.url,
    "logo": clientConfig.brand.logo,
    "description": "Luxury travel booking platform specializing in vacation rentals, car rentals, and yacht charters",
    "telephone": clientConfig.company.phone,
    "email": clientConfig.company.email,
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "FL",
      "addressCountry": "US",
      "addressLocality": "Miami"
    },
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