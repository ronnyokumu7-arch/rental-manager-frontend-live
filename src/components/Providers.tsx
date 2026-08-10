// src/components/Providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary"; // ✅ Import from dedicated file

/**
 * @component Providers
 * @description 
 * Wraps the app in React Query and the Error Boundary.
 * 
 * ✅ BUILD FIX: The ErrorBoundary (Class Component) has been extracted 
 * into its own file to prevent the Next.js 14.2.x "Unsupported Server 
 * Component type: Module" serialization crash during static generation.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  // Initialize QueryClient once per user session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,             // Retry failed requests once
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}