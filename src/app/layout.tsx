export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "react-hot-toast";
import '@/styles/flatpickr-theme.css';
import Providers from "@/components/Providers";

// 1. Configure Sans-Serif Font (Primary UI)
const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

// 2. Configure Monospace Font (Technical IDs, code, license plates, etc.)
const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Rental Manager",
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
      <body className="
        font-sans 
        antialiased 
        bg-[#0b0f14] 
        text-[var(--color-ink)] 
        selection:bg-[var(--color-primary-muted)] 
        selection:text-[var(--color-primary-text)]
        scroll-smooth
        relative
        min-h-screen
        overflow-x-hidden
      ">
        <Providers>
          <AuthProvider>
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

            {/* 🌌 AMBIENT GLOW BACKGROUND LAYER */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
              {/* Top-Left Green Glow (Behind top text / hero area) */}
              <div 
                className="absolute -left-[10%] -top-[10%] h-[700px] w-[700px] rounded-full bg-[#0d3323] opacity-70 blur-[140px]" 
                aria-hidden="true" 
              />
              {/* Bottom-Right Green Glow (Behind right status card / tables) */}
              <div 
                className="absolute -bottom-[20%] -right-[10%] h-[900px] w-[900px] rounded-full bg-[#0a2b1d] opacity-80 blur-[160px]" 
                aria-hidden="true" 
              />
              {/* Subtle Center-Right Accent Glow */}
              <div 
                className="absolute top-[20%] right-[15%] h-[450px] w-[450px] rounded-full bg-[#0d211c] opacity-35 blur-[120px]" 
                aria-hidden="true" 
              />
            </div>

            {/* 🚀 APPLICATION CONTENT LAYER */}
            <div className="relative z-10 min-h-screen">
              {children}
            </div>

          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
