/**
 * Security Configuration for Cupon Tours Website
 * This file contains security-related constants and configurations
 */

// Content Security Policy configuration
const isDevelopment = process.env.NODE_ENV === 'development'

export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'", // Required for Next.js and Turbopack
    ...(isDevelopment ? ["'unsafe-inline'"] : []), // Allow inline scripts only in development
    'https://vercel.live', // Vercel analytics
    'https://va.vercel-scripts.com', // Vercel analytics scripts
    'https://d2q3n06xhbi0am.cloudfront.net', // Hostaway calendar widget
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS and styled-components
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:', // Allow data URIs for fonts
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:', // Allow all HTTPS images (for external content)
    'blob:', // Allow blob URLs for generated images
  ],
  'connect-src': [
    "'self'",
    'https://api.hostaway.com', // Hostaway API
    'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app', // External API
    'https://res.cloudinary.com', // Cloudinary assets
    'https://vitals.vercel-insights.com', // Vercel analytics
    'https://sourcemaps.hostaway.eu', // Hostaway calendar widget source maps
    'https://booking-engine.hostaway.com', // Hostaway calendar widget API
    ...(isDevelopment ? ['ws://localhost:*', 'wss://localhost:*'] : []), // WebSocket for HMR
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': isDevelopment ? [] : [''],
} as const

// Generate CSP header string
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive
      }
      return `${directive} ${sources.join(' ')}`
    })
    .join('; ')
}

// Security headers configuration
export const SECURITY_HEADERS = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: generateCSPHeader()
  }
]

// Environment variable validation
export const REQUIRED_ENV_VARS = [
  'API_BASE_URL',
  'HOSTAWAY_BASE_URL',
  'HOSTAWAY_CLIENT_ID',
  'HOSTAWAY_CLIENT_SECRET',
] as const

export const OPTIONAL_ENV_VARS = [
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
  'NEXT_PUBLIC_COMPANY_NAME',
  'NEXT_PUBLIC_COMPANY_PHONE',
  'NEXT_PUBLIC_COMPANY_EMAIL',
] as const

/**
 * Validate that all required environment variables are present
 * This should be called during application startup
 */
export const validateEnvironmentVariables = (): void => {
  const missing: string[] = []
  
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    )
  }
}

/**
 * Sanitize environment variables for client-side exposure
 * Only returns variables that are safe to expose to the client
 */
export const getClientSafeEnvVars = () => {
  return {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_FACEBOOK_URL: process.env.NEXT_PUBLIC_FACEBOOK_URL,
    NEXT_PUBLIC_INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    NEXT_PUBLIC_TWITTER_URL: process.env.NEXT_PUBLIC_TWITTER_URL,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  }
}

// Rate limiting configuration (for future implementation)
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
} as const