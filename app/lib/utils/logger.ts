/**
 * Production-safe Logger Utility
 * Only logs in development environment to prevent information leakage
 */

type LogLevel = 'log' | 'error' | 'warn' | 'info'

interface Logger {
  log: (message: string, ...args: unknown[]) => void
  error: (message: string, ...args: unknown[]) => void
  warn: (message: string, ...args: unknown[]) => void
  info: (message: string, ...args: unknown[]) => void
}

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Safe logger that only outputs in development
 * In production, logs are suppressed to prevent information disclosure
 */
export const logger: Logger = {
  log: isDevelopment ? console.log : () => {},
  error: isDevelopment ? console.error : () => {},
  warn: isDevelopment ? console.warn : () => {},
  info: isDevelopment ? console.info : () => {},
}

/**
 * Sanitize error messages for client-side display
 * Removes sensitive information while keeping user-friendly messages
 */
export const sanitizeErrorMessage = (error: unknown): string => {
  if (isDevelopment) {
    return error instanceof Error ? error.message : String(error)
  }
  
  // Generic error messages for production
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Connection error. Please check your internet connection and try again.'
    }
    
    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.'
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return 'The requested item was not found.'
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Access denied. Please refresh the page and try again.'
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return 'You do not have permission to access this resource.'
    }
  }
  
  return 'An unexpected error occurred. Please try again later.'
}

/**
 * Log errors safely without exposing sensitive information
 */
export const logError = (context: string, error: unknown): void => {
  logger.error(`[${context}]`, error)
}

/**
 * Create a safe error for client-side consumption
 */
export const createSafeError = (error: unknown, context?: string): Error => {
  const safeMessage = sanitizeErrorMessage(error)
  if (context) {
    logError(context, error)
  }
  return new Error(safeMessage)
}