// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Rental Manager",
  description: "Professional vehicle rental management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 
        ✅ CRITICAL FIX: 
        1. Use --color-bg for the true canvas background (premium off-white in light, rich charcoal in dark).
        2. Explicitly lock dark mode to #0B0D14 to guarantee it matches the sidebar/topbar perfectly.
        3. Smooth transition for theme switching.
      */}
      <body className="antialiased bg-[var(--color-bg)] dark:bg-[#0B0D14] text-[var(--color-ink)] transition-colors duration-300">
        <AuthProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              // Ensure toasts also adapt perfectly to the theme
              className: "bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-surface-border)] shadow-[var(--shadow-dropdown)] rounded-xl",
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
