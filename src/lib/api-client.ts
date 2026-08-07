// src/lib/api-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";

/**
 * @module apiClient
 * @description
 * Centralized Axios instance for communicating with the FastAPI backend.
 * 
 * Key Features:
 * - Uses Zod-validated environment variables for the base URL.
 * - Automatically attaches JWT tokens from localStorage to outgoing requests.
 * - Intercepts 401 Unauthorized responses to safely handle session expiration,
 *   preventing concurrent 401s from corrupting state or triggering multiple redirects.
 * - Logs network timeouts and 5xx server errors for easier debugging.
 */

/**
 * ✅ CRITICAL: Concurrency Guard
 * When a token expires, multiple React Query hooks might fail with a 401 simultaneously.
 * Without this flag, the app would attempt to redirect multiple times concurrently,
 * leading to state corruption, race conditions, and a jarring user experience.
 */
let isHandling401 = false;

// Initialize Axios instance with strict typing and validated env vars
const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
/**
 * Attaches the JWT token to outgoing requests.
 * Ensures we only read from localStorage on the client side.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
/**
 * Handles global API errors, session expiration, and network issues.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    // 1. ✅ FIXED: Handle 401 Unauthorized (Session Expired / Invalid Token)
    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login") &&
      !isHandling401 // ✅ Prevents concurrent 401s from triggering multiple redirects
    ) {
      isHandling401 = true; // Lock the redirect
      
      console.warn("[API Client] 401 Unauthorized: Session expired. Clearing credentials.");
      
      // Clear localStorage
      localStorage.removeItem("rm_token");
      
      // Clear cookie (Must match the logic in auth-context.tsx)
      document.cookie = "rm_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // ✅ FIXED: Mid-Render State Corruption Prevention
      // A slight delay (100ms) yields to the main thread, allowing React to finish 
      // its current render cycle before the hard reload destroys the DOM and state.
      setTimeout(() => {
        window.location.href = "/login?reason=session_expired";
      }, 100);
    }

    // 2. Handle Network Timeouts
    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      console.error("[API Client] Request timed out. The server took too long to respond.");
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
