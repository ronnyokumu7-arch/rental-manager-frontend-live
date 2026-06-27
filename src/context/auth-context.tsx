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

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Cookie helpers
const setAuthCookie = (token: string) => {
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const expires = new Date(Date.now() + 7 * 864e5).toUTCString(); // 7 days
  document.cookie = `rm_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
};

const getAuthCookie = (): string | null => {
  const match = document.cookie.match(new RegExp(`(^| )rm_token=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const removeAuthCookie = () => {
  document.cookie = "rm_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

async function fetchTenant(tenantId: number): Promise<Tenant | null> {
  try {
    const res = await apiClient.get<Tenant>(`/admin/tenants/${tenantId}`);
    return res.data;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Restore session on mount using cookies
  useEffect(() => {
    const token = getAuthCookie();
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    apiClient
      .get<User>("/auth/me")
      .then(async (res) => {
        const user = res.data;
        const tenant = user.tenant_id ? await fetchTenant(user.tenant_id) : null;
        setState({ user, tenant, token, isLoading: false, isAuthenticated: true });
      })
      .catch(() => {
        removeAuthCookie();
        setState((s) => ({ ...s, isLoading: false }));
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    const { access_token, user } = res.data;
    
    // Store in cookie (for middleware)
    setAuthCookie(access_token);
    
    const tenant = user.tenant_id ? await fetchTenant(user.tenant_id) : null;

    setState({
      user,
      tenant,
      token: access_token,
      isLoading: false,
      isAuthenticated: true,
    });

    // Role-based redirect
    if (user.role === "super_admin") router.push("/super-admin");
    else router.push("/dashboard");
  };

  const logout = () => {
    removeAuthCookie();
    setState({
      user: null,
      tenant: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
