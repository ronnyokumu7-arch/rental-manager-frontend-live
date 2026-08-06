// src/lib/api-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env"; // ✅ Import validated environment variables

// Initialize Axios instance with strict typing and validated env vars
const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL, // ✅ Uses Zod-validated URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// Attaches JWT token to outgoing requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only access localStorage on the client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("rm_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// Handles global API errors, session expiration, and network issues
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    // 1. Handle 401 Unauthorized (Session Expired / Invalid Token)
    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      console.warn("[API Client] 401 Unauthorized: Clearing session and redirecting.");
      localStorage.removeItem("rm_token");
      
      // Using window.location.href forces a hard reload, which is the safest 
      // way to clear React Query cache and app state during a global auth failure.
      window.location.href = "/login"; 
    }

    // 2. Handle Network Timeouts
    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      console.error("[API Client] Request timed out. The server took too long to respond.");
      // You could trigger a global toast notification here if you have a toast service outside React context
    }

    // 3. Handle 5xx Server Errors
    if (status && status >= 500) {
      console.error(`[API Client] Server Error (${status}):`, error.response?.data);
    }

    // Always reject the promise so TanStack Query or local catch blocks can handle the UI error state
    return Promise.reject(error);
  }
);

export default apiClient;
