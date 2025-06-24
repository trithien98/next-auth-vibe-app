import localforage from "localforage";

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
}

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = "auth_access_token";
  private static readonly REFRESH_TOKEN_KEY = "auth_refresh_token";
  private static readonly TOKEN_DATA_KEY = "auth_token_data";

  constructor() {
    // Configure localforage for better performance and security
    localforage.config({
      name: "NextAuthApp",
      storeName: "auth_tokens",
      description: "Secure storage for authentication tokens",
    });
  }

  /**
   * Store authentication tokens securely
   */
  async setTokens(tokenData: TokenData): Promise<void> {
    try {
      await localforage.setItem(TokenManager.TOKEN_DATA_KEY, tokenData);
      await localforage.setItem(
        TokenManager.ACCESS_TOKEN_KEY,
        tokenData.accessToken
      );
      await localforage.setItem(
        TokenManager.REFRESH_TOKEN_KEY,
        tokenData.refreshToken
      );
    } catch (error) {
      console.error("Failed to store tokens:", error);
      throw new Error("Failed to store authentication tokens");
    }
  }

  /**
   * Get the current access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await localforage.getItem<string>(
        TokenManager.ACCESS_TOKEN_KEY
      );

      // Check if token is expired
      if (token && (await this.isAccessTokenExpired())) {
        return null;
      }

      return token;
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  }

  /**
   * Get the current refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await localforage.getItem<string>(
        TokenManager.REFRESH_TOKEN_KEY
      );

      // Check if refresh token is expired
      if (token && (await this.isRefreshTokenExpired())) {
        await this.clearTokens();
        return null;
      }

      return token;
    } catch (error) {
      console.error("Failed to get refresh token:", error);
      return null;
    }
  }

  /**
   * Get all token data
   */
  async getTokenData(): Promise<TokenData | null> {
    try {
      return await localforage.getItem<TokenData>(TokenManager.TOKEN_DATA_KEY);
    } catch (error) {
      console.error("Failed to get token data:", error);
      return null;
    }
  }

  /**
   * Check if access token is expired
   */
  async isAccessTokenExpired(): Promise<boolean> {
    try {
      const tokenData = await this.getTokenData();
      if (!tokenData) return true;

      return Date.now() >= tokenData.expiresAt;
    } catch (error) {
      console.error("Failed to check token expiration:", error);
      return true;
    }
  }

  /**
   * Check if refresh token is expired
   */
  async isRefreshTokenExpired(): Promise<boolean> {
    try {
      const tokenData = await this.getTokenData();
      if (!tokenData) return true;

      return Date.now() >= tokenData.refreshExpiresAt;
    } catch (error) {
      console.error("Failed to check refresh token expiration:", error);
      return true;
    }
  }

  /**
   * Check if we need to refresh the access token (within 5 minutes of expiry)
   */
  async shouldRefreshToken(): Promise<boolean> {
    try {
      const tokenData = await this.getTokenData();
      if (!tokenData) return false;

      const fiveMinutesInMs = 5 * 60 * 1000;
      return Date.now() >= tokenData.expiresAt - fiveMinutesInMs;
    } catch (error) {
      console.error("Failed to check if should refresh token:", error);
      return false;
    }
  }

  /**
   * Clear all stored tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        localforage.removeItem(TokenManager.TOKEN_DATA_KEY),
        localforage.removeItem(TokenManager.ACCESS_TOKEN_KEY),
        localforage.removeItem(TokenManager.REFRESH_TOKEN_KEY),
      ]);
    } catch (error) {
      console.error("Failed to clear tokens:", error);
      throw new Error("Failed to clear authentication tokens");
    }
  }

  /**
   * Check if user is authenticated (has valid tokens)
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();

      // If we have a valid access token, user is authenticated
      if (accessToken && !(await this.isAccessTokenExpired())) {
        return true;
      }

      // If access token is expired but refresh token is valid, user can be re-authenticated
      if (refreshToken && !(await this.isRefreshTokenExpired())) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to check authentication status:", error);
      return false;
    }
  }

  /**
   * Automatic token refresh
   */
  async refreshTokensIfNeeded(): Promise<boolean> {
    try {
      if (!(await this.shouldRefreshToken())) {
        return true; // No refresh needed
      }

      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return false; // No refresh token available
      }

      // Call the refresh endpoint
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await this.clearTokens();
        return false;
      }

      const data = await response.json();
      if (data.success && data.data) {
        await this.setTokens(data.data);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to refresh tokens:", error);
      return false;
    }
  }
}

// Export a singleton instance
export const tokenManager = new TokenManager();
