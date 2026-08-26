/**
 * Environment Configuration
 * Centralized configuration for all environment variables
 */

// Server-side environment variables
export const serverConfig = {
  // (Obsoleto) Config de SendGrid. Ya no se usa: los correos salen por Gmail SMTP
  // (ver app/lib/services/mailer.ts). Se deja el shape sin credenciales para no
  // romper referencias antiguas; no pongas API keys aquí.
  sendGrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'info@cupontours.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'Cupon Tours',
  },

  // External API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api',
  },

  // Hostaway API Configuration
  hostaway: {
    apiKey: process.env.HOSTAWAY_API_KEY || '',
    baseUrl: process.env.HOSTAWAY_BASE_URL || 'https://api.hostaway.com/v1',
    clientId: process.env.HOSTAWAY_CLIENT_ID || '',
    clientSecret: process.env.HOSTAWAY_CLIENT_SECRET || '',
  },

  // Contact Email Configuration
  contactEmails: {
    properties: process.env.CONTACT_EMAIL_PROPERTIES || 'properties@cupontours.com',
    cars: process.env.CONTACT_EMAIL_CARS || 'cars@cupontours.com',
    yachts: process.env.CONTACT_EMAIL_YACHTS || 'yachts@cupontours.com',
    general: process.env.CONTACT_EMAIL_GENERAL || 'info@cupontours.com',
  },
}

// Client-side environment variables (must be prefixed with NEXT_PUBLIC_)
export const clientConfig = {
  // External API Configuration (for client-side usage)
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api',
  },

  // Analytics & tracking (opcional). El tracking queda inerte si están vacíos.
  analytics: {
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || '',
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
  },

  // Site Configuration
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cupontours.com',
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Cupon Tours',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Discover amazing deals on luxury properties, cars, and yachts',
  },

  // Company Information
  company: {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Cupon Tours',
    phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+1 (786) 656-6582',
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@cupontours.com',
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Miami Florida',
  },

  // Brand Assets
  brand: {
    logo: process.env.NEXT_PUBLIC_COMPANY_LOGO || 'https://res.cloudinary.com/gt-connections/image/upload/v1680756313/cupon-tours/logo-cupon-tours-email_rwh0tm.png',
    favicon: process.env.NEXT_PUBLIC_COMPANY_FAVICON || 'https://res.cloudinary.com/gt-connections/image/upload/v1635802011/cupon-tours/icon_h5p4jq.svg',
    whiteLogo: process.env.NEXT_PUBLIC_COMPANY_WHITE_LOGO || 'https://res.cloudinary.com/gt-connections/image/upload/v1705168752/cupon-tours/footer-icons/logo-cupontours-footer_maerif.png',
  },

  // Social Media
  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/cupontours',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/cupontours',
    // twitter: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com/cupontours',
    // whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+15551234567',
  },
}

// Combined configuration for easy access
export const config = {
  ...serverConfig,
  ...clientConfig,
}

export default config