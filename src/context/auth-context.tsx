// src/context/auth-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { AuthState, User, Tenant, LoginResponse } from "@/lib/types";

/**
 * @interface AuthContextType
 * @description Extends the base AuthState with authentication action methods.
 */
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── TOKEN MANAGEMENT HELPERS ────────────────────────────────────────────────

/**
 * Stores the auth token in both localStorage (for API client) 
 * and Cookies (for Next.js Middleware/Server Components).
 */
const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("rm_token", token);
    const isSecure = window.location.protocol === "https:";
    const expires = new Date(Date.now() + 7 * 864e5).toUTCString(); // 7 days
    document.cookie = `rm_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
  }
};

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("rm_token");
  }
  return null;
};

const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("rm_token");
    document.cookie = "rm_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};

/**
 * Fetches tenant data safely. Returns null if the request fails 
 * to prevent crashing the entire auth flow.
 */
async function fetchTenant(tenantId: number): Promise<Tenant | null> {
  try {
    const res = await apiClient.get<Tenant>(`/tenants/${tenantId}`);
    return res.data;
  } catch (error) {
    return null;
  }
}

// ─── AUTH PROVIDER ───────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  // ✅ CRITICAL: isLoading MUST start as true to prevent race conditions 
  // where protected routes render before auth state is resolved.
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    token: null,
    isLoading: true, 
    isAuthenticated: false,
  });

  /**
   * ✅ FIXED: Safe Initialization
   * Wraps the initial auth check in an async function with a try/catch/finally.
   * Uses an `isMounted` flag to prevent state updates if the component unmounts 
   * before the API calls finish (prevents React memory leak/race condition warnings).
   */
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = getAuthToken();
      
      if (!token) {
        if (isMounted) setState((s) => ({ ...s, isLoading: false }));
        return;
      }

      try {
        const res = await apiClient.get<User>("/auth/me");
        const user = res.data;
        const tenant = user.tenant_id ? await fetchTenant(user.tenant_id) : null;
        
        if (isMounted) {
          setState({ user, tenant, token, isLoading: false, isAuthenticated: true });
        }
      } catch (error) {
        console.error("[Auth] Initialization failed:");
        removeAuthToken();
        if (isMounted) {
          setState((s) => ({ ...s, user: null, tenant: null, token: null, isLoading: false, isAuthenticated: false }));
        }
      }
    };

    initAuth();

    // Cleanup function to prevent race conditions on unmount
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * ✅ FIXED: Safe Login
   * Wrapped in try/catch to prevent Uncaught Promise Rejections.
   * Re-throws the error so the Login UI component can catch it and display a toast.
   */
  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient.post<LoginResponse>("/auth/login", { email, password });
      const { access_token, user } = res.data;

      setAuthToken(access_token);
      const tenant = user.tenant_id ? await fetchTenant(user.tenant_id) : null;

      setState({
        user,
        tenant,
        token: access_token,
        isLoading: false,
        isAuthenticated: true,
      });

      if (user.role === "super_admin") router.push("/super-admin");
      else router.push("/dashboard");
    } catch (error) {
      console.error("[Auth] Login failed:");
      throw error; // Let the login form handle the UI error display
    }
  };

  /**
   * Clears all auth state and redirects to login.
   */
  const logout = () => {
    removeAuthToken();
    setState({
      user: null,
      tenant: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push("/login");
  };

  /**
   * ✅ FIXED: Safe Refresh
   * If the refresh fails (e.g., token expired on backend), it safely logs 
   * the user out instead of leaving the app in a corrupted state.
   */
  const refresh = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const res = await apiClient.get<User>("/auth/me");
      const user = res.data;
      const tenant = user.tenant_id ? await fetchTenant(user.tenant_id) : null;
      
      setState({ user, tenant, token, isLoading: false, isAuthenticated: true });
    } catch {
      console.error("[Auth] Refresh failed, clearing session:");
      removeAuthToken();
      setState({
        user: null,
        tenant: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume the AuthContext safely.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
