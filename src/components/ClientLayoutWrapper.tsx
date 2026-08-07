// src/components/ClientLayoutWrapper.tsx
"use client";

import { ReactNode } from "react";
import Providers from "./Providers";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "react-hot-toast";

/**
 * @component ClientLayoutWrapper
 * @description 
 * Consolidates all Client-side providers into a single boundary.
 * This prevents the "Unsupported Server Component type: Module" error 
 * during Next.js 14 static generation by creating one clear Server/Client split.
 */
export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <AuthProvider>
        {/* Global Toast Provider - Single source of truth for the entire app */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            className: `
              font-sans 
              bg-[var(--color-surface)] 
              text-[var(--color-ink)] 
              border border-[var(--color-surface-border)] 
              shadow-[var(--shadow-dropdown)] 
              rounded-xl 
              px-4 py-3
            `,
            success: {
              iconTheme: {
                primary: "var(--color-success)",
                secondary: "var(--color-surface)",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--color-danger)",
                secondary: "var(--color-surface)",
              },
            },
          }}
        />
        {children}
      </AuthProvider>
    </Providers>
  );
}
