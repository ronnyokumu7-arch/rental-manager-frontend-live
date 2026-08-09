// src/context/auth-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback, // ✅ Added for stable refresh interval
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
  } catch {
    return null;
  }
}

// ─── AUTH PROVIDER ───────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    token: null,
    isLoading: true, 
    isAuthenticated: false,
  });

  /**
   * Safe Initialization
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
        console.error("[Auth] Initialization failed:", error);
        removeAuthToken();
        if (isMounted) {
          setState((s) => ({ ...s, user: null, tenant: null, token: null, isLoading: false, isAuthenticated: false }));
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Safe Login
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
      console.error("[Auth] Login failed:", error);
      throw error; 
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
   * ✅ UPDATED: Safe Refresh (Wrapped in useCallback)
   * Wrapped in useCallback to provide a stable memory reference for the 
   * auto-refresh interval below, preventing unnecessary interval resets.
   */
  const refresh = useCallback(async () => {
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
  }, []);

  /**
   * ✅ NEW: Automatic Session Keep-Alive
   * Since the backend token expires in 60 minutes, we proactively refresh 
   * the session every 45 minutes while the user is active and authenticated.
   * This prevents unexpected logouts during long work sessions.
   */
  useEffect(() => {
    if (!state.isAuthenticated) return;

    // 45 minutes in milliseconds (Safe buffer before the 60-min backend expiry)
    const REFRESH_INTERVAL_MS = 45 * 60 * 1000;

    const intervalId = setInterval(() => {
      console.log("[Auth] Proactive session refresh triggered.");
      refresh();
    }, REFRESH_INTERVAL_MS);

    // Cleanup interval on unmount or when user logs out
    return () => {
      clearInterval(intervalId);
    };
  }, [state.isAuthenticated, refresh]);

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
