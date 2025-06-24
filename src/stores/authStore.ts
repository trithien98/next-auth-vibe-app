import { create } from "zustand";
import { tokenManager } from "@/lib/client/TokenManager";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (
    email: string,
    password: string,
    deviceInfo?: {
      userAgent?: string;
      ipAddress?: string;
      deviceId?: string;
    }
  ) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (
    token: string,
    password: string,
    confirmPassword: string
  ) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  login: async (email, password, deviceInfo) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          userAgent: deviceInfo?.userAgent || navigator.userAgent,
          ipAddress: deviceInfo?.ipAddress,
          deviceId: deviceInfo?.deviceId,
        }),
      });

      const data = await response.json();

      if (data.success && data.accessToken && data.refreshToken) {
        // Store tokens
        await tokenManager.setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: new Date(data.expiresAt).getTime(),
          refreshExpiresAt: new Date(data.refreshExpiresAt).getTime(),
        });

        // Store user data
        await tokenManager.setUserData(data.user);

        // Set user
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });

        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Login failed",
        isLoading: false,
      });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ error: result.message, isLoading: false });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Registration failed",
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      const refreshToken = await tokenManager.getRefreshToken();
      const user = get().user;

      if (refreshToken && user) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            refreshToken,
          }),
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear tokens and user state regardless of API response
      await tokenManager.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });

    try {
      const isAuthenticated = await tokenManager.isAuthenticated();

      if (isAuthenticated) {
        // Try to refresh tokens if needed
        const refreshed = await tokenManager.refreshTokensIfNeeded();

        if (refreshed) {
          // Get stored user data
          const userData = await tokenManager.getUserData();
          
          if (userData) {
            set({ 
              user: userData,
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            // No user data found, clear tokens and redirect to login
            await tokenManager.clearTokens();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          await tokenManager.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  verifyEmail: async (token) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Email verification failed",
        isLoading: false,
      });
      return false;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      set({ isLoading: false });

      if (!data.success) {
        set({ error: data.message });
      }

      return data.success;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to send reset email",
        isLoading: false,
      });
      return false;
    }
  },

  resetPassword: async (token, password, confirmPassword) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();

      if (data.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Password reset failed",
        isLoading: false,
      });
      return false;
    }
  },
}));
