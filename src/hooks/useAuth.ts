import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

interface UseAuthOptions {
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    checkAuth,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    setError,
  } = useAuthStore();

  const router = useRouter();

  const { redirectTo = "/signin", redirectIfAuthenticated = false } = options;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && redirectTo) {
        router.push(redirectTo);
      } else if (isAuthenticated && redirectIfAuthenticated) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, redirectTo, redirectIfAuthenticated, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    setError,
    checkAuth,
  };
}

// Hook for protecting pages that require authentication
export function useRequireAuth() {
  return useAuth({ redirectTo: "/signin" });
}

// Hook for pages that should redirect authenticated users (like login/register pages)
export function useRedirectIfAuthenticated() {
  return useAuth({ redirectIfAuthenticated: true });
}
