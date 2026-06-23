/**
 * Hostaway HTTP Client
 * 
 * Optimized HTTP client for Hostaway API with built-in:
 * - Automatic authentication
 * - Rate limiting
 * - Error handling
 * - Request retry logic
 */

import { hostawayAuth } from './hostaway-auth';

interface HostawayApiResponse<T = any> {
  status: 'success' | 'fail';
  result: T;
  message?: string;
}

interface HostawayRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string | number | boolean>;
  body?: any;
  timeout?: number;
  retries?: number;
}

class HostawayHttpClient {
  private static instance: HostawayHttpClient;
  private baseUrl: string;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private readonly rateLimitDelay = 1000; // 1 second between requests to avoid rate limits

  private constructor() {
    this.baseUrl = process.env.HOSTAWAY_BASE_URL || 'https://api.hostaway.com/v1';
  }

  static getInstance(): HostawayHttpClient {
    if (!HostawayHttpClient.instance) {
      HostawayHttpClient.instance = new HostawayHttpClient();
    }
    return HostawayHttpClient.instance;
  }

  /**
   * Rate limiting: Ensure requests are spaced appropriately
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Execute HTTP request with retries and error handling
   */
  private async executeRequest<T>(
    url: string,
    options: RequestInit,
    retries = 3,
    timeoutMs = 30000
  ): Promise<HostawayApiResponse<T>> {
    await this.enforceRateLimit();

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Create timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 10000;
          
                    
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          throw new Error('Rate limit exceeded. Please try again later.');
        }

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
                    
          try {
            await hostawayAuth.forceRefresh();
            
            // Retry with new token
            if (attempt < retries) {
              const newAuthHeader = await hostawayAuth.getAuthHeader();
              options.headers = {
                ...options.headers,
                'Authorization': newAuthHeader
              };
              continue;
            }
          } catch (authError) {
            throw new Error('Authentication failed and token refresh unsuccessful');
          }
        }

        // Parse response
        const responseText = await response.text();
        let responseData: HostawayApiResponse<T>;

        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Invalid JSON response: ${responseText}`);
        }

        // Handle API errors
        if (!response.ok) {
          const errorMessage = responseData.message || `HTTP ${response.status}: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        return responseData;

      } catch (error) {
                
        if (attempt === retries) {
          throw error;
        }
        
        // Exponential backoff for retries
        const backoffTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }

    throw new Error('All retry attempts exhausted');
  }

  /**
   * Make authenticated request to Hostaway API
   */
  async request<T = any>(
    endpoint: string,
    options: HostawayRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      params,
      body,
      timeout = 30000,
      retries = 3
    } = options;

    // Get authentication header
    const authHeader = await hostawayAuth.getAuthHeader();
    
    // Build URL
    const url = this.buildUrl(endpoint, params);
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'CuponTours/1.0'
      }
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await this.executeRequest<T>(url, requestOptions, retries, timeout);
      
      if (response.status === 'fail') {
        throw new Error(response.message || 'API request failed');
      }
      
      return response.result;
    } catch (error) {
            throw error;
    }
  }

  /**
   * GET request shorthand
   */
  async get<T = any>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request shorthand
   */
  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT request shorthand
   */
  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  /**
   * DELETE request shorthand
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Health check - test API connectivity
   */
  async healthCheck(): Promise<{ status: string; authenticated: boolean; tokenInfo?: any }> {
    try {
      // Try to get account information to test authentication
      await this.get('/listings', { limit: 1 });
      
      return {
        status: 'healthy',
        authenticated: true,
        tokenInfo: hostawayAuth.getTokenInfo()
      };
    } catch (error) {
      return {
        status: 'error',
        authenticated: false,
        tokenInfo: hostawayAuth.getTokenInfo()
      };
    }
  }
}

// Export singleton instance
export const hostawayClient = HostawayHttpClient.getInstance();

// Export for testing
export { HostawayHttpClient };