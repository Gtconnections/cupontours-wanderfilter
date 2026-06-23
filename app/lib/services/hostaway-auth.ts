/**
 * Hostaway OAuth2 Authentication Service
 * 
 * This service manages OAuth2 authentication for Hostaway API.
 * It handles token generation, refresh, and automatic renewal.
 * 
 * IMPORTANT: This runs server-side only for security.
 */

interface HostawayTokenResponse {
  token_type: string;
  expires_in: number; // in seconds (24 months = 63,072,000 seconds)
  access_token: string;
}

interface HostawayTokenInfo {
  accessToken: string;
  expiresAt: Date;
  tokenType: string;
}

class HostawayAuthService {
  private static instance: HostawayAuthService;
  private tokenInfo: HostawayTokenInfo | null = null;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {
    // Load existing token from environment if available
    this.loadTokenFromEnv();
  }

  static getInstance(): HostawayAuthService {
    if (!HostawayAuthService.instance) {
      HostawayAuthService.instance = new HostawayAuthService();
    }
    return HostawayAuthService.instance;
  }

  /**
   * Load token from environment variables
   */
  private loadTokenFromEnv(): void {
    const accessToken = process.env.HOSTAWAY_ACCESS_TOKEN;
    const expiresAt = process.env.HOSTAWAY_TOKEN_EXPIRES_AT;
    const tokenType = process.env.HOSTAWAY_TOKEN_TYPE || 'Bearer';

    if (accessToken && expiresAt) {
      this.tokenInfo = {
        accessToken,
        expiresAt: new Date(expiresAt),
        tokenType
      };
    }
  }

  /**
   * Check if current token is valid and not expired
   */
  private isTokenValid(): boolean {
    if (!this.tokenInfo) return false;
    
    // Add 5 minutes buffer before expiration
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = new Date().getTime();
    const expiryWithBuffer = this.tokenInfo.expiresAt.getTime() - bufferTime;
    
    return now < expiryWithBuffer;
  }

  /**
   * Request new access token from Hostaway
   */
  private async requestNewToken(): Promise<HostawayTokenResponse> {
    const clientId = process.env.HOSTAWAY_CLIENT_ID;
    const clientSecret = process.env.HOSTAWAY_CLIENT_SECRET;
    const baseUrl = process.env.HOSTAWAY_BASE_URL;

    if (!clientId || !clientSecret || !baseUrl) {
      throw new Error('Missing Hostaway OAuth2 configuration. Please check HOSTAWAY_CLIENT_ID, HOSTAWAY_CLIENT_SECRET, and HOSTAWAY_BASE_URL environment variables.');
    }

    const tokenUrl = `${baseUrl}/accessTokens`;
    
    const payload = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'general'
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache'
        },
        body: payload.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const tokenData: HostawayTokenResponse = await response.json();
      
      if (!tokenData.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      return tokenData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save token to environment (in production, this should save to secure storage)
   */
  private async saveTokenToEnv(tokenData: HostawayTokenResponse): Promise<void> {
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));
    
    this.tokenInfo = {
      accessToken: tokenData.access_token,
      expiresAt,
      tokenType: tokenData.token_type
    };

    // In a production environment, you would save this to a secure database
    // For now, we update the process environment
    process.env.HOSTAWAY_ACCESS_TOKEN = tokenData.access_token;
    process.env.HOSTAWAY_TOKEN_EXPIRES_AT = expiresAt.toISOString();
    process.env.HOSTAWAY_TOKEN_TYPE = tokenData.token_type;
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  async getValidToken(): Promise<string> {
    // If token is valid, return it
    if (this.isTokenValid()) {
      return this.tokenInfo!.accessToken;
    }

    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    // Start refresh process
    this.refreshPromise = this.refreshToken();
    
    try {
      const token = await this.refreshPromise;
      this.refreshPromise = null;
      return token;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(): Promise<string> {
    try {
      const tokenData = await this.requestNewToken();
      await this.saveTokenToEnv(tokenData);
      return tokenData.access_token;
    } catch (error) {
      throw new Error('Failed to authenticate with Hostaway API');
    }
  }

  /**
   * Get authorization header for API requests
   */
  async getAuthHeader(): Promise<string> {
    const token = await this.getValidToken();
    const tokenType = this.tokenInfo?.tokenType || 'Bearer';
    return `${tokenType} ${token}`;
  }

  /**
   * Force token refresh (useful for testing)
   */
  async forceRefresh(): Promise<void> {
    this.tokenInfo = null;
    await this.getValidToken();
  }

  /**
   * Revoke current token
   */
  async revokeToken(): Promise<void> {
    if (!this.tokenInfo) return;

    const baseUrl = process.env.HOSTAWAY_BASE_URL;
    if (!baseUrl) return;

    const revokeUrl = `${baseUrl}/accessTokens?token=${this.tokenInfo.accessToken}`;

    try {
      await fetch(revokeUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error) {
      // Silent error handling for revoke - not critical
    } finally {
      this.tokenInfo = null;
      process.env.HOSTAWAY_ACCESS_TOKEN = '';
      process.env.HOSTAWAY_TOKEN_EXPIRES_AT = '';
    }
  }

  /**
   * Get token info for debugging
   */
  getTokenInfo(): HostawayTokenInfo | null {
    return this.tokenInfo;
  }
}

// Export singleton instance
export const hostawayAuth = HostawayAuthService.getInstance();

// Export for testing
export { HostawayAuthService };