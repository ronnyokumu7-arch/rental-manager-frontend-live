export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "react-hot-toast";
import '@/styles/flatpickr-theme.css';
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next"

// 1. Sans-Serif (Primary UI / paragraphs)
const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// 2. Display (Titles, headers — brand identity)
const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

// 3. Monospace (Numbers, IDs, plates, amounts)
const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Rental Garage",
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
      className={`${sansFont.variable} ${displayFont.variable} ${monoFont.variable}`}
    >
      <body className="
        font-sans 
        antialiased 
        bg-[var(--color-bg)] 
        text-[var(--color-ink)] 
        selection:bg-[var(--color-primary-muted)] 
        selection:text-[var(--color-primary-text)]
        scroll-smooth
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
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
