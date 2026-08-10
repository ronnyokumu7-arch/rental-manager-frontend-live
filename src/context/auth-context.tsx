// src/context/auth-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { AuthState, User, Tenant, LoginResponse } from "@/lib/types";

/**
 * AuthContext with JWT access/refresh token rotation.
 *
 * Security model (mirrors the backend):
 * - Access token:  short-lived (15 min) → limits damage window if stolen.
 * - Refresh token: long-lived (7 days), rotated on every use (replay protection).
 * - The frontend keeps the session alive by silently rotating the pair
 *   every 10 minutes while the user is active.
 */

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Keep-alive cadence: MUST be shorter than the 15-min access token TTL.
const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000;

// ─── TOKEN STORAGE HELPERS ───────────────────────────────────────────────────

/** Stores access token (localStorage + cookie) and refresh token (localStorage only). */
const setAuthTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("rm_token", accessToken);
    localStorage.setItem("rm_refresh_token", refreshToken);
    const isSecure = window.location.protocol === "https:";
    const expires = new Date(Date.now() + 7 * 864e5).toUTCString(); // 7 days
    document.cookie = `rm_token=${encodeURIComponent(accessToken)}; expires=${expires}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
  }
};

const getAuthToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("rm_token") : null;

const getRefreshToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("rm_refresh_token") : null;

const removeAuthTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("rm_token");
    localStorage.removeItem("rm_refresh_token");
    document.cookie = "rm_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};

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
   * ✅ NEW: Silent token rotation via POST /auth/refresh.
   * Rotates the pair (old refresh token is revoked server-side),
   * stores the new pair, and updates auth state.
   * Never throws — safe to call from intervals.
   */
  const rotateTokens = useCallback(async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await apiClient.post<LoginResponse & { refresh_token: string }>(
        "/auth/refresh",
        { refresh_token: refreshToken },
      );
      const { access_token, refresh_token, user } = res.data;

      setAuthTokens(access_token, refresh_token);
      const tenant = user.tenant_id ? await fetchTenant(user.tenant_id) : null;

      setState({
        user,
        tenant,
        token: access_token,
        isLoading: false,
        isAuthenticated: true,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Safe initialization.
   * If the access token expired while the tab was closed, attempts ONE
   * silent rotation before giving up — so returning users stay logged in.
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
      } catch {
        // Access token expired → try one silent rotation before forcing login
        const rotated = await rotateTokens();
        if (!rotated && isMounted) {
          removeAuthTokens();
          setState((s) => ({
            ...s,
            user: null,
            tenant: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          }));
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [rotateTokens]);

  /**
   * ✅ NEW: Keep-alive — rotate the pair every 10 minutes while authenticated.
   * A failed tick does NOT log the user out (e.g., transient network blip);
   * the next tick retries, and a truly dead session will 401 on the next
   * real API call and be handled by the api-client interceptor.
   */
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const intervalId = setInterval(() => {
      rotateTokens();
    }, KEEP_ALIVE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [state.isAuthenticated, rotateTokens]);

  /** Login now stores BOTH tokens from the backend's TokenOut response. */
  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient.post<LoginResponse & { refresh_token: string }>(
        "/auth/login",
        { email, password },
      );
      const { access_token, refresh_token, user } = res.data;

      setAuthTokens(access_token, refresh_token);
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

  /** Clears BOTH tokens and redirects to login. */
  const logout = () => {
    removeAuthTokens();
    setState({
      user: null,
      tenant: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push("/login");
  };

  /** Manual refresh (e.g., after profile changes). Hard-logout on failure. */
  const refresh = useCallback(async () => {
    const ok = await rotateTokens();
    if (!ok) {
      removeAuthTokens();
      setState({
        user: null,
        tenant: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, [rotateTokens]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}