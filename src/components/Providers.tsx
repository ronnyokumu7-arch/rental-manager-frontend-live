// src/components/Providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, Component, ReactNode, ErrorInfo } from "react";

// ─── 1. ERROR BOUNDARY ───────────────────────────────────────────────────────
// Catches rendering crashes and shows a fallback UI instead of a white screen
interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
    // In the future, you can send this to Sentry here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
          <div className="max-w-md w-full bg-[var(--color-surface)] shadow-lg rounded-2xl p-8 text-center border border-[var(--color-surface-border)]">
            <h2 className="text-2xl font-bold text-[var(--color-danger)] mb-4">
              Something went wrong
            </h2>
            <p className="text-[var(--color-ink-muted)] mb-6">
              The application encountered an unexpected error. Please try refreshing.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── 2. PROVIDERS WRAPPER ────────────────────────────────────────────────────
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
