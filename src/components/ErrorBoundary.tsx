// src/components/ErrorBoundary.tsx
"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface ErrorBoundaryProps { 
  children: ReactNode; 
}

interface ErrorBoundaryState { 
  hasError: boolean; 
}

/**
 * Catches rendering crashes and shows a fallback UI instead of a white screen.
 * Extracted into its own file to prevent Next.js 14 RSC serialization bugs 
 * when mixed with Function Components in the same module.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
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