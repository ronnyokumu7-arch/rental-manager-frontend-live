export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/flatpickr-theme.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";

// 1. Configure Primary Sans-Serif Typography (UI & Dashboard Controls)
const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

// 2. Configure Monospace Typography (Technical IDs, VINs, Contracts, License Plates)
const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Rental Manager | Fleet & Booking Operations",
    template: "%s | Rental Manager",
  },
  description: "Enterprise-grade vehicle rental and fleet management platform.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sansFont.variable} ${monoFont.variable}`}
    >
      <body
        className="
          font-sans
          antialiased
          bg-[var(--color-bg,#0b0f14)]
          text-[var(--color-ink)]
          selection:bg-[var(--color-primary-muted,rgba(16,185,129,0.2))]
          selection:text-[var(--color-primary-text,#34d399)]
          scroll-smooth
          relative
          min-h-screen
          overflow-x-hidden
        "
      >
        <Providers>
          <AuthProvider>
            {/* 🔔 PREMIUM GLASSMORPHIC TOASTER NOTIFICATIONS */}
            <Toaster
              position="top-right"
              toastOptions={{
                className: `
                  font-sans
                  text-sm
                  font-medium
                  bg-[var(--color-surface,rgba(18,24,33,0.85))]
                  text-[var(--color-ink,#f3f4f6)]
                  border border-[var(--color-surface-border,rgba(255,255,255,0.08))]
                  shadow-[var(--shadow-dropdown,0_20px_25px_-5px_rgba(0,0,0,0.5))]
                  backdrop-blur-md
                  rounded-xl
                  px-4 py-3.5
                  transition-all duration-200
                `,
                duration: 4000,
                success: {
                  iconTheme: {
                    primary: "var(--color-success, #10b981)",
                    secondary: "var(--color-surface, #0b0f14)",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "var(--color-danger, #ef4444)",
                    secondary: "var(--color-surface, #0b0f14)",
                  },
                },
              }}
            />

            {/* 🌌 AMBIENT BRAND GLOW & MESH DEPTH LAYER */}
            <div 
              className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" 
              aria-hidden="true"
            >
              {/* Radial Grid Pattern Mesh for Dark Mode Tech Feel */}
              <div 
                className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                  backgroundSize: '32px 32px',
                }}
              />

              {/* Top-Left Brand Lighting Glow */}
              <div
                className="
                  absolute -left-[10%] -top-[12%] 
                  h-[750px] w-[750px] 
                  rounded-full 
                  bg-[var(--color-primary-glow,#0d3323)] 
                  opacity-70 blur-[150px]
                  transform-gpu
                "
              />

              {/* Bottom-Right Deep Accent Lighting Glow */}
              <div
                className="
                  absolute -bottom-[20%] -right-[10%] 
                  h-[950px] w-[950px] 
                  rounded-full 
                  bg-[var(--color-brand-glow-secondary,#0a2b1d)] 
                  opacity-80 blur-[170px]
                  transform-gpu
                "
              />

              {/* Subtle Center-Right Secondary Highlight Glow */}
              <div
                className="
                  absolute top-[22%] right-[12%] 
                  h-[500px] w-[500px] 
                  rounded-full 
                  bg-[var(--color-brand-glow-tertiary,#0d211c)] 
                  opacity-35 blur-[130px]
                  transform-gpu
                "
              />

              {/* Top Hero Vignette Spotlight */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[var(--color-primary-muted,rgba(16,185,129,0.05))] via-transparent to-transparent opacity-60 pointer-events-none"
              />
            </div>

            {/* 🚀 APPLICATION CONTENT CONTAINER */}
            <div className="relative z-10 flex min-h-screen flex-col">
              {children}
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
